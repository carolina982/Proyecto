import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { StoreProvider, useStore } from "../Public/src/context/Store";
// Importar tus páginas
import AdminPage from "../Public/src/pages/AdminPage";
import Dashboard from "../Public/src/pages/Dashboard";
import EditUnitsPage from "../Public/src/pages/EditUnitsPage";
import Login from "../Public/src/pages/Login";
import Register from "../Public/src/pages/Register";
import TripsPage from "../Public/src/pages/TripsPage";
import UnitsPage from "../Public/src/pages/UnitsPage";
import ViaticsPage from "../Public/src/pages/ViaticsPage";


const Stack = createNativeStackNavigator();
function AppNavigator() {
  const { currentUser } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!currentUser ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) :  (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="TripsPage" component={TripsPage} />
            <Stack.Screen name="ViaticsPage" component={ViaticsPage} />
            <Stack.Screen name="AdminPage" component={AdminPage} />
            <Stack.Screen name="UnitsPage" component={UnitsPage} />
            <Stack.Screen name="EditUnitsPage" component={EditUnitsPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppNavigator />
    </StoreProvider>
  );
}