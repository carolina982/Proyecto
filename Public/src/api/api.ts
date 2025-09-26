import axios from "axios";

export const BASE_URL = "http://192.168.1.81:3000/api";

export const api =axios.create ({
    baseURL:BASE_URL,
});