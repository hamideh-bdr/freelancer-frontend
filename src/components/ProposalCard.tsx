import { Link } from "react-router-dom";
import type { Proposal, User } from "@/types";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface Props {
  proposal: Proposal;
  isOwnerView?: boolean;
  onAccept?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  busy?: boolean;
  projectTitle?: string;
  projectId?: string;
}

function freelancerName(freelancer?: User | string) {
  if (!freelancer) return "کاربر";
  if (typeof freelancer === "string") return freelancer;
  return freelancer.name || freelancer.username;
}

export default function ProposalCard({
  proposal,
  isOwnerView,
  onAccept,
  onEdit,
  onDelete,
  busy,
  projectTitle,
  projectId,
}: Props) {
  return (
    <div className="card flex flex-col gap-3">
      {!isOwnerView && (projectTitle || projectId) && (
        <div className="-mb-1 flex items-center gap-1.5 text-xs text-muted">
          <span>پیشنهاد برای پروژه:</span>
          {projectId ? (
            <Link to={`/projects/${projectId}`} className="font-medium text-brand-700 hover:text-brand-800">
              {projectTitle ?? "مشاهده پروژه"}
            </Link>
          ) : (
            <span className="font-medium text-ink">{projectTitle}</span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{freelancerName(proposal.user)}</p>
          <p className="text-xs text-muted">{formatDate(proposal.createdAt)}</p>
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <p className="text-sm text-ink/90">{proposal.message}</p>

      {proposal.budget !== undefined && (
        <p className="text-sm text-muted">پیشنهاد قیمت: {formatCurrency(proposal.budget)}</p>
      )}

      <div className="mt-1 flex flex-wrap gap-2">
        {isOwnerView && proposal.status !== "ACCEPTED" && onAccept && (
          <button className="btn-primary px-3 py-1.5 text-xs" onClick={onAccept} disabled={busy}>
            قبول پیشنهاد
          </button>
        )}
        {!isOwnerView && onEdit && (
          <button className="btn-outline px-3 py-1.5 text-xs" onClick={onEdit} disabled={busy}>
            ویرایش
          </button>
        )}
        {!isOwnerView && onDelete && (
          <button className="btn-danger px-3 py-1.5 text-xs" onClick={onDelete} disabled={busy}>
            حذف
          </button>
        )}
      </div>
    </div>
  );
}
