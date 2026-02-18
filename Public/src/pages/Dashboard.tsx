import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { Appbar, Menu } from "react-native-paper";
import { useStore } from "../context/Store";
import AdminPage from "./AdminPage";
import HomePage from "./HomePage";
import PerfilePage from "./PerfilePage";
import TripsPage from "./TripsPage";
import UnitsPage from "./UnitsPage";
import ViaticsPage from "./ViaticsPage";

export default function Dashboard() {
  const { currentUser, setCurrentUser } = useStore();
  const [tab, setTab] = useState<"Inicio" | "Perfil" | "Viajes" | "Viáticos" | "Unidades" | "Usuarios">("Inicio");
  const [menuVisible, setMenuVisible] = useState(false);
  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <Text>Debes iniciar sesión</Text>
      </View>
    );
  }
  const handleLogout = () => setCurrentUser(null);
  // ================= WEB =================
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View style={styles.sideMenu}>
          <Text style={styles.name}>
            {currentUser.nombre} {currentUser.apellido}
          </Text>
          <Text style={styles.role}>Rol: {currentUser.rol}</Text>
          <TouchableOpacity
            style={[styles.sideTab, tab === "Inicio" && styles.sideTabActive]}
            onPress={() => setTab("Inicio")} >
            <Text style={styles.tabText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideTab, tab === "Perfil" && styles.sideTabActive]}
            onPress={() => setTab("Perfil")} >
            <Text style={styles.tabText}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideTab, tab === "Viajes" && styles.sideTabActive]}
            onPress={() => setTab("Viajes")}>
            <Text style={styles.tabText}>Viajes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideTab, tab === "Viáticos" && styles.sideTabActive]}
            onPress={() => setTab("Viáticos")} >
            <Text style={styles.tabText}>Viáticos</Text>
          </TouchableOpacity>
          {currentUser.rol?.toLowerCase() === "admin" && (
            <>
              <TouchableOpacity
                style={[styles.sideTab, tab === "Unidades" && styles.sideTabActive]}
                onPress={() => setTab("Unidades")}>
                <Text style={styles.tabText}>Unidades</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sideTab, tab === "Usuarios" && styles.sideTabActive]}
                onPress={() => setTab("Usuarios")}>
                <Text style={styles.tabText}>Usuarios</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentContainer}>
          {tab === "Inicio" && <HomePage currentUser={currentUser} />}
          {tab === "Perfil" && <PerfilePage currentUser={currentUser} />}
          {tab === "Viajes" && <TripsPage />}
          {tab === "Viáticos" && <ViaticsPage />}
          {tab === "Unidades" &&
            currentUser.rol?.toLowerCase() === "admin" && <UnitsPage />}
          {tab === "Usuarios" &&
            currentUser.rol?.toLowerCase() === "admin" && <AdminPage />}
        </ScrollView>
      </View>
    );
  }
  // ================= MOVIL =================
  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="menu"color="white"onPress={() => setMenuVisible(true)}/>
        <Appbar.Content title={tab} />
        <Menu visible={menuVisible}onDismiss={() => setMenuVisible(false)}anchor={{ x: 10, y: 50 }} >
          <Menu.Item onPress={() => { setTab("Inicio"); setMenuVisible(false); }} title="Inicio" />
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
      <ScrollView style={styles.contentContainer}>
        {tab === "Inicio" && <HomePage currentUser={currentUser} />}
        {tab === "Perfil" && <PerfilePage CurrentUser={currentUser} />}
        {tab === "Viajes" && <TripsPage />}
        {tab === "Viáticos" && <ViaticsPage />}
        {tab === "Unidades" &&
          currentUser.rol?.toLowerCase() === "admin" && <UnitsPage />}
        {tab === "Usuarios" &&
          currentUser.rol?.toLowerCase() === "admin" && <AdminPage />}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered:{flex: 1,justifyContent: "center",alignItems: "center",},
  sideMenu:{width: 200,backgroundColor: "#f0f0f0", padding: 10,},
  sideTab:{padding: 10,marginVertical: 5,borderRadius: 5,...(Platform.OS === "web" ? { cursor: "pointer" } : {}),},
  sideTabActive: {backgroundColor: "#007bff",},
  tabText:{color: "#000",},
  logoutButton:{marginTop: 20,padding: 10,backgroundColor: "#ff4d4d",borderRadius: 5,},
  logoutText:{color: "#fff",textAlign: "center",},
  contentContainer: {flex: 1,padding: 10,},
  name:{fontSize: 22,fontWeight: "bold",marginBottom: 5,},
  role:{fontSize: 15,marginBottom: 15,color: "#555",},
});