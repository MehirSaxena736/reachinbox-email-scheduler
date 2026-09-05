import React, { useState } from "react";
import {
  Send, CalendarClock, Megaphone, MessageSquare, ArrowRight,
  TrendingUp, Mail, GitBranch, Wifi, PauseCircle, Plus
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { KpiCard, Badge, Card, Button, Avatar } from "../components/ui";
import { campaigns, chartData, scheduledEmails, activityItems } from "../data";
import type { Page, ActivityItem } from "../types";

interface DashboardProps {
  onNavigate: (page: Page, id?: string) => void;
  userName: string;
}

const ActivityIcon = ({ type }: { type: ActivityItem["type"] }) => {
  const icons: Record<ActivityItem["type"], React.ReactNode> = {
    campaign_started: <Megaphone size={12} className="text-indigo-600" />,
    emails_scheduled: <CalendarClock size={12} className="text-violet-600" />,
    reply: <MessageSquare size={12} className="text-emerald-600" />,
    account_connected: <Wifi size={12} className="text-sky-600" />,
    campaign_paused: <PauseCircle size={12} className="text-amber-600" />,
    campaign_created: <GitBranch size={12} className="text-slate-600" />,
  };
  const bg: Record<ActivityItem["type"], string> = {
    campaign_started: "bg-indigo-50",
    emails_scheduled: "bg-violet-50",
    reply: "bg-emerald-50",
    account_connected: "bg-sky-50",
    campaign_paused: "bg-amber-50",
    campaign_created: "bg-slate-100",
  };
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${bg[type]}`}>
      {icons[type]}
    </div>
  );
};

function relativeTime(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function Dashboard({ onNavigate, userName }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const data = chartData.emailActivity;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            {greeting}, {userName.split(" ")[0]} 👋
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Here&apos;s what&apos;s happening with your outreach today.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => onNavigate("create-campaign")}>
          <Plus size={14} />
          New Campaign
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Emails Sent" value="1,284" trend={12.4} icon={<Send size={16} />} color="text-indigo-600" />
        <KpiCard label="Scheduled" value="342" trend={8.1} icon={<CalendarClock size={16} />} color="text-violet-600" />
        <KpiCard label="Active Campaigns" value="8" trend={0} icon={<Megaphone size={16} />} color="text-sky-600" />
        <KpiCard label="Reply Rate" value="18.6%" trend={2.3} icon={<MessageSquare size={16} />} color="text-emerald-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Email activity chart */}
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Email Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Sent, opens, replies and bounces</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {(["7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${timeRange === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="opened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="replied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Area type="monotone" dataKey="sent" stroke="#4f46e5" strokeWidth={2} fill="url(#sent)" name="Sent" />
              <Area type="monotone" dataKey="opened" stroke="#06b6d4" strokeWidth={2} fill="url(#opened)" name="Opened" />
              <Area type="monotone" dataKey="replied" stroke="#10b981" strokeWidth={2} fill="url(#replied)" name="Replied" />
              <Area type="monotone" dataKey="bounced" stroke="#f87171" strokeWidth={1.5} fill="none" name="Bounced" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activityItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <ActivityIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-snug">{item.text}</p>
                  {item.meta && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.meta}</p>}
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">{relativeTime(item.timestamp)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Campaign table */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Campaign Performance</h3>
          <button onClick={() => onNavigate("campaigns")} className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                {["Campaign", "Status", "Sent", "Opened", "Replied", "Bounced"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.filter((c) => c.status !== "archived").slice(0, 5).map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onNavigate("campaign-details", c.id)}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.senderEmail}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={c.status} dot>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</Badge>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{c.sent.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-mono text-xs text-slate-700">{c.opened.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0}%</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-mono text-xs text-emerald-700 font-semibold">{c.replied.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{c.sent > 0 ? Math.round((c.replied / c.sent) * 100) : 0}%</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-red-600">{c.bounced}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upcoming scheduled emails */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Upcoming Scheduled Emails</h3>
          <button onClick={() => onNavigate("scheduled-emails")} className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {scheduledEmails.filter((e) => e.status === "pending" || e.status === "queued").slice(0, 4).map((email) => (
            <div key={email.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
              <Avatar name={email.recipient} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{email.recipient}</p>
                <p className="text-xs text-slate-400 truncate">{email.subject}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-600">{email.campaign}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {new Date(email.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {new Date(email.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="shrink-0">
                <Badge variant={email.status}>{email.status}</Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Mail size={12} className="text-slate-400" />
                <span className="text-[10px] text-slate-400">{email.sender}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
