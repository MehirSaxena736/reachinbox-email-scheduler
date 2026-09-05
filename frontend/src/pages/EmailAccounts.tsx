import { useEffect, useState } from "react";

import {
  Plus,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Settings,
  AlertCircle,
  CheckCircle,
  Wifi,
  RefreshCw,
} from "lucide-react";

import {
  Button,
  Badge,
  Card,
  Dropdown,
  Modal,
} from "../components/ui";

import {
  getEmailAccounts,
  createEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  type EmailAccount,
} from "../api/emailAccounts";

interface EmailAccountsProps {
  onToast: (
    msg: string,
    type?: "success" | "error" | "info"
  ) => void;
}

type Provider = string;

const ProviderIcon = ({
  provider,
}: {
  provider: Provider;
}) => {
  const normalizedProvider = provider?.toLowerCase();

  if (normalizedProvider === "google") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        />
      </svg>
    );
  }

  if (normalizedProvider === "smtp") {
    return (
      <Wifi
        size={18}
        className="text-slate-500"
      />
    );
  }

  return (
    <div className="w-[18px] h-[18px] bg-blue-500 rounded-full" />
  );
};

export default function EmailAccounts({
  onToast,
}: EmailAccountsProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [connectOpen, setConnectOpen] =
    useState(false);

  const [connectStep, setConnectStep] =
    useState<
      "choose" | "smtp" | "connecting" | "success"
    >("choose");

  const [smtpForm, setSmtpForm] = useState({
    host: "",
    port: "587",
    email: "",
    password: "",
  });

  // ------------------------------------------
  // Workspace
  // ------------------------------------------

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

  // ------------------------------------------
  // Load accounts
  // ------------------------------------------

  const loadAccounts = async () => {
    const workspaceId = getWorkspaceId();

    if (!workspaceId) {
      setAccounts([]);
      setLoading(false);

      onToast(
        "No workspace found. Please create a workspace first.",
        "error"
      );

      return;
    }

    try {
      setLoading(true);

      const data =
        await getEmailAccounts(workspaceId);

      setAccounts(data);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // ------------------------------------------
  // Helpers
  // ------------------------------------------

  const getDisplayName = (
    account: EmailAccount
  ) => {
    return account.name || account.email;
  };

  const getDailyLimit = (
    account: EmailAccount
  ) => {
    return account.dailyLimit ?? 200;
  };

  const getSentToday = (
    account: EmailAccount
  ) => {
    return account.sentToday ?? 0;
  };

  const getLastActivity = (
    account: EmailAccount
  ) => {
    return (
      account.lastActivity ||
      account.updatedAt
    );
  };

  // ------------------------------------------
  // Pause / Resume
  // ------------------------------------------

  const toggleStatus = async (id: string) => {
    const account = accounts.find(
      (item) => item.id === id
    );

    if (!account) {
      return;
    }

    const currentStatus =
      account.status?.toUpperCase();

    const newStatus =
      currentStatus === "ACTIVE"
        ? "PAUSED"
        : "ACTIVE";

    try {
      await updateEmailAccount(id, {
        status: newStatus,
      });

      setAccounts((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      onToast(
        newStatus === "ACTIVE"
          ? "Account resumed"
          : "Account paused",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to update account:",
        error
      );

      onToast(
        error instanceof Error
          ? error.message
          : "Failed to update account",
        "error"
      );
    }
  };

  // ------------------------------------------
  // Delete
  // ------------------------------------------

  const handleRemove = async (id: string) => {
    const confirmed = window.confirm(
      "Remove this email account?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmailAccount(id);

      setAccounts((prev) =>
        prev.filter(
          (account) => account.id !== id
        )
      );

      onToast(
        "Email account removed",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to remove email account:",
        error
      );

      onToast(
        error instanceof Error
          ? error.message
          : "Failed to remove email account",
        "error"
      );
    }
  };

  // ------------------------------------------
  // Google OAuth
  // ------------------------------------------

  const handleGoogleConnect = () => {
    window.location.href =
      "http://localhost:3000/api/google/auth";
  };

  // ------------------------------------------
  // SMTP
  // ------------------------------------------

  const handleSmtpConnect = async () => {
    const workspaceId = getWorkspaceId();

    if (!workspaceId) {
      onToast(
        "No workspace found. Please create a workspace first.",
        "error"
      );

      return;
    }

    const email =
      smtpForm.email.trim();

    const password =
      smtpForm.password;

    const host =
      smtpForm.host.trim();

    const port =
      Number(smtpForm.port);

    if (!email) {
      onToast(
        "Email address is required",
        "error"
      );

      return;
    }

    if (!password) {
      onToast(
        "Password / App password is required",
        "error"
      );

      return;
    }

    if (!host) {
      onToast(
        "SMTP host is required",
        "error"
      );

      return;
    }

    if (
      !Number.isInteger(port) ||
      port <= 0 ||
      port > 65535
    ) {
      onToast(
        "Please enter a valid SMTP port",
        "error"
      );

      return;
    }

    try {
      setConnectStep("connecting");

      const account =
        await createEmailAccount({
          workspaceId,
          email,
          name: email,
          provider: "smtp",
          smtpHost: host,
          smtpPort: port,
          smtpUsername: email,
          smtpPassword: password,
          dailyLimit: 200,
        });

      setAccounts((prev) => [
        account,
        ...prev,
      ]);

      setConnectStep("success");

      onToast(
        "SMTP account connected",
        "success"
      );

      setTimeout(() => {
        setConnectOpen(false);
        setConnectStep("choose");

        setSmtpForm({
          host: "",
          port: "587",
          email: "",
          password: "",
        });
      }, 1200);
    } catch (error) {
      console.error(
        "Failed to connect SMTP account:",
        error
      );

      setConnectStep("smtp");

      onToast(
        error instanceof Error
          ? error.message
          : "Failed to connect SMTP account",
        "error"
      );
    }
  };

  // ------------------------------------------
  // Stats
  // ------------------------------------------

  const connectedCount =
    accounts.filter(
      (account) =>
        account.status?.toUpperCase() ===
        "ACTIVE"
    ).length;

  const sentTodayTotal =
    accounts.reduce(
      (sum, account) =>
        sum + getSentToday(account),
      0
    );

  const dailyCapacity =
    accounts
      .filter(
        (account) =>
          account.status?.toUpperCase() ===
          "ACTIVE"
      )
      .reduce(
        (sum, account) =>
          sum + getDailyLimit(account),
        0
      );

  // ------------------------------------------
  // UI
  // ------------------------------------------

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Email Accounts
          </h2>

          <p className="text-sm text-slate-500 mt-0.5">
            Connect and manage the inboxes used
            for your campaigns.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setConnectStep("choose");
            setConnectOpen(true);
          }}
        >
          <Plus size={14} />
          Connect Email
        </Button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Connected",
            value: connectedCount,
            color: "text-emerald-700",
          },
          {
            label: "Sent today",
            value: sentTodayTotal,
            color: "text-slate-900",
          },
          {
            label: "Daily capacity",
            value: dailyCapacity,
            color: "text-indigo-700",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="p-4"
          >
            <p className="text-xs text-slate-500">
              {stat.label}
            </p>

            <p
              className={`text-2xl font-semibold font-display mt-1 ${stat.color}`}
            >
              {stat.value.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      {/* Loading */}

      {loading ? (
        <Card className="p-10 flex flex-col items-center text-center">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />

          <p className="text-sm font-medium text-slate-900">
            Loading email accounts...
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Fetching connected accounts from
            the backend.
          </p>
        </Card>
      ) : accounts.length === 0 ? (
        /* Empty State */

        <Card className="p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <Wifi
              size={20}
              className="text-slate-400"
            />
          </div>

          <h3 className="text-sm font-semibold text-slate-900">
            No email accounts connected
          </h3>

          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            Connect a Gmail account or SMTP
            inbox to start sending campaigns.
          </p>

          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => {
              setConnectStep("choose");
              setConnectOpen(true);
            }}
          >
            <Plus size={13} />
            Connect Email
          </Button>
        </Card>
      ) : (
        /* Accounts */

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((account) => {
            const sentToday =
              getSentToday(account);

            const dailyLimit =
              getDailyLimit(account);

            const lastActivity =
              getLastActivity(account);

            const usage =
              dailyLimit > 0
                ? Math.min(
                    100,
                    (sentToday /
                      dailyLimit) *
                      100
                  )
                : 0;

            const status =
              account.status?.toUpperCase();

            const provider =
              account.provider?.toLowerCase();

            return (
              <Card
                key={account.id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                      <ProviderIcon
                        provider={
                          account.provider
                        }
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-900 text-sm">
                          {account.email}
                        </p>

                        <Badge
                          variant={
                            status === "ERROR"
                              ? "error"
                              : status ===
                                  "ACTIVE"
                                ? "active"
                                : "paused"
                          }
                          dot
                        >
                          {status
                            ? status
                                .charAt(0)
                                .toUpperCase() +
                              status
                                .slice(1)
                                .toLowerCase()
                            : "Unknown"}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {getDisplayName(
                          account
                        )}
                        {" · "}
                        {provider ===
                        "google"
                          ? "Google Gmail"
                          : "SMTP"}
                      </p>
                    </div>
                  </div>

                  <Dropdown
                    trigger={
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal
                          size={15}
                        />
                      </button>
                    }
                    items={[
                      {
                        label: "Configure",
                        icon: (
                          <Settings
                            size={13}
                          />
                        ),
                        onClick: () =>
                          onToast(
                            "Opening settings...",
                            "info"
                          ),
                      },
                      {
                        label:
                          status === "ACTIVE"
                            ? "Pause"
                            : "Resume",
                        icon:
                          status ===
                          "ACTIVE" ? (
                            <Pause
                              size={13}
                            />
                          ) : (
                            <Play
                              size={13}
                            />
                          ),
                        onClick: () =>
                          toggleStatus(
                            account.id
                          ),
                        divider: true,
                      },
                      {
                        label: "Remove",
                        icon: (
                          <Trash2
                            size={13}
                          />
                        ),
                        onClick: () =>
                          handleRemove(
                            account.id
                          ),
                        danger: true,
                      },
                    ]}
                  />
                </div>

                {/* Error */}

                {status === "ERROR" && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle
                      size={13}
                      className="text-red-500 shrink-0"
                    />

                    <p className="text-xs text-red-700 flex-1">
                      Authentication failed.
                      Reconnect to resume
                      sending.
                    </p>

                    <button
                      onClick={
                        handleGoogleConnect
                      }
                      className="text-xs text-red-600 font-medium hover:text-red-700 flex items-center gap-1"
                    >
                      <RefreshCw
                        size={11}
                      />
                      Reconnect
                    </button>
                  </div>
                )}

                {/* Account stats */}

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                      Sent today
                    </p>

                    <p className="text-sm font-semibold text-slate-900 mt-0.5 font-mono">
                      {sentToday}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                      Daily limit
                    </p>

                    <p className="text-sm font-semibold text-slate-900 mt-0.5 font-mono">
                      {dailyLimit}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                      Last active
                    </p>

                    <p className="text-sm font-semibold text-slate-900 mt-0.5 font-mono text-xs">
                      {lastActivity
                        ? new Date(
                            lastActivity
                          ).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Usage */}

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400">
                      Daily usage
                    </span>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {sentToday}/{dailyLimit}
                    </span>
                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usage > 80
                          ? "bg-amber-400"
                          : "bg-indigo-500"
                      }`}
                      style={{
                        width: `${usage}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}

      <Modal
        open={connectOpen}
        onClose={() => {
          setConnectOpen(false);
          setConnectStep("choose");
        }}
        title="Connect Email Account"
        size="md"
      >
        {/* Choose */}

        {connectStep === "choose" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Choose how to connect your email
              account.
            </p>

            {/* Google */}

            <button
              onClick={
                handleGoogleConnect
              }
              className="w-full flex items-center gap-4 px-4 py-4 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 group-hover:border-indigo-200">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 18 18"
                >
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  />
                </svg>
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">
                  Connect Google / Gmail
                </p>

                <p className="text-xs text-slate-500">
                  Authorize with OAuth — no
                  password stored
                </p>
              </div>

              <div className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors">
                →
              </div>
            </button>

            {/* SMTP */}

            <button
              onClick={() =>
                setConnectStep("smtp")
              }
              className="w-full flex items-center gap-4 px-4 py-4 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                <Wifi
                  size={18}
                  className="text-slate-500"
                />
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">
                  Connect via SMTP
                </p>

                <p className="text-xs text-slate-500">
                  Use any email provider with
                  SMTP credentials
                </p>
              </div>

              <div className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors">
                →
              </div>
            </button>

            <p className="text-xs text-slate-400 text-center pt-1">
              🔒 Credentials are encrypted and
              never shared.
            </p>
          </div>
        )}

        {/* SMTP */}

        {connectStep === "smtp" && (
          <div className="space-y-4">
            <button
              onClick={() =>
                setConnectStep("choose")
              }
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              ← Back
            </button>

            <div className="grid grid-cols-2 gap-3">
              {/* Email */}

              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Email address
                </label>

                <input
                  type="email"
                  value={smtpForm.email}
                  onChange={(e) =>
                    setSmtpForm({
                      ...smtpForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="you@company.com"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Password */}

              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Password / App password
                </label>

                <input
                  type="password"
                  value={smtpForm.password}
                  onChange={(e) =>
                    setSmtpForm({
                      ...smtpForm,
                      password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Host */}

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  SMTP host
                </label>

                <input
                  value={smtpForm.host}
                  onChange={(e) =>
                    setSmtpForm({
                      ...smtpForm,
                      host: e.target.value,
                    })
                  }
                  placeholder="smtp.gmail.com"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Port */}

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Port
                </label>

                <input
                  type="number"
                  value={smtpForm.port}
                  onChange={(e) =>
                    setSmtpForm({
                      ...smtpForm,
                      port: e.target.value,
                    })
                  }
                  placeholder="587"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleSmtpConnect}
              disabled={
                !smtpForm.email.trim() ||
                !smtpForm.password ||
                !smtpForm.host.trim()
              }
            >
              Connect Account
            </Button>
          </div>
        )}

        {/* Connecting */}

        {connectStep === "connecting" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-12 h-12 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />

            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">
                Connecting...
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Verifying credentials and
                setting up your account
              </p>
            </div>
          </div>
        )}

        {/* Success */}

        {connectStep === "success" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <CheckCircle
                size={24}
                className="text-emerald-600"
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">
                Account connected!
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Your inbox is ready to send
                campaigns.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}