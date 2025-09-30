import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../api/api";

interface Viatic {
  id: string;
  tripId: string;
  concepto: string;
  descripcion: string;
  monto: number;
}

interface Trip {
  id: string;
  nombre: string;
  destino: string;
}

export default function ViaticsPage() {
  const [viatics, setViatics] = useState<Viatic[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingViatic, setEditingViatic] = useState<Viatic | null>(null);

  const [tripId, setTripId] = useState("");
  const [concepto, setConcepto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");

  useEffect(() => {
    loadViatics();
    loadTrips();
  }, []);

  const loadViatics = async () => {
    try {
      const res = await api.get("/viatics");
      setViatics(res.data.map((v: any) => ({ ...v, id: v._id })));
    } catch (error) {
      console.error("Error cargando viáticos", error);
      Alert.alert("Error", "No se pudieron cargar los viáticos");
    }
  };

  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data.map((t: any) => ({ id: t._id, nombre: t.nombre, destino: t.destino })));
    } catch (error) {
      console.error("Error cargando viajes", error);
    }
  };

  const openModal = (viatic?: Viatic) => {
    if (viatic) {
      setEditingViatic(viatic);
      setTripId(viatic.tripId);
      setConcepto(viatic.concepto);
      setDescripcion(viatic.descripcion);
      setMonto(viatic.monto.toString());
    } else {
      setEditingViatic(null);
      setTripId("");
      setConcepto("");
      setDescripcion("");
      setMonto("");
    }
    setModalVisible(true);
  };

  const saveViatic = async () => {
    if (!tripId || !concepto || !descripcion || !monto) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    const viaticData = {
      tripId,
      concepto,
      descripcion,
      monto: parseFloat(monto),
    };

    try {
      if (editingViatic) {
        await api.put(`/viatics/${editingViatic.id}`, viaticData);
      } else {
        await api.post("/viatics", viaticData);
      }
      await loadViatics();
      setModalVisible(false);
    } catch (error) {
      console.error("Error guardando viático", error);
      Alert.alert("Error", "No se pudo guardar el viático");
    }
  };

  const deleteViaticItem = (id: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar este viático?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/viatics/${id}`);
            await loadViatics();
          } catch (error) {
            console.error("Error eliminando viático", error);
            Alert.alert("Error", "No se pudo eliminar el viático");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Viatic }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.concepto}</Text>
      <Text>Monto: ${item.monto}</Text>
      <Text>Descripción: {item.descripcion}</Text>
      <Text>Viaje: {trips.find(t => t.id === item.tripId)?.nombre || item.tripId}</Text>
      <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>Editar</Button>
        <Button mode="contained" buttonColor="red" onPress={() => deleteViaticItem(item.id)}>Eliminar</Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viáticos Registrados</Text>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>Nuevo Viático</Button>
      <FlatList data={viatics} keyExtractor={(item) => item.id} renderItem={renderItem} style={{ marginTop: 15 }} />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingViatic ? "Editar Viático" : "Nuevo Viático"}</Text>

          <Text>Selecciona un viaje:</Text>
          <Picker selectedValue={tripId} onValueChange={setTripId} style={styles.input}>
            <Picker.Item label="Selecciona un viaje" value="" />
            {trips.map(t => (
              <Picker.Item key={t.id} label={`${t.nombre} - ${t.destino}`} value={t.id} />
            ))}
          </Picker>

          <TextInput placeholder="Concepto" value={concepto} onChangeText={setConcepto} style={styles.input} />
          <TextInput placeholder="Monto" value={monto} onChangeText={setMonto} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} style={styles.input} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Button mode="contained" onPress={() => setModalVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={saveViatic}>Guardar</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  card: { backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10 },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
});