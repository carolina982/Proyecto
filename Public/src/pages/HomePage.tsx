import React, { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { api } from "../api/api";

interface User {
  id: string;
  nombre: string;
  rol: string;
}

interface Announcement {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
}

interface HomePageProps {
  currentUser: User;
}

export default function HomePage({ currentUser }: HomePageProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data.map((a: any) => ({ ...a, id: a._id })));
    } catch (error) {
      console.error("Error cargando anuncios", error);
      Alert.alert("Error", "No se pudieron cargar los anuncios");
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!titulo || !contenido) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    try {
      if (editingId) {
        // Editando anuncio existente
        await api.put(`/announcements/${editingId}`, { titulo, contenido });
        Alert.alert("Éxito", "Anuncio actualizado");
      } else {
        // Creando nuevo anuncio
        await api.post("/announcements", { titulo, contenido });
        Alert.alert("Éxito", "Anuncio creado");
      }

      setModalVisible(false);
      setTitulo("");
      setContenido("");
      setEditingId(null);
      loadAnnouncements();
    } catch (error) {
      console.error("Error guardando anuncio", error);
      Alert.alert("Error", "No se pudo guardar anuncio");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error eliminando anuncio", error);
      Alert.alert("Error", "No se pudo eliminar anuncio");
    }
  };

  const handleEdit = (a: Announcement) => {
    setTitulo(a.titulo);
    setContenido(a.contenido);
    setEditingId(a.id);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bienvenidos</Text>

      {announcements.map((a) => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.cardTitle}>{a.titulo}</Text>
          <Text>{a.contenido}</Text>
          <Text style={styles.date}>{new Date(a.fecha).toLocaleDateString()}</Text>

          {currentUser.rol?.toLowerCase() === "admin" && (
            <View style={styles.buttonsRow}>
              <Button
                mode="contained"
                buttonColor="#f39c12"
                style={styles.actionButton}
                onPress={() => handleEdit(a)}
              >
                Editar
              </Button>
              <Button
                mode="contained"
                buttonColor="red"
                style={styles.actionButton}
                onPress={() => deleteAnnouncement(a.id)}
              >
                Eliminar
              </Button>
            </View>
          )}
        </View>
      ))}

      {currentUser.rol?.toLowerCase() === "admin" && (
        <Button
          mode="contained"
          buttonColor="#0d75bb"
          style={styles.createButton}
          onPress={() => {
            setTitulo("");
            setContenido("");
            setEditingId(null);
            setModalVisible(true);
          }}
        >
          Crear Anuncio
        </Button>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingId ? "Editar Anuncio" : "Nuevo Anuncio"}
            </Text>

            <TextInput
              label="Titulo"
              value={titulo}
              onChangeText={setTitulo}
              mode="flat"
              underlineColor="#0d75bb"
              activeUnderlineColor="#0d75bb"
              style={styles.input}
            />
            <TextInput
              label="Contenido"
              value={contenido}
              onChangeText={setContenido}
              mode="flat"
              underlineColor="#0d75bb"
              activeUnderlineColor="#0d75bb"
              multiline
              style={styles.input}
            />

            <View style={styles.buttonsRow}>
              <Button
                mode="contained"
                buttonColor="#888"
                onPress={() => {
                  setModalVisible(false);
                  setEditingId(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                buttonColor="#007bff"
                onPress={handleSaveAnnouncement}
              >
                Guardar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  date: { fontSize: 12, color: "#666", marginTop: 5 },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  actionButton: { flex: 1, marginHorizontal: 5 },
  createButton: { marginTop: 20 },
  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { marginBottom: 15, backgroundColor: "#fff" },
});