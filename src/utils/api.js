import { GAS_URL } from "../constants/config";

export async function apiGet(action) {
  const res = await fetch(`${GAS_URL}?action=${action}`);
  return res.json();
}

export async function apiPost(body) {
  const params = { ...body };
  if (params.rejected !== undefined) params.rejected = String(params.rejected);
  if (params.stepIdx !== undefined) params.stepIdx = String(params.stepIdx);
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GAS_URL}?${qs}`);
  return res.json();
}
