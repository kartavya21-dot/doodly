import { api } from "./index.js";

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (credentials) => {
    
    console.log("in funtion:",credentials);
    const response = await api.post("/auth/login", credentials);
  localStorage.setItem("access_token", response.data.access_token);
  localStorage.setItem("refresh_token", response.data.refresh_token);
  return response.data;
};

export const refresh = async (refreshToken) => {
  // FastAPI expects refresh_token as a query parameter string
  const response = await api.post(
    `/auth/refresh?refresh_token=${refreshToken}`,
  );
  return response.data;
};

export const deleteAccount = async (credentials) => {
  // Axios requires the 'data' property to send a body payload in a DELETE request
  const response = await api.delete("/auth/delete", { data: credentials });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/";
};
