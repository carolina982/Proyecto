import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";
import { useStore } from "../context/Store";
 
export default function UnitsPage (){
    const {users ,currentUser} =useStore();
    //solo admin pude ver todas las unidades 
    if (currentUser ?.rol !=="Admin"){
        return (
            <View style={styles.container}>
                <Text>Hola </Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Text style ={styles.title}>Unidades/choferes</Text>
            <FlatList 
            data ={users.filter (u=>u.rol === "Chofer")}
            keyExtractor={item => item.id} renderItem={({item})=> (
                <Card>
                    <Text>Nombre : {item.nombre}</Text>
                    <Text>Email : {item.email}</Text>
                </Card>
            )}
            />
        </View>
    );
}

const styles =StyleSheet.create ({
    container :{flex:1 ,padding:16 },
    title:{fontSize :24 , fontWeight:"bold",marginBottom:10},
});