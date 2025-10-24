import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import { api, BASE_URL } from "../api/api";

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
  facturaUrl?: string;
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
  const [factura, setFactura] = useState<string | null>(null);
  const [facturaRemoved, setFacturaRemoved] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showFactura, setShowFactura]=useState(false);

  useEffect(() => {
    loadViaticos();
    loadTrips();
  }, []);

  const loadViaticos = async () => {
   try {
    const res=await api.get("/viatics");
    setViaticos(res.data.map((v:any)=>({
      ...v, id:v._id ,facturaUrl:v.factura ? `${BASE_URL.replace("/api","")}${v.factura}`:undefined,
    }))
  );
   }catch (error){
    console.error(error);
    Alert.alert("Error", "No se pudieron cargar los viaticos");
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
      setFactura(viatico.facturaUrl || null);
      setShowFactura(false);
    } else {
      setEditingViatico(null);
      setNombre("");
      setTripId("");
      setMonto("");
      setDescripcion("");
      setConcepto("");
      setFactura(null);
      setShowFactura(false);
    }
    setFacturaRemoved(false);
    setErrors({});
    setModalVisible(true);
  };

  const pickFactura = async () => {
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

      setFactura(file.uri);
      setFacturaRemoved(false);
    } catch (error) {
      console.error("Error seleccionando archivo:", error);
      Alert.alert("Error", "Ocurrió un problema al seleccionar el archivo");
    }
  };
const saveViatico = async () => {
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
        const match = /\.(\w+)$/.exec(filename);
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
    let res;
    if (editingViatico) {
      res = await fetch(`${BASE_URL}/viatics/${editingViatico.id}`, {
        method: "PUT",
        body: formData,
      });
    } else {
      res = await fetch(`${BASE_URL}/viatics`, {
        method: "POST",
        body: formData,
      });
    }

    const text = await res.text();
    if (!res.ok) throw new Error(text || "Error guardando viático");
    const data = JSON.parse(text);
    await loadViaticos();
    setModalVisible(false);
  } catch (error) {
    console.error("Error guardando viático:", error);
    Alert.alert("Error", "No se pudo guardar el viático");
  } finally {
    setLoading(false);
  }
};
 const deleteViatico = async (id: string) => {
   console.log("Eliminar viatico ID",id);
   let confirmed = false ;
   if (Platform.OS === "web"){
    confirmed=window.confirm("¿Desea eliminar este viatico?");
    if (!confirmed) return;
   }else {
    confirmed=await new Promise<boolean>((resolve)=>{
      Alert.alert("Confrimar" , "¿Desea confirmar este viatico?",[
        {text:"Cancelar", style:"cancel", onPress:()=>resolve (false)},
        {text:"Eliminar", style:"destructive", onPress:()=>resolve(true)},
      ],
      {cancelable:true}
    );
    });
    if (!confirmed) return;
   }
   try {
    const res= await api.delete(`/viatics/${id}`);
    console.log("DELETE  viatico response",res.data);
    setViaticos((prev)=> prev.filter((v)=> v.id !==id));
    Alert.alert("Exito", "Viatico eliminado correctamente");
   }catch (error){
    console.error("Error eliminando viatico", error);
    Alert.alert("Error","No se pudo eliminar viatico")
   }
};
  const renderItem = ({ item }: { item: Viatico }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text>Viaje: {trips.find((t) => t.id === item.tripId)?.nombre || "Desconocido"}</Text>
      <Text>Concepto: {item.concepto}</Text>
      <Text>Descripción: {item.descripcion}</Text>
      <Text>Monto: ${item.monto}</Text>
       
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
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
          <Text style ={styles.label}>factura:</Text>
          {factura ?(
            <>
            {showFactura ?( factura.toLowerCase().endsWith(".pdf")?(
              <View style ={{marginBottom:10}}>
                <Text>Factura en pdf</Text>
                <Button mode="contained" onPress={()=>{
                  if (Platform.OS ==="web")window.open(factura,"_blank");
                  else Linking.openURL(factura);}}>Abrir PDF</Button>
              </View>
              ):(
                <Image source={{uri:factura}} style={styles.facturaPreview}/>
              )
            ):(
              <Button mode="contained" onPress={()=> setShowFactura(true)}>Mostrar Factura</Button>
            )}
            <View style={{flexDirection:"row",justifyContent:"space-between",gap:10,marginTop:5}}>
              <Button mode="contained" buttonColor="#17d1f1ff" onPress={pickFactura}>Remplazar factura</Button>
              <Button mode="contained" buttonColor="#e27975ff" onPress={()=>{setFactura(null);setFacturaRemoved(true);setShowFactura(false);}}>Eliminar</Button>
            </View>
             </>
            ):(
              <Button mode="contained" buttonColor="#4caf50" onPress={pickFactura}>Subir factura</Button>
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
  facturaPreview: { width: "100%", height: 180, borderRadius: 8, marginBottom: 10, resizeMode: "contain" },
});