import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/api";
import { User } from "../context/Store";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [initialUserSnapshot, setInitialUserSnapshot] = useState<Partial<User>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    }
  };

  const handleEdit = (user?: User) => {
    if (user) {
      setEditingUser({ ...user });
      setInitialUserSnapshot({ ...user });
      setIsAdding(false);
    } else {
      const newUser: User = {
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: "Chofer",
        photoUrl: null,
        id: "",
        _id: ""
      };
      setEditingUser(newUser);
      setInitialUserSnapshot({ ...newUser });
      setIsAdding(true);
    }
    setModalVisible(true);
  };

  // Función corregida para partial update
  const getChangedFields = (): Partial<User> => {
    if (!editingUser) return {};
    const changed: Partial<User> = {};

    (Object.keys(editingUser) as (keyof User)[]).forEach((key) => {
      const newValue = editingUser[key];
      const oldValue = initialUserSnapshot[key];

      // Ignorar valores iguales o nulos
      if (newValue === oldValue || newValue == null) return;

      // Rol solo acepta "Admin" | "Chofer"
      if (key === "rol") {
        if (newValue === "Admin" || newValue === "Chofer") {
          changed[key] = newValue;
        }
      } else {
        changed[key] = newValue;
      }
    });

    return changed;
  };

  const saveChanges = async () => {
    if (!editingUser) return;

    const { nombre, apellido, email, password, rol, photoUrl, id, _id } = editingUser;

    if (!nombre || !apellido || !email || (!password && isAdding) || !rol) {
      Alert.alert("Error", "Todos los campos obligatorios deben estar completos");
      return;
    }

    try {
      if (isAdding) {
        await api.post("/users", { nombre, apellido, email, password, rol, photoUrl });
        Alert.alert("Éxito", "Usuario creado correctamente");
      } else {
        const changedFields = getChangedFields();
        if (Object.keys(changedFields).length === 0) {
          Alert.alert("Info", "No se realizaron cambios");
        } else {
          await api.patch( `/users/${_id || id} `, changedFields);
          Alert.alert("Éxito", "Usuario actualizado correctamente");
        }
      }
      await loadUsers();
      setModalVisible(false);
      setEditingUser(null);
      setIsAdding(false);
    } catch (error) {
      console.error("Error guardando usuario", error);
      Alert.alert("Error", "No se pudo guardar el usuario");
    }
  };

  const handleDelete = (userId: string) => {
    Alert.alert("Confirmar", "¿Desea eliminar este usuario?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete( `users/${userId} `);
            Alert.alert("Éxito", "Usuario eliminado correctamente");
            await loadUsers();
          } catch (error) {
            console.error("Error eliminando usuario", error);
            Alert.alert("Error", "No se pudo eliminar el usuario");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>Rol: {item.rol}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id || item.id || "")}>
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
        keyExtractor={(item) => item._id || item.id || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, marginTop: 10 }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
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
            {isAdding && (
              <TextInput
                placeholder="Contraseña"
                style={styles.input}
                secureTextEntry
                value={editingUser?.password}
                onChangeText={(text) => editingUser && setEditingUser({ ...editingUser, password: text })}
              />
            )}
            <TextInput
              placeholder="Rol (Admin / Chofer)"
              style={styles.input}
              value={editingUser?.rol}
              onChangeText={(text) => editingUser && setEditingUser({ ...editingUser, rol: text as "Admin" | "Chofer" })}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <Button title="Cancelar" onPress={() => { setModalVisible(false); setEditingUser(null); setIsAdding(false); }} />
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
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
});