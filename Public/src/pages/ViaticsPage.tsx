import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../api/api";

interface Viatic {
  id: string;
  concepto: string;
  descripcion: string;
  monto: number;
  tripId: string;
}

export default function ViaticsPage() {
  const [viatics, setViatics] = useState<Viatic[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingViatic, setEditingViatic] = useState<Viatic | null>(null);
  const [tripId, setTripId] = useState("");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadViatics();
  }, []);

  const loadViatics = async () => {
    try {
      const res = await api.get("/viatics");
      setViatics(res.data);
    } catch (error) {
      console.error("Error cargando viáticos", error);
    }
  };

  const openModal = (viatic?: Viatic) => {
    if (viatic) {
      setEditingViatic(viatic);
      setConcepto(viatic.concepto);
      setMonto(viatic.monto.toString());
      setDescription(viatic.descripcion);
      setTripId(viatic.tripId);
    } else {
      setEditingViatic(null);
      setConcepto("");
      setMonto("");
      setDescription("");
      setTripId("");
    }
    setModalVisible(true);
  };

  const saveViatic = async () => {
    if (!concepto || !monto || !description || !tripId) {
      Alert.alert("Error", "Completa todos los datos obligatorios");
      return;
    }

    const viaticData = {
      concepto,
      descripcion: description,
      monto: parseFloat(monto),
      tripId,
    };

    try {
      const response = editingViatic
        ? await api.put(`/viatics/${editingViatic.id}`, viaticData)
        : await api.post("/viatics", viaticData);

      console.log("Viático guardado:", response.data);
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
      <Text>Trip ID: {item.tripId}</Text>
      <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>
          Editar
        </Button>
        <Button mode="contained" buttonColor="red" onPress={() => deleteViaticItem(item.id)}>
          Eliminar
        </Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viaticos Registrados</Text>
      <Button mode="contained" buttonColor="#0d75bbff" onPress={() => openModal()}>
        Nuevo Viático
      </Button>

      {viatics.length === 0 ? (
        <Text style={{ marginTop: 15 }}>No hay viáticos registrados</Text>
      ) : (
        <FlatList
          data={viatics}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ marginTop: 15 }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingViatic ? "Editar Viático" : "Nuevo Viático"}</Text>

          <TextInput placeholder="Trip ID" value={tripId} onChangeText={setTripId} style={styles.input} />
          <TextInput placeholder="Concepto" value={concepto} onChangeText={setConcepto} style={styles.input} />
          <TextInput
            placeholder="Monto"
            value={monto}
            onChangeText={setMonto}
            keyboardType="numeric"
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
 title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
});