import React, { useState } from "react";
import { Plus, MoreHorizontal, Pause, Play, Trash2, Settings, AlertCircle, CheckCircle, Wifi, RefreshCw } from "lucide-react";
import { Button, Badge, Card, Dropdown, Modal } from "../components/ui";
import { emailAccounts as initialAccounts } from "../data";
import type { EmailAccount } from "../types";

interface EmailAccountsProps {
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const ProviderIcon = ({ provider }: { provider: EmailAccount["provider"] }) => {
  if (provider === "google") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
      </svg>
    );
  }
  if (provider === "smtp") {
    return <Wifi size={18} className="text-slate-500" />;
  }
  return <div className="w-[18px] h-[18px] bg-blue-500 rounded-full" />;
};

export default function EmailAccounts({ onToast }: EmailAccountsProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>(initialAccounts);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectStep, setConnectStep] = useState<"choose" | "smtp" | "connecting" | "success">("choose");
  const [smtpForm, setSmtpForm] = useState({ host: "", port: "587", email: "", password: "" });

  const toggleStatus = (id: string) => {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a));
    const acct = accounts.find((a) => a.id === id);
    onToast(acct?.status === "active" ? "Account paused" : "Account resumed", "success");
  };

  const handleRemove = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    onToast("Email account removed", "success");
  };

  const handleGoogleConnect = () => {
    setConnectStep("connecting");
    setTimeout(() => setConnectStep("success"), 1500);
  };

  const handleSmtpConnect = () => {
    setConnectStep("connecting");
    setTimeout(() => {
      const newAccount: EmailAccount = {
        id: `e${Date.now()}`,
        email: smtpForm.email || "new@company.com",
        name: "New Account",
        provider: "smtp",
        status: "active",
        sentToday: 0,
        dailyLimit: 200,
        lastActivity: new Date().toISOString(),
      };
      setAccounts([...accounts, newAccount]);
      setConnectStep("success");
      setTimeout(() => { setConnectOpen(false); setConnectStep("choose"); }, 1200);
      onToast("SMTP account connected", "success");
    }, 1400);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">Email Accounts</h2>
          <p className="text-sm text-slate-500 mt-0.5">Connect and manage the inboxes used for your campaigns.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setConnectStep("choose"); setConnectOpen(true); }}>
          <Plus size={14} />
          Connect Email
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Connected", value: accounts.filter((a) => a.status === "active").length, color: "text-emerald-700" },
          { label: "Sent today", value: accounts.reduce((sum, a) => sum + a.sentToday, 0), color: "text-slate-900" },
          { label: "Daily capacity", value: accounts.filter((a) => a.status === "active").reduce((sum, a) => sum + a.dailyLimit, 0), color: "text-indigo-700" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-semibold font-display mt-1 ${s.color}`}>{s.value.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      {/* Accounts */}
      {accounts.length === 0 ? (
        <Card className="p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <Wifi size={20} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No email accounts connected</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">Connect a Gmail account or SMTP inbox to start sending campaigns.</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setConnectOpen(true)}><Plus size={13} />Connect Email</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                    <ProviderIcon provider={account.provider} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-900 text-sm">{account.email}</p>
                      <Badge variant={account.status === "error" ? "error" : account.status} dot>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{account.name} · {account.provider === "google" ? "Google Gmail" : "SMTP"}</p>
                  </div>
                </div>

                <Dropdown
                  trigger={
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={15} />
                    </button>
                  }
                  items={[
                    { label: "Configure", icon: <Settings size={13} />, onClick: () => onToast("Opening settings...", "info") },
                    { label: account.status === "active" ? "Pause" : "Resume", icon: account.status === "active" ? <Pause size={13} /> : <Play size={13} />, onClick: () => toggleStatus(account.id), divider: true },
                    { label: "Remove", icon: <Trash2 size={13} />, onClick: () => handleRemove(account.id), danger: true },
                  ]}
                />
              </div>

              {account.status === "error" && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={13} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 flex-1">Authentication failed. Reconnect to resume sending.</p>
                  <button className="text-xs text-red-600 font-medium hover:text-red-700 flex items-center gap-1">
                    <RefreshCw size={11} />Reconnect
                  </button>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Sent today</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 font-mono">{account.sentToday}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Daily limit</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 font-mono">{account.dailyLimit}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Last active</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 font-mono text-xs">
                    {new Date(account.lastActivity).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">Daily usage</span>
                  <span className="text-[10px] text-slate-500 font-mono">{account.sentToday}/{account.dailyLimit}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${account.sentToday / account.dailyLimit > 0.8 ? "bg-amber-400" : "bg-indigo-500"}`}
                    style={{ width: `${Math.min(100, (account.sentToday / account.dailyLimit) * 100)}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      <Modal open={connectOpen} onClose={() => { setConnectOpen(false); setConnectStep("choose"); }} title="Connect Email Account" size="md">
        {connectStep === "choose" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Choose how to connect your email account.</p>
            <button
              onClick={handleGoogleConnect}
              className="w-full flex items-center gap-4 px-4 py-4 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 group-hover:border-indigo-200">
                <svg width="20" height="20" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" /><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" /><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" /></svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Connect Google / Gmail</p>
                <p className="text-xs text-slate-500">Authorize with OAuth — no password stored</p>
              </div>
              <div className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors">→</div>
            </button>

            <button
              onClick={() => setConnectStep("smtp")}
              className="w-full flex items-center gap-4 px-4 py-4 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                <Wifi size={18} className="text-slate-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Connect via SMTP</p>
                <p className="text-xs text-slate-500">Use any email provider with SMTP credentials</p>
              </div>
              <div className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors">→</div>
            </button>

            <p className="text-xs text-slate-400 text-center pt-1">
              🔒 Credentials are encrypted and never shared. OAuth connections are read-limited to sending only.
            </p>
          </div>
        )}

        {connectStep === "smtp" && (
          <div className="space-y-4">
            <button onClick={() => setConnectStep("choose")} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">← Back</button>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1">Email address</label>
                <input value={smtpForm.email} onChange={(e) => setSmtpForm({ ...smtpForm, email: e.target.value })} placeholder="you@company.com" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700 block mb-1">Password / App password</label>
                <input type="password" value={smtpForm.password} onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })} placeholder="••••••••" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">SMTP host</label>
                <input value={smtpForm.host} onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })} placeholder="smtp.gmail.com" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Port</label>
                <input value={smtpForm.port} onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })} placeholder="587" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <Button variant="primary" size="md" className="w-full" onClick={handleSmtpConnect} disabled={!smtpForm.email}>
              Connect Account
            </Button>
          </div>
        )}

        {connectStep === "connecting" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-12 h-12 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">Connecting...</p>
              <p className="text-xs text-slate-500 mt-1">Verifying credentials and setting up your account</p>
            </div>
          </div>
        )}

        {connectStep === "success" && (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">Account connected!</p>
              <p className="text-xs text-slate-500 mt-1">Your inbox is ready to send campaigns.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
