import type { Charge, CreateChargeInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listCharges() {
  const { data } = await api.get<Charge[]>("/charges");
  return data;
}

export async function createCharge(input: CreateChargeInput) {
  const { data } = await api.post<Charge>("/charges", input);
  return data;
}
