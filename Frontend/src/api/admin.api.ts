import { api, endpoints } from "./axios";
import type { AuthUser } from "@/types/auth";

export interface CreateHostPayload {
  name: string;
  email: string;
}

export interface CreateHostResponse {
  success: boolean;
  message: string;
  data?: {
    host: AuthUser;
    credentials: {
      email: string;
      temporaryPassword: string;
    };
    emailSent: boolean;
  };
  error?: string;
}

export async function createHost(payload: CreateHostPayload) {
  const response = await api.post<CreateHostResponse>(
    endpoints.admin.createHost,
    payload,
  );

  return response.data;
}
