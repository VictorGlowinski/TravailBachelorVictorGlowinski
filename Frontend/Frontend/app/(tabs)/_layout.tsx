import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      
      {/* Onglet Accueil */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      {/* Onglet Plans d'entraînement */}
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plans',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
          headerRight: () => (
            <Link href="/(tabs)/creationPlan" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="plus"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      {/* Onglet Calendrier */}
      <Tabs.Screen
        name="calendrier"
        options={{
          title: 'Calendrier',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />

      {/* Onglet Profil */}
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          // ✅ SUPPRIMER le headerRight car maintenant tout se passe dans la page profil
        }}
      />

      {/* Masquer les pages non utilisées dans les onglets */}
      <Tabs.Screen
        name="two"
        options={{
          href: null, // Masque cet onglet
        }}
      />

      <Tabs.Screen
        name="creationAnamnese"
        options={{
          href: null, // Masque cet onglet (sera accessible via navigation)
        }}
      />

      <Tabs.Screen
        name="creationEvaluationInitiale"
        options={{
          href: null, // Masque cet onglet (sera accessible via navigation)
        }}
      />

      <Tabs.Screen
        name="creationPlan"
        options={{
          href: null, // Masque cet onglet (sera accessible via navigation)
        }}
      />
      
    </Tabs>
  );
}