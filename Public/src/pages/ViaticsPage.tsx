import React, { useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Trip, useStore, Viatic } from "../context/Store";

export default function ViaticsPage() {
  const { viatics, trips, addViatic, updateViatic, removeViatic } = useStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingViatic, setEditingViatic] = useState<Viatic | null>(null);
  const [tripId, setTripId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const openModal = (viatic?: Viatic) => {
    if (viatic) {
      setEditingViatic(viatic);
      setTripId(viatic.tripId);
      setAmount(viatic.amount.toString());
      setDescription(viatic.description);
    }
    setModalVisible(true);
  };

  const saveViatic = () => {
    if (!tripId || !amount || !description) {
      Alert.alert("Error", "Completa todos los datos");
      return;
    }
    const viatic: Viatic = {
      id: editingViatic ? editingViatic.id : Date.now().toString(),
      tripId,
      amount: Number(amount),
      description,
    };
    if (editingViatic) updateViatic(viatic);
    else addViatic(viatic);

    setEditingViatic(null);
    setTripId("");
    setAmount("");
    setDescription("");
    setModalVisible(false);
  };

  const deleteViaticItem = (id: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar este viático?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeViatic(id) },
    ]);
  };

  const renderItem = ({ item }: { item: Viatic }) => {
    const trip: Trip | undefined = trips.find((t) => t.id === item.tripId);
    return (
      <View style={styles.card}>
        <Text style={styles.title}>${item.amount}</Text>
        <Text>Descripción: {item.description}</Text>
        <Text>Viaje: {trip?.nombre || "No asignado"}</Text>
        <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
          <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>
            Editar
          </Button>
          <Button mode="contained" onPress={() => deleteViaticItem(item.id)} buttonColor="red">
            Eliminar
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" buttonColor="#0d75bbff" onPress={() => openModal()} >
        Nuevo Viático
      </Button>
      <FlatList
        data={viatics}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 15 }}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingViatic ? "Editar Viático" : "Nuevo Viático"}</Text>
          <TextInput
            placeholder="Trip ID"
            value={tripId}
            onChangeText={setTripId}
            style={styles.input}
          />
          <TextInput
            placeholder="Monto"
            value={amount}
            keyboardType="numeric"
            onChangeText={setAmount}
            style={styles.input}
          />
          <TextInput
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Button mode="contained" onPress={() => setModalVisible(false)}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={saveViatic}>
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
  card: { backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10 },
  title: { fontWeight: "bold", fontSize: 16, color: "#007bff" },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
});