
import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

// The key used to identify our saved information
const STORAGE_KEY = "coffeeProfile";

export default function HomeScreen() {

  // 1. the state variables 
  const [name, setName] = useState("");
  const [coffee, setCoffee] = useState("");

  // The profile that is actually saved
  const [savedProfile, setSavedProfile] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true); //always use loading state for data


  // Read saved information when screen opens
  useEffect(() => {

    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          STORAGE_KEY
        );

        if (saved !== null) {
          const profile = JSON.parse(saved);

          setName(profile.name ?? "");
          setCoffee(profile.coffee ?? "");
          setSavedProfile(profile);

          setMessage("Saved preferences loaded!");
        } else {
          setMessage("No saved preferences yet.");
        }

      } catch (error) {
        console.log("Load error:", error);
        setMessage("Could not load preferences.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

  }, []);


  // 3. SAVE: Store the current preferences
  const saveProfile = async () => {

    if (name.trim() === "" || coffee.trim() === "") {
      setMessage("Please enter your name and coffee.");
      return;
    }

    const profile = {
      name: name.trim(),
      coffee: coffee.trim(),
    };

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(profile)
      );

      setSavedProfile(profile);
      setMessage("Preferences saved successfully!");

    } catch (error) {
      console.log("Save error:", error);
      setMessage("Could not save preferences.");
    }
  };


  // 4. DELETE: Remove saved preferences
  const deleteProfile = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);

      setName("");
      setCoffee("");
      setSavedProfile(null);

      setMessage("Preferences deleted!");

    } catch (error) {
      console.log("Delete error:", error);
      setMessage("Could not delete preferences.");
    }
  };


  // 5. User Interface
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >

      <Text style={styles.title}>
        Coffee Preferences
      </Text>

      <Text style={styles.subtitle}>
        Save your favorite coffee on your device.
      </Text>

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#795548"
        />

      ) : (

        <>
          <View style={styles.card}>

            <Text style={styles.label}>
              Your Name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>
              Favorite Coffee
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: Latte"
              value={coffee}
              onChangeText={setCoffee}
            />

            <Pressable
              style={styles.saveButton}
              onPress={saveProfile}
            >
              <Text style={styles.buttonText}>
                Save Preferences
              </Text>
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={deleteProfile}
            >
              <Text style={styles.buttonText}>
                Delete Preferences
              </Text>
            </Pressable>

          </View>

          <Text style={styles.message}>
            {message}
          </Text>

          <View style={styles.savedCard}>

            <Text style={styles.sectionTitle}>
              Saved on This Device
            </Text>

            {savedProfile !== null ? (
              <>
                <Text style={styles.savedText}>
                  Name: {savedProfile.name}
                </Text>

                <Text style={styles.savedText}>
                  Coffee: {savedProfile.coffee}
                </Text>
              </>
            ) : (
              <Text style={styles.savedText}>
                No saved information.
              </Text>
            )}

          </View>

          <Text style={styles.hint}>
            Try changing your coffee without saving.
            Then restart the app.
          </Text>

        </>

      )}

    </ScrollView>
  );
}


// 6. Styles
const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: "#F7F3EF",
  },

  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4E342E",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    color: "#795548",
    textAlign: "center",
    marginBottom: 28,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4E342E",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D7CCC8",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },

  saveButton: {
    backgroundColor: "#6D4C41",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor: "#A1887F",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  message: {
    textAlign: "center",
    color: "#5D4037",
    fontSize: 15,
    marginBottom: 18,
  },

  savedCard: {
    backgroundColor: "#EFEBE9",
    padding: 20,
    borderRadius: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4E342E",
    marginBottom: 12,
  },

  savedText: {
    fontSize: 16,
    color: "#5D4037",
    marginBottom: 8,
  },

  hint: {
    fontSize: 13,
    color: "#795548",
    textAlign: "center",
    marginTop: 24,
  },

});
