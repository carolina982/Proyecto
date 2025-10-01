import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, Picker, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useStore } from "../context/Store";

export default function Register({ navigation }: any) {
  const { addUser, login } = useStore();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"Admin" | "Chofer">("Chofer"); // Campo rol
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUrl(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUrl(result.assets[0].uri);
  };

  const handleRegister = () => {
    if (!email || !nombre || !apellido || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      nombre,
      apellido,
      email,
      password,
      rol, //  rol seleccionado por el usuario
      photoUrl,
    };

    
    navigation.navigate("Dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} style={styles.input} />
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

      {/* Selector de rol */}
      <Text style={{ marginBottom: 5 }}>Selecciona tu rol:</Text>
      <Picker selectedValue={rol} onValueChange={(value: string) => setRol(value as "Admin" | "Chofer")} style={styles.picker}>
        <Picker.Item label="Chofer" value="Chofer" />
        <Picker.Item label="Admin" value="Admin" />
      </Picker>

      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoButton} onPress={pickImageFromGallery}>
          <Text style={styles.photoButtonText}>Elegir foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Text style={styles.photoButtonText}>Tomar foto</Text>
        </TouchableOpacity>
      </View>

      {photoUrl && <Image source={{ uri: photoUrl }} style={styles.avatarPreview} />}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.registerText}>¿Ya tienes cuenta? Inicia Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  input: { width: "100%", height: 50, backgroundColor: "#fff", paddingHorizontal: 15, marginBottom: 15, borderRadius: 10, borderWidth: 1, borderColor: "#ccc" },
  picker: { width: "100%", height: 50, marginBottom: 15, backgroundColor: "#fff", borderRadius: 10 },
  photoButtons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  photoButton: { flex: 0.48, height: 45, backgroundColor: "#007bff", justifyContent: "center", alignItems: "center", borderRadius: 10 },
  photoButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  avatarPreview: { width: 100, height: 100, borderRadius: 50, alignSelf: "center", marginVertical: 10 },
  button: { width: "100%", height: 50, backgroundColor: "#007bff", borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  registerButton: { marginTop: 15, alignItems: "center" },
  registerText: { color: "#007bff", fontSize: 16 },
});