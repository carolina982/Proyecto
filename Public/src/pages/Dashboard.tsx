import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import { useStore } from "../context/Store";

import AdminPage from "./AdminPage";
import HomePage from "./HomePage";
import PerfilePage from "./PerfilePage";
import TripsPage from "./TripsPage";
import UnitsPage from "./UnitsPage";
import ViaticsPage from "./ViaticsPage";

type TabType = | "Inicio"| "Perfil"| "Viajes"| "Viáticos"| "Unidades"| "Usuarios";

export default function Dashboard() {
  const { currentUser, setCurrentUser } = useStore();
  const [tab, setTab] = useState<TabType>("Inicio");
  const [menuVisible, setMenuVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // web + tablets

  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <Text>Debes iniciar sesión</Text>
      </View>
    );
  }

  const handleLogout = () => setCurrentUser(null);

  const renderContent = () => {
    switch (tab) {
      case "Inicio":
        return <HomePage currentUser={currentUser} />;
      case "Perfil":
        return <PerfilePage currentUser={currentUser} />;
      case "Viajes":
        return <TripsPage />;
      case "Viáticos":
        return <ViaticsPage />;
      case "Unidades":
        return currentUser.rol?.toLowerCase() === "admin" ? <UnitsPage /> : null;
      case "Usuarios":
        return currentUser.rol?.toLowerCase() === "admin" ? <AdminPage /> : null;
      default:
        return null;
    }
  };

  const menuItems: TabType[] = [ "Inicio","Perfil","Viajes","Viáticos",
    ...(currentUser.rol?.toLowerCase() === "admin"
      ? (["Unidades", "Usuarios"] as TabType[])
      : []),
  ];

  return (
    <View style={styles.container}>
      {isLargeScreen ? (
        /* ================= WEB / TABLET ================= */
        <>
          <View style={styles.sideMenu}>
            <Text style={styles.name}> {currentUser.nombre} {currentUser.apellido}
            </Text>
            <Text style={styles.role}>Rol: {currentUser.rol}</Text>
            {menuItems.map((item) => (
              <TouchableOpacity key={item} style={[ styles.sideTab, tab === item && styles.sideTabActive,]} onPress={() => setTab(item)}>
                <Text style={[ styles.tabText, tab === item && { color: "#fff" },]}> {item}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.logoutButton}onPress={handleLogout} >
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}> {renderContent()}</ScrollView>
          </View>
        </>
      ) : (
        /* ================= MOVIL ================= */
        <>
          <Appbar.Header>
            <Appbar.Action icon="menu"onPress={() => setMenuVisible(true)}/>
            <Appbar.Content title={tab} />
          </Appbar.Header>
          {menuVisible && (
            <View style={styles.drawerOverlay}>
              <View style={styles.drawer}>
                <Text style={styles.drawerName}>
                  {currentUser.nombre} {currentUser.apellido}
                </Text>
                <Text style={styles.drawerRole}>  Rol: {currentUser.rol}</Text>
                {menuItems.map((item) => (
                  <TouchableOpacity key={item} style={[styles.drawerItem,tab === item && styles.drawerItemActive,]}
                    onPress={() => { setTab(item); setMenuVisible(false); }}>
                    <Text style={[styles.drawerText, tab === item && { color: "#fff" }, ]}>{item}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.logoutButton}onPress={() => {setMenuVisible(false);handleLogout(); }}>
                  <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.overlayBackground} onPress={() => setMenuVisible(false)}/>
            </View>
          )}

          <View style={styles.mobileContent}>
            {renderContent()}
          </View>
        </>
      )}
    </View>
  );
}

/* ================= ESTILOS ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {flex: 1,justifyContent: "center",alignItems: "center",},
  /* ===== WEB ===== */
  sideMenu: {width: 260,backgroundColor: "#f5f5f5",padding: 20,},
  sideTab: {padding: 12,marginVertical: 6,borderRadius: 6,...(Platform.OS === "web" ? { cursor: "pointer" } : {}),},
  sideTabActive: { backgroundColor: "#007bff",},
  tabText: {fontSize: 16,color: "#333",},
  content: {flex: 1, padding: 20},
  logoutButton: { marginTop: 30, padding: 12, backgroundColor: "#ff4d4d", borderRadius: 6},
  logoutText: {color: "#fff", textAlign: "center", fontWeight: "bold",},
  name: { fontSize: 20, fontWeight: "bold",},
  role: { fontSize: 14, marginBottom: 20, color: "#666", },
  /* ===== MOVIL ===== */
  mobileContent: { flex: 1, padding: 15,},
  drawerOverlay: {position: "absolute", top: 0,left: 0,right: 0,  bottom: 0,flexDirection: "row", zIndex: 1000,},
  drawer: {width: 260,backgroundColor: "#fff",padding: 20,elevation: 8,},
  overlayBackground: {flex: 1,backgroundColor: "rgba(0,0,0,0.4)",},
  drawerItem: { paddingVertical: 12,paddingHorizontal: 10,borderRadius: 6,marginVertical: 5},
  drawerItemActive: {backgroundColor: "#007bff", },
  drawerText: {fontSize: 16,color: "#333"},
  drawerName: {fontSize: 18,fontWeight: "bold",marginBottom: 5 },
  drawerRole: {fontSize: 14,marginBottom: 20,color: "#666"},
});