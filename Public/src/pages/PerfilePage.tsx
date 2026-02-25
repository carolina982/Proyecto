import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar, Button, TextInput } from "react-native-paper";
import { User } from "../types";

interface PerfilPageProps {
  currentUser: User | null;
  setCurrentUser?: (user: User) => void;
}

export default function PerfilPage({
  currentUser,
  setCurrentUser,
}: PerfilPageProps) {
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
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
    currentUser.photoUrl
      ? `http://192.168.1.81:3000${currentUser.photoUrl}`
      : null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error: any) {
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
        <Avatar.Text size={100}label={(nombre ?? "").split(" ").map((n: string) => n[0]).join("").toUpperCase()}style={styles.avatar}/>)}
      <Button mode="outlined" style={styles.changePhotoButton} onPress={() => {}} labelStyle={{ color: "#0d75bb" }}>
        Cambiar Imagen
      </Button>
      <Text style={styles.title}>Perfil</Text>
      <TextInput label="Nombre"value={nombre}onChangeText={setNombre}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"textColor="#000"contentStyle={{ color: "#000", fontWeight: "600" }}style={styles.input}/>
      <TextInput label="Apellido"value={apellido}onChangeText={setApellido}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"textColor="#000"contentStyle={{ color: "#000", fontWeight: "600" }}style={styles.input}/>
      <TextInput label="Email"value={email}onChangeText={setEmail}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"textColor="#000"contentStyle={{ color: "#000", fontWeight: "600" }}style={styles.input}/>
      <Text style={styles.rolLabel}>Rol</Text>
      <Picker selectedValue={rol}onValueChange={(value: "Admin" | "Chofer") => setRol(value)}style={styles.picker}>
        <Picker.Item label="Admin" value="Admin" />
        <Picker.Item label="Chofer" value="Chofer" />
      </Picker>

      <Button mode="contained" buttonColor="#0d75bb" style={styles.button} onPress={handleSave} loading={isSaving}>  Guardar Cambios
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer:{flex: 1,justifyContent: "center",alignItems: "center"},
  container:{padding: 20,flexGrow: 1,alignItems: "center",backgroundColor: "#f5f7fa",},
  avatar:{backgroundColor: "#0d75bb",marginBottom: 10,},
  changePhotoButton:{marginBottom: 20,borderColor: "#0d75bb",},
  title:{fontSize: 24,fontWeight: "bold",marginBottom: 20,color: "#000",},
  input: {width: "100%", marginBottom: 15,backgroundColor: "transparent",   borderRadius: 8,},
  rolLabel:{alignSelf: "flex-start",marginBottom: 5,color: "#000",fontWeight: "600",},
  picker:{ width: "100%", marginBottom: 15,color: "#0d75bb", backgroundColor: "#fff",},
  button:{width: "100%", marginTop: 10,},
});