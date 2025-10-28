import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import { useStore } from "../context/Store";

export default function Login({ navigation }: any) {
  const { login } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword]=useState(false);
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://192.168.1.81:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Ocurrió un problema al iniciar sesión");
        return;
      }
      login(data);
      if (data.rol?.toLowerCase() === "admin") {
        navigation.navigate("AdminPage");
      } else {
        navigation.navigate("Dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "No se pudo iniciar sesión. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FontAwesome5 name="truck-moving" size={85.5} color="#007bff" style={styles.icon} />
      <Text style={styles.title}>Volta</Text>
      <TextInput placeholder="Correo electrónico"value={email}onChangeText={setEmail}keyboardType="email-address"autoCapitalize="none"mode="flat" underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"dense style={styles.input}/>
      <TextInput placeholder="Contraseña"value={password}onChangeText={setPassword}secureTextEntry={!showPassword}mode="flat" underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"dense style={styles.input} 
      right={<TextInput.Icon icon={showPassword ? "eye-off":"eye"}color="#007bff"onPress={()=>setShowPassword(!showPassword)}/>}/>
      <TouchableOpacity  style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, backgroundColor: "#f5f5f5" },
  icon: { marginBottom: 20 },
  title: { fontSize: 28, marginBottom: 30, fontWeight: "bold" },
  input: { width: "100%", height: 50, backgroundColor: "", paddingHorizontal: 15, marginBottom: 15, borderRadius: 10,  },
  button: { width: "100%", height: 50, backgroundColor: "#007bff", borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  registerButton: { marginTop: 15 },
  registerText: { color: "#007bff", fontSize: 16 },
});