import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Trip, User, useStore } from "../context/Store";

export default function TripsPage() {
  const { trips, addTrip, removeTrip, users } = useStore();
  const [modalVisible, setModalVisble] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [conductorId, setConductorId] = useState("");

  const openModal = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setNombre(trip.nombre);
      setDescripcion(trip.descripcion);
      setConductorId(trip.conductorId);
    } else {
      setEditingTrip(null);
      setNombre("");
      setDescripcion("");
      setConductorId("");
    }
    setModalVisble(true);
  };

  const saveTrip = () => {
    if (!nombre || !descripcion || !conductorId) {
      Alert.alert("Error", "Completa todos los datos");
      return;
    }
    const trip: Trip = {
      id: editingTrip ? editingTrip.id : Date.now().toString(),
      nombre,
      descripcion,
      conductorId,
      estado: editingTrip ? editingTrip.estado : "pendiente",
    };
    addTrip(trip);
    setEditingTrip(null);
    setNombre("");
    setDescripcion("");
    setConductorId("");
    setModalVisble(false);
  };

  const deleteTripItem = (id: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar este viaje?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeTrip(id) },
    ]);
  };

  const renderItem = ({ item }: { item: Trip }) => {
    const user: User | undefined = users.find((u) => u.id === item.conductorId);
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.nombre}</Text>
        <Text>{item.descripcion}</Text>
        <Text>Conductor: {user ? user.nombre : "No asignado"}</Text>
        <Text>Estado: {item.estado}</Text>
        <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
          <Button
            mode="contained"
            buttonColor="#008bff"
            onPress={() => openModal(item)}
          >
            Editar
          </Button>
          <Button
            mode="contained"
            onPress={() => deleteTripItem(item.id)}
            buttonColor="red"
          >
            Eliminar
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        buttonColor="#0d75bb"
        onPress={() => openModal()}
      >
        Nuevo Viaje
      </Button>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 15 }}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Viaje</Text>
          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
          />
          <TextInput
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            style={styles.input}
          />

          {/*  Picker para seleccionar conductor */}
          <Text style={{ marginBottom: 5 }}>Asignar Conductor:</Text>
          <Picker
            selectedValue={conductorId}
            onValueChange={(value) => setConductorId(value)}
            style={styles.input}
          >
            <Picker.Item label="Seleccione un conductor" value="" />
            {users
              .filter((u) => u.rol?.toLowerCase() === "chofer")
              .map((u) => (
                <Picker.Item key={u.id} label={u.nombre} value={u.id} />
              ))}
          </Picker>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Button mode="contained" onPress={() => setModalVisble(false)}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={saveTrip}>
              Guardar
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  title: { fontWeight: "bold", fontSize: 16, color: "#007bff" },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});