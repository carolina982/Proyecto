import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Avatar, Button, Text, TextInput } from "react-native-paper";

interface User {
  _id: string;
  nombre: string;
  apellido: string;
  rol: "Admin" | "Chofer";
  email: string;
  photoUrl: string | null;
}

interface PerfilPageProps {
  currentUser: User;
}

export default function PerfilPage({ currentUser }: PerfilPageProps) {
  const [nombre, setNombre] = useState(currentUser.nombre);
  const [apellido, setApellido] = useState(currentUser.apellido);
  const [rol, setRol] = useState<"Admin" | "Chofer">(currentUser.rol);
  const [email, setEmail] = useState(currentUser.email);
  const [photoUri, setPhotoUri] = useState<string | null>(
    currentUser.photoUrl ? `http://192.168.1.81:3000${currentUser.photoUrl}`: null
  );
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería para subir foto");
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
const handleSave = async () => {
  setIsSaving(true);
  try {
    const userId = currentUser._id;
    if (!userId) return Alert.alert("Error", "No se encontró el ID del usuario");

    const payload: any = { nombre, apellido, email, rol };

    if (photoUri && !photoUri.startsWith("http")) {
      Alert.alert("Info", "Actualmente solo se actualizan datos de texto");
    }

    const response = await fetch(`http://192.168.1.81:3000/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al actualizar perfil");
    }

    const data = await response.json();
    setNombre(data.nombre);
    setApellido(data.apellido);
    setEmail(data.email);
    setRol(data.rol);

    Alert.alert("Éxito", "Perfil actualizado correctamente");
  } catch (error: any) {
    console.error("Error en handleSave:", error);
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

       <Button mode="outlined"style={styles.changePhotoButton}onPress={pickImage}labelStyle={{ color: "#0d75bb" }}> Cambiar Imagen</Button>
      
      <Text style={styles.title}>Perfil</Text>
      
      <TextInput label="Nombre"value={nombre}onChangeText={setNombre} mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#8bc1e6ff"style={styles.input}/>
      <TextInput label="Apellido"value={apellido}onChangeText={setApellido}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#8bc1e6ff"style={styles.input}/>
      <TextInput label="Email"value={email}onChangeText={setEmail}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#8bc1e6ff"style={styles.input}/>
      <Text style={{ alignSelf: "flex-start", marginBottom: 5, color: "#0f0f0fff" }}>Rol</Text>
      <Picker selectedValue={rol}onValueChange={(value: "Admin" | "Chofer") => setRol(value)}style={styles.picker}>
        <Picker.Item label="Admin" value="Admin" />
        <Picker.Item label="Chofer" value="Chofer" />
      </Picker>
      <Button mode="contained" buttonColor="#0d75bb"style={styles.button}onPress={handleSave}loading={isSaving}> Guardar Cambios</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding: 20,flexGrow: 1,alignItems: "center",},
  avatar:{backgroundColor: "#0d75bb",marginBottom: 10,},
  changePhotoButton: {marginBottom: 20,borderColor: "#0d75bb", },
  title:{fontSize: 24,fontWeight: "bold",marginBottom: 20,color: "#0d75bb",},
  input: {width: "100%",marginBottom: 15,backgroundColor:"", },
  picker:{width: "100%",marginBottom: 15,color: "#0d75bb",},
  button:{width: "100%",marginTop: 10,},
});