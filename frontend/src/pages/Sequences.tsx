import React, { useState } from "react";
import { Plus, MoreHorizontal, Edit, Copy, Trash2, GitBranch, Clock, Mail } from "lucide-react";
import { Button, Badge, Card, Dropdown, Modal, Input, EmptyState } from "../components/ui";
import { sequences as initialSequences } from "../data";
import type { Sequence } from "../types";

interface SequencesProps {
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const SAMPLE_STEPS = [
  { num: 1, delay: "Immediately", subject: "Quick question, {{firstName}}", preview: "Hi {{firstName}}, I noticed that {{company}} is..." },
  { num: 2, delay: "Wait 2 days", subject: "Following up", preview: "Just wanted to bump this up in your inbox..." },
  { num: 3, delay: "Wait 4 days", subject: "Closing the loop", preview: "I'll keep this short — if now's not the right time..." },
];

export default function Sequences({ onToast }: SequencesProps) {
  const [sequences, setSequences] = useState<Sequence[]>(initialSequences);
  const [selected, setSelected] = useState<Sequence | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    const seq: Sequence = {
      id: `seq${Date.now()}`,
      name: newName || "Untitled Sequence",
      campaign: "—",
      steps: 1,
      contacts: 0,
      active: false,
      updatedAt: new Date().toISOString(),
    };
    setSequences([seq, ...sequences]);
    setNewOpen(false);
    setNewName("");
    onToast("Sequence created", "success");
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">Sequences</h2>
          <p className="text-sm text-slate-500 mt-0.5">Build and manage multi-step email sequences for your campaigns.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setNewOpen(true)}>
          <Plus size={14} />
          New Sequence
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Sequence list */}
        <div className="xl:col-span-1 space-y-3">
          {sequences.length === 0 ? (
            <EmptyState
              icon={<GitBranch size={20} />}
              title="No sequences yet"
              description="Create your first email sequence."
              action={<Button variant="primary" size="sm" onClick={() => setNewOpen(true)}><Plus size={13} /> New Sequence</Button>}
            />
          ) : sequences.map((seq) => (
            <Card
              key={seq.id}
              className={`p-4 cursor-pointer transition-all ${selected?.id === seq.id ? "border-indigo-300 shadow-indigo-100 shadow-sm" : ""}`}
              onClick={() => setSelected(seq)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{seq.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{seq.campaign}</p>
                </div>
                <Dropdown
                  trigger={
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={13} />
                    </button>
                  }
                  items={[
                    { label: "Edit", icon: <Edit size={13} />, onClick: () => setSelected(seq) },
                    { label: "Duplicate", icon: <Copy size={13} />, onClick: () => onToast("Sequence duplicated", "success") },
                    { label: "Delete", icon: <Trash2 size={13} />, onClick: () => { setSequences((prev) => prev.filter((s) => s.id !== seq.id)); onToast("Sequence deleted", "success"); }, danger: true, divider: true },
                  ]}
                />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant={seq.active ? "active" : "draft"}>{seq.active ? "Active" : "Inactive"}</Badge>
                <span className="text-xs text-slate-500">{seq.steps} steps</span>
                <span className="text-xs text-slate-500">{seq.contacts} contacts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                Updated {new Date(seq.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </Card>
          ))}
        </div>

        {/* Sequence editor */}
        <div className="xl:col-span-2">
          {!selected ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <GitBranch size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">Select a sequence to view and edit its steps</p>
              <p className="text-xs text-slate-400 mt-1">Or create a new sequence to get started</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{selected.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sequence editor · {selected.steps} steps</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onToast("Sequence saved", "success")}>Save</Button>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {SAMPLE_STEPS.slice(0, Math.max(selected.steps, 2)).map((s, idx) => (
                  <div key={s.num} className="flex items-start gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center">{s.num}</div>
                      {idx < SAMPLE_STEPS.slice(0, Math.max(selected.steps, 2)).length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 my-2 min-h-[16px]" />
                      )}
                    </div>

                    <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          {s.num > 1 && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <Clock size={10} />{s.delay}
                            </span>
                          )}
                          {s.num === 1 && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                              <Mail size={10} />{s.delay}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Edit</button>
                          <button className="text-xs text-slate-400 hover:text-slate-600"><Copy size={12} /></button>
                          <button className="text-xs text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-800 mb-1">Subject: {s.subject}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{s.preview}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => { setSelected({ ...selected, steps: selected.steps + 1 }); onToast("Step added", "info"); }}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors ml-12"
                >
                  <Plus size={14} />
                  Add Step
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Sequence Modal */}
      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New Sequence"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>Create Sequence</Button>
          </>
        }
      >
        <Input
          label="Sequence name"
          placeholder="e.g. SaaS Cold Outreach (3-step)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </Modal>
    </div>
  );
}
