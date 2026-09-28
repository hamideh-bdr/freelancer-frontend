import { useEffect, useState } from "react";
import type { Proposal } from "@/types";
import * as proposalsApi from "@/services/api/proposals";
import * as projectsApi from "@/services/api/projects";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import { extractProjectId, extractProjectTitle } from "@/utils/proposalHelpers";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import ProposalCard from "@/components/ProposalCard";

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [editBudget, setEditBudget] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proposalsApi.getMyProposals();

      const enriched = await Promise.all(
        data.map(async (p) => {
          if (extractProjectTitle(p)) return p;
          const projectId = extractProjectId(p);
          if (!projectId) return p;
          try {
            const project = await projectsApi.getProjectById(projectId);
            return { ...p, project };
          } catch {
            return p;
          }
        })
      );

      setProposals(enriched);
    } catch (err) {
      setError(extractErrorMessage(err, "دریافت پیشنهادهای شما با خطا مواجه شد."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (proposal: Proposal) => {
    setEditing(proposal);
    setEditMessage(proposal.message);
    setEditBudget(proposal.budget !== undefined ? String(proposal.budget) : "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (editMessage.trim().length < 10) {
      setError("پیام باید حداقل ۱۰ کاراکتر باشد.");
      return;
    }
    setBusyId(editing._id);
    try {
      await proposalsApi.updateProposal(editing._id, {
        message: editMessage.trim(),
        budget: editBudget ? Number(editBudget) : undefined,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, "ویرایش پیشنهاد با خطا مواجه شد."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!confirm("آیا از حذف این پیشنهاد مطمئن هستید؟")) return;
    setBusyId(proposalId);
    try {
      await proposalsApi.deleteProposal(proposalId);
      setProposals((prev) => prev.filter((p) => p._id !== proposalId));
    } catch (err) {
      setError(extractErrorMessage(err, "حذف پیشنهاد با خطا مواجه شد."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">پیشنهادهای من</h1>
        <p className="mt-1 text-sm text-muted">پیگیری پیشنهادهایی که برای پروژه‌ها ارسال کرده‌اید</p>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} onRetry={load} />}

      {!loading && !error && proposals.length === 0 && (
        <EmptyState title="هنوز پیشنهادی ارسال نکرده‌اید" description="در صفحه‌ی پروژه‌ها، برای پروژه‌ی مناسب پیشنهاد ارسال کنید." />
      )}

      {!loading && !error && proposals.length > 0 && (
        <div className="flex flex-col gap-3">
          {proposals.map((p) =>
            editing?._id === p._id ? (
              <div key={p._id} className="card flex flex-col gap-3">
                <div>
                  <label className="label">پیام</label>
                  <textarea
                    className="input min-h-[90px] resize-y"
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                  />
                </div>
                <div className="sm:w-56">
                  <label className="label">بودجه پیشنهادی</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={saveEdit} disabled={busyId === p._id}>
                    ذخیره
                  </button>
                  <button className="btn-outline" onClick={() => setEditing(null)}>
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <ProposalCard
                key={p._id}
                proposal={p}
                projectId={extractProjectId(p)}
                projectTitle={extractProjectTitle(p)}
                onEdit={() => startEdit(p)}
                onDelete={() => handleDelete(p._id)}
                busy={busyId === p._id}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
