import React, { useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { User, useStore } from "../context/Store";

export default function AdminPage() {
  const { users, setUsers } = useStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Abrir modal para agregar o editar
  const handleEdit = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setIsAdding(false);
    } else {
      setEditingUser({
        id: Date.now().toString(),
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

  // Guardar cambios
  const saveChanges = () => {
    if (!editingUser) return;

    if (
      !editingUser.nombre ||
      !editingUser.apellido ||
      !editingUser.email ||
      !editingUser.rol ||
      !editingUser.password
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const existingIndex = users.findIndex((u) => u.email === editingUser.email);
    let updatedUsers = [...users];

    if (isAdding) {
      if (existingIndex >= 0) {
        Alert.alert("Error", "Ya existe un usuario con ese correo");
        return;
      }
      updatedUsers.push(editingUser);
    } else {
      if (existingIndex >= 0) {
        updatedUsers[existingIndex] = editingUser;
      }
    }

    setUsers(updatedUsers);
    setModalVisible(false);
    setEditingUser(null);
    setIsAdding(false);
  };

  // Eliminar usuario correctamente
  const handleDelete= (email:string ) =>Alert.alert("Confirmar " , "¿Desea elimar este usuario",[
    {text:"Cancelar" , style:"cancel"},
    {
      text:"Eliminar",
      style:"destructive",
      onPress:()=>{
        const updatedUsers=users.filter((u)=>u.email !==email);
        setUsers(updatedUsers);
        if (editingUser?.email === email) setEditingUser (null);
      },
    },
  ] )

  

  const renderItem = ({ item }: any) => (
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
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.email)}>
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios Registrados</Text>
      <Button title="Agregar Usuario" onPress={() => handleEdit()} />
      <FlatList
        data={users}
        keyExtractor={(item) => item.email}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
      />

      {/* Modal para agregar/editar */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              {isAdding ? "Agregar Usuario" : "Editar Usuario"}
            </Text>

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
              onChangeText={(text) => editingUser && setEditingUser({ ...editingUser, rol: text })}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setModalVisible(false);
                  setEditingUser(null);
                  setIsAdding(false);
                }}
              />
              <Button title="Guardar" onPress={saveChanges} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  userCard: { flexDirection: "row", backgroundColor: "#fff", padding: 10, marginBottom: 10, borderRadius: 10, alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 14, color: "#555" },
  role: { fontSize: 14, color: "#007bff", marginTop: 2 },
  actions: { flexDirection: "column", marginLeft: 10 },
  editButton: { backgroundColor: "#1381f7ff", padding: 5, borderRadius: 5, marginBottom: 5 },
  deleteButton: { backgroundColor: "#ec514cff", padding: 5, borderRadius: 5 },
  actionText: { color: "#fff", fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
});