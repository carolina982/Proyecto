import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet } from "react-native";
import { Avatar, Button, Text, TextInput } from "react-native-paper";

interface User {
  id: string;
  nombre: string;
  rol: string;
  email: string;
  photoUrl?: string | null;
}

interface PerfilPageProps {
  currentUser: User;
}

export default function PerfilPage({ currentUser }: PerfilPageProps) {
  const [nombre, setNombre] = useState(currentUser.nombre);
  const [rol, setRol] = useState(currentUser.rol);
  const [email, setEmail] = useState(currentUser.email);
  const [photoUri, setPhotoUri] = useState<string | null>(
    currentUser.photoUrl ? `http://192.168.1.81:3000${currentUser.photoUrl} `: null
  );
  const [isSaving, setIsSaving] = useState(false);

  // Seleccionar imagen de galería
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería para subir una foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // Guardar cambios en el backend
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("rol", rol);
      formData.append("email", email);

      // Si hay nueva foto y no es la misma que la del servidor
      if (photoUri && !photoUri.startsWith("http")) {
        const filename = photoUri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]} `: "image";

        formData.append("photo", {
          uri: Platform.OS === "ios" ? photoUri.replace("file://", "") : photoUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`http://192.168.1.81:3000/api/users/${currentUser.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al actualizar perfil");

      const data = await response.json();

      setNombre(data.nombre);
      setRol(data.rol);
      setEmail(data.email);
      setPhotoUri(data.photoUrl ? `http://192.168.1.81:3000${data.photoUrl}` : null);

      Alert.alert("Éxito", "Perfil y foto actualizados");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {photoUri ? (
        <Avatar.Image size={100} source={{ uri: photoUri }} style={styles.avatar} />
      ) : (
        <Avatar.Text
          size={100}
          label={nombre
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
          style={styles.avatar}
        />
      )}

      <Button
        mode="outlined"
        style={styles.changePhotoButton}
        onPress={pickImage}
        labelStyle={{ color: "#0d75bb" }}
      >
        Cambiar Imagen
      </Button>

      <Text style={styles.title}>Perfil</Text>

      <TextInput
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        mode="flat"
        underlineColor="#0d75bb"
        activeUnderlineColor="#0d75bb"
        style={styles.input}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="flat"
        underlineColor="#0d75bb"
        activeUnderlineColor="#0d75bb"
        style={styles.input}
      />

      <TextInput
        label="Rol"
        value={rol}
        onChangeText={setRol}
        mode="flat"
        underlineColor="#0d75bb"
        activeUnderlineColor="#0d75bb"
        style={styles.input}
      />

      <Button
        mode="contained"
        buttonColor="#0d75bb"
        style={styles.button}
        onPress={handleSave}
        loading={isSaving}
      >
        Guardar Cambios
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#0d75bb",
    marginBottom: 10,
  },
  changePhotoButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "",
  },
  button: {
    width: "100%",
    marginTop: 10,
  },
});