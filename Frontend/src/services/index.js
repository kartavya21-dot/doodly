import axios from 'axios'
import { logout } from './auth';

const BASEURL = 'http://localhost:8000'

export const api = axios.create({
    baseURL: BASEURL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && !original.url.endsWith("/refresh")) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const res = await api.post("/refresh", {
          refresh_token: refreshToken,
        });

        localStorage.setItem("accessToken", res.data.access_token);
        original.headers.Authorization =
          `Bearer ${res.data.access_token}`;

        return api(original);
      } catch {
        logout();
        window.location.href = "/";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);