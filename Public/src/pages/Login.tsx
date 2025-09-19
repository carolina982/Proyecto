import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useStore } from "../context/Store";

export default function Login({ navigation }: any) {
  const { users, login } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    // Buscar usuario por email
    const existingUser = users.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
    );

    if (!existingUser) {
      Alert.alert("Usuario no encontrado", "Regístrate primero");
      return;
    }

    // Iniciar sesión
    login(existingUser);

    // Redirigir según rol
    if (existingUser.rol?.toLowerCase() === "admin") {
      navigation.navigate("AdminPage");
    } else {
      navigation.navigate("Dashboard");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FontAwesome5 name="truck-moving" size={85.5} color="#007bff" style={styles.icon} />

      <Text style={styles.title}>Volta</Text>

      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, backgroundColor: "#f5f5f5" },
  icon: { marginBottom: 20 },
  title: { fontSize: 28, marginBottom: 30, fontWeight: "bold" },
  input: { width: "100%", height: 50, backgroundColor: "#fff", paddingHorizontal: 15, marginBottom: 15, borderRadius: 10, borderWidth: 1, borderColor: "#ccc" },
  button: { width: "100%", height: 50, backgroundColor: "#007bff", borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  registerButton: { marginTop: 15 },
  registerText: { color: "#007bff", fontSize: 16 },
});