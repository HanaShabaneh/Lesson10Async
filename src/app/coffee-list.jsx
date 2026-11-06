
import { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Different key from the original index screen
const LIST_KEY = "coffeeList";

export default function CoffeeListScreen() {

  // 1. STATE
  const [coffees, setCoffees] = useState([]);

  const [coffee, setCoffee] = useState("");
  const [shop, setShop] = useState("");

  // null means we are adding a new item
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const listRef = useRef(null);


  // 2. LOAD LIST WHEN SCREEN OPENS
  useEffect(() => {

    const loadList = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          LIST_KEY
        );

        if (saved !== null) {
          const savedList = JSON.parse(saved);

          if (Array.isArray(savedList)) {
            setCoffees(savedList);
          }
        }

      } catch (error) {
        console.log("Load error:", error);
        setMessage("Could not load the coffee list.");
      } finally {
        setLoading(false);
      }
    };

    loadList();

  }, []);


  // 3. SAVE THE ENTIRE LIST TO LOCAL STORAGE
  const saveList = async (updatedList) => {

    await AsyncStorage.setItem(
      LIST_KEY,
      JSON.stringify(updatedList)
    );

    setCoffees(updatedList);
  };


  // 4. CLEAR INPUT FIELDS
  const clearInputs = () => {
    setCoffee("");
    setShop("");
    setEditingId(null);
  };


  // 5. ADD A NEW COFFEE OR UPDATE AN EXISTING ONE
  const saveCoffee = async () => {

    if (saving) return;

    if (coffee.trim() === "") {
      setMessage("Please enter a coffee name.");
      return;
    }

    setSaving(true);

    try {
      let updatedList;

      if (editingId === null) {

        // ADD NEW ITEM
        const newCoffee = {
          id: Date.now().toString() +
              Math.random().toString(36).slice(2, 7),
          coffee: coffee.trim(),
          shop: shop.trim(),
        };

        updatedList = [...coffees, newCoffee];

      } else {

        // UPDATE EXISTING ITEM
        updatedList = coffees.map((item) => {

          if (item.id === editingId) {
            return {
              ...item,
              coffee: coffee.trim(),
              shop: shop.trim(),
            };
          }

          return item;
        });
      }

      // Save updated array
      await saveList(updatedList);

      setMessage(
        editingId === null
          ? "Coffee added successfully!"
          : "Coffee updated successfully!"
      );

      clearInputs();

    } catch (error) {
      console.log("Save error:", error);
      setMessage("Could not save the coffee list.");
    } finally {
      setSaving(false);
    }
  };


  // 6. SELECT ITEM FOR EDITING
  const editCoffee = (item) => {

    setCoffee(item.coffee);
    setShop(item.shop);
    setEditingId(item.id);

    setMessage("Edit the fields and press Update.");

    // Return to the form at the top
    listRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };


  // 7. DELETE ONE ITEM
  const deleteCoffee = async (id) => {

    if (saving) return;

    setSaving(true);

    try {

      // Keep every item except the selected one
      const updatedList = coffees.filter(
        (item) => item.id !== id
      );

      // Save the new array
      await saveList(updatedList);

      if (editingId === id) {
        clearInputs();
      }

      setMessage("Coffee deleted!");

    } catch (error) {
      console.log("Delete error:", error);
      setMessage("Could not delete coffee.");
    } finally {
      setSaving(false);
    }
  };


  // 8. USER INTERFACE
  return (
    <View style={styles.screen}>

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#795548"
          style={{ marginTop: 60 }}
        />

      ) : (

        <FlatList
          ref={listRef}
          data={coffees}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}

          // INPUT FORM ABOVE THE LIST
          ListHeaderComponent={

            <View>

              <Text style={styles.title}>
                My Coffee List
              </Text>

              <Text style={styles.subtitle}>
                Add and manage your favorite coffees.
              </Text>

              <View style={styles.form}>

                <Text style={styles.label}>
                  Coffee Name
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: Cappuccino"
                  value={coffee}
                  onChangeText={setCoffee}
                />

                <Text style={styles.label}>
                  Coffee Shop
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Example: My favorite cafe"
                  value={shop}
                  onChangeText={setShop}
                />

                <Pressable
                  style={styles.saveButton}
                  onPress={saveCoffee}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {editingId === null
                      ? "Add Coffee"
                      : "Update Coffee"}
                  </Text>
                </Pressable>

                {editingId !== null && (

                  <Pressable
                    style={styles.cancelButton}
                    onPress={clearInputs}
                  >
                    <Text style={styles.cancelText}>
                      Cancel Editing
                    </Text>
                  </Pressable>

                )}

              </View>

              <Text style={styles.message}>
                {message}
              </Text>

              <Text style={styles.listTitle}>
                Saved Coffees ({coffees.length})
              </Text>

            </View>
          }

          // SHOW MESSAGE WHEN LIST IS EMPTY
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No coffees saved yet.
              Add your first favorite coffee!
            </Text>
          }

          // DISPLAY EACH SAVED ITEM
          renderItem={({ item }) => (

            <View style={styles.itemCard}>

              <Text style={styles.coffeeName}>
                {item.coffee}
              </Text>

              <Text style={styles.shopName}>
                Coffee Shop: {item.shop || "Not specified"}
              </Text>

              <View style={styles.buttonRow}>

                <Pressable
                  style={styles.editButton}
                  onPress={() => editCoffee(item)}
                  disabled={saving}
                >
                  <Text style={styles.smallButtonText}>
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteCoffee(item.id)}
                  disabled={saving}
                >
                  <Text style={styles.smallButtonText}>
                    Delete
                  </Text>
                </Pressable>

              </View>

            </View>

          )}
        />

      )}

    </View>
  );
}


// 9. STYLES
const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: "#F7F3EF",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4E342E",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#795548",
    textAlign: "center",
    marginBottom: 20,
  },

  form: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
    marginBottom: 12,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },

  saveButton: {
    backgroundColor: "#6D4C41",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelButton: {
    padding: 12,
    alignItems: "center",
  },

  cancelText: {
    color: "#6D4C41",
    fontSize: 14,
  },

  message: {
    fontSize: 14,
    color: "#795548",
    textAlign: "center",
    marginBottom: 15,
  },

  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4E342E",
    marginBottom: 14,
  },

  emptyText: {
    textAlign: "center",
    color: "#8D6E63",
    marginTop: 20,
    fontSize: 15,
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFEBE9",
  },

  coffeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4E342E",
    marginBottom: 6,
  },

  shopName: {
    fontSize: 14,
    color: "#795548",
    marginBottom: 14,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#8D6E63",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#B85C50",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },

  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

});
