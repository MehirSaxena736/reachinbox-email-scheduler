import React, { useState } from "react";
import {
  LayoutDashboard, Megaphone, Users, Mail, GitBranch,
  CalendarClock, BarChart3, Settings, HelpCircle, LogOut,
  ChevronDown, ChevronLeft, ChevronRight, Bell, Search,
  Building2, Menu, X
} from "lucide-react";
import type { Page } from "../types";
import { Avatar } from "./ui";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
}

const nav = [
  { id: "dashboard" as Page, label: "Overview", icon: LayoutDashboard },
  { id: "campaigns" as Page, label: "Campaigns", icon: Megaphone },
  { id: "contacts" as Page, label: "Contacts", icon: Users },
  { id: "email-accounts" as Page, label: "Email Accounts", icon: Mail },
  { id: "sequences" as Page, label: "Sequences", icon: GitBranch },
  { id: "scheduled-emails" as Page, label: "Scheduled Emails", icon: CalendarClock },
  { id: "analytics" as Page, label: "Analytics", icon: BarChart3 },
  { id: "settings" as Page, label: "Settings", icon: Settings },
];

const pageTitles: Partial<Record<Page, string>> = {
  dashboard: "Overview",
  campaigns: "Campaigns",
  "create-campaign": "Create Campaign",
  "campaign-details": "Campaign Details",
  contacts: "Contacts",
  "email-accounts": "Email Accounts",
  sequences: "Sequences",
  "scheduled-emails": "Scheduled Emails",
  analytics: "Analytics",
  settings: "Settings",
};

export default function Layout({ children, currentPage, onNavigate, onLogout, userName, userEmail }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 h-14 border-b border-slate-100 shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <Mail size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-semibold text-slate-900 text-base tracking-tight">ReachInbox</span>
        )}
      </div>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors group">
            <div className="w-6 h-6 bg-indigo-50 border border-indigo-200 rounded flex items-center justify-center shrink-0">
              <Building2 size={12} className="text-indigo-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">GrowthCo</p>
              <p className="text-[10px] text-slate-400 truncate">Pro plan</p>
            </div>
            <ChevronDown size={12} className="text-slate-400 shrink-0" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 sidebar-scroll overflow-y-auto">
        {nav.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id || (id === "campaigns" && currentPage === "campaign-details");
          return (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-100 ${
                active
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={`px-3 py-3 border-t border-slate-100 space-y-0.5 shrink-0`}>
        <button
          title={collapsed ? "Help" : undefined}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <HelpCircle size={16} className="shrink-0" />
          {!collapsed && "Help & Support"}
        </button>

        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <Avatar name={userName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-100 rounded-md"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            title="Log out"
            className="w-full flex justify-center px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-full bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 shrink-0 ${collapsed ? "w-14" : "w-56"}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 w-56 lg:hidden transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={16} />
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-slate-900">{pageTitles[currentPage] ?? ""}</h1>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-56">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
            />
            <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1 py-0.5 font-mono shrink-0">⌘K</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Mark all read</button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {[
                      { title: "Sarah Chen replied", desc: "SaaS Founders Outreach • 8 min ago", unread: true },
                      { title: "Campaign went live", desc: "DevTools Buyer Personas • 1 hr ago", unread: true },
                      { title: "24 emails scheduled", desc: "Q4 Product Demo • 3 hr ago", unread: false },
                    ].map((n, i) => (
                      <div key={i} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer ${n.unread ? "bg-indigo-50/40" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-indigo-500" : "bg-transparent"}`} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500">{n.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100">
                    <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">View all notifications</button>
                  </div>
                </div>
              </>
            )}
          </div>

          <Avatar name={userName} size="sm" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
