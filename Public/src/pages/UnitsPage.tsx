import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../api/api";
import { Unit } from "../context/Store";

interface Unit {
  id:string;
  nombre: string;
  tipo:string;
}

export default function UnitsPage() {
  const [units, setUnits] =useState<Unit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");

  useEffect(()=>{
    loadUnits();
  },[]);
  const loadUnits = async ()=>{
    try {
      const res =await api.get("/units");
      setUnits (res.data) ;
    }catch (error){
      console.error("Error cargando unidade", error);
    }
  };
  const openModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setNombre(unit.nombre);
      setTipo(unit.tipo);
    }else {
      setEditingUnit(null);
      setNombre("");
      setTipo("");
    }
    setModalVisible(true);
  };

  const saveUnit =async () => {
    if (!nombre || !tipo) {
      Alert.alert("Error", "Completa todos los datos");
      return;
    }
   const unitData ={nombre, tipo };
   try{
    if (editingUnit) {
      await api.put(`/units/${editingUnit.id}`,unitData);
    }else{
      await api.post ("/units" , unitData);
    }
    await loadUnits();
    setModalVisible(false);
  } catch (error){
    console.error("Error guardando unidad " , error );
    Alert.alert("Error", "No se puedo guadar la unidad");
  }
  };


  const deleteUnitItem = (id: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar esta unidad?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress:async () => {
        try{
          await api.delete(`/units/${id}`);
          await loadUnits();
        }catch (error){
          console.error ("Error eliminado unidad", error);
          Alert.alert ("Error", "No se puede eliminar la unidad");
        }
      },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Unit }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nombre}</Text>
      <Text>Tipo: {item.tipo}</Text>
      <View style={{ flexDirection: "row", marginTop: 5, gap: 10 }}>
        <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>
          Editar
        </Button>
        <Button mode="contained" onPress={() => deleteUnitItem(item.id)} buttonColor="red">
          Eliminar
        </Button>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button mode="contained" buttonColor="#0d75bbff" onPress={() => openModal()}>
        Nueva Unidad
      </Button>
      <FlatList
        data={units}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ marginTop: 15 }}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingUnit ? "Editar Unidad" : "Nueva Unidad"}</Text>
          <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
          <TextInput placeholder="Tipo" value={tipo} onChangeText={setTipo} style={styles.input} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <Button mode="contained" onPress={() => setModalVisible(false)}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={saveUnit}>
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
  title: { fontWeight: "bold", fontSize: 16, color: "#007bff" },
  modalContent: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
});