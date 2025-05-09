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

