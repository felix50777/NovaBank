import axios from "../api/axios";  // Usamos tu instancia base de Axios

export const register = async (userData) => {
  const response = await axios.post("/auth/register", userData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const login = async (userData) => {
  const response = await axios.post("/auth/login", userData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// Obtener datos del dashboard
export async function getDashboard(token) {
  const response = await fetch("http://localhost:5000/api/auth/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    credentials: "include"
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Error al obtener dashboard");
  }

  return await response.json();
}


