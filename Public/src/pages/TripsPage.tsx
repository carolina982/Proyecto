import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../api/api";

interface Trip {
  id: string;
  nombre: string;
  unidadId: string;
  conductorId: string;
  fechaSalida: string;
  fechaLlegada: string;
  destino: string;
  estado: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [nombre, setNombre] = useState("");
  const [unidadId, setUnidadId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [fechaLlegada, setFechaLlegada] = useState("");
  const [destino, setDestino] = useState("");

  // Carga viajes al iniciar
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data);
    } catch (error) {
      console.error("Error cargando viajes", error);
    }
  };

  const openModal = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setNombre(trip.nombre);
      setUnidadId(trip.unidadId);
      setConductorId(trip.conductorId);
      setFechaSalida(trip.fechaSalida);
      setFechaLlegada(trip.fechaLlegada);
      setDestino(trip.destino);
    } else {
      setEditingTrip(null);
      setNombre("");
      setUnidadId("");
      setConductorId("");
      setFechaSalida("");
      setFechaLlegada("");
      setDestino("");
    }
    setModalVisible(true);
  };

  const saveTrip = async () => {
    if (!nombre || !unidadId || !conductorId || !fechaSalida || !fechaLlegada || !destino) {
      Alert.alert("Error", "Completa todos los datos");
      return;
    }

    const tripData = {
      nombre,
      unidadId,
      conductorId,
      fechaSalida,
      fechaLlegada,
      destino,
      estado: editingTrip?.estado || "pendiente",
    };

    try {
      if (editingTrip) {
        await api.put(`/trips/${editingTrip.id}`, tripData);
      } else {
        await api.post("/trips", tripData);
      }
      await loadTrips();
      setModalVisible(false);
    } catch (error) {
      console.error("Error guardando viaje", error);
      Alert.alert("Error", "No se pudo guardar el viaje");
    }
  };

  const deleteTripItem = (id: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar este viaje?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/trips/${id}`);
            await loadTrips();
          } catch (error) {
            console.error("Error eliminando viaje", error);
            Alert.alert("Error", "No se pudo eliminar el viaje");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Trip }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text>Unidad: {item.unidadId}</Text>
      <Text>Conductor: {item.conductorId}</Text>
      <Text>Destino: {item.destino}</Text>
      <Text>Salida: {item.fechaSalida}</Text>
      <Text>Llegada: {item.fechaLlegada}</Text>
      <Text>Estado: {item.estado}</Text>
      <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>
          Editar
        </Button>
        <Button mode="contained" buttonColor="red" onPress={() => deleteTripItem(item.id)}>
          Eliminar
        </Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>
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
          <Text style={styles.modalTitle}>{editingTrip ? "Editar Viaje" : "Nuevo Viaje"}</Text>

          <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
          <TextInput placeholder="Unidad" value={unidadId} onChangeText={setUnidadId} style={styles.input} />
          <TextInput placeholder="Conductor" value={conductorId} onChangeText={setConductorId} style={styles.input} />
          <TextInput placeholder="Fecha de salida" value={fechaSalida} onChangeText={setFechaSalida} style={styles.input} />
          <TextInput placeholder="Fecha de llegada" value={fechaLlegada} onChangeText={setFechaLlegada} style={styles.input} />
          <TextInput placeholder="Destino" value={destino} onChangeText={setDestino} style={styles.input} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Button mode="contained" onPress={() => setModalVisible(false)}>
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
  card: { backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10 },
  title: { fontWeight: "bold", fontSize: 16, color: "#007bff" },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
});