import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import * as Notifications from "expo-notifications";
import { theme } from "../../theme";

export default function CounterScreen() {
  const handleRequestPermission = async () => {
    const result = await registerForPushNotificationsAsync();
    console.log("Permission: ", result);
  };

  const scheduleNotification = async () => {
    const result = await registerForPushNotificationsAsync();

    if (result === "granted") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "I'm a notification from your app! 📨",
        },
        trigger: {
          seconds: 5,
        },
      });
    } else {
      Alert.alert(
        "Unable to schedule notification",
        // eslint-disable-next-line prettier/prettier
        "Enable the notifications permission for Expo Go in settings"
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleRequestPermission}
        // onPress={scheduleNotification}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Request permission</Text>
        {/* <Text style={styles.buttonText}>Schedule notification</Text> */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colorWhite,
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
