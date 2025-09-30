import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/api";

interface User {
  _id?: string; // _id viene de MongoDB
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  rol: "Admin" | "Chofer";
  photoUrl?: string | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Cargar usuarios al iniciar
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
    }
  };

  // Abrir modal para agregar o editar
  const handleEdit = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setIsAdding(false);
    } else {
      setEditingUser({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: "Chofer",
        photoUrl: null,
      });
      setIsAdding(true);
    }
    setModalVisible(true);
  };

  // Guardar cambios (POST o PUT)
  const saveChanges = async () => {
    if (!editingUser) return;

    if (!editingUser.nombre || !editingUser.email || !editingUser.password || !editingUser.rol) {
      Alert.alert("Error", "Completa todos los campos obligatorios");
      return;
    }

    try {
      if (isAdding) {
        await api.post("/users", editingUser);
        Alert.alert("Éxito", "Usuario creado correctamente");
      } else {
        await api.put(`/users/${editingUser._id}`, editingUser);
        Alert.alert("Éxito", "Usuario actualizado correctamente");
      }
      setModalVisible(false);
      setEditingUser(null);
      setIsAdding(false);
      loadUsers();
    } catch (error) {
      console.error("Error guardando usuario:", error);
      Alert.alert("Error", "No se pudo guardar el usuario");
    }
  };

  // Eliminar usuario
  const handleDelete = async (userId: string) => {
    Alert.alert("Confirmar", "¿Desea eliminar este usuario?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/users/${userId}`);
            Alert.alert("Éxito", "Usuario eliminado correctamente");
            loadUsers();
          } catch (error) {
            console.error("Error eliminando usuario:", error);
            Alert.alert("Error", "No se pudo eliminar el usuario");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      {item.photoUrl && <Image source={{ uri: item.photoUrl }} style={styles.avatar} />}
      <View style={styles.userInfo}>
        <Text style={styles.name}>
          {item.nombre} {item.apellido}
        </Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>Rol: {item.rol}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id!)}>
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios Registrados</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => handleEdit()}>
        <Text style={styles.addButtonText}>Agregar Usuario</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id!}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
      />
    

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isAdding ? "Agregar Usuario" : "Editar Usuario"}</Text>

            <TextInput
              placeholder="Nombre"
              style={styles.input}
              value={editingUser?.nombre}
              onChangeText={(text) => editingUser && setEditingUser({ ...editingUser, nombre: text })}
            />
            <TextInput
              placeholder="Apellido"
              style={styles.input}
              value={editingUser?.apellido}
              onChangeText={(text) => editingUser && setEditingUser({ ...editingUser, apellido: text })}
            />
            <TextInput
              placeholder="Correo"
              style={styles.input}
              value={editingUser?.email}
              onChangeText={(text) => editingUser && setEditingUser({ ...editingUser, email: text })}
            />
            <TextInput
              placeholder="Contraseña"
              style={styles.input}
              secureTextEntry
              value={editingUser?.password}
              onChangeText={(text) => editingUser && setEditingUser({ ...editingUser, password: text })}
            />
            <TextInput
              placeholder="Rol (Admin / Chofer)"
              style={styles.input}
              value={editingUser?.rol}
              onChangeText={(text) => editingUser && setEditingUser({ ...editingUser, rol: text as "Admin" | "Chofer" })}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.actionText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                <Text style={styles.actionText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  addButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 10, alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  userCard: { flexDirection: "row", backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10, alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 14, color: "#555" },
  role: { fontSize: 14, color: "#007bff", marginTop: 2 },
  actions: { flexDirection: "column", marginLeft: 10 },
  editButton: { backgroundColor: "#1381f7ff", padding: 5, borderRadius: 5, marginBottom: 5, alignItems: "center" },
  deleteButton: { backgroundColor: "#ec514cff", padding: 5, borderRadius: 5, alignItems: "center" },
  cancelButton: { backgroundColor: "#999", padding: 10, borderRadius: 5, flex: 1, marginRight: 5, alignItems: "center" },
  saveButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
});