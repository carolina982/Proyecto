import axios from "axios";
import { Platform } from "react-native";

export const BASE_URL =
  Platform.OS === "web" ? "http://localhost:3000/api" :"http://192.168.1.81:3000/api";

  export const api =axios.create({baseURL:BASE_URL,});
