import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Button, Image, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { User } from "../types";

interface ProfileTabProps {
  currentUser: User;
}

export default function ProfileTab({ currentUser }: ProfileTabProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState(currentUser.nombre);
  const [email, setEmail] = useState(currentUser.email);

  // Función para abrir el selector de imágenes
  const pickImage = async () => {
    // Pedir permisos (solo necesario en móvil)
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Se necesitan permisos para acceder a la galería");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // Aquí puedes actualizar el usuario en el store si quieres
    alert("Perfil actualizado");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.section}>Perfil</Text>

      <Image
        source={
          photoUri
            ? { uri: photoUri }
            : { uri: "https://via.placeholder.com/120" } // placeholder por defecto
        }
        style={styles.photo}
      />

      <Button title="Cambiar foto" onPress={pickImage} />

      <TextInput
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <Button title="Guardar cambios" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  section: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  photo: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
});