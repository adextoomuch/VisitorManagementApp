import { api, endpoints } from "@/api/axios";
import type {
  ApiResponse,
  CreateVisitorPayload,
  Visitor,
} from "./visitors.types";

export async function createVisitor(payload: CreateVisitorPayload) {
  const response = await api.post<ApiResponse<Visitor>>(
    endpoints.visitor.createVisitor,
    payload,
  );

  return response.data;
}
