import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
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
  ticketUrl?: string;
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
  const [ticket, setTicket] = useState<string | null>(null);
  const [ticketRemoved, setTicketRemoved] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

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
      setMonto(String(viatico.monto));
      setDescripcion(viatico.descripcion);
      setConcepto(viatico.concepto);
      setTicket(viatico.ticketUrl || null);
    } else {
      setEditingViatico(null);
      setNombre("");
      setTripId("");
      setMonto("");
      setDescripcion("");
      setConcepto("");
      setTicket(null);
    }
    setTicketRemoved(false);
    setErrors({});
    setModalVisible(true);
  };

  const pickTicket = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
      });

      if (!result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      if (!file.uri) {
        Alert.alert("Error", "No se pudo seleccionar el archivo");
        return;
      }

      setTicket(file.uri);
      setTicketRemoved(false);
    } catch (error) {
      console.error("Error seleccionando archivo:", error);
      Alert.alert("Error", "Ocurrió un problema al seleccionar el archivo");
    }
  };

  const saveViatico = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!tripId) newErrors.tripId = "Debes seleccionar un viaje";
    if (!concepto.trim()) newErrors.concepto = "El concepto es obligatorio";
    if (!descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!monto.trim() || isNaN(Number(monto)) || Number(monto) <= 0)
      newErrors.monto = "Monto inválido";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nombre.trim());
      formData.append("tripId", tripId);
      formData.append("concepto", concepto.trim());
      formData.append("descripcion", descripcion.trim());
      formData.append("monto", String(Number(monto)));

      if (ticket) {
        const filename = ticket.split("/").pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? (match[1].toLowerCase() === "pdf" ? "application/pdf" :`image/${match[1]}`) : "image";
        formData.append("ticket", { uri: ticket, name: filename, type } as any);
      } else if (ticketRemoved) {
        formData.append("ticket", "");
      }

      if (editingViatico) {
        await api.put(`/viatics/${editingViatico.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/viatics", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await loadViaticos();
      setModalVisible(false);
    } catch (error) {
      console.error("Error guardando viático:", error);
      Alert.alert("Error", "No se pudo guardar el viático");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Viatico }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text>Viaje: {trips.find((t) => t.id === item.tripId)?.nombre || "Desconocido"}</Text>
      <Text>Concepto: {item.concepto}</Text>
      <Text>Descripción: {item.descripcion}</Text>
      <Text>Monto: ${item.monto}</Text>
      {item.ticketUrl && (
        <Image source={{ uri: item.ticketUrl }} style={styles.ticketPreview} />
      )}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>Editar</Button>
        <Button mode="contained" buttonColor="red" onPress={() => deleteViatico(item.id)}>Eliminar</Button>
      </View>
    </View>
  );

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

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingViatico ? "Editar Viático" : "Nuevo Viático"}</Text>

          <Text style={styles.label}>Nombre:</Text>
          <TextInput value={nombre} mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" onChangeText={setNombre} error={!!errors.nombre} style={styles.input} />

          <Text style={styles.label}>Viaje:</Text>
          <Picker selectedValue={tripId} onValueChange={setTripId} style={styles.picker}>
            <Picker.Item label="Selecciona un viaje" value="" />
            {trips.map((t) => <Picker.Item key={t.id} label={t.nombre} value={t.id} />)}
          </Picker>
          {errors.tripId && <Text style={styles.error}>{errors.tripId}</Text>}

          <Text style={styles.label}>Concepto:</Text>
          <TextInput value={concepto}    mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" onChangeText={setConcepto} error={!!errors.concepto} style={styles.input} />
          <Text style={styles.label}>Descripción:</Text>
          <TextInput value={descripcion}  mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb"onChangeText={setDescripcion} error={!!errors.descripcion} style={styles.input} />

          <Text style={styles.label}>Monto:</Text>
          <TextInput value={monto} mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb"onChangeText={setMonto} keyboardType="numeric" error={!!errors.monto} style={styles.input} />

          <Text style={styles.label}>Factura:</Text>
          {ticket ? (
            <>
              <Image source={{ uri: ticket }} style={styles.ticketPreview} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                <Button mode="contained" buttonColor="#17d1f1ff" onPress={pickTicket}>Reemplazar Ticket</Button>
                <Button mode="contained" buttonColor="#e27975ff" onPress={() => { setTicket(null); setTicketRemoved(true); }}>Eliminar</Button>
              </View>
            </>
          ) : (
            <Button mode="contained" buttonColor="#4caf50" onPress={pickTicket}>Subir Factura</Button>
          )}

          {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
            <View style={styles.modalButtons}>
              <Button mode="contained" buttonColor="#888" onPress={() => setModalVisible(false)}>Cancelar</Button>
              <Button mode="contained" buttonColor="#167abd" onPress={saveViatico}>Guardar</Button>
            </View>
          )}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 8 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: { backgroundColor: "#fff", marginBottom: 10 },
  label: { fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  picker: { backgroundColor: "#fff", borderRadius: 5, marginBottom: 10 },
  error: { color: "red", fontSize: 12, marginBottom: 8 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  ticketPreview: { width: "100%", height: 180, borderRadius: 8, marginBottom: 10, resizeMode: "contain" },
});