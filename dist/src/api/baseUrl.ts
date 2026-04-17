import { Platform } from "react-native";

export const BASE_URL= 
 Platform.OS ==="web" ?"http://localhost:300" : "http://192.168.1.81:3000";