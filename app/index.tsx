import {
  StyleSheet,
  TextInput,
  FlatList,
  View,
  Text,
  LayoutAnimation,
} from "react-native";
import { ShoppingListItem } from "../components/shopping-list-item";
import { theme } from "../theme";
import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../utils/storage";
import { STORAGE_KEY } from "../utils/constants";
import * as Haptics from "expo-haptics";

type ShoppingListItemType = {
  id: string;
  name: string;
  completedAtTimestamp?: number;
  lastUpdatedAtTimestamp: number;
};

export default function App() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>([]);
  const [value, setValue] = useState<string>();

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getFromStorage(STORAGE_KEY);

      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setShoppingList(data);
      }
    };

    fetchInitial();
  }, []);

  const handleSubmit = () => {
    if (value) {
      const newShoppingList = [
        {
          id: new Date().toISOString(),
          name: value,
          lastUpdatedAtTimestamp: Date.now(),
        },
        ...shoppingList,
      ];

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setShoppingList(newShoppingList);
      saveToStorage(STORAGE_KEY, newShoppingList);
      setValue(undefined);
    }
  };

  const handleDelete = (id: string) => {
    const newShoppingList = shoppingList.filter((item) => item.id !== id);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setShoppingList(newShoppingList);
  };

  const handleToggleComplete = (id: string) => {
    const newShoppingList = shoppingList.map((item) => {
      if (item.id === id) {
        if (item.completedAtTimestamp) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        return {
          ...item,
          lastUpdatedAtTimestamp: Date.now(),
          completedAtTimestamp: item.completedAtTimestamp
            ? undefined
            : Date.now(),
        };
      }
      return item;
    });

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    saveToStorage(STORAGE_KEY, newShoppingList);
    setShoppingList(newShoppingList);
  };

  const sortShoppingList = (shoppingList: ShoppingListItemType[]) => {
    return shoppingList.sort((a, b) => {
      if (a.completedAtTimestamp && b.completedAtTimestamp) {
        return b.completedAtTimestamp - a.completedAtTimestamp;
      }

      if (a.completedAtTimestamp && !b.completedAtTimestamp) {
        return 1;
      }

      if (!a.completedAtTimestamp && b.completedAtTimestamp) {
        return -1;
      }

      if (!a.completedAtTimestamp && !b.completedAtTimestamp) {
        return b.lastUpdatedAtTimestamp - a.lastUpdatedAtTimestamp;
      }

      return 0;
    });
  };

  return (
    <FlatList
      data={sortShoppingList(shoppingList)}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={
        <TextInput
          value={value}
          style={styles.textInput}
          onChangeText={setValue}
          placeholder="e.g Coffee"
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
      }
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your shopping list is empty</Text>
        </View>
      }
      stickyHeaderIndices={[0]}
      renderItem={({ item }) => (
        <ShoppingListItem
          name={item.name}
          onDelete={() => handleDelete(item.id)}
          onToggleComplete={() => handleToggleComplete(item.id)}
          isCompleted={Boolean(item.completedAtTimestamp)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    paddingVertical: 12,
  },
  contentContainer: {
    paddingVertical: 12,
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    fontSize: 18,
    borderRadius: 50,
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: theme.colorWhite,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});
