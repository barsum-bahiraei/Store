import axios from "axios";
import { getAuthToken } from "./auth-token";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7185/api",
  headers: {
    Accept: "application/json",
  },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
