import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import saveAs from "file-saver";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import * as XLSX from "xlsx";
import { api, BASE_URL } from "../api/api";
import { useStore } from '../context/Store';

interface Trip { id: string; nombre: string; conductorId: string; conductorNombre?: string; }
interface Viatico {
  id: string;
  tripId: string;
  conceptos: { [key: string]: number };
  dieselCantidad: number;
  dieselCosto: number;
  tag: number;
  facturaUrl?: string;
  total: number;
  createdAt: string;
}

const conceptosList = [
  "Comidas Cantidad", "Comidas Costo",
  "Hospedaje Cantidad", "Hospedaje Costo",
  "Taxi Cantidad", "Taxi Costo",
  "Regaderas Cantidad", "Regaderas Costo",
  "Pensión", "Vulcanizadora", "Casetas efectivo",
  "Limpieza Unidad", "Multa", "Comisiones",
  "Fumigación", "DEF"
];

export default function ViaticosPage() {
  const { currentUser } = useStore();
  const [viaticos, setViaticos] = useState<Viatico[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingViatico, setEditingViatico] = useState<Viatico | null>(null);

  const [tripId, setTripId] = useState("");
  const [conceptos, setConceptos] = useState<{ [key: string]: string }>(
    conceptosList.reduce((acc, c) => ({ ...acc, [c]: "0" }), {})
  );
  const [dieselCantidad, setDieselCantidad] = useState("0");
  const [dieselCosto, setDieselCosto] = useState("0");
  const [tag, setTag] = useState("0");
  const [factura, setFactura] = useState<string | null>(null);
  const [facturaRemoved, setFacturaRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFactura, setShowFactura] = useState(false);

  const [filter, setFilter] = useState<"day" | "week" | "month">("month");
  const [conductorFilter, setConductorFilter] = useState<string>("");

  useEffect(() => { loadTrips(); }, [currentUser]);

  useEffect(() => { loadViaticos(); }, [currentUser, filter, conductorFilter, trips]);

  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      let tripsData = res.data.map((t: any) => ({
        ...t,
        id: t._id,
        conductorNombre: t.conductorNombre || t.conductorNombre || t.conductor || "Sin asignar"
      }));
      if (currentUser?.rol === "Chofer") tripsData = tripsData.filter((t: any) => t.conductorId === currentUser.id);
      setTrips(tripsData);
    } catch (e) {
      console.error(e);
    }
  };

  const loadViaticos = async () => {
    try {
      const res = await api.get(`/viatics?filter=${filter}`);
      let viaticosData = res.data.map((v: any) => ({
        ...v,
        id: v._id,
        facturaUrl: v.factura ? `${BASE_URL.replace("/api", "")}${v.factura} `: undefined
      }));

      if (currentUser?.rol === "Chofer") {
        viaticosData = viaticosData.filter((v: any) => trips.find(t => t.id === v.tripId)?.conductorId === currentUser.id);
      }
      if (conductorFilter) {
        viaticosData = viaticosData.filter((v: any) => {
          const trip = trips.find(t => t.id === v.tripId);
          return trip && trip.conductorId === conductorFilter;
        });
      }
      viaticosData = viaticosData.map((v: any) => ({
        ...v,
        conceptos: v.conceptos || conceptosList.reduce((acc: any, c: string) => ({ ...acc, [c]: 0 }), {})
      }));

      setViaticos(viaticosData);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudieron cargar los viáticos");
    }
  };
  const exportViaticosToExcel = async (filter: string) => {
    try {
      const sortedViaticos = [...viaticos].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const ws_data: any[][] = [];
      let currentMonth = "";
      let currentWeek = 0;
      let monthViaticoCount = 0;
      let monthTotal = 0;

      sortedViaticos.forEach(v => {
        const created = new Date(v.createdAt);
        const monthName = created.toLocaleString("es-ES", { month: "long", year: "numeric" });
        const weekNumber = Math.ceil(created.getDate() / 7);
        const dayNumber = created.getDate();

        if (monthName !== currentMonth) {
          if (monthViaticoCount > 0) {
            ws_data.push([`TOTAL DEL MES: ${monthTotal.toFixed(2)}`]);
            ws_data.push([]);
          }

          ws_data.push([`MES: ${monthName.toUpperCase()}`]);
          ws_data.push([
            "Semana",
            "Día",
            "Viaje",
            "Conductor",
            "Diesel Cantidad",
            "Diesel Costo",
            "TAG",
            ...conceptosList,
            "Total",
          ]);

          currentMonth = monthName;
          currentWeek = 0;
          monthViaticoCount = 0;
          monthTotal = 0;
        }

        if (weekNumber !== currentWeek) {
          ws_data.push([`Semana ${weekNumber}`]);
          currentWeek = weekNumber;
        }

        const trip = trips.find(t => t.id === v.tripId);
        const conductorNombre = trip?.conductorNombre || "Desconocido";

        const row = [
          weekNumber,
          dayNumber,
          trip?.nombre || "Desconocido",
          conductorNombre,
          v.dieselCantidad ?? 0,
          v.dieselCosto ?? 0,
          v.tag ?? 0,
          ...conceptosList.map(c => v.conceptos?.[c] ?? 0),
          v.total ?? 0
        ];

        ws_data.push(row);
        monthViaticoCount++;
        monthTotal += Number(v.total ?? 0);
      });

      if (monthViaticoCount > 0) {
        ws_data.push([`TOTAL DEL MES: ${monthTotal.toFixed(2)}`]);
      }

      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Viaticos");

      if (Platform.OS === "web") {
        const blob = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(
          new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
          "Viaticos.xlsx"
        );
      } else {
        const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
        const cacheDir = (FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory ?? "";
        const fileUri = `${cacheDir}Viaticos.xlsx`;
        await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: "base64" });
        await Sharing.shareAsync(fileUri);
      }

      Alert.alert("Éxito", "Reporte de viáticos generado correctamente");
    } catch (error) {
      console.error("Error exportando viáticos:", error);
      Alert.alert("Error", "No se pudo generar el Excel");
    }
  };

  const openModal = (viatico?: Viatico) => {
    if (viatico) {
      setEditingViatico(viatico);
      setTripId(viatico.tripId);
      const conceptosString: { [key: string]: string } = {};
      conceptosList.forEach(c => conceptosString[c] = (viatico.conceptos?.[c] ?? 0).toString());
      setConceptos(conceptosString);
      setDieselCantidad((viatico.dieselCantidad ?? 0).toString());
      setDieselCosto((viatico.dieselCosto ?? 0).toString());
      setTag((viatico.tag ?? 0).toString());
      setFactura(viatico.facturaUrl || null);
      setShowFactura(false);
    } else {
      setEditingViatico(null);
      setTripId("");
      setFactura(null);
      setShowFactura(false);
      setConceptos(conceptosList.reduce((acc, c) => ({ ...acc, [c]: "0" }), {}));
      setDieselCantidad("0");
      setDieselCosto("0");
      setTag("0");
    }
    setFacturaRemoved(false);
    setModalVisible(true);
  };

  const pickFactura = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["image/*", "application/pdf"] });
      if ((result as any).type === "cancel") return;
      const uri = (result as any).uri ?? (result as any).assets?.[0]?.uri;
      if (!uri) return Alert.alert("Error", "No se pudo seleccionar el archivo");
      setFactura(uri);
      setFacturaRemoved(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Ocurrió un problema al seleccionar el archivo");
    }
  };
  const calcularTotal = () => {
    let total = 0;
    conceptosList.forEach(c => {
      if (c.endsWith("Costo") || (!c.includes("Cantidad") && !c.endsWith("Costo"))) {
        total += Number(conceptos[c] || 0);
      }
    });
    total += Number(dieselCantidad || 0) * Number(dieselCosto || 0);
    total += Number(tag || 0);
    return total;
  };

  const saveViatico = async () => {
    if (!tripId) { Alert.alert("Error", "Selecciona un viaje"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tripId", tripId);
      formData.append("conceptos", JSON.stringify(conceptos));
      formData.append("dieselCantidad", dieselCantidad);
      formData.append("dieselCosto", dieselCosto);
      formData.append("tag", tag);
      formData.append("total", String(calcularTotal()));

      if (factura) {
        if (Platform.OS === "web") {
          const response = await fetch(factura);
          const blob = await response.blob();
          const file = new File([blob], `factura_${Date.now()}.jpg`, { type: blob.type });
          formData.append("factura", file);
        } else {
          const uri = factura.startsWith("file://") ? factura : "file://" + factura;
          const filename = uri.split("/").pop()!;
          let type = "image/jpeg";
          if (filename.toLowerCase().endsWith(".pdf")) type = "application/pdf";
          else if (filename.toLowerCase().endsWith(".png")) type = "image/png";
          formData.append("factura", { uri, name: filename, type } as any);
        }
      } else if (facturaRemoved) {
        formData.append("factura", "");
      }

      const url = editingViatico ? `${BASE_URL}/viatics/${editingViatico.id}` : `${BASE_URL}/viatics`;
      const method = editingViatico ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error(await res.text());
      await loadViaticos();
      setModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo guardar el viático");
    } finally {
      setLoading(false);
    }
  };

  const deleteViatico = async (id: string) => {
    let confirmed = false;
    if (Platform.OS === "web") {
      confirmed = window.confirm("¿Desea eliminar este Viatico?");
      if (!confirmed) return;
    } else {
      confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert("Confirmar", "¿Desea eliminar este viático?", [
          { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
          { text: "Eliminar", style: "destructive", onPress: () => resolve(true) },
        ]);
      });
      if (!confirmed) return;
    }
    try {
      await api.delete(`/viatics/${id}`);
      setViaticos(prev => prev.filter(v => v.id !== id));
      Alert.alert("Éxito", "Viático eliminado correctamente");
    } catch (error) {
      console.log("Error eliminando viático", error);
      Alert.alert("Error", "No se pudo eliminar el viático");
    }
  };

  const renderItem = ({ item }: { item: Viatico }) => {
    const trip = trips.find(t => t.id === item.tripId);
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Viaje: {trip?.nombre || "Desconocido"}</Text>
        <Text>Conductor: {trip?.conductorNombre || "Desconocido"}</Text>
        <Text>Total: ${item.total}</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>Editar</Button>
          {currentUser?.rol === "Admin" && <Button mode="contained" buttonColor="red" onPress={() => deleteViatico(item.id)}>Eliminar</Button>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viáticos Registrados</Text>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>Nuevo Viático</Button>
      <View style={{flexDirection:"row",alignItems:"center", marginTop:10, marginBottom:10,}}>
        <Text style={{ fontWeight: "bold", marginRight: 8}}>Exportar por:</Text>
        <View style={{flex:1, backgroundColor:"#fff",borderRadius:8,marginRight:8}}>
          <Picker selectedValue={filter} onValueChange={(value)=>setFilter(value)} style={{backgroundColor:"#fff"}}>
            <Picker.Item label="Día" value="dia" />
            <Picker.Item label="Semana" value="semana" />
            <Picker.Item label="Mes" value="mes" />
          </Picker>
        </View>
        <Button mode="contained" buttonColor="#0d75bb" onPress={() => exportViaticosToExcel(filter)}>Exportar Excel  </Button>

      </View>
      <FlatList data={viaticos} keyExtractor={item => item.id} renderItem={renderItem} style={{ marginTop: 15 }} />
      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingViatico ? "Editar Viático" : "Nuevo Viático"}</Text>

          <Text style={styles.label}>Viaje:</Text>
          <Picker selectedValue={tripId} onValueChange={setTripId} style={styles.picker}>
            <Picker.Item label="Selecciona un viaje" value="" />
            {trips.map(t => <Picker.Item key={t.id} label={`${t.nombre}(${t.conductorNombre || "Sin conductor"})`} value={t.id} />)}
          </Picker>

          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, paddingRight: 5 }}>
              {conceptosList.map(c => (
                <View key={c} style={{ marginBottom: 10 }}>
                  <Text style={styles.label}>{c}:</Text>
                  <TextInput
                    value={conceptos[c]}
                    onChangeText={text => setConceptos({ ...conceptos, [c]: text })}
                    keyboardType="numeric"
                    mode="flat"
                    underlineColor="#0d75bb"
                    activeUnderlineColor="#0d75bb"
                    style={styles.input}
                    placeholder={
                      c.endsWith("Cantidad") ? "Cantidad" :
                        c.endsWith("Costo") ? "Costo" : ""
                    }
                  />
                </View>
              ))}
            </View>

            <View style={{ flex: 1, paddingLeft: 5 }}>
              <Text style={styles.label}>Diésel - Cantidad:</Text>
               <TextInput value={dieselCantidad} onChangeText={setDieselCantidad} keyboardType="numeric" mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" style={styles.input} />
              <Text style={styles.label}>Diésel - Costo:</Text>
              <TextInput value={dieselCosto} onChangeText={setDieselCosto} keyboardType="numeric" mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" style={styles.input} />
              <Text style={styles.label}>TAG:</Text>
              <TextInput value={tag} onChangeText={setTag} keyboardType="numeric" mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" style={styles.input} />
            </View>
          </View>

          <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 15 }}>Total: ${calcularTotal()}</Text>

          <Text style={styles.label}>Factura:</Text>
          {factura ? (
            <>
              {showFactura ? (
                factura.toLowerCase().endsWith(".pdf") ? (
                 <View style={{ marginBottom: 10 }}>
                    <Text>Factura en PDF</Text>
                    <Button mode="contained" onPress={() => Platform.OS === "web" ? window.open(factura, "_blank") : Linking.openURL(factura)}>Abrir PDF</Button>
                  </View>
                ) : (
                  <Image source={{ uri: factura }} style={styles.facturaPreview} />
                )
              ) : (
                <Button mode="contained" onPress={() => setShowFactura(true)}>Mostrar Factura</Button>
              )}
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 5 }}>
                <Button mode="contained" buttonColor="#17d1f1ff" onPress={pickFactura}>Reemplazar factura</Button>
                <Button mode="contained" buttonColor="#e27975ff" onPress={() => { setFactura(null); setFacturaRemoved(true); setShowFactura(false); }}>Eliminar</Button>
              </View>
            </>
          ) : (
            <Button mode="contained" buttonColor="#4caf50" onPress={pickFactura}>Subir factura</Button>
          )}

          {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
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
  title: { fontSize: 22, fontWeight: "bold" },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: { backgroundColor: "#fff", marginBottom: 15 },
  label: { fontWeight: "bold", marginTop: 10, marginBottom: 5 },
  picker: { backgroundColor: "#fff", borderRadius: 5, marginBottom: 10 },
  facturaPreview: { width: "100%", height: 180, borderRadius: 8, marginBottom: 10, resizeMode: "contain" },
});