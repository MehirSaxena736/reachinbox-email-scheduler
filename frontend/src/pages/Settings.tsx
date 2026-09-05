import React, { useState } from "react";
import { Building2, Users, Mail, Plug, Bell, Plus, Trash2, Edit, Check, Crown, Shield } from "lucide-react";
import { Button, Card, Input, Modal, Avatar, Badge } from "../components/ui";

interface SettingsProps {
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const SETTINGS_NAV = [
  { id: "general", label: "General", icon: Building2 },
  { id: "members", label: "Members", icon: Users },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const MEMBERS = [
  { id: "1", name: "Alex Rivera", email: "alex@growthco.io", role: "owner", status: "active" },
  { id: "2", name: "Jordan Lee", email: "jordan@growthco.io", role: "member", status: "active" },
  { id: "3", name: "Sam Park", email: "sam@growthco.io", role: "member", status: "active" },
  { id: "4", name: "Casey Morgan", email: "casey@growthco.io", role: "member", status: "pending" },
];

const INTEGRATIONS = [
  { name: "HubSpot CRM", desc: "Sync contacts and deal stage data", icon: "🔶", connected: true },
  { name: "Salesforce", desc: "Push reply data to Salesforce opportunities", icon: "☁️", connected: false },
  { name: "Slack", desc: "Get notified on replies in Slack", icon: "💬", connected: true },
  { name: "Zapier", desc: "Connect to 5,000+ apps via Zapier", icon: "⚡", connected: false },
  { name: "LinkedIn", desc: "Enrich contact profiles automatically", icon: "🔷", connected: false },
];

const NOTIF_SETTINGS = [
  { id: "new_reply", label: "New reply received", desc: "When a prospect responds to any email", enabled: true },
  { id: "campaign_live", label: "Campaign goes live", desc: "When a campaign starts sending", enabled: true },
  { id: "daily_summary", label: "Daily sending summary", desc: "End-of-day overview of activity", enabled: false },
  { id: "bounce_alert", label: "High bounce alert", desc: "When bounce rate exceeds 5%", enabled: true },
  { id: "campaign_complete", label: "Campaign completed", desc: "When all sequence steps have been sent", enabled: false },
];

export default function Settings({ onToast }: SettingsProps) {
  const [activeNav, setActiveNav] = useState("general");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [wsName, setWsName] = useState("GrowthCo");
  const [notifSettings, setNotifSettings] = useState(
    Object.fromEntries(NOTIF_SETTINGS.map((n) => [n.id, n.enabled]))
  );

  const handleInvite = () => {
    setInviteOpen(false);
    setInviteEmail("");
    onToast(`Invitation sent to ${inviteEmail}`, "success");
  };

  const handleSaveGeneral = () => {
    onToast("Settings saved", "success");
  };

  return (
    <div className="p-6 max-w-[1000px] space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your workspace and preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Side nav */}
        <aside className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {SETTINGS_NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeNav === id
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* General */}
          {activeNav === "general" && (
            <Card className="p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">Workspace Settings</h3>
              <Input
                label="Workspace name"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
              />
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Workspace ID</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value="ws_growthco_7a2b1c"
                    className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 font-mono focus:outline-none"
                  />
                  <button onClick={() => onToast("Copied!", "success")} className="px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white">
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Plan</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Crown size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">Pro Plan</p>
                    <p className="text-xs text-indigo-600">5 seats · Unlimited campaigns · 10,000 emails/mo</p>
                  </div>
                  <button className="ml-auto text-xs text-indigo-700 font-medium border border-indigo-300 rounded-lg px-3 py-1.5 hover:bg-indigo-100">Upgrade</button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSaveGeneral}>
                  <Check size={13} />
                  Save changes
                </Button>
              </div>
            </Card>
          )}

          {/* Members */}
          {activeNav === "members" && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Team Members</h3>
                <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
                  <Plus size={13} />
                  Invite Member
                </Button>
              </div>
              <div className="divide-y divide-slate-100">
                {MEMBERS.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <Avatar name={m.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.role === "owner" ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
                          <Crown size={10} className="text-amber-600" />
                          <span className="text-xs text-amber-700 font-medium">Owner</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full">
                          <Shield size={10} className="text-slate-500" />
                          <span className="text-xs text-slate-600 font-medium">Member</span>
                        </div>
                      )}
                      <Badge variant={m.status === "pending" ? "paused" : "active"} dot>
                        {m.status === "pending" ? "Pending" : "Active"}
                      </Badge>
                      {m.role !== "owner" && (
                        <button className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Integrations */}
          {activeNav === "integrations" && (
            <div className="space-y-3">
              {INTEGRATIONS.map((int) => (
                <Card key={int.name} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {int.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{int.name}</p>
                      <p className="text-xs text-slate-500">{int.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {int.connected && <Badge variant="active" dot>Connected</Badge>}
                      <Button
                        variant={int.connected ? "outline" : "primary"}
                        size="sm"
                        onClick={() => onToast(int.connected ? `${int.name} disconnected` : `${int.name} connected`, int.connected ? "info" : "success")}
                      >
                        {int.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Notifications */}
          {activeNav === "notifications" && (
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">Choose which events trigger email or in-app notifications.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {NOTIF_SETTINGS.map((n) => (
                  <div key={n.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{n.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setNotifSettings((prev) => ({ ...prev, [n.id]: !prev[n.id] }));
                        onToast(`Notification ${notifSettings[n.id] ? "disabled" : "enabled"}`, "info");
                      }}
                      className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${notifSettings[n.id] ? "bg-indigo-600" : "bg-slate-200"}`}
                      style={{ height: 22, width: 40 }}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notifSettings[n.id] ? "translate-x-[18px]" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => onToast("Notification preferences saved", "success")}>
                  <Check size={13} />
                  Save preferences
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleInvite} disabled={!inviteEmail}>Send Invite</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Email address" type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Role</label>
            <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <p className="text-xs text-slate-500">They will receive an email with a link to join your workspace.</p>
        </div>
      </Modal>
    </div>
  );
}
