import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Project, Proposal } from "@/types";
import * as projectsApi from "@/services/api/projects";
import * as proposalsApi from "@/services/api/proposals";
import * as bookmarksApi from "@/services/api/bookmarks";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import ProposalCard from "@/components/ProposalCard";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { extractProjectId } from "@/utils/proposalHelpers";

function ownerId(owner?: Project["owner"]): string | undefined {
  if (!owner) return undefined;
  return typeof owner === "string" ? owner : owner._id;
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myProposal, setMyProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalBudget, setProposalBudget] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

  const isOwner = project ? ownerId(project.owner) === user?._id : false;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const projectData = await projectsApi.getProjectById(id);
      setProject(projectData);

      if (ownerId(projectData.owner) === user?._id) {
        const list = await proposalsApi.getProjectProposals(id);
        setProposals(list);
      } else {
        try {
          const mine = await proposalsApi.getMyProposals();
          const existing = mine.find((p) => {
            const projectRefId = extractProjectId(p);
            return projectRefId === id;
          });
          setMyProposal(existing ?? null);
        } catch {
          setMyProposal(null);
        }
      }
    } catch (err) {
      setError(extractErrorMessage(err, "دریافت اطلاعات پروژه با خطا مواجه شد."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("آیا از حذف این پروژه مطمئن هستید؟")) return;
    setBusy(true);
    try {
      await projectsApi.deleteProject(id);
      navigate("/my-projects");
    } catch (err) {
      setActionError(extractErrorMessage(err, "حذف پروژه با خطا مواجه شد."));
    } finally {
      setBusy(false);
    }
  };

  const handleBookmark = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await bookmarksApi.addBookmark(id);
    } catch (err) {
      setActionError(extractErrorMessage(err, "نشان‌کردن پروژه با خطا مواجه شد."));
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async (proposalId: string) => {
    setBusy(true);
    try {
      await proposalsApi.acceptProposal(proposalId);
      if (id) {
        const list = await proposalsApi.getProjectProposals(id);
        setProposals(list);
      }
    } catch (err) {
      setActionError(extractErrorMessage(err, "قبول پیشنهاد با خطا مواجه شد."));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitProposal = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (proposalMessage.trim().length < 10) {
      setActionError("پیام باید حداقل ۱۰ کاراکتر باشد.");
      return;
    }
    setSubmittingProposal(true);
    setActionError(null);
    try {
      await proposalsApi.createProposal(id, {
        message: proposalMessage.trim(),
        budget: proposalBudget ? Number(proposalBudget) : undefined,
      });
      setProposalMessage("");
      setProposalBudget("");
      navigate("/proposals");
    } catch (err) {
      setActionError(extractErrorMessage(err, "ارسال پیشنهاد با خطا مواجه شد."));
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;
  if (!project) return <EmptyState title="پروژه یافت نشد" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-ink">{project.title}</h1>
            <p className="mt-1 text-xs text-muted">
              {project.category} · {formatDate(project.createdAt)}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <p className="whitespace-pre-line text-sm leading-7 text-ink/90">{project.description}</p>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {project.budget !== undefined && <span>بودجه: {formatCurrency(project.budget)}</span>}
          {project.deliveryDays !== undefined && <span>مدت تحویل: {project.deliveryDays} روز</span>}
        </div>

        {actionError && <ErrorAlert message={actionError} />}

        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          {isOwner ? (
            <>
              <Link to={`/projects/${project._id}/edit`} className="btn-outline">
                ویرایش پروژه
              </Link>
              <button className="btn-danger" onClick={handleDelete} disabled={busy}>
                حذف پروژه
              </button>
            </>
          ) : (
            <button className="btn-outline" onClick={handleBookmark} disabled={busy}>
              نشان‌کردن پروژه
            </button>
          )}
        </div>
      </div>

      {isOwner ? (
        <div>
          <h2 className="mb-3 text-base font-semibold text-ink">پیشنهادهای دریافت‌شده</h2>
          {proposals.length === 0 ? (
            <EmptyState title="هنوز پیشنهادی ثبت نشده" description="وقتی فریلنسرها پیشنهاد بدهند، اینجا نمایش داده می‌شود." />
          ) : (
            <div className="flex flex-col gap-3">
              {proposals.map((p) => (
                <ProposalCard key={p._id} proposal={p} isOwnerView onAccept={() => handleAccept(p._id)} busy={busy} />
              ))}
            </div>
          )}
        </div>
      ) : myProposal ? (
        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            شما قبلاً برای این پروژه پیشنهاد ارسال کرده‌اید
          </div>
          <p className="text-sm text-ink/80">{myProposal.message}</p>
          {myProposal.budget !== undefined && (
            <p className="text-sm text-muted">بودجه‌ی پیشنهادی شما: {formatCurrency(myProposal.budget)}</p>
          )}
          <Link to="/proposals" className="btn-outline self-start text-xs">
            مدیریت پیشنهادهایم
          </Link>
        </div>
      ) : project.status !== "OPEN" ? (
        <div className="card flex items-start gap-3 border-accent-200 bg-accent-50/40">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-ink/80">
            این پروژه دیگر پیشنهاد جدید نمی‌پذیرد، چون وضعیتش{" "}
            <span className="font-medium">
              {project.status === "IN_PROGRESS" ? "«در حال انجام»" : "«تکمیل‌شده»"}
            </span>{" "}
            است (یعنی قبلاً یک پیشنهاد برای آن پذیرفته شده).
          </p>
        </div>
      ) : (
        <div className="card">
          <h2 className="mb-3 text-base font-semibold text-ink">ارسال پیشنهاد برای این پروژه</h2>
          <form onSubmit={handleSubmitProposal} className="flex flex-col gap-3">
            <div>
              <label className="label" htmlFor="message">
                پیام شما
              </label>
              <textarea
                id="message"
                className="input min-h-[100px] resize-y"
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="توضیح دهید چرا برای این پروژه مناسب هستید… (حداقل ۱۰ کاراکتر)"
                disabled={submittingProposal}
                required
              />
            </div>
            <div className="sm:w-56">
              <label className="label" htmlFor="proposalBudget">
                بودجه‌ی پیشنهادی (تومان)
              </label>
              <input
                id="proposalBudget"
                type="number"
                min={0}
                className="input"
                value={proposalBudget}
                onChange={(e) => setProposalBudget(e.target.value)}
                disabled={submittingProposal}
              />
            </div>
            <button type="submit" className="btn-primary self-start" disabled={submittingProposal}>
              {submittingProposal ? "در حال ارسال…" : "ارسال پیشنهاد"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
