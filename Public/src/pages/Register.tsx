import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from "react-native";
import { useStore } from "../context/Store";

export default function Register({ navigation }: any) {
  const { users, addUser } = useStore();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState(""); // nuevo campo apellido
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"Admin" | "Chofer">("Chofer");
  const [photoUri, setPhotoUri] = useState<string | null>(null); // URI de la foto

  // Función para seleccionar foto desde la galería
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

  const handleRegister = () => {
    if (!nombre || !apellido || !email) return alert("Todos los campos son obligatorios");
    if (users.find(u => u.email === email)) return alert("Usuario ya existe");

    const Nuevo = { 
      id: Date.now().toString(), 
      nombre: nombre + " " + apellido, // unir nombre y apellido
      email, 
      rol, 
      photoUrl: photoUri 
    };

    addUser(Nuevo);
    alert("Usuario creado");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} style={styles.input} />

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />

      <Picker selectedValue={rol} onValueChange={value => setRol(value as any)} style={styles.picker}>
        <Picker.Item label="Chofer" value="Chofer" />
        <Picker.Item label="Admin" value="Admin" />
      </Picker>

      {/* Mostrar foto seleccionada */}
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}

      <Button title="Seleccionar Foto" onPress={pickImage} />
      <View style={{ marginTop: 10 }} />
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  picker: { height: 50, width: "100%", marginBottom: 20 },
  photo: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
});