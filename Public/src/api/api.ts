import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert, Platform } from "react-native";

export const BASE_URL =
  Platform.OS === "web" ? "http://localhost:3000/api" :"http://192.168.1.81:3000/api";

  export const api =axios.create({baseURL:BASE_URL,});


  api.interceptors.request.use(
  async (config) => {
    try {
      let token: string | null = null;
      if (Platform.OS === "web") {
        token = localStorage.getItem("token");
      } else {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        token = await AsyncStorage.getItem("token");
      }
      console.log("Token enviado",token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("⚠ Error al obtener token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use((response)=> response,
 async (error)=>{
  if (error.response && error.response.status === 401){
    console.log("Token expirado o invalido. Cerrar sesion");
    if (Platform.OS === "web"){
      localStorage.removeItem("token");
    }else{
      await AsyncStorage.removeItem("token");
    }
     Alert.alert("Sesión expirada","Tu sesión ha caducado  porfavor inisia sesión nuevamente");
     return Promise.reject(error);
  }
  return Promise.reject(error);
 }
)