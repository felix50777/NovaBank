import axios from "../api/axios";  // Usamos tu instancia base de Axios

export const register = async (userData) => {
  const response = await axios.post("/register", userData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const login = async (userData) => {
  const response = await axios.post("/login", userData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

