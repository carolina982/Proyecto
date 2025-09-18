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

  const screenWidth = Dimensions.get("window").width;
  const isLargeScreen = screenWidth > 600;

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? "row" : "column" }}>
      {/* Menú lateral o hamburguesa */}
      {isLargeScreen ? (
        <View style={styles.sideMenu}>
          {["Perfil", "Viajes", "Viáticos"].map((t) => (
            <TouchableOpacity key={t} style={[styles.sideTab, tab === t && styles.sideTabActive]} onPress={() => setTab(t as any)}>
              <Text style={styles.tabText}>{t}</Text>
            </TouchableOpacity>
          ))}

          {currentUser.rol === "Admin" && (
            <TouchableOpacity style={[styles.sideTab, tab === "Unidades" && styles.sideTabActive]} onPress={() => setTab("Unidades")}>
              <Text style={styles.tabText}>Unidades</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <Text style={styles.currentRole}>Rol actual: {currentUser.rol}</Text>
        </View>
      ) : (
        <Appbar.Header>
          <Appbar.Content title="Dashboard" />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<Appbar.Action icon="menu" color="white" onPress={() => setMenuVisible(true)} />}
          >
            {["Perfil", "Viajes", "Viáticos"].map((t) => (
              <Menu.Item key={t} onPress={() => { setTab(t as any); setMenuVisible(false); }} title={t} />
            ))}
            {currentUser.rol === "Admin" && (
              <Menu.Item onPress={() => { setTab("Unidades"); setMenuVisible(false); }} title="Unidades" />
            )}
            <Menu.Item onPress={handleLogout} title="Cerrar Sesión" />
          </Menu>
        </Appbar.Header>
      )}

      {/* Contenido */}
      <ScrollView style={styles.contentContainer}>
        {tab === "Perfil" && <ProfileTab currentUser={currentUser} />}
        {tab === "Viajes" && (
          <TripList viewOnly={currentUser.rol === "Chofer"} onSelect={(id) => setSelectedTripId(id)} />
        )}
        {tab === "Viáticos" && <ViaticList viewOnly={currentUser.rol === "Chofer"} />}
        {tab === "Unidades" && currentUser.rol === "Admin" && <UnitList />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sideMenu: { width: 160, backgroundColor: "#eee", paddingVertical: 20, paddingHorizontal: 10 },
  sideTab: { paddingVertical: 12, paddingHorizontal: 10, marginBottom: 5, borderRadius: 6 },
  sideTabActive: { backgroundColor: "#74a8dfff" },
  tabText: { fontSize: 16 },
  logoutButton: { marginTop: 20, backgroundColor: "#3842a0ff", paddingVertical: 10, borderRadius: 6 },
  logoutText: { color: "white", textAlign: "center", fontWeight: "bold" },
  currentRole: { marginTop: 10, fontWeight: "bold", textAlign: "center" },
  contentContainer: { flex: 1, padding: 16 },
});