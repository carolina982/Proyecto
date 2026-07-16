import { Expo, ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo();

export async function sendPushToToken(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!Expo.isExpoPushToken(token)) {
    console.warn("Push token inválido:", token);
    return;
  }

  const message: ExpoPushMessage = {
    to: token,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      console.log("Push enviado:", tickets);
    }
  } catch (error) {
    console.error("Error enviando push:", error);
  }
}
