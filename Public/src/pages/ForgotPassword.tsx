import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
export default function ForgotPassword (){
    const [email,setEmail]=useState("");
    const [loading, setLoading]=useState(false);
    const handleSend = async ()=>{
        if (!email) return Alert.alert("Error","Ingresa tu correo electronico ");
        setLoading(true);
        try {
            const res=await fetch("http://192.168.1.81:3000/api/users/forgot-password",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({email}),
            });
            const data =await res.json();
            Alert.alert("Aviso", data.message || "Correo enviado sila cuenta exite");
        }catch{
            Alert.alert("Error", "No se pudo enviar al correo");
        }finally{
            setLoading(false);
        }
    };
    return (
        <View style={styles.container}>
            <TextInput placeholder="Correo electronico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input}/>
            <Button mode="contained" onPress={handleSend} loading={loading}>Enviar correo de recuperacion</Button>
        </View>
    );
}
const styles=StyleSheet.create({
    container:{flex:1, justifyContent:"center",padding:20},
    input:{marginBottom:15}
})