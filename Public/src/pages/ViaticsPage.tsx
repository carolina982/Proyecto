import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import { api, BASE_URL } from "../api/api";
import { useStore } from '../context/Store';

interface Trip {
  id: string;
  nombre: string;
  conductorId: string;
}

interface Viatico {
  id: string;
  nombre: string;
  tripId: string;
  monto: number;
  descripcion: string;
  concepto: string;
  facturaUrl?: string;
}

export default function ViaticosPage() {
  const { currentUser } = useStore();
  const [viaticos, setViaticos] = useState<Viatico[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingViatico, setEditingViatico] = useState<Viatico | null>(null);
  const [nombre, setNombre] = useState("");
  const [tripId, setTripId] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [concepto, setConcepto] = useState("");
  const [factura, setFactura] = useState<string | null>(null);
  const [facturaRemoved, setFacturaRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFactura, setShowFactura] = useState(false);
  if (!currentUser) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }
  useEffect(() => {
    loadTrips();
    loadViaticos();
  }, [currentUser]);

  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      let tripsData = res.data.map((t: any) => ({ ...t, id: t._id }));
      if (currentUser.rol === "Chofer") {
        tripsData = tripsData.filter((t: { conductorId: string; }) => t.conductorId === currentUser.id);
      }
      setTrips(tripsData);
    } catch (error) {
      console.error(error);
    }
  };
  const loadViaticos = async () => {
    try {
      const res = await api.get("/viatics");
      let viaticosData = res.data.map((v: any) => ({
        ...v,
        id: v._id,
        facturaUrl: v.factura ? `${BASE_URL.replace("/api","")}${v.factura} `: undefined
      }));
      if (currentUser.rol === "Chofer") {
        viaticosData = viaticosData.filter((v: { tripId: string; }) => {
          const trip = trips.find(t => t.id === v.tripId);
          return trip?.conductorId === currentUser.id;
        });
      }
      setViaticos(viaticosData);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar los viáticos");
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
      setFactura(viatico.facturaUrl || null);
      setShowFactura(false);
    } else {
      setEditingViatico(null);
      setNombre(""); setTripId(""); setMonto(""); setDescripcion(""); setConcepto(""); setFactura(null); setShowFactura(false);
    }
    setFacturaRemoved(false);
    setModalVisible(true);
  };

  const pickFactura = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"] });
      if (!result.assets || result.assets.length === 0) return;
      const file = result.assets[0];
      if (!file.uri) return Alert.alert("Error", "No se pudo seleccionar el archivo");
      setFactura(file.uri);
      setFacturaRemoved(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un problema al seleccionar el archivo");
    }
  };

  const saveViatico = async () => {
    if (!nombre || !tripId || !monto) {
      Alert.alert("Error", "Completa los campos obligatorios");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nombre", nombre.trim());
      formData.append("tripId", tripId);
      formData.append("concepto", concepto.trim());
      formData.append("descripcion", descripcion.trim());
      formData.append("monto", String(Number(monto)));

      if (factura) {
        if (Platform.OS === "web") {
          const response = await fetch(factura);
          const blob = await response.blob();
          const filename = `factura_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: blob.type });
          formData.append("factura", file);
        } else {
          const localUri = factura.startsWith("file://") ? factura : "file://" + factura;
          const filename = localUri.split("/").pop()!;
          let type = "image/jpeg";
          if (filename.toLowerCase().endsWith(".pdf")) type = "application/pdf";
          else if (filename.toLowerCase().endsWith(".png")) type = "image/png";
          else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg"))
            type = "image/jpeg";
          formData.append("factura", { uri: localUri, name: filename, type } as any);
        }
      } else if (facturaRemoved) {
        formData.append("factura", "");
      }

      const url = editingViatico ? `${BASE_URL}/viatics/${editingViatico.id}`:` ${BASE_URL}/viatics`;
      const method = editingViatico ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error(await res.text());
      await loadViaticos();
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar el viático");
    } finally {
      setLoading(false);
    }
  };

  const deleteViatico = async (id: string) => {
    if (currentUser.rol !== "Admin") return; 
    let confirmed = Platform.OS === "web" ? window.confirm("¿Desea eliminar este viático?") : await new Promise<boolean>((resolve) => {
      Alert.alert("Confirmar", "¿Desea eliminar este viático?", [
        { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
        { text: "Eliminar", style: "destructive", onPress: () => resolve(true) }
      ], { cancelable: true });
    });
    if (!confirmed) return;
    try {
      await api.delete(`/viatics/${id}`);
      setViaticos(prev => prev.filter(v => v.id !== id));
      Alert.alert("Éxito", "Viático eliminado correctamente");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo eliminar el viático");
    }
  };
  const renderItem = ({ item }: { item: Viatico }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text>Viaje: {trips.find(t => t.id === item.tripId)?.nombre || "Desconocido"}</Text>
      <Text>Concepto: {item.concepto}</Text>
      <Text>Descripción: {item.descripcion}</Text>
      <Text>Monto: ${item.monto}</Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>Editar</Button>
        {currentUser.rol === "Admin" && (
          <Button mode="contained" buttonColor="red" onPress={() => deleteViatico(item.id)}>Eliminar</Button>
        )}
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viáticos Registrados</Text>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>Nuevo Viático</Button>
      <FlatList data={viaticos} keyExtractor={item => item.id} renderItem={renderItem} style={{ marginTop: 15 }} />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingViatico ? "Editar Viático" : "Nuevo Viático"}</Text>
          <Text style={styles.label}>Nombre:</Text>
          <TextInput value={nombre} onChangeText={setNombre} mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb" style={styles.input} />
          <Text style={styles.label}>Viaje:</Text>
          <Picker selectedValue={tripId} onValueChange={setTripId} style={styles.picker}>
            <Picker.Item label="Selecciona un viaje" value="" />
            {trips.map(t => <Picker.Item key={t.id} label={t.nombre} value={t.id} />)}
          </Picker>
          <Text style={styles.label}>Concepto:</Text>
          <TextInput value={concepto} onChangeText={setConcepto} mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb" style={styles.input} />
          <Text style={styles.label}>Descripción:</Text>
          <TextInput value={descripcion} onChangeText={setDescripcion} mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb" style={styles.input} />
          <Text style={styles.label}>Monto:</Text>
          <TextInput value={monto} onChangeText={setMonto} mode="flat" underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"keyboardType="numeric" style={styles.input} />

          <Text style={styles.label}>Factura:</Text>
          {factura ? (
            <>
              {showFactura ? (factura.toLowerCase().endsWith(".pdf") ? (
                <View style={{ marginBottom: 10 }}>
                  <Text>Factura en PDF</Text>
                  <Button mode="contained" onPress={() => {
                    if (Platform.OS === "web") window.open(factura, "_blank");
                    else Linking.openURL(factura);
                  }}>Abrir PDF</Button>
                </View>
              ) : (
                <Image source={{ uri: factura }} style={styles.facturaPreview} />
              )) : (
                <Button mode="contained" onPress={() => setShowFactura(true)}>Mostrar Factura</Button>
              )}
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 5 }}>
                <Button mode="contained" buttonColor="#17d1f1ff" onPress={pickFactura}>Remplazar factura</Button>
                <Button mode="contained" buttonColor="#e27975ff" onPress={() => { setFactura(null); setFacturaRemoved(true); setShowFactura(false); }}>Eliminar</Button>
              </View>
            </>
          ) : (
            <Button mode="contained" buttonColor="#4caf50" onPress={pickFactura}>Subir factura</Button>
          )}
          {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
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
  facturaPreview: { width: "100%", height: 180, borderRadius: 8, marginBottom: 10, resizeMode: "contain" },
});