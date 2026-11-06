
import { Stack, router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#F7F3EF",
        },
        headerTintColor: "#4E342E",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      {/* Home screen */}
      <Stack.Screen
        name="index"
        options={{
          title: "Coffee Preferences",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/coffee-list")}
              style={{ padding: 8 }}
            >
              <Text
                style={{
                  color: "#6D4C41",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                Coffee List
              </Text>
            </Pressable>
          ),
        }}
      />

      {/* Coffee List screen */}
      <Stack.Screen
        name="coffee-list"
        options={{
          title: "My Coffee List",
        }}
      />
    </Stack>
  );
}
