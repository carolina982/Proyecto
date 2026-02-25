import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button, DefaultTheme, Provider as PaperProvider, TextInput } from "react-native-paper";

export default function ForgotPassword({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    if (!email) {
      Alert.alert("Error", "Ingresa tu correo electrónico");
      return;
    }
    console.log("Enviando correo de recuperación para:", email);
    setLoading(true);
    try {
      const res = await fetch("http://192.168.1.81:3000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      Alert.alert("Aviso", data.message || "Correo enviado si la cuenta existe");
    } catch (error) {
      console.error("Error enviando correo:", error);
      Alert.alert("Error", "No se pudo enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider
      theme={{...DefaultTheme,
        colors: { ...DefaultTheme.colors,
          primary: "transparent", 
          onSurfaceVariant: "#007bff",
        },
      }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <TextInput placeholder="Correo electrónico"contentStyle={{ color: "#000", fontWeight: "600" }} value={email}onChangeText={setEmail}keyboardType="email-address"autoCapitalize="none"mode="flat"style={styles.input}/>
        <Button mode="contained"onPress={handleSend}loading={loading}contentStyle={styles.buttonContent}labelStyle={styles.buttonLabel}style={styles.button}>
          Enviar correo de recuperación
        </Button>
        <Text style={styles.backLink} onPress={() => navigation.navigate("Login")}> ← Volver al inicio de sesión</Text>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,justifyContent: "center",padding: 20,backgroundColor: "#f8f9fa",},
  title:{fontSize: 26,fontWeight: "bold",color: "#007bff",textAlign: "center",marginBottom: 25, },
  input:{backgroundColor: "transparent",borderRadius: 10,paddingHorizontal: 10,height: 50,marginBottom: 15,},
  button:{backgroundColor: "#007bff", borderRadius: 10,elevation: 0,},
  buttonContent:{height: 50},
  buttonLabel:{color: "#fff",fontSize: 16,fontWeight: "bold",},
  backLink:{marginTop: 20,textAlign: "center",color: "#007bff",},
});