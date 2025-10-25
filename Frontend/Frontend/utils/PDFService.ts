// ✅ CRÉER utils/PDFService.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { Alert } from 'react-native';

export interface UserData {
  planData: {
    pla_nom?: string;
    pla_date_debut?: string;
    pla_date_fin?: string;
    jours?: Array<{
      jou_id: number;
      jou_date?: string;
      activites?: Array<{
        gen_id: number;
        gen_nom?: string;
        gen_type?: string;
        gen_duree?: string;
        gen_distance?: string;
        gen_intensite?: string;
        gen_commentaire?: string;
      }>;
    }>;
  };
}

export interface User {
  id: number;
  email: string;
}

export class PDFService {
  
  /**
   * FORMATAGE de date pour PDF
   */
  private static formatDateForPDF(dateString: string): string {
    if (!dateString) return 'Non défini';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  /**
   * FORMATAGE d'une activité en HTML
   */
  private static formatActiviteHTML(activite: any): string {
    return `
      <div class="activite-card">
        <h4 class="activite-nom">${activite.gen_nom || 'Activité'}</h4>
        <div class="activite-details">
          ${activite.gen_type ? `<span class="detail-item"><strong>Type:</strong> ${activite.gen_type}</span>` : ''}
          ${activite.gen_duree ? `<span class="detail-item"><strong>Durée:</strong> ${activite.gen_duree} min</span>` : ''}
          ${activite.gen_distance ? `<span class="detail-item"><strong>Distance:</strong> ${activite.gen_distance} km</span>` : ''}
        </div>
        ${activite.gen_intensite ? `<p class="activite-intensite"><strong>Intensité:</strong> ${activite.gen_intensite}</p>` : ''}
        ${activite.gen_commentaire ? `<p class="activite-commentaire">${activite.gen_commentaire}</p>` : ''}
      </div>
    `;
  }

  /**
   * GÉNÉRATION du contenu HTML complet
   */
  private static generateHTML(userData: UserData, user?: User): string {
    const planData = userData.planData;
    
    // GÉNÉRATION des jours
    const joursHTML = planData.jours?.map((jour, index) => {
      const activitesHTML = jour.activites?.length ? 
        jour.activites.map(this.formatActiviteHTML).join('') :
        '<p class="repos-jour">Jour de repos</p>';

      return `
        <div class="jour-container">
          <div class="jour-header">
            <span class="jour-numero">${index + 1}</span>
            <div class="jour-info">
              <h3 class="jour-titre">Jour ${index + 1}</h3>
              ${jour.jou_date ? `<p class="jour-date">${this.formatDateForPDF(jour.jou_date)}</p>` : ''}
            </div>
          </div>
          <div class="activites-container">
            ${activitesHTML}
          </div>
        </div>
      `;
    }).join('') || '<p>Aucun jour programmé</p>';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Plan d'Entraînement Triathlon</title>
          <style>
            /* STYLES GLOBAUX */
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              background-color: #ffffff;
            }
            
            /* HEADER */
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              padding: 30px; 
              background: linear-gradient(135deg, #007AFF, #0056CC); 
              color: white; 
              border-radius: 12px;
            }
            .header h1 { 
              margin: 0 0 10px 0; 
              font-size: 28px; 
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              opacity: 0.9;
            }
            
            /* INFO DU PLAN */
            .plan-info { 
              display: flex; 
              justify-content: space-around; 
              margin: 30px 0; 
              padding: 20px; 
              background-color: #f8f9fa; 
              border-radius: 12px;
              border: 1px solid #e9ecef;
            }
            .plan-info-item { 
              text-align: center;
              flex: 1;
            }
            .plan-info-item strong { 
              display: block; 
              color: #007AFF; 
              font-size: 18px;
              margin-bottom: 5px;
            }
            .plan-info-item span {
              color: #666;
              font-size: 14px;
            }
            
            /* SECTION PROGRAMME */
            .programme-section {
              margin: 30px 0;
            }
            .section-titre {
              color: #007AFF; 
              border-bottom: 2px solid #007AFF; 
              padding-bottom: 10px;
              margin-bottom: 25px;
              font-size: 24px;
            }
            
            /* JOURS */
            .jour-container {
              page-break-inside: avoid; 
              margin: 25px 0; 
              padding: 20px; 
              border: 1px solid #e0e0e0; 
              border-radius: 12px;
              background-color: #ffffff;
            }
            .jour-header {
              display: flex; 
              align-items: center; 
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #f0f0f0;
            }
            .jour-numero {
              background-color: #007AFF; 
              color: white; 
              width: 35px; 
              height: 35px; 
              border-radius: 50%; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              margin-right: 15px;
              font-size: 16px;
            }
            .jour-titre {
              margin: 0; 
              color: #333;
              font-size: 22px;
            }
            .jour-date {
              margin: 5px 0 0 0; 
              color: #666; 
              font-size: 14px;
            }
            
            /* ACTIVITÉS */
            .activites-container {
              padding: 10px 0;
            }
            .activite-card {
              margin: 15px 0; 
              padding: 18px; 
              background-color: #f8f9fa; 
              border-radius: 10px; 
              border-left: 4px solid #007AFF;
            }
            .activite-nom {
              margin: 0 0 12px 0; 
              color: #333; 
              font-size: 18px;
              font-weight: 600;
            }
            .activite-details {
              display: flex; 
              flex-wrap: wrap; 
              gap: 20px; 
              margin: 12px 0;
            }
            .detail-item {
              color: #666;
              font-size: 14px;
              background-color: #ffffff;
              padding: 4px 8px;
              border-radius: 4px;
              border: 1px solid #e9ecef;
            }
            .activite-intensite {
              margin: 12px 0; 
              color: #555;
              font-size: 15px;
              background-color: #e3f2fd;
              padding: 8px 12px;
              border-radius: 6px;
              border-left: 3px solid #2196f3;
            }
            .activite-commentaire {
              margin: 12px 0; 
              color: #666; 
              font-style: italic;
              background-color: #fff3e0;
              padding: 10px 12px;
              border-radius: 6px;
              border-left: 3px solid #ff9800;
            }
            .repos-jour {
              color: #888; 
              font-style: italic; 
              padding: 30px; 
              text-align: center; 
              background-color: #f0f0f0; 
              border-radius: 8px;
              font-size: 16px;
            }
            
            /* FOOTER */
            .footer { 
              margin-top: 50px; 
              padding: 25px; 
              background-color: #f8f9fa; 
              border-radius: 12px; 
              text-align: center; 
              color: #666; 
              font-size: 12px;
              border-top: 2px solid #007AFF;
            }
            .footer p {
              margin: 5px 0;
            }
            
            /* PRINT */
            @media print {
              .page-break { 
                page-break-before: always; 
              }
              body {
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <!-- HEADER -->
          <div class="header">
            <h1>Plan d'Entraînement Triathlon</h1>
            <p style="font-size: 18px;">${planData.pla_nom || 'Programme Personnalisé'}</p>
            ${user?.email ? `<p style="font-size: 14px;">Généré pour: ${user.email}</p>` : ''}
          </div>

          <!-- INFORMATIONS DU PLAN -->
          <div class="plan-info">
            <div class="plan-info-item">
              <strong>Date de début</strong>
              <span>${this.formatDateForPDF(planData.pla_date_debut || '')}</span>
            </div>
            <div class="plan-info-item">
              <strong>Date de fin</strong>
              <span>${this.formatDateForPDF(planData.pla_date_fin || '')}</span>
            </div>
            <div class="plan-info-item">
              <strong>Durée totale</strong>
              <span>${planData.jours?.length || 0} jours</span>
            </div>
          </div>

          <!-- PROGRAMME DÉTAILLÉ -->
          <div class="programme-section">
            <h2 class="section-titre">Programme Détaillé</h2>
            ${joursHTML}
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <p><strong>Plan d'entraînement généré le ${new Date().toLocaleDateString('fr-FR')}</strong></p>
            <p>Application d'Entraînement Triathlon</p>
            <p style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
              Ce plan est personnalisé selon votre profil et vos objectifs
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * GÉNÉRATION et téléchargement PDF
   */
  public static async generatePDF(userData: UserData, user?: User): Promise<void> {
    if (!userData.planData) {
      Alert.alert('Erreur', 'Aucun plan à exporter');
      return;
    }

    try {
      console.log('📄 Génération du PDF...');
      
      const htmlContent = this.generateHTML(userData, user);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,
        height: 792,
      });

      console.log('✅ PDF généré:', uri);

      // PARTAGER le PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Partager le plan d\'entraînement',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Succès', 'PDF généré avec succès !');
      }

    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF');
      throw error;
    }
  }

  /**
   * ENVOI par email
   */
  public static async sendByEmail(userData: UserData, user?: User): Promise<void> {
    if (!userData.planData) {
      Alert.alert('Erreur', 'Aucun plan à envoyer');
      return;
    }

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Email non disponible', 'Aucune application email configurée sur cet appareil');
        return;
      }

      console.log('📧 Préparation de l\'email...');
      
      // GÉNÉRER le PDF pour l'attachement
      const htmlContent = this.generateHTML(userData, user);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // CONTENU de l'email
      const emailBody = `
Bonjour,

Veuillez trouver ci-joint votre plan d'entraînement triathlon personnalisé.

📋 Détails du plan :
• Nom : ${userData.planData.pla_nom || 'Plan personnalisé'}
• Début : ${this.formatDateForPDF(userData.planData.pla_date_debut || '')}
• Fin : ${this.formatDateForPDF(userData.planData.pla_date_fin || '')}
• Durée : ${userData.planData.jours?.length || 0} jours

Le plan est également consultable dans l'application.

Bon entraînement !

---
Généré par l'Application Triathlon
      `.trim();

      await MailComposer.composeAsync({
        subject: `Plan d'Entraînement Triathlon - ${userData.planData.pla_nom || 'Programme'}`,
        body: emailBody,
        attachments: [uri],
        isHtml: false,
      });

    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'email');
      throw error;
    }
  }
}