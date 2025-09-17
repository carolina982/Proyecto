import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useStore } from "../context/Store";

export default function Register({ navigation }: any) {
  const { users, addUser } = useStore();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"Admin" | "Chofer">("Chofer");

  const handleRegister = () => {
    if (!nombre || !email) return alert("Todos los campos son obligatorios");
    if (users.find(u => u.email === email)) return alert("Usuario ya existe");
    const Nuevo = { id: Date.now().toString(), nombre, email, rol };
    addUser (Nuevo) ;
    alert("Usuario creado");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <Picker selectedValue={rol} onValueChange={value => setRol(value as any)} style={styles.picker}>
        <Picker.Item label="Chofer" value="Chofer" />
        <Picker.Item label="Admin" value="Admin" />
      </Picker>
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  picker: { height: 50, width: "100%", marginBottom: 20 },
});
