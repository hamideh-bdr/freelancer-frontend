import axios from "axios";
import { api, unwrapEnvelope } from "./axiosInstance";
import type { Proposal, ProposalPayload } from "@/types";

function isNotFound(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

/** طبق سورس واقعی بک‌اند، وقتی پیشنهادی نباشد، به‌جای آرایه‌ی خالی، 404 برمی‌گردد. */

export async function getMyProposals(): Promise<Proposal[]> {
  try {
    const { data } = await api.get("/proposals");
    return unwrapEnvelope<Proposal[]>(data);
  } catch (err) {
    if (isNotFound(err)) return [];
    throw err;
  }
}

export async function getProjectProposals(projectId: string): Promise<Proposal[]> {
  try {
    const { data } = await api.get(`/proposals/${projectId}`);
    return unwrapEnvelope<Proposal[]>(data);
  } catch (err) {
    if (isNotFound(err)) return [];
    throw err;
  }
}

export async function createProposal(projectId: string, payload: ProposalPayload): Promise<Proposal> {
  const { data } = await api.post(`/proposals/${projectId}`, payload);
  return unwrapEnvelope<Proposal>(data);
}

export async function updateProposal(proposalId: string, payload: Partial<ProposalPayload>): Promise<Proposal> {
  const { data } = await api.patch(`/proposals/${proposalId}`, payload);
  return unwrapEnvelope<Proposal>(data);
}

export async function deleteProposal(proposalId: string): Promise<void> {
  await api.delete(`/proposals/${proposalId}`);
}

export async function acceptProposal(proposalId: string): Promise<Proposal> {
  const { data } = await api.patch(`/proposals/${proposalId}/accept`, { status: "ACCEPTED" });
  return unwrapEnvelope<Proposal>(data);
}
