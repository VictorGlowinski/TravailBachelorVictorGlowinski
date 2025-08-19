// styles/index.ts
export { colors } from './colors';
export { typography } from './typography';
export { globalStyles } from './globale';

// Screens
export { default as loginStyles } from './screens/LoginStyles';
export { default as profilStyles } from './screens/ProfilStyles';
export { default as anamneseStyles } from './screens/AnamneseStyles';
export { default as registerStyles } from './screens/RegisterStyles';
export { default as evaluationInitialeStyles } from './screens/EvaluationInitialeStyles';
// Import values for convenience export
import { colors } from './colors';
import { typography } from './typography';
import { globalStyles } from './globale';
import  loginStyles from './screens/LoginStyles';
import  profilStyles from './screens/ProfilStyles';
import anamneseStyles from './screens/AnamneseStyles';
import  registerStyles from './screens/RegisterStyles';
import EvaluationInitialeStyles from './screens/EvaluationInitialeStyles';


// Export de convenance pour l'importation directe
export const styles = {
  colors,
  typography,
  global: globalStyles,
  login: loginStyles,
  profil: profilStyles,
  anamnese: anamneseStyles,
  register: registerStyles,
  evaluationInitiale: EvaluationInitialeStyles,
};