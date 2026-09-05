import React, { useState } from "react";
import { Plus, Search, Upload, Download, MoreHorizontal, Trash2, Edit, Filter } from "lucide-react";
import { Button, Badge, Card, Checkbox, Dropdown, Avatar, Modal, Input, Select, Pagination, EmptyState } from "../components/ui";
import { contacts as initialContacts } from "../data";
import type { Contact } from "../types";

interface ContactsProps {
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function Contacts({ onToast }: ContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const [newContact, setNewContact] = useState({ firstName: "", lastName: "", email: "", company: "", title: "" });

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = `${c.firstName} ${c.lastName} ${c.email} ${c.company}`.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const allSelected = paginated.length > 0 && paginated.every((c) => selected.has(c.id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handleAdd = () => {
    const contact: Contact = {
      id: `c${Date.now()}`,
      ...newContact,
      status: "active",
      addedAt: new Date().toISOString(),
    };
    setContacts([contact, ...contacts]);
    setAddOpen(false);
    setNewContact({ firstName: "", lastName: "", email: "", company: "", title: "" });
    onToast("Contact added successfully", "success");
  };

  const handleDelete = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    onToast("Contact deleted", "success");
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">Contacts</h2>
          <p className="text-sm text-slate-500 mt-0.5">{contacts.length.toLocaleString()} total contacts across all campaigns.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          Add Contact
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search contacts..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            {[{ v: "all", l: "All statuses" }, { v: "active", l: "Active" }, { v: "replied", l: "Replied" }, { v: "bounced", l: "Bounced" }, { v: "unsubscribed", l: "Unsubscribed" }].map((o) => (
              <option key={o.v} value={o.v}>{o.l}</option>
            ))}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white">
            <Upload size={13} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white">
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="text-sm text-slate-600">{selected.size} selected</span>
            <button className="text-xs text-red-600 hover:text-red-700 font-medium" onClick={() => {
              setContacts((prev) => prev.filter((c) => !selected.has(c.id)));
              setSelected(new Set());
              onToast(`${selected.size} contacts deleted`, "success");
            }}>Delete</button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Filter size={20} />}
            title="No contacts found"
            description={search || statusFilter !== "all" ? "Try adjusting your search or filters." : "Add your first contact to get started."}
            action={<Button variant="primary" size="sm" onClick={() => setAddOpen(true)}><Plus size={13} /> Add Contact</Button>}
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
                        onChange={(checked) => {
                          if (checked) setSelected(new Set(paginated.map((c) => c.id)));
                          else setSelected((prev) => { const s = new Set(prev); paginated.forEach((c) => s.delete(c.id)); return s; });
                        }}
                        indeterminate={selected.size > 0 && !allSelected}
                      />
                    </th>
                    {["Name", "Email", "Company", "Job Title", "Campaign", "Status", "Added", ""].map((h) => (
                      <th key={h} className="px-3 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((c) => (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors group ${selected.has(c.id) ? "bg-indigo-50/40" : ""}`}>
                      <td className="px-4 py-3.5">
                        <Checkbox checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
                          <span className="font-medium text-slate-900">{c.firstName} {c.lastName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">{c.email}</td>
                      <td className="px-3 py-3.5 text-slate-700">{c.company}</td>
                      <td className="px-3 py-3.5 text-slate-500 text-xs">{c.title}</td>
                      <td className="px-3 py-3.5 text-xs text-slate-500 max-w-[140px] truncate">{c.campaign ?? "—"}</td>
                      <td className="px-3 py-3.5"><Badge variant={c.status}>{c.status}</Badge></td>
                      <td className="px-3 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(c.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                          trigger={
                            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                              <MoreHorizontal size={15} />
                            </button>
                          }
                          items={[
                            { label: "Edit", icon: <Edit size={13} />, onClick: () => onToast("Opening contact editor...", "info") },
                            { label: "Delete", icon: <Trash2 size={13} />, onClick: () => handleDelete(c.id), danger: true, divider: true },
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

      {/* Add Contact Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Contact"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAdd} disabled={!newContact.email}>Add Contact</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" placeholder="Alex" value={newContact.firstName} onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })} />
            <Input label="Last name" placeholder="Rivera" value={newContact.lastName} onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })} />
          </div>
          <Input label="Email *" type="email" placeholder="alex@company.com" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
          <Input label="Company" placeholder="Acme Corp" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} />
          <Input label="Job title" placeholder="VP of Engineering" value={newContact.title} onChange={(e) => setNewContact({ ...newContact, title: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
