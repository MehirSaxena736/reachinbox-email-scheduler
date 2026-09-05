import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Copy,
  Pause,
  Play,
  Trash2,
  SlidersHorizontal,
  Eye,
} from "lucide-react";

import {
  Button,
  Badge,
  Card,
  Checkbox,
  Dropdown,
  ProgressBar,
  EmptyState,
  Pagination,
  Confirm,
} from "../components/ui";

import type { Campaign, CampaignStatus, Page } from "../types";
import {
  getCampaigns,
  updateCampaign,
  deleteCampaign,
} from "../api/campaigns";

interface CampaignsProps {
  onNavigate: (page: Page, id?: string) => void;
  onToast: (
    msg: string,
    type?: "success" | "error" | "info"
  ) => void;
}

const statusOptions: {
  value: string;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

interface BackendCampaign {
  id: string;
  workspaceId: string;
  emailAccountId: string;
  name: string;
  description?: string | null;
  status: string;
  timezone?: string | null;
  scheduledStartAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapCampaign(campaign: BackendCampaign): Campaign {
  return {
    id: campaign.id,
    name: campaign.name,
    sender: campaign.emailAccountId,
    senderEmail: "Email account",
    status: campaign.status as CampaignStatus,
    contacts: 0,
    sent: 0,
    opened: 0,
    replied: 0,
    bounced: 0,
    scheduled: 0,
    steps: 0,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

export default function Campaigns({
  onNavigate,
  onToast,
}: CampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(
    new Set()
  );
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const PER_PAGE = 8;

  // Load campaigns from backend
  useEffect(() => {
    const loadCampaigns = async () => {
      const workspaceData =
        localStorage.getItem("reachinbox_workspace");

      if (!workspaceData) {
        setLoading(false);
        onToast(
          "No workspace found. Please create a workspace first.",
          "error"
        );
        return;
      }

      try {
        const workspace = JSON.parse(workspaceData);

        if (!workspace.id) {
          throw new Error("Invalid workspace");
        }

        const data = await getCampaigns(workspace.id);

        setCampaigns(
          data.map((campaign) =>
            mapCampaign(campaign as BackendCampaign)
          )
        );
      } catch (error) {
        console.error(
          "Failed to load campaigns:",
          error
        );

        onToast(
          error instanceof Error
            ? error.message
            : "Failed to load campaigns",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [onToast]);

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      c.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      c.senderEmail
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      c.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  const allSelected =
    paginated.length > 0 &&
    paginated.every((c) => selected.has(c.id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);

      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }

      return s;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const s = new Set(prev);

        paginated.forEach((c) =>
          s.delete(c.id)
        );

        return s;
      });
    } else {
      setSelected((prev) => {
        const s = new Set(prev);

        paginated.forEach((c) =>
          s.add(c.id)
        );

        return s;
      });
    }
  };

  // Pause / Resume campaign using backend
  const toggleStatus = async (
    id: string,
    current: CampaignStatus
  ) => {
    const newStatus =
      current === "active"
        ? "paused"
        : "active";

    try {
      const updated = await updateCampaign(
        id,
        {
          status: newStatus,
        }
      );

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status:
                  updated.status as CampaignStatus,
              }
            : c
        )
      );

      onToast(
        newStatus === "active"
          ? "Campaign resumed"
          : "Campaign paused",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to update campaign:",
        error
      );

      onToast(
        error instanceof Error
          ? error.message
          : "Failed to update campaign",
        "error"
      );
    }
  };

  // Delete campaign using backend
  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id);

      setCampaigns((prev) =>
        prev.filter((c) => c.id !== id)
      );

      setSelected((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });

      setDeleteId(null);

      onToast(
        "Campaign deleted",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to delete campaign:",
        error
      );

      onToast(
        error instanceof Error
          ? error.message
          : "Failed to delete campaign",
        "error"
      );
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Campaigns
          </h2>

          <p className="text-sm text-slate-500 mt-0.5">
            Create, manage and monitor your outreach campaigns.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            onNavigate("create-campaign")
          }
        >
          <Plus size={14} />
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(
          [
            "all",
            "active",
            "draft",
            "paused",
            "completed",
          ] as const
        ).map((s) => {
          const count =
            s === "all"
              ? campaigns.length
              : campaigns.filter(
                  (c) => c.status === s
                ).length;

          return (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-lg border text-left transition-all ${
                statusFilter === s
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
              }`}
            >
              <p
                className={`text-lg font-semibold font-display ${
                  statusFilter === s
                    ? "text-indigo-700"
                    : "text-slate-900"
                }`}
              >
                {count}
              </p>

              <p className="text-xs capitalize">
                {s === "all" ? "Total" : s}
              </p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <Card className="px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search
            size={14}
            className="text-slate-400 shrink-0"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search campaigns..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none flex-1 min-w-0"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {statusOptions.map((o) => (
              <option
                key={o.value}
                value={o.value}
              >
                {o.label}
              </option>
            ))}
          </select>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white">
            <SlidersHorizontal size={13} />

            <span className="hidden sm:inline">
              Filters
            </span>
          </button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="text-sm text-slate-600">
              {selected.size} selected
            </span>

            <button
              onClick={() => {
                const firstId =
                  Array.from(selected)[0];

                if (firstId) {
                  setDeleteId(firstId);
                }
              }}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading campaigns...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Filter size={20} />}
            title="No campaigns found"
            description={
              search ||
              statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first campaign to start sending personalized outreach."
            }
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  onNavigate("create-campaign")
                }
              >
                <Plus size={13} />
                Create Campaign
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                    <th className="px-4 py-3 w-10">
                      <Checkbox
                        checked={allSelected}
                        onChange={toggleAll}
                        indeterminate={
                          selected.size > 0 &&
                          !allSelected
                        }
                      />
                    </th>

                    {[
                      "Campaign",
                      "Status",
                      "Contacts",
                      "Sent",
                      "Opened",
                      "Replied",
                      "Bounced",
                      "Scheduled",
                      "Created",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-xs font-medium text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {paginated.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50 transition-colors group ${
                        selected.has(c.id)
                          ? "bg-indigo-50/40"
                          : ""
                      }`}
                    >
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <Checkbox
                          checked={selected.has(
                            c.id
                          )}
                          onChange={() =>
                            toggleSelect(c.id)
                          }
                        />
                      </td>

                      <td
                        className="px-3 py-3.5 cursor-pointer"
                        onClick={() =>
                          onNavigate(
                            "campaign-details",
                            c.id
                          )
                        }
                      >
                        <div className="font-medium text-slate-900 hover:text-indigo-700 transition-colors">
                          {c.name}
                        </div>

                        <div className="text-xs text-slate-400 mt-0.5">
                          {c.sender} · {c.steps} steps
                        </div>
                      </td>

                      <td className="px-3 py-3.5">
                        <Badge
                          variant={c.status}
                          dot
                        >
                          {c.status
                            .charAt(0)
                            .toUpperCase() +
                            c.status.slice(1)}
                        </Badge>
                      </td>

                      <td className="px-3 py-3.5 font-mono text-xs text-slate-700">
                        {c.contacts.toLocaleString()}
                      </td>

                      <td className="px-3 py-3.5 font-mono text-xs text-slate-700">
                        {c.sent.toLocaleString()}
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="font-mono text-xs text-slate-700">
                          {c.opened.toLocaleString()}
                        </div>

                        {c.sent > 0 && (
                          <div className="w-16 mt-1">
                            <ProgressBar
                              value={c.opened}
                              max={c.sent}
                              color="bg-sky-400"
                            />
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="font-mono text-xs text-emerald-700 font-semibold">
                          {c.replied.toLocaleString()}
                        </div>

                        {c.sent > 0 && (
                          <div className="w-16 mt-1">
                            <ProgressBar
                              value={c.replied}
                              max={c.sent}
                              color="bg-emerald-400"
                            />
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3.5 font-mono text-xs text-red-600">
                        {c.bounced}
                      </td>

                      <td className="px-3 py-3.5 font-mono text-xs text-violet-600">
                        {c.scheduled}
                      </td>

                      <td className="px-3 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(
                          c.createdAt
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td
                        className="px-3 py-3.5 text-right"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <Dropdown
                          trigger={
                            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                              <MoreHorizontal
                                size={15}
                              />
                            </button>
                          }
                          items={[
                            {
                              label: "View details",
                              icon: (
                                <Eye size={13} />
                              ),
                              onClick: () =>
                                onNavigate(
                                  "campaign-details",
                                  c.id
                                ),
                            },
                            {
                              label: "Edit",
                              icon: (
                                <Edit size={13} />
                              ),
                              onClick: () =>
                                onToast(
                                  "Opening editor...",
                                  "info"
                                ),
                            },
                            {
                              label: "Duplicate",
                              icon: (
                                <Copy size={13} />
                              ),
                              onClick: () =>
                                onToast(
                                  "Campaign duplication will be connected next.",
                                  "info"
                                ),
                            },
                            {
                              label:
                                c.status === "active"
                                  ? "Pause"
                                  : "Resume",
                              icon:
                                c.status === "active" ? (
                                  <Pause size={13} />
                                ) : (
                                  <Play size={13} />
                                ),
                              onClick: () =>
                                toggleStatus(
                                  c.id,
                                  c.status
                                ),
                              divider: true,
                            },
                            {
                              label: "Delete",
                              icon: (
                                <Trash2 size={13} />
                              ),
                              onClick: () =>
                                setDeleteId(c.id),
                              danger: true,
                              divider: true,
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              total={filtered.length}
              page={page}
              perPage={PER_PAGE}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <Confirm
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() =>
          deleteId && handleDelete(deleteId)
        }
        title="Delete campaign"
        description="This will permanently delete the campaign and all associated data. This action cannot be undone."
        confirmLabel="Delete campaign"
        danger
      />
    </div>
  );
}