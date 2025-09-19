import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { Trip, Unit, User, Viatic } from "../types";

interface StoreContextProps {
  currentUser: User | null;
  users: User[];
  trips: Trip[];
  units: Unit[];
  viatics: Viatic[];
  setCurrentUser: (user: User | null) => void;

  addUser: (user: User) => void;
  updateUser: (user: User) => void;      // 🔹 actualizar usuario
  removeUser: (userId: string) => void;  // 🔹 eliminar usuario

  addTrip: (trip: Trip) => void;
  removeTrip: (tripId: string) => void;

  updateViatic: (viatic: Viatic) => void;
  removeViatic: (viaticId: string) => void;

  addUnit: (unit: Unit) => void;
  removeUnit: (unitId: string) => void;

  login: (user: User) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextProps>({} as StoreContextProps);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [viatics, setViatic] = useState<Viatic[]>([]);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const dataStr =
          Platform.OS === "web"
            ? localStorage.getItem("storeData")
            : await AsyncStorage.getItem("storeData");

        if (dataStr) {
          const parsed = JSON.parse(dataStr);
          setUsers(parsed.users || []);
          setTrips(parsed.trips || []);
          setUnits(parsed.units || []);
          setViatic(parsed.viatics || []);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
  }, []);

  // Guardar datos
  useEffect(() => {
    const saveData = async () => {
      try {
        const data = JSON.stringify({ users, trips, units, viatics });
        if (Platform.OS === "web") localStorage.setItem("storeData", data);
        else await AsyncStorage.setItem("storeData", data);
      } catch (error) {
        console.error("Error guardando datos:", error);
      }
    };
    saveData();
  }, [users, trips, units, viatics]);

  // ===================== Usuarios =====================
  const addUser = (user: User) => setUsers((prev) => [...prev, user]);

  const updateUser = (updatedUser: User) =>
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

  const removeUser = (userId: string) =>
    setUsers((prev) => prev.filter((u) => u.id !== userId));

  // ===================== Viajes =====================
  const addTrip = (trip: Trip) =>
    setTrips((prev) => {
      const exist = prev.find((t) => t.id === trip.id);
      return exist ? prev.map((t) => (t.id === trip.id ? trip : t)) : [...prev, trip];
    });

  const removeTrip = (tripId: string) =>
    setTrips((prev) => prev.filter((t) => t.id !== tripId));

  // ===================== Viáticos =====================
  const updateViatic = (viatic: Viatic) =>
    setViatic((prev) => prev.map((v) => (v.id === viatic.id ? viatic : v)));

  const removeViatic = (viaticId: string) =>
    setViatic((prev) => prev.filter((v) => v.id !== viaticId));

  // ===================== Unidades =====================
  const addUnit = (unit: Unit) => setUnits((prev) => [...prev, unit]);

  const removeUnit = (unitId: string) =>
    setUnits((prev) => prev.filter((u) => u.id !== unitId));

  // ===================== Login/Logout =====================
  const login = (user: User) => setCurrentUser(user);

  const logout = () => setCurrentUser(null);

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        trips,
        units,
        viatics,
        setCurrentUser,
        addUser,
        updateUser,
        removeUser,
        addTrip,
        removeTrip,
        updateViatic,
        removeViatic,
        addUnit,
        removeUnit,
        login,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);