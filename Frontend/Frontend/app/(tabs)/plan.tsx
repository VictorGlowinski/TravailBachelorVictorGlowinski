import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function PlanScreen() { // ✅ CORRECTION : Nom unique
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Plans</Text>
      <Text style={styles.subtitle}>Plans d'entraînement générés par IA</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/* TODO: Liste des plans */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
