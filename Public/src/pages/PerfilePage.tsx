import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar, Button, TextInput } from "react-native-paper";

interface User {
  id: string;
  nombre: string;
  apellido: string;
  rol: "Admin" | "Chofer";
  email: string;
  photoUrl: string | null;
}

interface PerfilPageProps {
  currentUser: User | null;
  setCurrentUser?: (user: User) => void;
}

export default function PerfilPage({ currentUser, setCurrentUser }: PerfilPageProps) {
  if (!currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0d75bb" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  const [nombre, setNombre] = useState(currentUser.nombre);
  const [apellido, setApellido] = useState(currentUser.apellido);
  const [rol, setRol] = useState<"Admin" | "Chofer">(currentUser.rol);
  const [email, setEmail] = useState(currentUser.email);
  const [photoUri, setPhotoUri] = useState<string | null>(
    currentUser.photoUrl ? `http://192.168.1.81:3000${currentUser.photoUrl}` : null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://192.168.1.81:3000/api/users/${currentUser.id}`);
        if (!res.ok) throw new Error("No se pudo obtener el perfil");
        const data = await res.json();
        setNombre(data.nombre);
        setApellido(data.apellido);
        setEmail(data.email);
        setRol(data.rol);
        if (data.photoUrl)
          setPhotoUri(`http://192.168.1.81:3000${data.photoUrl}?t=${Date.now()}`);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };
    fetchUser();
  }, [currentUser.id]);

  const pickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert("Permiso denegado", "Se requiere acceso a la galería para subir foto");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
      });

      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userId = currentUser.id;
      if (!userId) {
        Alert.alert("Error", "No se encontró el id del usuario");
        return;
      }
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("apellido", apellido);
      formData.append("email", email);
      formData.append("rol", rol);

      if (photoUri && !photoUri.startsWith("http")) {
        if (Platform.OS === "web") {
          const response = await fetch(photoUri);
          const blob = await response.blob();
          const filename =`photo_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: blob.type });
          formData.append("photo", file);
        } else {
          const localUri = photoUri.startsWith("file://") ? photoUri : "file://" + photoUri;
          const filename = localUri.split("/").pop()!;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1].toLowerCase()}`: "image";
          formData.append("photo", { uri: localUri, name: filename, type } as any);
        }
      }

      const response = await fetch(`http://192.168.1.81:3000/api/users/${userId}`, {
        method: "PATCH",
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text || "Error al actualizar perfil");
      const data = JSON.parse(text);

      setNombre(data.nombre);
      setApellido(data.apellido);
      setEmail(data.email);
      setRol(data.rol);
      if (data.photoUrl)
        setPhotoUri(`http://192.168.1.81:3000${data.photoUrl}?t=${Date.now()}`);

      if (setCurrentUser) {
        setCurrentUser({
          ...currentUser,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          rol: data.rol,
          photoUrl: data.photoUrl,
        });
      }

      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error: any) {
      console.error("Error en handleSave", error);
      Alert.alert("Error", error.message || "No se pudo actualizar el perfil");
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
          label={(nombre ?? "")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()}
          style={styles.avatar}
        />
      )}

      <Button mode="outlined"style={styles.changePhotoButton}onPress={pickImage}labelStyle={{ color: "#0d75bb" }}>Cambiar Imagen</Button>
      <Text style={styles.title}>Perfil</Text>
      <TextInput label="Nombre"value={nombre}onChangeText={setNombre}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#8bc1e6ff"style={styles.input}/>
      <TextInput label="Apellido"value={apellido}onChangeText={setApellido}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#8bc1e6ff"style={styles.input}/>
      <TextInput label="Email"value={email}onChangeText={setEmail}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#8bc1e6ff"style={styles.input}/>
      <Text style={{ alignSelf: "flex-start", marginBottom: 5, color: "#0f0f0f" }}>Rol</Text>
      <Picker
        selectedValue={rol}
        onValueChange={(value: "Admin" | "Chofer") => setRol(value)}
        style={styles.picker}
      >
        <Picker.Item label="Admin" value="Admin" />
        <Picker.Item label="Chofer" value="Chofer" />
      </Picker>
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
  container: { padding: 20, flexGrow: 1, alignItems: "center" },
  avatar: { backgroundColor: "#0d75bb", marginBottom: 10 },
  changePhotoButton: { marginBottom: 20, borderColor: "#0d75bb" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#0d75bb" },
  input: { width: "100%", marginBottom: 15, backgroundColor: "" },
  picker: { width: "100%", marginBottom: 15, color: "#0d75bb" },
  button: { width: "100%", marginTop: 10 },
});