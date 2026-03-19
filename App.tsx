import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform, TouchableWithoutFeedback } from 'react-native';
import { Provider as PaperProvider } from "react-native-paper";
import useAutoLogout from "./hooks/useAutoLogout";
import { StoreProvider, useStore } from "./Public/src/context/Store";


import { View } from "react-native";
import AdminPage from "./Public/src/pages/AdminPage";
import Dashboard from "./Public/src/pages/Dashboard";
import EditUnitsPage from "./Public/src/pages/EditUnitsPage";
import ForgotPassword from "./Public/src/pages/ForgotPassword";
import Login from "./Public/src/pages/Login";
import Register from "./Public/src/pages/Register";
import ResetPassword from "./Public/src/pages/ResetPassword";
import TripsPage from "./Public/src/pages/TripsPage";
import UnitsPage from "./Public/src/pages/UnitsPage";
import ViaticsPage from "./Public/src/pages/ViaticsPage";





// --- INICIO DEL PARCHE DE PORTABILIDAD ---

if (Platform.OS !== 'web') {
  if (typeof global.HTMLAnchorElement === 'undefined') {
    // @ts-ignore
    global.HTMLAnchorElement = class {};
  }
}


const Stack = createNativeStackNavigator();


  function AppNavigator() {
  const { currentUser, logout } = useStore();

  const { resetTimer } = useAutoLogout(logout);

  return (
    <TouchableWithoutFeedback onPress={resetTimer}>
      <View style={{ flex: 1 }}>
        <NavigationContainer onStateChange={resetTimer}>
          <Stack.Navigator screenOptions={{ headerShown: true }}>
            {!currentUser ? (
              <>
                <Stack.Screen name="Login" component={Login} options={{headerShown:false}}/>
                <Stack.Screen name="Register" component={Register} options={{headerShown:false}}/>
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{headerShown:false}}/>
                <Stack.Screen name="ResetPassword" component={ResetPassword} options={{headerShown:false}}/>
              </>
            ) : (
              <>
                <Stack.Screen name="Dashboard" component={Dashboard} options={{headerShown:false}} />
                <Stack.Screen name="TripsPage" component={TripsPage} />
                <Stack.Screen name="ViaticsPage" component={ViaticsPage} />
                <Stack.Screen name="AdminPage" component={AdminPage} />
                <Stack.Screen name="UnitsPage" component={UnitsPage} />
                <Stack.Screen name="EditUnitsPage" component={EditUnitsPage} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </StoreProvider>
  );
}