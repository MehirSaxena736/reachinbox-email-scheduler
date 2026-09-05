import React, { useState } from "react";
import {
  Pause, Play, Edit, ArrowLeft, Users, Send, Eye, MessageSquare,
  AlertCircle, ChevronRight, Mail
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import { Badge, Button, Tabs, KpiCard, Card, Avatar } from "../components/ui";
import { campaigns, contacts, scheduledEmails, activityItems, chartData } from "../data";
import type { Page } from "../types";

interface CampaignDetailsProps {
  campaignId: string;
  onNavigate: (page: Page) => void;
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function CampaignDetails({ campaignId, onNavigate, onToast }: CampaignDetailsProps) {
  const [tab, setTab] = useState("overview");
  const [paused, setPaused] = useState(false);
  const campaign = campaigns.find((c) => c.id === campaignId) ?? campaigns[0];

  const campaignContacts = contacts.filter((c) => c.campaign === campaign.name);
  const campaignScheduled = scheduledEmails.filter((e) => e.campaign === campaign.name);

  const stepData = [
    { step: "Step 1", sent: campaign.sent, opened: campaign.opened, replied: campaign.replied },
    { step: "Step 2", sent: Math.round(campaign.sent * 0.6), opened: Math.round(campaign.opened * 0.5), replied: Math.round(campaign.replied * 0.4) },
    { step: "Step 3", sent: Math.round(campaign.sent * 0.3), opened: Math.round(campaign.opened * 0.25), replied: Math.round(campaign.replied * 0.2) },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onNavigate("campaigns")}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display text-xl font-semibold text-slate-900">{campaign.name}</h2>
              <Badge variant={paused ? "paused" : campaign.status} dot>
                {paused ? "Paused" : campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Sent by {campaign.sender} · {campaign.steps} steps · Created {new Date(campaign.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onToast("Opening editor...", "info")}>
            <Edit size={13} />
            Edit
          </Button>
          <Button
            variant={paused ? "primary" : "outline"}
            size="sm"
            onClick={() => { setPaused(!paused); onToast(paused ? "Campaign resumed" : "Campaign paused", "success"); }}
          >
            {paused ? <><Play size={13} />Resume</> : <><Pause size={13} />Pause</>}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Contacts" value={campaign.contacts.toLocaleString()} icon={<Users size={16} />} color="text-slate-600" />
        <KpiCard label="Emails Sent" value={campaign.sent.toLocaleString()} icon={<Send size={16} />} color="text-indigo-600" />
        <KpiCard label="Opened" value={`${campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%`} icon={<Eye size={16} />} color="text-sky-600" trend={4.2} />
        <KpiCard label="Replied" value={`${campaign.sent > 0 ? Math.round((campaign.replied / campaign.sent) * 100) : 0}%`} icon={<MessageSquare size={16} />} color="text-emerald-600" trend={1.8} />
        <KpiCard label="Bounced" value={`${campaign.sent > 0 ? Math.round((campaign.bounced / campaign.sent) * 100) : 0}%`} icon={<AlertCircle size={16} />} color="text-red-500" />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "sequence", label: "Sequence", count: campaign.steps },
          { id: "contacts", label: "Contacts", count: campaignContacts.length },
          { id: "scheduled", label: "Scheduled", count: campaignScheduled.length },
          { id: "activity", label: "Activity" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Email Performance (7 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData.emailActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="sent" stroke="#4f46e5" strokeWidth={2} fill="url(#g1)" name="Sent" />
                  <Area type="monotone" dataKey="replied" stroke="#10b981" strokeWidth={2} fill="none" name="Replied" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Step Performance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stepData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="step" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
                  <Bar dataKey="sent" fill="#e0e7ff" name="Sent" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="opened" fill="#818cf8" name="Opened" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="replied" fill="#4f46e5" name="Replied" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Delivery metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Delivery Rate", value: `${campaign.sent > 0 ? Math.round(((campaign.sent - campaign.bounced) / campaign.sent) * 100) : 0}%`, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Open Rate", value: `${campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%`, color: "text-sky-700", bg: "bg-sky-50" },
              { label: "Reply Rate", value: `${campaign.sent > 0 ? Math.round((campaign.replied / campaign.sent) * 100) : 0}%`, color: "text-indigo-700", bg: "bg-indigo-50" },
              { label: "Bounce Rate", value: `${campaign.sent > 0 ? Math.round((campaign.bounced / campaign.sent) * 100) : 0}%`, color: "text-red-700", bg: "bg-red-50" },
            ].map((m) => (
              <div key={m.label} className={`${m.bg} border border-slate-100 rounded-xl p-4`}>
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className={`text-2xl font-semibold font-display mt-1 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "sequence" && (
        <div className="space-y-4">
          {[
            { step: 1, delay: "Immediately", subject: "Quick question about {{company}}", preview: "Hi {{firstName}}, I noticed that {{company}} is actively hiring..." },
            { step: 2, delay: "Wait 2 days", subject: "Following up, {{firstName}}", preview: "Just wanted to bump this up in your inbox..." },
            { step: 3, delay: "Wait 4 days", subject: "Closing the loop", preview: "I'll keep this short — if now's not the right time..." },
          ].slice(0, campaign.steps).map((s, i) => (
            <div key={s.step} className="flex items-start gap-4">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-semibold flex items-center justify-center">{s.step}</div>
                {i < campaign.steps - 1 && <div className="w-px flex-1 bg-slate-200 my-2 min-h-[24px]" />}
              </div>
              <Card className="flex-1 p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><ChevronRight size={11} />{s.delay}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">Subject: {s.subject}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.preview}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onToast("Opening editor...", "info")}><Edit size={12} /></Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {tab === "contacts" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                  {["Name", "Email", "Company", "Title", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaignContacts.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">No contacts in this campaign yet.</td></tr>
                ) : campaignContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
                        <span className="font-medium text-slate-900">{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{c.email}</td>
                    <td className="px-5 py-3.5 text-slate-600">{c.company}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{c.title}</td>
                    <td className="px-5 py-3.5"><Badge variant={c.status}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "scheduled" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                  {["Recipient", "Subject", "Sender", "Scheduled", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaignScheduled.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">No scheduled emails for this campaign.</td></tr>
                ) : campaignScheduled.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{e.recipient}</div>
                      <div className="text-xs text-slate-400">{e.recipientEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{e.subject}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{e.sender}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {new Date(e.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5"><Badge variant={e.status}>{e.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "activity" && (
        <Card className="p-5">
          <div className="space-y-3">
            {activityItems.filter((a) => a.meta === campaign.name || !a.meta).slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {new Date(item.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
