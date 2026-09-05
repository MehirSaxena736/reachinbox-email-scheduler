import React, { useState } from "react";
import { Search, MoreHorizontal, Edit, X, Eye, AlertCircle, RefreshCw } from "lucide-react";
import { Badge, Card, Dropdown, Tabs, Pagination, EmptyState, Modal } from "../components/ui";
import { scheduledEmails as initialEmails } from "../data";
import type { ScheduledEmail, EmailStatus } from "../types";

interface ScheduledEmailsProps {
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const statusTabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "queued", label: "Queued" },
  { id: "sent", label: "Sent" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
];

function EventTimeline({ email }: { email: ScheduledEmail }) {
  const events: { label: string; ts: string; done: boolean; color: string; note?: string }[] = [
    { label: "Scheduled", ts: email.scheduledAt, done: true, color: "bg-slate-400" },
    {
      label: "Queued", ts: new Date(new Date(email.scheduledAt).getTime() - 60000).toISOString(),
      done: ["queued", "sent", "opened", "replied", "failed"].includes(email.status), color: "bg-blue-500"
    },
    {
      label: "Sent", ts: email.scheduledAt,
      done: ["sent", "opened", "replied"].includes(email.status), color: "bg-emerald-500"
    },
    {
      label: "Opened", ts: new Date(new Date(email.scheduledAt).getTime() + 3600000).toISOString(),
      done: ["opened", "replied"].includes(email.status), color: "bg-sky-500"
    },
    {
      label: email.status === "failed" ? "Failed" : "Replied",
      ts: new Date(new Date(email.scheduledAt).getTime() + 86400000).toISOString(),
      done: email.status === "replied" || email.status === "failed",
      color: email.status === "failed" ? "bg-red-500" : "bg-teal-500",
      note: email.status === "failed" ? "Mailbox not found (550 5.1.1)" : undefined,
    },
  ];

  return (
    <div className="space-y-3">
      {events.map((ev, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center shrink-0 mt-0.5">
            <div className={`w-3 h-3 rounded-full border-2 ${ev.done ? `${ev.color} border-transparent` : "border-slate-300 bg-white"}`} />
            {i < events.length - 1 && <div className={`w-px flex-1 my-1 min-h-[16px] ${ev.done ? "bg-slate-300" : "bg-slate-100"}`} />}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${ev.done ? "text-slate-900" : "text-slate-400"}`}>{ev.label}</p>
              {ev.done && <p className="text-xs text-slate-400 font-mono">{new Date(ev.ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
            </div>
            {ev.note && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle size={11} className="text-red-500" />
                <p className="text-xs text-red-600">{ev.note}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ScheduledEmails({ onToast }: ScheduledEmailsProps) {
  const [emails, setEmails] = useState<ScheduledEmail[]>(initialEmails);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<ScheduledEmail | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = emails.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = `${e.recipient} ${e.recipientEmail} ${e.subject} ${e.campaign}`.toLowerCase().includes(q);
    const matchTab = tab === "all" || e.status === tab;
    return matchSearch && matchTab;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const cancelEmail = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, status: "cancelled" as EmailStatus } : e));
    onToast("Email cancelled", "success");
  };

  const retryEmail = (id: string) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, status: "pending" as EmailStatus } : e));
    onToast("Email queued for retry", "success");
  };

  const tabCounts = statusTabs.reduce((acc, t) => {
    acc[t.id] = t.id === "all" ? emails.length : emails.filter((e) => e.status === t.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-900">Scheduled Emails</h2>
        <p className="text-sm text-slate-500 mt-0.5">View and manage all outgoing emails across your campaigns.</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statusTabs.slice(1).map((t) => (
          <div key={t.id} className={`px-3 py-2 rounded-lg border bg-white cursor-pointer transition-all ${tab === t.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`} onClick={() => { setTab(t.id); setPage(1); }}>
            <p className={`text-lg font-semibold font-display ${tab === t.id ? "text-indigo-700" : "text-slate-900"}`}>{tabCounts[t.id]}</p>
            <p className={`text-xs capitalize ${tab === t.id ? "text-indigo-600" : "text-slate-500"}`}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="space-y-3">
        <Tabs
          tabs={statusTabs.map((t) => ({ ...t, count: tab === t.id ? undefined : tabCounts[t.id] }))}
          active={tab}
          onChange={(id) => { setTab(id); setPage(1); }}
        />
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 max-w-sm">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by recipient, subject, campaign..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none flex-1"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={20} />}
            title="No emails found"
            description="Try adjusting your filters or search query."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                    {["Recipient", "Subject", "Campaign", "Sender", "Scheduled", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((email) => (
                    <tr key={email.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{email.recipient}</p>
                        <p className="text-xs text-slate-400">{email.recipientEmail}</p>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="text-slate-700 truncate">{email.subject}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Step {email.step}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[140px] truncate">{email.campaign}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{email.sender}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-mono whitespace-nowrap">
                        {new Date(email.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={email.status}>{email.status}</Badge>
                        {email.status === "failed" && (
                          <p className="text-[10px] text-red-600 mt-0.5">Delivery failed</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Dropdown
                          trigger={
                            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                              <MoreHorizontal size={15} />
                            </button>
                          }
                          items={[
                            { label: "View details", icon: <Eye size={13} />, onClick: () => setDetail(email) },
                            ...(email.status === "pending" || email.status === "queued" ? [{ label: "Edit schedule", icon: <Edit size={13} />, onClick: () => onToast("Schedule editor opened", "info") }] : []),
                            ...(email.status === "failed" ? [{ label: "Retry", icon: <RefreshCw size={13} />, onClick: () => retryEmail(email.id) }] : []),
                            ...(email.status === "pending" || email.status === "queued" ? [{ label: "Cancel", icon: <X size={13} />, onClick: () => cancelEmail(email.id), danger: true, divider: true }] : []),
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
          </>
        )}
      </Card>

      {/* Detail drawer */}
      <Modal open={detail !== null} onClose={() => setDetail(null)} title="Email Details" size="md">
        {detail && (
          <div className="space-y-5">
            <div className="space-y-2">
              {[
                { label: "Recipient", value: `${detail.recipient} <${detail.recipientEmail}>` },
                { label: "Sender", value: detail.sender },
                { label: "Subject", value: detail.subject },
                { label: "Campaign", value: detail.campaign },
                { label: "Sequence step", value: `Step ${detail.step}` },
                { label: "Scheduled", value: new Date(detail.scheduledAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
                { label: "Status", value: <Badge variant={detail.status}>{detail.status}</Badge> },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-500 shrink-0 w-28">{label}</span>
                  <span className="text-sm text-slate-900 text-right flex-1">{value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-3">Event Timeline</p>
              <EventTimeline email={detail} />
            </div>

            {detail.status === "failed" && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">Delivery failed</p>
                  <p className="text-xs text-red-600 mt-0.5">Mailbox not found (550 5.1.1). The email address may be invalid or no longer active.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
