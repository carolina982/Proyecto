import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Appbar, Menu } from "react-native-paper";
import ProfileTab from "../components/ProfileTab";
import TripList from "../components/TripList";
import UnitList from "../components/UnitList";
import ViaticList from "../components/ViaticList";
import { useStore } from "../context/Store";

export default function Dashboard() {
  const { currentUser, setCurrentUser } = useStore();
  const [tab, setTab] = useState<"Perfil" | "Viajes" | "Viáticos" | "Unidades">("Perfil");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  if (!currentUser) return <Text>Debes iniciar sesión</Text>;

  const handleLogout = () => setCurrentUser(null);

  // Detectar ancho de pantalla
  const screenWidth = Dimensions.get("window").width;
  const isLargeScreen = screenWidth > 600; // Ajusta según tu criterio

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? "row" : "column" }}>
      {/* Menú lateral o hamburguesa */}
      {isLargeScreen ? (
        <View style={styles.sideMenu}>
          <TouchableOpacity
            style={[styles.sideTab, tab === "Perfil" && styles.sideTabActive]}
            onPress={() => setTab("Perfil")}
          >
            <Text style={styles.tabText}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideTab, tab === "Viajes" && styles.sideTabActive]}
            onPress={() => setTab("Viajes")}
          >
            <Text style={styles.tabText}>Viajes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideTab, tab === "Viáticos" && styles.sideTabActive]}
            onPress={() => setTab("Viáticos")}
          >
            <Text style={styles.tabText}>Viáticos</Text>
          </TouchableOpacity>
          {currentUser.rol === "Admin" && (
            <TouchableOpacity
              style={[styles.sideTab, tab === "Unidades" && styles.sideTabActive]}
              onPress={() => setTab("Unidades")}
            >
              <Text style={styles.tabText}>Unidades</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Appbar.Header>
          <Appbar.Content title="Dashboard" />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Appbar.Action
                icon="menu"
                color="white"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item onPress={() => { setTab("Perfil"); setMenuVisible(false); }} title="Perfil" />
            <Menu.Item onPress={() => { setTab("Viajes"); setMenuVisible(false); }} title="Viajes" />
            <Menu.Item onPress={() => { setTab("Viáticos"); setMenuVisible(false); }} title="Viáticos" />
            {currentUser.rol === "Admin" && (
              <Menu.Item onPress={() => { setTab("Unidades"); setMenuVisible(false); }} title="Unidades" />
            )}
            <Menu.Item onPress={handleLogout} title="Cerrar Sesión" />
          </Menu>
        </Appbar.Header>
      )}

      {/* Contenido de la pestaña */}
      <ScrollView style={styles.contentContainer}>
        {/* Mostrar siempre nombre y rol */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.section}>Usuario: {currentUser.nombre}</Text>
          <Text style={styles.section}>Rol: {currentUser.rol}</Text>
        </View>

        {tab === "Perfil" && <ProfileTab currentUser={currentUser} />}

        {tab === "Viajes" && (
          <View>
            <Text style={styles.section}>Lista de Viajes</Text>
            <TripList
              viewOnly={currentUser.rol === "Chofer"}
              onSelect={(tripId: string) => setSelectedTripId(tripId)}
            />
            {selectedTripId && (
              <View style={styles.detail}>
                <Text style={styles.section}>Detalles del viaje {selectedTripId}</Text>
              </View>
            )}
          </View>
        )}

        {tab === "Viáticos" && (
          <View>
            <Text style={styles.section}>Lista de Viáticos</Text>
            <ViaticList viewOnly={currentUser.rol === "Chofer"} />
          </View>
        )}

        {tab === "Unidades" && currentUser.rol === "Admin" && (
          <View>
            <Text style={styles.section}>Lista de Unidades</Text>
            <UnitList />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sideMenu: {
    width: 140,
    backgroundColor: "#eee",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  sideTab: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 6,
  },
  sideTabActive: {
    backgroundColor: "#74a8dfff",
  },
  tabText: { fontSize: 16 },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#3842a0ff",
    paddingVertical: 10,
    borderRadius: 6,
  },
  logoutText: { color: "white", textAlign: "center", fontWeight: "bold" },
  contentContainer: { flex: 1, padding: 16 },
  section: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  detail: { marginTop: 15, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 8 },
});