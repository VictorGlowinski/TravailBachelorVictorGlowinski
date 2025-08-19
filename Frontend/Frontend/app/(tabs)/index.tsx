// app/(tabs)/index.tsx
import { Text, View } from '@/components/Themed';
import { globalStyles } from '@/styles'; // ✅ Import des styles globaux

export default function HomeScreen() { 
  return (
    <View style={globalStyles.centeredContainer}>
      <Text style={globalStyles.title}>Accueil</Text>
      <Text style={globalStyles.subtitle}>Votre dashboard triathlon</Text>
      <View style={globalStyles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/* TODO: Ajouter widgets dashboard */}
    </View>
  );
}