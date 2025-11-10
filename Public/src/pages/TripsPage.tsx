import { Picker } from '@react-native-picker/picker';
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import * as XLSX from "xlsx";
import { api } from "../api/api";
import { useStore } from '../context/Store';

interface Trip {
  id: string; nombre: string;
  unidadId: string; conductorId: string;
  fechaSalida: string; fechaLlegada: string;
  destino: string;  estado: string;
  kilometraje?: number; acompanate:string;
  def:string;
}

interface Unit { id: string; nombre: string; }
interface User { id: string; nombre: string; apellido?: string; }

export default function TripsPage() {
  const { currentUser } = useStore();
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
  const [estado, setEstado] = useState("pendiente");
  const [kilometraje, setKilometraje] = useState("");
  const [acompanate,setAcompanate]=useState("");
  const [def,setDef]=useState("");

  useEffect(() => {
    if (currentUser) {
      loadTrips();
      loadUnits();
      loadUsers();
    }
  }, [currentUser]);
  if (!currentUser) {
    return (
      <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <Text>Cargando usuario...</Text>
      </View>
    );
  }
  const isAdmin= currentUser.rol?.toLocaleLowerCase() ==="admin";
const loadTrips = async () => {
  try {
    let token: string | null = null;
    if (Platform.OS === "web") {
      token = localStorage.getItem("token");
    } else {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      token = await AsyncStorage.getItem("token");
    }
    if (!token) {
      console.warn("No hay token disponible. No se pudo cargar los viajes.");
      Alert.alert("Error", "No se pudo cargar viajes: token no disponible");
      return;
    }
    console.log ("Token usando en loadtrips",token);
    const res =await api.get("/trips",{
      headers:{
        Authorization:`Bearer ${token}`,
      }
    });
    let allTrips = res.data.map((t: any) => ({ ...t, id: t._id }));
    if (!isAdmin) {
      allTrips = allTrips.filter((t: Trip) => t.conductorId === currentUser.id);
    }
    setTrips(allTrips);
    generateReports(allTrips);
  } catch (error: any) {
    console.error("Error cargando viajes:", error.response?.data || error);
    Alert.alert("Error", "No se pudieron cargar los viajes. Ver consola para más detalles.");
  }
};

  const loadUnits = async () => {
    try {
      const res = await api.get("/units");
      setUnits(res.data.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      console.error("Error cargando unidades:", error);
    }
  };
  const generateReports =(tripsData:Trip[])=>{
    const daily:{[key:string]:number}={};
    const monthly:{[key:string]:number}={};
    tripsData.forEach((trip)=>{
      const salida=new Date(trip.fechaSalida);
      const daykey =salida.toLocaleDateString("es-ES");
      const monthkey =`${salida.getMonth ()+1}/${salida.getFullYear()}`;
      daily[daykey]=(daily[daykey] || 0)+1;
      monthly[monthkey]=(monthly[monthkey] || 0) +1;
    });

  }
  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      console.error("Error cargando usuarios:", error);
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
      setEstado(trip.estado);
      setKilometraje(trip.kilometraje?.toString() || "");
      setAcompanate(trip.acompanate)
      setDef(trip.def || "");
    } else {
      setEditingTrip(null);
      setNombre("");  setUnidadId(""); 
      setConductorId("");  setFechaSalida("");
      setFechaLlegada("");  setDestino(""); 
      setEstado("pendiente");   setKilometraje("");
      setAcompanate("");
      setDef("");
    }
    setModalVisible(true);
  };
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };
  const saveTrip = async () => {
    const tripData = isAdmin
      ? {
          nombre,
          unidadId,
          conductorId,
          fechaSalida: parseDate(fechaSalida),
          fechaLlegada: parseDate(fechaLlegada),
          destino,
          estado,
          kilometraje: Number(kilometraje),
          acompanate,
          def,
        }
      : { estado }; 
    try {
      if (editingTrip) await api.put(`/trips/${editingTrip.id}`, tripData);
      else if (isAdmin) await api.post("/trips", tripData);

       await loadTrips();
      setModalVisible(false);
    } catch (error: any) {
      console.error("Error guardando viaje:", error.response?.data || error);
      Alert.alert("Error", "No se pudo guardar el viaje");
    }
  };
  const deleteTrip = async (id: string) => {
    if (!isAdmin) return;
    let confirmed = false;
    if (Platform.OS === "web") {
      confirmed = window.confirm("¿Desea eliminar este viaje?");
      if (!confirmed) return;
    } else {
      confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert("Confirmar", "¿Desea eliminar este viaje?", [
          { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
          { text: "Eliminar", style: "destructive", onPress: () => resolve(true) },
        ], { cancelable: true });
      });
      if (!confirmed) return;
    }

    try {
      await api.delete(`/trips/${id}`);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      Alert.alert("Éxito", "Viaje eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando viaje", error);
      Alert.alert("Error", "No se pudo eliminar el viaje");
    }
  };

const exportToExcel = async () => {
  try {
    // Ordenar viajes por fecha de salida
    const sortedTrips = [...trips].sort(
      (a, b) => new Date(a.fechaSalida).getTime() - new Date(b.fechaSalida).getTime()
    );

    const ws_data: any[][] = [];
    let currentMonth = "";
    let currentWeek = 0;
    let monthTripCount = 0;

    for (const t of sortedTrips) {
      const salida = new Date(t.fechaSalida);
      const llegada = new Date(t.fechaLlegada);

      const monthName = salida.toLocaleString("es-ES", { month: "long", year: "numeric" });
      const weekNumber = Math.ceil(salida.getDate() / 7);
      const dayNumber = salida.getDate();

      // Nuevo mes
      if (monthName !== currentMonth) {
        // Total del mes anterior
        if (monthTripCount > 0) {
          ws_data.push([` TOTAL DE VIAJES DEL MES: ${monthTripCount}`]);
          ws_data.push([]);
        }

        // Fila del mes
        ws_data.push([` MES: ${monthName.toUpperCase()}`]);

        // Fila de encabezados
        ws_data.push([
          "Semana",
          "Nombre",
          "Destino",
          "Fecha Salida",
          "Fecha Llegada",
          "Día",
          "Conductor",
          "Acompañante",
          "Kilometraje",
          "Estado",
        ]);

        currentMonth = monthName;
        currentWeek = 0; // Reiniciar semana
        monthTripCount = 0;
      }

      // Fila de semana
      if (weekNumber !== currentWeek) {
        ws_data.push([`Semana ${weekNumber}`]); // Solo una fila de semana por semana
        currentWeek = weekNumber;
      }

      // Fila de viaje
      ws_data.push([
        weekNumber,
        t.nombre,
        t.destino,
        salida.toLocaleDateString("es-ES"),
        llegada.toLocaleDateString("es-ES"),
        dayNumber,
        users.find((u) => u.id === t.conductorId)?.nombre || "N/A",
        t.acompanate || "N/A",
        t.kilometraje ?? 0,
        t.estado,
      ]);

      monthTripCount++;
    }

    // Total del último mes
    if (monthTripCount > 0) {
      ws_data.push([` TOTAL DE VIAJES DEL MES: ${monthTripCount}`]);
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte_Viajes");

    if (Platform.OS === "web") {
      const blob = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const file = new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(file, "Reporte_Viajes.xlsx");
    } else {
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const cacheDir = (FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory ?? "";
      const fileUri =` ${cacheDir}Reporte_Viajes.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: "base64" });
      await shareAsync(fileUri);
    }

    Alert.alert("Éxito", "Reporte Excel generado correctamente");
  } catch (error) {
    console.error("Error exportando Excel:", error);
    Alert.alert("Error", "No se pudo generar el archivo Excel");
  }
};
  const renderItem = ({ item }: { item: Trip }) => {
    const unidadNombre = units.find(u => u.id === item.unidadId)?.nombre || item.unidadId;
    const conductorNombre = users.find(u => u.id === item.conductorId)?.nombre || item.conductorId;
    const canEdit = isAdmin || currentUser.id === item.conductorId;
    const canDelete = isAdmin;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.nombre}</Text>
        <Text style={styles.textSmall}>Unidad: {unidadNombre}</Text>
        <Text style={styles.textSmall}>Conductor: {conductorNombre}</Text>
        <Text style={styles.textSmall}>Acompañante: {item.acompanate}</Text>
        <Text style={styles.textSmall}>Destino: {item.destino}</Text>
        <Text style={styles.textSmall}>Salida: {new Date(item.fechaSalida).toLocaleDateString()}</Text>
        <Text style={styles.textSmall}>Llegada: {new Date(item.fechaLlegada).toLocaleDateString()}</Text>
        <Text style={styles.textSmall}>Estado: {item.estado}</Text>
        <Text style={styles.textSmall}>Def:{item.def}</Text>
        <Text style={styles.textSmall}>Kilometraje: {item.kilometraje ?? 0} km</Text>
        <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
          {canEdit && <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>Editar</Button>}
          {canDelete && <Button mode="contained" buttonColor="red" onPress={() => deleteTrip(item.id)}>Eliminar</Button>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viajes Registrados</Text>
      {isAdmin && <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>Nuevo Viaje</Button>}
      {isAdmin && (<Button mode="contained" buttonColor="#0d75bb" style={{marginTop:10}} onPress={ exportToExcel}>Exportar Excel</Button>)}
      <FlatList data={trips}keyExtractor={(item) => item.id} renderItem={renderItem}style={{ marginTop: 15 }}/>
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingTrip ? "Editar Viaje" : "Nuevo Viaje"}</Text>
          {isAdmin ? (
            <>
              <Text style={styles.label}>Nombre:</Text>
              <TextInput value={nombre} onChangeText={setNombre} mode="flat" underlineColor="#8bc1e6ff" activeUnderlineColor="#8bc1e6ff" dense style={styles.input} />
              <Text style={styles.label}>Unidad:</Text>
              <Picker selectedValue={unidadId} onValueChange={setUnidadId} style={styles.picker}>
                <Picker.Item label="Selecciona una unidad" value="" />
                {units.map(u => <Picker.Item key={u.id} label={u.nombre} value={u.id} />)}
              </Picker>
              <Text style={styles.label}>Conductor:</Text>
              <Picker selectedValue={conductorId} onValueChange={setConductorId} style={styles.picker}>
                <Picker.Item label="Selecciona un conductor" value="" />
                {users.map(u => <Picker.Item key={u.id} label={`${u.nombre}`} value={u.id} />)}
              </Picker>
              <Text style={styles.label}>Acompañante:</Text>
              <TextInput value={acompanate} onChangeText={setAcompanate} mode="flat" underlineColor="#0d75bb"activeUnderlineColor="#0d75bb" dense style={styles.input} />
              <Text style={styles.label}>Def</Text>
              <TextInput value={def} onChangeText={setDef} mode="flat" underlineColor="#0d75bb"activeUnderlineColor="#0d75bb" dense style={styles.input} />
              <Text style={styles.label}>Destino:</Text>
              <TextInput value={destino} onChangeText={setDestino} mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" dense style={styles.input} />
              <Text style={styles.label}>Kilometraje (km):</Text>
              <TextInput value={kilometraje} onChangeText={setKilometraje} keyboardType="numeric" mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" dense style={styles.input} />
              <Text style={styles.label}>Fecha de Salida (DD/MM/YYYY):</Text>
              <TextInput value={fechaSalida} onChangeText={setFechaSalida} mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" dense style={styles.input} />
              <Text style={styles.label}>Fecha de Llegada (DD/MM/YYYY):</Text>
              <TextInput value={fechaLlegada} onChangeText={setFechaLlegada} mode="flat" underlineColor="#0d75bb" activeUnderlineColor="#0d75bb" dense style={styles.input} />
            </>
          ) : (
            <Text style={styles.label}>Estado:</Text>
          )}
          <Picker selectedValue={estado} onValueChange={setEstado} style={styles.picker}>
            <Picker.Item label="Pendiente" value="pendiente" />
            <Picker.Item label="En progreso" value="en progreso" />
            <Picker.Item label="Completado" value="completado" />
          </Picker>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Button mode="contained" buttonColor="#888" onPress={() => setModalVisible(false)}>Cancelar</Button>
            <Button mode="contained" buttonColor="#167abdff" onPress={saveTrip}>Guardar</Button>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 8 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  textSmall: { fontSize: 13, marginBottom: 2 },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 8, marginBottom: 10, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginBottom: 5 },
  picker: { backgroundColor: "#fff", borderRadius: 5, marginBottom: 10 },
});


