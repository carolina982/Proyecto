import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
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
}

interface User {
  id: string;
  nombre: string;
  apellido?: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [users, setUsers] = useState<User[]>([]);

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
    loadUsers();
  }, []);

  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data.map((t: any) => ({ ...t, id: t._id })));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los viajes");
    }
  };

  const loadUnits = async () => {
    try {
      const res = await api.get("/units");
      setUnits(res.data.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      console.error(error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setNombre(trip.nombre);
      setUnidadId(trip.unidadId);
      setConductorId(trip.conductorId);
      setFechaSalida(new Date(trip.fechaSalida).toLocaleDateString("es-ES"));
      setFechaLlegada(new Date(trip.fechaLlegada).toLocaleDateString("es-ES"));
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

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const saveTrip = async () => {
    if (!nombre || !unidadId || !conductorId || !fechaSalida || !fechaLlegada || !destino) {
      Alert.alert("Error", "Completa todos los datos");
      return;
    }
    const deleteTrip =async (id:string)=>{
      try {
        await deleteTrip(id);
        Alert.alert("Exito", "El viaje eliminado ")
      }catch(error){
        console.log(error);
        Alert.alert("Error " , "Nos pudo eliminar viaje  ")
      }
      Alert.alert("Confirmar" ,"¿Deseas eliminar este viaje?",[
        {text:"Cancelar" , style:"cancel"},
        {text:"Eliminar", style:"destructive", onPress:async()=>{
          try{
            await api.delete(`/trips/${id}`);
            await loadTrips();
          }catch (error){
            console.error("Error eliminando viaje", error);
            Alert.alert("Error" , "No se pudo eliminar el viaje")
          }
        },
      },
      ]);
    };
    const tripData = {
      nombre,
      unidadId,
      conductorId,
      fechaSalida: parseDate(fechaSalida),
      fechaLlegada: parseDate(fechaLlegada),
      destino,
      estado: editingTrip?.estado || "pendiente",
    };

    try {
      if (editingTrip) await api.put(`/trips/${editingTrip.id}`, tripData);
      else await api.post("/trips", tripData);

      await loadTrips();
      setModalVisible(false);
    } catch (error) {
      console.error("Error guardando viaje", error);
      Alert.alert("Error", "No se pudo guardar el viaje");
    }
  };

  const renderItem = ({ item }: { item: Trip }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text style={styles.textSmall}>Unidad: {item.unidadId}</Text>
      <Text style={styles.textSmall}>Conductor: {item.conductorId}</Text>
      <Text style={styles.textSmall}>Destino: {item.destino}</Text>
      <Text style={styles.textSmall}>Salida: {item.fechaSalida}</Text>
      <Text style={styles.textSmall}>Llegada: {item.fechaLlegada}</Text>
      <Text style={styles.textSmall}>Estado: {item.estado}</Text>
      <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>Editar</Button>
        <Button mode="contained" buttonColor="red" onPress={() =>deleteTrip(item.id) }>Eliminar</Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viajes Registrados</Text>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>Nuevo Viaje</Button>
      <FlatList data={trips} keyExtractor={(item) => item.id} renderItem={renderItem} style={{ marginTop: 15 }} />
<Modal visible={modalVisible} animationType="slide">
  <ScrollView style={styles.modalContent}>
    <Text style={styles.modalTitle}>{editingTrip ? "Editar Viaje" : "Nuevo Viaje"}</Text>

    <Text style={styles.label}>Nombre:</Text>
    <TextInput
      value={nombre}
      onChangeText={setNombre}
      mode="flat"
      underlineColor="#8bc1e6ff"
      activeUnderlineColor="#8bc1e6ff"
      dense
      style={styles.input}
    />

    <Text style={styles.label}>Unidad:</Text>
    <Picker selectedValue={unidadId} onValueChange={setUnidadId} style={styles.picker}>
      <Picker.Item label="Selecciona una unidad" value="" />
      {units.map(u => (
        <Picker.Item key={u.id} label={u.nombre} value={u.id} />
      ))}
    </Picker>

    <Text style={styles.label}>Conductor:</Text>
    <Picker selectedValue={conductorId} onValueChange={setConductorId} style={styles.picker}>
      <Picker.Item label="Selecciona un conductor" value="" />
      {users.map(u => (
        <Picker.Item key={u.id} label={`${u.nombre}`} value={u.id} />
      ))}
    </Picker>

    <Text style={styles.label}>Destino:</Text>
    <TextInput
      value={destino}
      onChangeText={setDestino}
      mode="flat"
      underlineColor="#8bc1e6ff"
      activeUnderlineColor="#8bc1e6ff"
      dense
      style={styles.input}
    />

    <Text style={styles.label}>Fecha de Salida (DD/MM/YYYY):</Text>
    <TextInput
      value={fechaSalida}
      onChangeText={setFechaSalida}
      mode="flat"
      underlineColor="#8bc1e6ff"
      activeUnderlineColor="#8bc1e6ff"
      dense
      style={styles.input}
    />

    <Text style={styles.label}>Fecha de Llegada (DD/MM/YYYY):</Text>
    <TextInput
      value={fechaLlegada}
      onChangeText={setFechaLlegada}
      mode="flat"
      underlineColor="#8bc1e6ff"
      activeUnderlineColor="#8bc1e6ff"
      dense
      style={styles.input}
    />

    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
      <Button mode="contained" buttonColor="#888"  onPress={() => setModalVisible(false)}>
        Cancelar
      </Button>
      <Button mode="contained" buttonColor="#167abdff" onPress={saveTrip}>
        Guardar
      </Button>
      
    </View>
  </ScrollView>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: 8, marginBottom: 10, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  textSmall: { fontSize: 13, marginBottom: 2 },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 8, marginBottom: 10, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginBottom: 5 },
  picker: { backgroundColor: "#fff", borderRadius: 5, marginBottom: 10 },
});