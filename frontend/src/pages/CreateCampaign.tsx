import React, { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Users,
  Plus,
  Trash2,
  GripVertical,
  Variable,
  Clock,
  Calendar,
  AlertTriangle,
  Rocket,
} from "lucide-react";

import {
  Button,
  Input,
  Select,
  Card,
  Checkbox,
} from "../components/ui";

import { contacts } from "../data";
import type { Page } from "../types";

import { createCampaign } from "../api/campaigns";
import {
  getEmailAccounts,
  type EmailAccount,
} from "../api/emailAccounts";

interface CreateCampaignProps {
  onNavigate: (page: Page) => void;
  onToast: (
    msg: string,
    type?: "success" | "error" | "info"
  ) => void;
}

const STEPS = [
  "Campaign Details",
  "Audience",
  "Sequence",
  "Schedule",
  "Review",
];

interface SequenceStep {
  id: string;
  delay: string;
  subject: string;
  body: string;
}

const defaultSteps: SequenceStep[] = [
  {
    id: "s1",
    delay: "Immediately",
    subject: "Quick question about {{company}}",
    body:
      "Hi {{firstName}},\n\n" +
      "I noticed that {{company}} is actively hiring, which usually means there's a lot going on. " +
      "I'd love to learn more about your growth plans and share how we're helping similar companies move faster.\n\n" +
      "Would you be open to a 15-minute call this week?\n\n" +
      "Best,\nAlex",
  },
  {
    id: "s2",
    delay: "2 days",
    subject: "Following up, {{firstName}}",
    body:
      "Hi {{firstName}},\n\n" +
      "Just wanted to bump this up in your inbox — I know things get busy.\n\n" +
      "Happy to share a quick 2-minute loom of what we do if that would help.\n\n" +
      "Alex",
  },
  {
    id: "s3",
    delay: "4 days",
    subject: "Closing the loop",
    body:
      "Hi {{firstName}},\n\n" +
      "I'll keep this short — if now's not the right time, totally understood. " +
      "Just let me know and I'll follow up in Q1.\n\n" +
      "Alex",
  },
];

const DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export default function CreateCampaign({
  onNavigate,
  onToast,
}: CreateCampaignProps) {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sender: "",
    timezone: "America/New_York",
  });

  const [emailAccounts, setEmailAccounts] = useState<
    EmailAccount[]
  >([]);

  const [loadingAccounts, setLoadingAccounts] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [selectedContacts, setSelectedContacts] =
    useState<Set<string>>(new Set());

  const [steps, setSteps] =
    useState<SequenceStep[]>(defaultSteps);

  const [editingStep, setEditingStep] =
    useState<string | null>(null);

  const [schedule, setSchedule] = useState({
    startDate: "2026-09-10",
    startTime: "09:00",
    timezone: "America/New_York",
    days: new Set([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ]),
    dailyLimit: "50",
    delay: "3",
  });

  /*
   * Load the currently selected workspace's email accounts.
   */
  useEffect(() => {
    const loadEmailAccounts = async () => {
      const storedWorkspace =
        localStorage.getItem(
          "reachinbox_workspace"
        );

      if (!storedWorkspace) {
        setLoadingAccounts(false);

        onToast(
          "No workspace found. Please create a workspace first.",
          "error"
        );

        return;
      }

      try {
        const workspace =
          JSON.parse(storedWorkspace);

        const accounts =
          await getEmailAccounts(workspace.id);

        setEmailAccounts(accounts);

        if (accounts.length > 0) {
          const activeAccount =
            accounts.find(
              (account) =>
                account.status === "ACTIVE"
            ) ?? accounts[0];

          setForm((prev) => ({
            ...prev,
            sender: activeAccount.id,
          }));
        }
      } catch (error) {
        console.error(
          "Failed to load email accounts:",
          error
        );

        onToast(
          error instanceof Error
            ? error.message
            : "Failed to load email accounts",
          "error"
        );
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadEmailAccounts();
  }, [onToast]);

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) => {
      const selected = new Set(prev);

      if (selected.has(id)) {
        selected.delete(id);
      } else {
        selected.add(id);
      }

      return selected;
    });
  };

  const toggleDay = (day: string) => {
    setSchedule((prev) => {
      const days = new Set(prev.days);

      if (days.has(day)) {
        days.delete(day);
      } else {
        days.add(day);
      }

      return {
        ...prev,
        days,
      };
    });
  };

  const addStep = () => {
    const newStep: SequenceStep = {
      id: `s${Date.now()}`,
      delay: "3 days",
      subject: "Following up again",
      body:
        "Hi {{firstName}},\n\n" +
        "Just checking in...\n\n" +
        "Alex",
    };

    setSteps((prev) => [
      ...prev,
      newStep,
    ]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  };

  const updateStep = (
    id: string,
    field: keyof SequenceStep,
    value: string
  ) => {
    setSteps((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const canProceed = () => {
    if (step === 0) {
      return form.name.trim().length > 0;
    }

    if (step === 1) {
      return selectedContacts.size > 0;
    }

    if (step === 2) {
      return steps.length > 0;
    }

    if (step === 3) {
      return (
        Boolean(schedule.startDate) &&
        Boolean(schedule.startTime) &&
        schedule.days.size > 0
      );
    }

    return true;
  };

  const getWorkspaceId = () => {
    const storedWorkspace =
      localStorage.getItem(
        "reachinbox_workspace"
      );

    if (!storedWorkspace) {
      return null;
    }

    try {
      const workspace =
        JSON.parse(storedWorkspace);

      return workspace?.id ?? null;
    } catch {
      return null;
    }
  };

  const getScheduledStart = () => {
    if (
      !schedule.startDate ||
      !schedule.startTime
    ) {
      return undefined;
    }

    const date = new Date(
      `${schedule.startDate}T${schedule.startTime}:00`
    );

    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date.toISOString();
  };

  /*
   * Creates a real Campaign record in PostgreSQL.
   */
  const saveCampaign = async (
    status: "DRAFT" | "ACTIVE"
  ) => {
    const workspaceId =
      getWorkspaceId();

    if (!workspaceId) {
      onToast(
        "No workspace found. Please create a workspace first.",
        "error"
      );

      return false;
    }

    if (!form.name.trim()) {
      onToast(
        "Campaign name is required.",
        "error"
      );

      return false;
    }

    if (!form.sender) {
      onToast(
        "Please select a sending account.",
        "error"
      );

      return false;
    }

    try {
      setSaving(true);

      await createCampaign({
        workspaceId,
        emailAccountId: form.sender,
        name: form.name.trim(),
        description:
          form.description.trim() ||
          undefined,
        timezone:
          schedule.timezone ||
          form.timezone,
        scheduledStartAt:
          getScheduledStart(),
        status,
      });

      return true;
    } catch (error) {
      console.error(
        "Failed to create campaign:",
        error
      );

      onToast(
        error instanceof Error
          ? error.message
          : "Failed to create campaign",
        "error"
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleLaunch = async () => {
    const success =
      await saveCampaign("ACTIVE");

    if (!success) {
      return;
    }

    onToast(
      "Campaign launched successfully!",
      "success"
    );

    onNavigate("campaigns");
  };

  const handleSaveDraft = async () => {
    const success =
      await saveCampaign("DRAFT");

    if (!success) {
      return;
    }

    onToast(
      "Campaign saved as draft",
      "info"
    );

    onNavigate("campaigns");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() =>
              onNavigate("campaigns")
            }
            className="text-xs text-slate-400 hover:text-slate-600 mb-1 flex items-center gap-1"
          >
            ← Campaigns
          </button>

          <h2 className="font-display text-xl font-semibold text-slate-900">
            Create Campaign
          </h2>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                  i < step
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : i === step
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                    : "border-slate-200 text-slate-400 bg-white"
                }`}
              >
                {i < step ? (
                  <Check size={13} />
                ) : (
                  i + 1
                )}
              </div>

              <span
                className={`text-xs font-medium hidden sm:inline ${
                  i === step
                    ? "text-indigo-700"
                    : i < step
                    ? "text-slate-600"
                    : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  i < step
                    ? "bg-indigo-300"
                    : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card className="p-6">
        {/* STEP 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-0.5">
                Campaign Details
              </h3>

              <p className="text-sm text-slate-500">
                Give your campaign a name and configure basic settings.
              </p>
            </div>

            <Input
              label="Campaign Name *"
              placeholder="e.g. SaaS Founders Q4 Outreach"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                placeholder="Brief description of this campaign..."
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[80px] resize-none"
              />
            </div>

            <Select
              label="Sending Account"
              value={form.sender}
              onChange={(e) =>
                setForm({
                  ...form,
                  sender: e.target.value,
                })
              }
              disabled={
                loadingAccounts ||
                emailAccounts.length === 0
              }
              options={
                emailAccounts.length > 0
                  ? emailAccounts.map(
                      (account) => ({
                        value: account.id,
                        label: `${
                          account.email
                        } — ${
                          account.name ||
                          account.email
                        }`,
                      })
                    )
                  : [
                      {
                        value: "",
                        label:
                          loadingAccounts
                            ? "Loading email accounts..."
                            : "No email accounts connected",
                      },
                    ]
              }
            />

            {!loadingAccounts &&
              emailAccounts.length === 0 && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle
                    size={14}
                    className="text-amber-600 shrink-0"
                  />

                  <p className="text-sm text-amber-700">
                    Connect an email account before creating a campaign.
                  </p>
                </div>
              )}

            <Select
              label="Timezone"
              value={form.timezone}
              onChange={(e) => {
                setForm({
                  ...form,
                  timezone:
                    e.target.value,
                });

                setSchedule({
                  ...schedule,
                  timezone:
                    e.target.value,
                });
              }}
              options={[
                {
                  value:
                    "America/New_York",
                  label:
                    "Eastern Time (ET)",
                },
                {
                  value:
                    "America/Chicago",
                  label:
                    "Central Time (CT)",
                },
                {
                  value:
                    "America/Los_Angeles",
                  label:
                    "Pacific Time (PT)",
                },
                {
                  value: "Europe/London",
                  label:
                    "London (GMT)",
                },
                {
                  value: "Europe/Berlin",
                  label:
                    "Berlin (CET)",
                },
              ]}
            />
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Select Contacts
                </h3>

                <p className="text-sm text-slate-500">
                  {selectedContacts.size}{" "}
                  contact
                  {selectedContacts.size !==
                  1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
              >
                <Plus size={13} />
                Import
              </Button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Users
                size={14}
                className="text-slate-400 shrink-0"
              />

              <input
                placeholder="Search contacts..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none flex-1"
              />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-3">
                <Checkbox
                  checked={
                    contacts.length > 0 &&
                    contacts.every((c) =>
                      selectedContacts.has(
                        c.id
                      )
                    )
                  }
                  onChange={(checked) => {
                    if (checked) {
                      setSelectedContacts(
                        new Set(
                          contacts.map(
                            (c) => c.id
                          )
                        )
                      );
                    } else {
                      setSelectedContacts(
                        new Set()
                      );
                    }
                  }}
                />

                <span className="text-xs font-medium text-slate-500">
                  Select all (
                  {contacts.length})
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer"
                    onClick={() =>
                      toggleContact(c.id)
                    }
                  >
                    <Checkbox
                      checked={selectedContacts.has(
                        c.id
                      )}
                      onChange={() =>
                        toggleContact(c.id)
                      }
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {c.firstName}{" "}
                        {c.lastName}
                      </p>

                      <p className="text-xs text-slate-400">
                        {c.email} ·{" "}
                        {c.company}
                      </p>
                    </div>

                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {c.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Email Sequence
              </h3>

              <p className="text-sm text-slate-500">
                Build the sequence of emails that will be sent automatically.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-lg">
              <Variable
                size={14}
                className="text-violet-600 shrink-0"
              />

              <p className="text-xs text-violet-700">
                Use{" "}
                <code className="font-mono bg-violet-100 px-1 rounded">
                  {"{{firstName}}"}
                </code>
                ,{" "}
                <code className="font-mono bg-violet-100 px-1 rounded">
                  {"{{company}}"}
                </code>
                ,{" "}
                <code className="font-mono bg-violet-100 px-1 rounded">
                  {"{{title}}"}
                </code>{" "}
                as personalization variables.
              </p>
            </div>

            <div className="space-y-3">
              {steps.map((s, idx) => (
                <div
                  key={s.id}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <GripVertical
                      size={14}
                      className="text-slate-300 cursor-grab shrink-0"
                    />

                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-semibold shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-1">
                      <span className="text-xs font-semibold text-slate-700">
                        Step {idx + 1}
                      </span>

                      <span className="text-xs text-slate-400 ml-2">
                        · {s.delay}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setEditingStep(
                            editingStep ===
                              s.id
                              ? null
                              : s.id
                          )
                        }
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {editingStep ===
                        s.id
                          ? "Done"
                          : "Edit"}
                      </button>

                      {steps.length > 1 && (
                        <button
                          onClick={() =>
                            removeStep(
                              s.id
                            )
                          }
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2
                            size={13}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {editingStep ===
                  s.id ? (
                    <div className="p-4 space-y-3">
                      {idx > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock
                            size={13}
                            className="text-slate-400"
                          />

                          <select
                            value={s.delay}
                            onChange={(e) =>
                              updateStep(
                                s.id,
                                "delay",
                                e.target.value
                              )
                            }
                            className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          >
                            {[
                              "1 day",
                              "2 days",
                              "3 days",
                              "4 days",
                              "5 days",
                              "7 days",
                              "10 days",
                              "14 days",
                            ].map((d) => (
                              <option
                                key={d}
                                value={d}
                              >
                                Wait {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <Input
                        label="Subject"
                        value={s.subject}
                        onChange={(e) =>
                          updateStep(
                            s.id,
                            "subject",
                            e.target.value
                          )
                        }
                      />

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-700">
                          Body
                        </label>

                        <textarea
                          value={s.body}
                          onChange={(e) =>
                            updateStep(
                              s.id,
                              "body",
                              e.target.value
                            )
                          }
                          className="w-full text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-700 mb-1">
                        Subject:{" "}
                        {s.subject}
                      </p>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {s.body.split(
                          "\n"
                        )[0]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addStep}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              <Plus size={14} />
              Add Step
            </button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Sending Schedule
              </h3>

              <p className="text-sm text-slate-500">
                Configure when and how emails are sent.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={schedule.startDate}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    startDate:
                      e.target.value,
                  })
                }
              />

              <Input
                label="Start Time"
                type="time"
                value={schedule.startTime}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    startTime:
                      e.target.value,
                  })
                }
              />
            </div>

            <Select
              label="Timezone"
              value={schedule.timezone}
              onChange={(e) =>
                setSchedule({
                  ...schedule,
                  timezone:
                    e.target.value,
                })
              }
              options={[
                {
                  value:
                    "America/New_York",
                  label:
                    "Eastern Time (ET)",
                },
                {
                  value:
                    "America/Los_Angeles",
                  label:
                    "Pacific Time (PT)",
                },
                {
                  value: "Europe/London",
                  label:
                    "London (GMT)",
                },
              ]}
            />

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Sending Days
              </label>

              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() =>
                      toggleDay(day)
                    }
                    className={`w-12 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      schedule.days.has(
                        day
                      )
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Daily sending limit"
                type="number"
                value={
                  schedule.dailyLimit
                }
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    dailyLimit:
                      e.target.value,
                  })
                }
              />

              <Input
                label="Min delay between emails (min)"
                type="number"
                value={schedule.delay}
                onChange={(e) =>
                  setSchedule({
                    ...schedule,
                    delay:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Calendar
                  size={13}
                  className="text-indigo-600"
                />
                Estimated sending preview
              </p>

              <div className="space-y-1">
                {[
                  {
                    date: `${schedule.startDate} ${schedule.startTime}`,
                    count: Math.min(
                      50,
                      selectedContacts.size ||
                        10
                    ),
                    label:
                      "Step 1 emails",
                  },
                  {
                    date: "Step 2",
                    count: Math.min(
                      50,
                      selectedContacts.size ||
                        10
                    ),
                    label:
                      "follow-up emails",
                  },
                  {
                    date: "Step 3",
                    count: Math.min(
                      50,
                      selectedContacts.size ||
                        10
                    ),
                    label:
                      "follow-up emails",
                  },
                ].map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs text-slate-600"
                  >
                    <span className="font-mono">
                      {p.date}
                    </span>

                    <span className="text-slate-500">
                      {p.count}{" "}
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Review Campaign
              </h3>

              <p className="text-sm text-slate-500">
                Review all settings before launching.
              </p>
            </div>

            {!form.name && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle
                  size={14}
                  className="text-amber-600 shrink-0"
                />

                <p className="text-sm text-amber-700">
                  Campaign name is missing. Go back and add a name.
                </p>
              </div>
            )}

            {!form.sender && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle
                  size={14}
                  className="text-amber-600 shrink-0"
                />

                <p className="text-sm text-amber-700">
                  No sending account selected.
                </p>
              </div>
            )}

            {selectedContacts.size ===
              0 && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle
                  size={14}
                  className="text-amber-600 shrink-0"
                />

                <p className="text-sm text-amber-700">
                  No contacts selected. Go back and select an audience.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {[
                {
                  label: "Campaign name",
                  value:
                    form.name ||
                    "—",
                },
                {
                  label: "Sender",
                  value:
                    emailAccounts.find(
                      (account) =>
                        account.id ===
                        form.sender
                    )?.email ||
                    "Not selected",
                },
                {
                  label: "Contacts",
                  value: `${selectedContacts.size} contact${
                    selectedContacts.size !==
                    1
                      ? "s"
                      : ""
                  }`,
                },
                {
                  label: "Sequence",
                  value: `${steps.length} step${
                    steps.length !==
                    1
                      ? "s"
                      : ""
                  }`,
                },
                {
                  label: "Start date",
                  value: `${schedule.startDate} at ${schedule.startTime} ${schedule.timezone}`,
                },
                {
                  label: "Sending days",
                  value:
                    Array.from(
                      schedule.days
                    ).join(", "),
                },
                {
                  label: "Daily limit",
                  value: `${schedule.dailyLimit} emails/day`,
                },
              ].map(
                ({
                  label,
                  value,
                }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-sm text-slate-500">
                      {label}
                    </span>

                    <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Sequence summary
              </p>

              {steps.map(
                (s, i) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-3 mb-2 last:mb-0"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-semibold shrink-0 mt-0.5">
                      {i + 1}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-800">
                        {s.subject}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {s.delay}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            step === 0
              ? onNavigate(
                  "campaigns"
                )
              : setStep(
                  step - 1
                )
          }
          disabled={saving}
        >
          {step === 0
            ? "Cancel"
            : "← Back"}
        </Button>

        <div className="flex items-center gap-2">
          {step === 4 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={
                  handleSaveDraft
                }
                disabled={
                  saving ||
                  !form.name ||
                  !form.sender
                }
              >
                {saving
                  ? "Saving..."
                  : "Save Draft"}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={
                  handleLaunch
                }
                disabled={
                  saving ||
                  !form.name ||
                  !form.sender ||
                  selectedContacts.size ===
                    0
                }
              >
                <Rocket size={13} />

                {saving
                  ? "Launching..."
                  : "Launch Campaign"}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setStep(
                  step + 1
                )
              }
              disabled={
                !canProceed() ||
                (step === 0 &&
                  (!form.sender ||
                    emailAccounts.length ===
                      0))
              }
            >
              Continue

              <ChevronRight
                size={14}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}