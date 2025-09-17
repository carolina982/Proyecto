import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { User, useStore } from "../context/Store";

export default function Login({ navigation }: any) {
  const {login } =useStore ();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!nombre || !email) {
      alert("Por favor completa todos los campos");
      return;
    }
    const user: User = {
      id: "1",
      nombre,
      email,
      rol: "Chofer",
    };
    login(user);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Ícono de tráiler */}
      <FontAwesome5 name="truck-moving" size={85.5} color="#007bff" style={styles.icon} />

      <Text style={styles.title}>Volta</Text>

      <TextInput
        placeholder="Usuario"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <TextInput
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  icon: {
    marginBottom: 20, // separa el ícono del título
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 15,
  },
  registerText: {
    color: "#007bff",
    fontSize: 16,
  },
});