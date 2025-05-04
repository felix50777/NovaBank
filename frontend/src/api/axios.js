import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // Cambia esto si tu backend usa otro puerto o prefijo
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // si estás usando cookies para la sesión
});

export default instance;
