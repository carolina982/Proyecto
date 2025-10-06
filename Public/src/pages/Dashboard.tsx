import React, { useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Appbar, Menu } from "react-native-paper";
import ProfileTab from "../components/ProfileTab";
import { useStore } from "../context/Store";

import AdminPage from "./AdminPage";
import TripsPage from "./TripsPage";
import UnitsPage from "./UnitsPage";
import ViaticsPage from "./ViaticsPage";

export default function Dashboard() {
  const { currentUser, setCurrentUser } = useStore();
  const [tab, setTab] = useState<"Perfil" | "Viajes" | "Viáticos" | "Unidades" | "Usuarios">("Perfil");
  const [menuVisible, setMenuVisible] = useState(false);

  if (!currentUser) return <Text>Debes iniciar sesión</Text>;

  const handleLogout = () => setCurrentUser(null);

  const screenWidth = Dimensions.get("window").width;
  const isLargeScreen = screenWidth > 600;

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? "row" : "column" }}>
      
      {/* ===== MENÚ LATERAL (pantallas grandes) ===== */}
      {isLargeScreen ? (
        <View style={styles.sideMenu}>
          {currentUser.photoUrl && <Image source={{ uri: currentUser.photoUrl }} style={styles.avatar} />}
          <Text style={styles.name}>{currentUser.nombre} {currentUser.apellido}</Text>
          <Text style={styles.role}>Rol: {currentUser.rol}</Text>

          <TouchableOpacity style={[styles.sideTab, tab === "Perfil" && styles.sideTabActive]} onPress={() => setTab("Perfil")}>
            <Text style={styles.tabText}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sideTab, tab === "Viajes" && styles.sideTabActive]} onPress={() => setTab("Viajes")}>
            <Text style={styles.tabText}>Viajes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sideTab, tab === "Viáticos" && styles.sideTabActive]} onPress={() => setTab("Viáticos")}>
            <Text style={styles.tabText}>Viáticos</Text>
          </TouchableOpacity>

          {currentUser.rol?.toLowerCase() === "admin" && (
            <>
              <TouchableOpacity style={[styles.sideTab, tab === "Unidades" && styles.sideTabActive]} onPress={() => setTab("Unidades")}>
                <Text style={styles.tabText}>Unidades</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sideTab, tab === "Usuarios" && styles.sideTabActive]} onPress={() => setTab("Usuarios")}>
                <Text style={styles.tabText}>Usuarios</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ===== APPBAR Y MENÚ (pantallas pequeñas) ===== */
        <Appbar.Header>
          <Appbar.Content title="Dashboard" />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<Appbar.Action icon="menu" color="white" onPress={() => setMenuVisible(true)} />}
          >
            <Menu.Item onPress={() => { setTab("Perfil"); setMenuVisible(false); }} title="Perfil" />
            <Menu.Item onPress={() => { setTab("Viajes"); setMenuVisible(false); }} title="Viajes" />
            <Menu.Item onPress={() => { setTab("Viáticos"); setMenuVisible(false); }} title="Viáticos" />

            {currentUser.rol?.toLowerCase() === "admin" && (
              <>
                <Menu.Item onPress={() => { setTab("Unidades"); setMenuVisible(false); }} title="Unidades" />
                <Menu.Item onPress={() => { setTab("Usuarios"); setMenuVisible(false); }} title="Usuarios" />
              </>
            )}

            <Menu.Item onPress={handleLogout} title="Cerrar Sesión" />
          </Menu>
        </Appbar.Header>
      )}

      {/* ===== CONTENIDO DE PESTAÑAS ===== */}
      <ScrollView style={styles.contentContainer}>
        {tab === "Perfil" && <ProfileTab currentUser={currentUser} />}
        {tab === "Viajes" && <TripsPage />}
        {tab === "Viáticos" && <ViaticsPage />}
        {tab === "Unidades" && currentUser.rol?.toLowerCase() === "admin" && <UnitsPage />}
        {tab === "Usuarios" && currentUser.rol?.toLowerCase() === "admin" && <AdminPage />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sideMenu: { width: 200, backgroundColor: "#f0f0f0", padding: 10 },
  sideTab: { padding: 10, marginVertical: 5, borderRadius: 5 },
  sideTabActive: { backgroundColor: "#007bff" },
  tabText: { color: "#000" },
  logoutButton: { marginTop: 20, padding: 10, backgroundColor: "#ff4d4d", borderRadius: 5 },
  logoutText: { color: "#fff", textAlign: "center" },
  contentContainer: { flex: 1, padding: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  role: { fontSize: 14, marginBottom: 15, color: "#555" },
});