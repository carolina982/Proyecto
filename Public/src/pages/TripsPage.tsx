import { Picker } from "@react-native-picker/picker";
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

interface Unit {
  id: string;
  nombre: string;
  placas: string;
}

interface User {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [nombre, setNombre] = useState("");
  const [unidadId, setUnidadId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [fechaLlegada, setFechaLlegada] = useState("");
  const [destino, setDestino] = useState("");

  useEffect(() => {
    loadTrips();
    loadUnits();
    loadDrivers();
  }, []);

  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data.map((trip: any) => ({ ...trip, id: trip._id })));
    } catch (error) {
      console.error("Error cargando viajes", error);
      Alert.alert("Error", "No se pudieron cargar los viajes");
    }
  };

  const loadUnits = async () => {
    try {
      const res = await api.get("/units");
      setUnits(res.data.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      console.error("Error cargando unidades", error);
    }
  };

  const loadDrivers = async () => {
    try {
      const res = await api.get("/users");
      const choferes = res.data.filter((u: any) => u.rol === "Chofer");
      setDrivers(choferes.map((d: any) => ({ ...d, id: d._id })));
    } catch (error) {
      console.error("Error cargando choferes", error);
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

  const formatDateToIso = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return`  ${year}-${month}-${day}` ;
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
      fechaSalida: new Date(formatDateToIso(fechaSalida)),
      fechaLlegada: new Date(formatDateToIso(fechaLlegada)),
      destino,
      estado: editingTrip?.estado || "pendiente",
    };

    try {
      if (editingTrip) {
        await api.put(` /trips/${editingTrip.id}` , tripData);
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
            await api.delete(` /trips/${id}` );
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
      <Text>Unidad: {units.find(u => u.id === item.unidadId)?.nombre || item.unidadId}</Text>
      <Text>Conductor: {drivers.find(d => d.id === item.conductorId)?.nombre || item.conductorId}</Text>
      <Text>Destino: {item.destino}</Text>
      <Text>Salida: {item.fechaSalida}</Text>
      <Text>Llegada: {item.fechaLlegada}</Text>
      <Text>Estado: {item.estado}</Text>
      <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>Editar</Button>
        <Button mode="contained" buttonColor="red" onPress={() => deleteTripItem(item.id)}>Eliminar</Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viajes Registrados</Text>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>Nuevo Viaje</Button>
      <FlatList data={trips} keyExtractor={(item) => item.id} renderItem={renderItem} style={{ marginTop: 15 }} />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingTrip ? "Editar Viaje" : "Nuevo Viaje"}</Text>

          <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />

          <Text>Unidad:</Text>
          <Picker selectedValue={unidadId} onValueChange={setUnidadId} style={styles.picker}>
            <Picker.Item label="Selecciona unidad" value="" />
            {units.map(u => <Picker.Item key={u.id} label={` ${u.nombre} (${u.placas})` } value={u.id} />)}
          </Picker>

          <Text>Chofer:</Text>
          <Picker selectedValue={conductorId} onValueChange={setConductorId} style={styles.picker}>
            <Picker.Item label="Selecciona chofer" value="" />
            {drivers.map(d => <Picker.Item key={d.id} label={` ${d.nombre} ${d.apellido}` } value={d.id} />)}
          </Picker>

          <TextInput placeholder="Fecha de salida (DD/MM/YY)" value={fechaSalida} onChangeText={setFechaSalida} style={styles.input} />
          <TextInput placeholder="Fecha de llegada (DD/MM/YY)" value={fechaLlegada} onChangeText={setFechaLlegada} style={styles.input} />
          <TextInput placeholder="Destino" value={destino} onChangeText={setDestino} style={styles.input} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Button mode="contained" onPress={() => setModalVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={saveTrip}>Guardar</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10 },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
  picker: { backgroundColor: "#fff", marginBottom: 10, borderRadius: 5 },
});