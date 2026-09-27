import { api, unwrapEnvelope } from "./axiosInstance";
import type { Proposal, ProposalPayload } from "@/types";

function unwrapList(raw: unknown): Proposal[] {
  const unwrapped = unwrapEnvelope<unknown>(raw);
  if (Array.isArray(unwrapped)) return unwrapped as Proposal[];
  const obj = (unwrapped ?? {}) as Record<string, unknown>;
  return (obj.proposals ?? obj.items ?? obj.data ?? []) as Proposal[];
}

export async function getMyProposals(): Promise<Proposal[]> {
  const { data } = await api.get("/proposals");
  return unwrapList(data);
}

export async function getProjectProposals(projectId: string): Promise<Proposal[]> {
  const { data } = await api.get(`/proposals/${projectId}`);
  return unwrapList(data);
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
