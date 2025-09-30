import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
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
      setUnits(res.data);
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
      nombre,
      placas,
      modelo,
      capacidad: Number(capacidad),
      estado,
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

  const deleteUnitItem = (id: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar esta unidad?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/units/${id}`);
            await loadUnits();
          } catch (error) {
            console.error("Error eliminando unidad", error);
            Alert.alert("Error", "No se puede eliminar la unidad");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Unit }) => {
    let estadoColor = "#4caf50"; // Disponible
    if (item.estado === "Mantenimiento") estadoColor = "#ff9800";
    if (item.estado === "Ocupado") estadoColor = "#f44336";

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={styles.unitName}>{item.nombre}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estadoColor }]}>
            <Text style={styles.estadoText}>{item.estado}</Text>
          </View>
        </View>
        <Text>Placas: {item.placas}</Text>
        <Text>Modelo: {item.modelo}</Text>
        <Text>Capacidad: {item.capacidad}</Text>
        <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
          <Button mode="contained" buttonColor="#008bff" onPress={() => openModal(item)}>
            Editar
          </Button>
          <Button mode="contained" buttonColor="red" onPress={() => deleteUnitItem(item.id)}>
            Eliminar
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
       <Text style={styles.title} >Viajes  Registrados</Text>
      <Button mode="contained" buttonColor="#0d75bb" onPress={() => openModal()}>
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
          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            textColor="#000"
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Placas"
            value={placas}
            onChangeText={setPlacas}
            style={styles.input}
            textColor="#000"
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Modelo"
            value={modelo}
            onChangeText={setModelo}
            style={styles.input}
            textColor="#000"
            placeholderTextColor="#888"
          />
          <TextInput
            placeholder="Capacidad"
            value={capacidad}
            onChangeText={setCapacidad}
            style={styles.input}
            textColor="#000"
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Estado (Disponible / Mantenimiento / Ocupado)"
            value={estado}
            onChangeText={(text) => setEstado(text as Unit["estado"])}
            style={styles.input}
            textColor="#000"
            placeholderTextColor="#888"
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
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
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  title: { fontWeight: "bold", fontSize: 24, color: "#0c0c0cff",marginBottom: 15 ,textAlign: "center" },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  estadoText: { color: "#fff", fontWeight: "bold" },
  modalContent: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: { borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc" },
  unitName :{
    fontWeight:"bold",
    fontSize:17,
    color:"0c0c0cff",
  }
});