import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../api/api";

interface Trip {
  id: string;
  nombre: string;
}

interface Viatico {
  id: string;
  nombre: string;
  tripId: string;
  monto: number;
  descripcion: string;
  concepto: string;
  estado: string;
}

export default function ViaticosPage() {
  const [viaticos, setViaticos] = useState<Viatico[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingViatico, setEditingViatico] = useState<Viatico | null>(null);

  const [nombre, setNombre] = useState("");
  const [tripId, setTripId] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [concepto, setConcepto] = useState("");

  useEffect(() => {
    loadViaticos();
    loadTrips();
  }, []);

  const loadViaticos = async () => {
    try {
      const res = await api.get("/viatics");
      setViaticos(res.data.map((v: any) => ({ ...v, id: v._id })));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los viáticos");
    }
  };

  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data.map((t: any) => ({ ...t, id: t._id })));
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (viatico?: Viatico) => {
    if (viatico) {
      setEditingViatico(viatico);
      setNombre(viatico.nombre);
      setTripId(viatico.tripId);
      setMonto(viatico.monto.toString());
      setDescripcion(viatico.descripcion);
      setConcepto(viatico.concepto);
    } else {
      setEditingViatico(null);
      setNombre("");
      setTripId("");
      setMonto("");
      setDescripcion("");
      setConcepto("");
    }
    setModalVisible(true);
  };

  const saveViatico = async () => {
    if (!nombre || !tripId || !monto || !descripcion || !concepto) {
      Alert.alert("Error", "Completa todos los datos");
      return;
    }

    const viaticoData = {
      nombre,
      tripId,
      monto: Number(monto),
      descripcion,
      concepto,
      estado: editingViatico?.estado || "pendiente",
    };

    try {
      if (editingViatico) {
        await api.put(`/viatics/${editingViatico.id}`, viaticoData);
      } else {
        await api.post("/viatics", viaticoData);
      }
      await loadViaticos();
      setModalVisible(false);
    } catch (error) {
      console.error("Error creando/actualizando viático", error);
      Alert.alert("Error", "No se pudo guardar el viático");
    }
  };

  const deleteViatico = async (id: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar este viático?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/viatics/${id}`);
            await loadViaticos();
          } catch (error) {
            console.error("Error eliminando viático", error);
            Alert.alert("Error", "No se pudo eliminar el viático");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Viatico }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text>Viaje: {trips.find(t => t.id === item.tripId)?.nombre || "Desconocido"}</Text>
      <Text>Monto: {item.monto}</Text>
      <Text>Concepto: {item.concepto}</Text>
      <Text>Descripción: {item.descripcion}</Text>
      <Text>Estado: {item.estado}</Text>
      <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>Editar</Button>
        <Button mode="contained" buttonColor="red" onPress={() => deleteViatico(item.id)}>Eliminar</Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viáticos Registrados</Text>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>Nuevo Viático</Button>
      <FlatList
        data={viaticos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 15 }}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingViatico ? "Editar Viático" : "Nuevo Viático"}</Text>

          <Text style={styles.label}>Nombre:</Text>
          <TextInput value={nombre} onChangeText={setNombre} mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" style={styles.input} />

          <Text style={styles.label}>Viaje:</Text>
          <Picker selectedValue={tripId} onValueChange={setTripId} style={styles.picker}>
            <Picker.Item label="Selecciona un viaje" value="" />
            {trips.map(t => <Picker.Item key={t.id} label={t.nombre} value={t.id} />)}
          </Picker>

          <Text style={styles.label}>Concepto:</Text>
          <TextInput value={concepto} onChangeText={setConcepto} mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" style={styles.input} />

          <Text style={styles.label}>Descripción:</Text>
          <TextInput value={descripcion} onChangeText={setDescripcion} mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" style={styles.input} />

          <Text style={styles.label}>Monto:</Text>
          <TextInput value={monto} onChangeText={setMonto} keyboardType="numeric" mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" style={styles.input} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
            <Button mode="contained"  onPress={() => setModalVisible(false)}>Cancelar</Button>
            <Button mode="contained" buttonColor="#167abdff" onPress={saveViatico}>Guardar</Button>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 8, marginBottom: 10, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginBottom: 5 },
  picker: { backgroundColor: "#fff", borderRadius: 5, marginBottom: 10 },
});