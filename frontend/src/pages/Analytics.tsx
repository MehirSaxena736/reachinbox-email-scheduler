import React, { useState } from "react";
import { Send, Eye, MessageSquare, AlertCircle, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from "recharts";
import { KpiCard, Card, Badge } from "../components/ui";
import { campaigns, chartData } from "../data";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [senderFilter, setSenderFilter] = useState("all");

  const data = chartData.analyticsOverTime;

  const campaignPerf = campaigns.filter((c) => c.sent > 0).map((c) => ({
    name: c.name,
    sent: c.sent,
    openRate: Math.round((c.opened / c.sent) * 100),
    replyRate: Math.round((c.replied / c.sent) * 100),
    bounceRate: Math.round((c.bounced / c.sent) * 100),
    status: c.status,
  }));

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
  const totalReplied = campaigns.reduce((s, c) => s + c.replied, 0);
  const totalBounced = campaigns.reduce((s, c) => s + c.bounced, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track performance across all campaigns and accounts.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {[{ v: "7d", l: "Last 7 days" }, { v: "30d", l: "Last 30 days" }, { v: "90d", l: "Last 90 days" }, { v: "ytd", l: "Year to date" }].map((o) => (
              <option key={o.v} value={o.v}>{o.l}</option>
            ))}
          </select>
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All campaigns</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={senderFilter}
            onChange={(e) => setSenderFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All senders</option>
            <option value="alex">Alex Rivera</option>
            <option value="jordan">Jordan Lee</option>
            <option value="sam">Sam Park</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Sent" value={totalSent.toLocaleString()} trend={14.2} icon={<Send size={16} />} color="text-indigo-600" />
        <KpiCard label="Delivered" value={`${Math.round(((totalSent - totalBounced) / totalSent) * 100)}%`} trend={0.8} icon={<TrendingUp size={16} />} color="text-sky-600" />
        <KpiCard label="Open Rate" value={`${Math.round((totalOpened / totalSent) * 100)}%`} trend={3.1} icon={<Eye size={16} />} color="text-violet-600" />
        <KpiCard label="Reply Rate" value={`${Math.round((totalReplied / totalSent) * 100)}%`} trend={1.9} icon={<MessageSquare size={16} />} color="text-emerald-600" />
        <KpiCard label="Bounce Rate" value={`${Math.round((totalBounced / totalSent) * 100)}%`} trend={-0.4} icon={<AlertCircle size={16} />} color="text-red-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Emails sent over time */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Emails Sent Over Time</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly breakdown of outbound volume</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="sent" stroke="#4f46e5" strokeWidth={2} fill="url(#aGrad)" name="Sent" />
              <Area type="monotone" dataKey="opened" stroke="#06b6d4" strokeWidth={2} fill="none" name="Opened" />
              <Area type="monotone" dataKey="replied" stroke="#10b981" strokeWidth={2} fill="none" name="Replied" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Open & reply rate */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Open & Reply Rate</h3>
          <p className="text-xs text-slate-400 mb-4">Engagement trends over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.map((d) => ({ ...d, openRate: Math.round((d.opened / d.sent) * 100), replyRate: Math.round((d.replied / d.sent) * 100) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              <Line type="monotone" dataKey="openRate" stroke="#818cf8" strokeWidth={2.5} dot={false} name="Open Rate %" />
              <Line type="monotone" dataKey="replyRate" stroke="#10b981" strokeWidth={2.5} dot={false} name="Reply Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Campaign comparison */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Campaign Comparison</h3>
        <p className="text-xs text-slate-400 mb-4">Side-by-side performance for all campaigns with sends</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={campaignPerf.map((c) => ({ name: c.name.split(" ").slice(0, 2).join(" "), openRate: c.openRate, replyRate: c.replyRate, bounceRate: c.bounceRate }))} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
            <Bar dataKey="openRate" fill="#818cf8" name="Open Rate %" radius={[3, 3, 0, 0]} />
            <Bar dataKey="replyRate" fill="#10b981" name="Reply Rate %" radius={[3, 3, 0, 0]} />
            <Bar dataKey="bounceRate" fill="#f87171" name="Bounce Rate %" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Performance table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Campaign Performance Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                {["Campaign", "Status", "Sent", "Opened", "Open Rate", "Replied", "Reply Rate", "Bounced"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {campaignPerf.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{c.name}</td>
                  <td className="px-5 py-3.5"><Badge variant={c.status}>{c.status}</Badge></td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{c.sent.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{campaigns.find((cc) => cc.name === c.name)?.opened.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-mono text-xs font-semibold ${c.openRate >= 40 ? "text-emerald-700" : c.openRate >= 25 ? "text-sky-700" : "text-amber-700"}`}>{c.openRate}%</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700">{campaigns.find((cc) => cc.name === c.name)?.replied.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-mono text-xs font-semibold ${c.replyRate >= 15 ? "text-emerald-700" : c.replyRate >= 10 ? "text-sky-700" : "text-amber-700"}`}>{c.replyRate}%</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-mono text-xs ${c.bounceRate > 5 ? "text-red-600 font-semibold" : "text-slate-500"}`}>{c.bounceRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
