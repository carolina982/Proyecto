import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Card } from "react-native-paper";
import { useStore } from "../context/Store";

export default function TripsPague () {
    const {trips ,currentUser} =useStore();

    //filtrado segun el rol
    const tripsToShow =currentUser?.rol === "Admin" ?trips :trips.filter (t =>t.choferId === currentUser?.id);

    return (
        <View style={styles.container}>
            <Text style ={styles.title}>Viajes</Text>
            <FlatList
            data ={tripsToShow }
            keyExtractor={item => item.id} renderItem={({item }) =>{
                <Card>
                    <Text>Origen :{item.origen}</Text>
                    <Text>Destino:{item.destino}</Text>
                    <Text>Kilómetros:{item.kilometros}</Text>
                    <Text>Estado:{item.estado}</Text>
                </Card>
            }}
            />
        </View>
    );
}

const styles =StyleSheet.create ({
    container :{flex:1 ,padding :16},
    title:{fontSize:24,fontWeight:"bold",marginBottom:10},
});