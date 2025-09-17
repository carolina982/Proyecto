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
  addTrip: (trip: Trip) => void;
  updateViatic: (viatic: Viatic) => void;
  login : (user: User )=> void ;
  logout : () =>void;
}

const StoreContext = createContext<StoreContextProps>({} as StoreContextProps);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [viatics, setViatic] = useState<Viatic[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (Platform.OS === "web") {
        const data = localStorage.getItem("storeData");
        if (data) {
          const parsed = JSON.parse(data);
          setUsers(parsed.users || []);
          setTrips(parsed.trips || []);
          setUnits(parsed.units || []);
          setViatic(parsed.viatics || []);
        }
      } else {
        const data = await AsyncStorage.getItem("storeData");
        if (data) {
          const parsed = JSON.parse(data);
          setUsers(parsed.users || []);
          setTrips(parsed.trips || []);
          setUnits(parsed.units || []);
          setViatic(parsed.viatics || []);
        }
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      const data = JSON.stringify({ users, trips, units, viatics });
      if (Platform.OS === "web") {
        localStorage.setItem("storeData", data);
      } else {
        await AsyncStorage.setItem("storeData", data);
      }
    };
    saveData();
  }, [users, trips, units, viatics]);

  const addUser = (user: User) => setUsers([...users, user]);
  const addTrip = (trip: Trip) => {
    const exist = trips.find(t => t.id === trip.id);
    if (exist) setTrips(trips.map(t => t.id === trip.id ? trip : t));
    else setTrips([...trips, trip]);
  };
  const updateViatic = (viatic: Viatic) => {
    setViatic(viatics.map(v => v.id === viatic.id ? viatic : v));
  };
  const login =(user :User) => {
    setCurrentUser (user) ;
  };
  const logout = () => {
    setCurrentUser(null);
  };
  return (
    <StoreContext.Provider 
    value={{
      currentUser, users, trips, units, viatics,
      setCurrentUser, addUser, addTrip, updateViatic ,login,logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);