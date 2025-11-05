import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { Button, TextInput, } from "react-native-paper";
import { api } from "../api/api";

interface Unit {
  id: string;
  nombre: string;
  placas: string;
  modelo: string;
  capacidad: number;
  estado: "Disponible" | "Mantenimiento" | "Ocupado";
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [nombre, setNombre] = useState("");
  const [placas, setPlacas] = useState("");
  const [modelo, setModelo] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [estado, setEstado] = useState<Unit["estado"]>("Disponible");

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const res = await api.get("/units");
      const mappedUnits= res.data.map((u:any)=> ({
        id:u.id,
        nombre:u.nombre,
        placas:u.placas,
        modelo:u.modelo,
        capacidad:u.capacidad,
        estado:u.estado,
      }));
      setUnits(mappedUnits);
    } catch (error) {
      console.error("Error cargando unidades", error);
    }
  };

  const openModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setNombre(unit.nombre);
      setPlacas(unit.placas);
      setModelo(unit.modelo);
      setCapacidad(unit.capacidad.toString());
      setEstado(unit.estado);
    } else {
      setEditingUnit(null);
      setNombre("");
      setPlacas("");
      setModelo("");
      setCapacidad("");
      setEstado("Disponible");
    }
    setModalVisible(true);
  };

  const saveUnit = async () => {
    if (!nombre || !placas || !modelo || !capacidad) {
      Alert.alert("Error", "Completa todos los datos");
      return;
    }
    const unitData = {
      nombre, placas,
      modelo,capacidad: Number(capacidad),estado,
    };

    try {
      if (editingUnit) {
        await api.put(`/units/${editingUnit.id}`, unitData);
      } else {
        await api.post("/units", unitData);
      }
      await loadUnits();
      setModalVisible(false);
    } catch (error) {
      console.error("Error guardando unidad", error);
      Alert.alert("Error", "No se pudo guardar la unidad");
    }
  };
  const deleteUnit = async(id:string)=>{
    console.log ("Eliminar unidad id",id);
    let confirmed =false;
    if (Platform.OS === "web"){
      confirmed= window.confirm("¿Desea eliminar esta unidad?");
      if (!confirmed) return;
    }else {
      confirmed = await new Promise<boolean>((resolve)=>{
        Alert.alert("Confirmar" , "¿Desea eliminar esta unidad?",[
          {text:"Cancelar" , style:"cancel" , onPress:()=>resolve(false)},
          {text:"Eliminar", style:"destructive" , onPress:()=>resolve(true)},
        ],
        {cancelable:true}
      );
      });
      if (!confirmed) return;
    }
    try {
      const res= await api.delete(`/units/${id}`);
      console.log("DELETE unidad response", res.data);
      setUnits((prev)=>prev.filter((u)=> u.id !==id));
      Alert.alert("Exito", "Unidad eliminada correctamente");
    }catch (error){
      console.log("Error eliminando unidad", error);
      Alert.alert("Error", "No se pudo eliminar la unidad")
    }
  }
  const renderItem = ({ item }: { item: Unit }) => {
    let estadoColor = "#4caf50"; //Disponible
    if (item.estado === "Mantenimiento") estadoColor = "#ff9800";
    if (item.estado === "Ocupado") estadoColor = "#f44336";
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.title}>{item.nombre}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
            <Text style={styles.estadoText}>{item.estado}</Text>
          </View>
        </View>
        <Text>Placas: {item.placas}</Text>
        <Text>Modelo: {item.modelo}</Text>
        <Text>Capacidad: {item.capacidad}</Text>
        <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
          <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal(item)}>
            Editar
          </Button>
          <Button mode="contained" buttonColor="red" onPress={() =>deleteUnit(item.id)}>
            Eliminar
          </Button>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unidades Registradas</Text>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>
        Nueva Unidad
      </Button>
      <FlatList data={units}keyExtractor={(item) => item.id}renderItem={renderItem}style={{ marginTop: 15 }}/>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingUnit ? "Editar Unidad" : "Nueva Unidad"}</Text>
          <TextInput placeholder="Nombre"value={nombre}onChangeText={setNombre} mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb" textColor="#000"placeholderTextColor="#888"dense style={styles.input}/>
          <TextInput placeholder="Placas"value={placas}onChangeText={setPlacas}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"textColor="#000"placeholderTextColor="#888"dense style={styles.input}/>
          <TextInput placeholder="Modelo"value={modelo}onChangeText={setModelo}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"textColor="#000"placeholderTextColor="#888"dense style={styles.input}/>
          <TextInput placeholder="Capacidad"value={capacidad}onChangeText={setCapacidad}mode="flat"underlineColor="#0d75bb"activeUnderlineColor="#0d75bb"textColor="#000"placeholderTextColor="#888"keyboardType="numeric"dense style={styles.input}/>
          <TextInput placeholder="Estado (Disponible / Mantenimiento / Ocupado)"value={estado}onChangeText={(text) => setEstado(text as Unit["estado"])} mode="flat"underlineColor="#0d75bb"
            activeUnderlineColor="#0d75bb" textColor="#000" placeholderTextColor="#888" dense style={styles.input}/>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
            <Button mode="contained" buttonColor="#888"  onPress={() => setModalVisible(false)}>
              Cancelar
            </Button>
            <Button mode="contained" buttonColor="#0d75bb" onPress={saveUnit}>
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
  card: { backgroundColor: "#fff",padding: 15,marginBottom: 12,borderRadius: 12,shadowColor: "#000",shadowOpacity: 0.05,shadowOffset: { width: 0, height: 2 },shadowRadius: 5,elevation: 2, },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
  pageTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#0d75bb" },
  estadoBadge: {paddingHorizontal: 8,paddingVertical: 3,borderRadius: 12,},
  estadoText: { color: "#fff", fontWeight: "bold" },
  modalContent: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: { borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor:""},
});