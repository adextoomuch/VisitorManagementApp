import axios from "axios";
import { endpoints } from "./endpoints";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message || "The request could not be completed."
    );
  }

  return "The request could not be completed.";
};

export { endpoints };
