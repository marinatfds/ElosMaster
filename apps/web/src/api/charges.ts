import type { Charge, CreateChargeInput, UpdateChargeInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listCharges() {
  const { data } = await api.get<Charge[]>("/charges");
  return data;
}

export async function getCharge(id: number) {
  const { data } = await api.get<Charge>(`/charges/${id}`);
  return data;
}

export async function createCharge(input: CreateChargeInput) {
  const { data } = await api.post<Charge>("/charges", input);
  return data;
}

export async function updateCharge(id: number, input: UpdateChargeInput) {
  const { data } = await api.put<Charge>(`/charges/${id}`, input);
  return data;
}

export async function deleteCharge(id: number) {
  await api.delete(`/charges/${id}`);
}
