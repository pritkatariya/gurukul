import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaXmark, FaPlus, FaTrash, FaFloppyDisk, FaRotateLeft } from "react-icons/fa6";
import type { CanvasElement, Connection, ElementEvent, EventType, ActionType } from "./EditorTypes";
import { EVENT_TYPES, ACTION_TYPES, EVENT_TYPE_LABELS, ACTION_TYPE_LABELS } from "./EditorTypes";

type Tab = "connections" | "events" | "code";

interface LogicPanelProps {
  open: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  selectedElementId: string | null;
  connections: Connection[];
  onAddConnection: (conn: Connection) => void;
  onDeleteConnection: (id: string) => void;
  onUpdateConnection: (id: string, patch: Partial<Connection>) => void;
  onAddEvent: (elementId: string, event: ElementEvent) => void;
  onDeleteEvent: (elementId: string, eventId: string) => void;
  onUpdateCode: (elementId: string, code: string, language: string) => void;
}

export default function LogicPanel({
  open,
  onClose,
  elements,
  selectedElementId,
  connections,
  onAddConnection,
  onDeleteConnection,
  onUpdateConnection,
  onAddEvent,
  onDeleteEvent,
  onUpdateCode,
}: LogicPanelProps) {
  const [tab, setTab] = useState<Tab>("connections");
  const [newSource, setNewSource] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newEventType, setNewEventType] = useState<EventType>("onClick");
  const [newActionType, setNewActionType] = useState<ActionType>("navigate");
  const [newLabel, setNewLabel] = useState("");
  const [newParams, setNewParams] = useState("");

  const [newEventEventType, setNewEventEventType] = useState<EventType>("onClick");
  const [newEventActionType, setNewEventActionType] = useState<ActionType>("navigate");
  const [newEventTarget, setNewEventTarget] = useState("");
  const [newEventParams, setNewEventParams] = useState("");

  const selectedElement = elements.find((el) => el.id === selectedElementId) ?? null;

  const addConnection = () => {
    if (!newSource || !newTarget || newSource === newTarget) return;
    const conn: Connection = {
      id: crypto.randomUUID(),
      sourceElementId: newSource,
      targetElementId: newTarget,
      eventType: newEventType,
      actionType: newActionType,
      label: newLabel || `${EVENT_TYPE_LABELS[newEventType]} → ${ACTION_TYPE_LABELS[newActionType]}`,
      params: newParams,
    };
    onAddConnection(conn);
    setNewLabel("");
    setNewParams("");
  };

  const addEvent = () => {
    if (!selectedElementId) return;
    const evt: ElementEvent = {
      id: crypto.randomUUID(),
      eventType: newEventEventType,
      actionType: newEventActionType,
      targetElementId: newEventTarget,
      params: newEventParams,
    };
    onAddEvent(selectedElementId, evt);
    setNewEventParams("");
  };

  const elementLabel = (id: string) => {
    const el = elements.find((e) => e.id === id);
    return el ? `${el.type} "${el.text.slice(0, 20)}"` : id.slice(0, 8);
  };

  const selectCls = "h-8 rounded-lg bg-slate-50 px-2 text-[11px] font-semibold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-300";
  const inputCls = "h-8 rounded-lg bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-blue-300";
  const btnCls = "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 32 }}
          className="fixed right-0 top-0 z-[9998] flex h-full w-[310px] flex-col border-l border-slate-200/60 bg-white/95 shadow-[-12px_0_40px_rgba(15,23,42,0.1)] backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-[13px] font-black text-slate-800">Logic</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
              <FaXmark size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {(["connections", "events", "code"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  tab === t ? "border-b-2 border-blue-500 text-blue-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {/* CONNECTIONS TAB */}
            {tab === "connections" && (
              <div className="grid gap-4">
                <div className="grid gap-2.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">New Connection</p>
                  <div className="grid gap-1.5">
                    <label className="grid gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Source</span>
                      <select value={newSource} onChange={(e) => setNewSource(e.target.value)} className={selectCls}>
                        <option value="">Select source...</option>
                        {elements.map((el) => (
                          <option key={el.id} value={el.id}>{el.type} - {el.text.slice(0, 20)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Target</span>
                      <select value={newTarget} onChange={(e) => setNewTarget(e.target.value)} className={selectCls}>
                        <option value="">Select target...</option>
                        {elements.map((el) => (
                          <option key={el.id} value={el.id}>{el.type} - {el.text.slice(0, 20)}</option>
                        ))}
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <label className="grid gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Event</span>
                        <select value={newEventType} onChange={(e) => setNewEventType(e.target.value as EventType)} className={selectCls}>
                          {EVENT_TYPES.map((t) => (
                            <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Action</span>
                        <select value={newActionType} onChange={(e) => setNewActionType(e.target.value as ActionType)} className={selectCls}>
                          {ACTION_TYPES.map((a) => (
                            <option key={a} value={a}>{ACTION_TYPE_LABELS[a]}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="grid gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Label (optional)</span>
                      <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Connection label" className={inputCls} />
                    </label>
                    <label className="grid gap-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Params</span>
                      <input value={newParams} onChange={(e) => setNewParams(e.target.value)} placeholder="e.g. { color: 'red' }" className={inputCls} />
                    </label>
                    <button onClick={addConnection} disabled={!newSource || !newTarget || newSource === newTarget}
                      className={`${btnCls} justify-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed`}>
                      <FaPlus size={10} /> Add Connection
                    </button>
                  </div>
                </div>

                {connections.length > 0 && (
                  <div className="grid gap-2 border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Connections</p>
                    {connections.map((conn) => (
                      <div key={conn.id} className="rounded-xl bg-slate-50 p-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-600">{conn.label}</span>
                          <button onClick={() => onDeleteConnection(conn.id)} className="text-red-400 hover:text-red-600">
                            <FaTrash size={10} />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {elementLabel(conn.sourceElementId)} → {elementLabel(conn.targetElementId)}
                        </p>
                        <p className="mt-0.5 text-[9px] text-blue-500">
                          {EVENT_TYPE_LABELS[conn.eventType]} / {ACTION_TYPE_LABELS[conn.actionType]}
                        </p>
                        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                          <select value={conn.eventType} onChange={(e) => onUpdateConnection(conn.id, { eventType: e.target.value as EventType })} className={selectCls}>
                            {EVENT_TYPES.map((t) => (<option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>))}
                          </select>
                          <select value={conn.actionType} onChange={(e) => onUpdateConnection(conn.id, { actionType: e.target.value as ActionType })} className={selectCls}>
                            {ACTION_TYPES.map((a) => (<option key={a} value={a}>{ACTION_TYPE_LABELS[a]}</option>))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EVENTS TAB */}
            {tab === "events" && (
              <div className="grid gap-4">
                {selectedElement ? (
                  <>
                    <div className="grid gap-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Events for <span className="text-blue-600">{selectedElement.type}</span>
                      </p>
                      <div className="grid gap-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <label className="grid gap-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Event</span>
                            <select value={newEventEventType} onChange={(e) => setNewEventEventType(e.target.value as EventType)} className={selectCls}>
                              {EVENT_TYPES.map((t) => (<option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>))}
                            </select>
                          </label>
                          <label className="grid gap-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Action</span>
                            <select value={newEventActionType} onChange={(e) => setNewEventActionType(e.target.value as ActionType)} className={selectCls}>
                              {ACTION_TYPES.map((a) => (<option key={a} value={a}>{ACTION_TYPE_LABELS[a]}</option>))}
                            </select>
                          </label>
                        </div>
                        <label className="grid gap-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Target Component</span>
                          <select value={newEventTarget} onChange={(e) => setNewEventTarget(e.target.value)} className={selectCls}>
                            <option value="">None</option>
                            {elements.filter((el) => el.id !== selectedElementId).map((el) => (
                              <option key={el.id} value={el.id}>{el.type} - {el.text.slice(0, 20)}</option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Params</span>
                          <input value={newEventParams} onChange={(e) => setNewEventParams(e.target.value)} placeholder="Optional params" className={inputCls} />
                        </label>
                        <button onClick={addEvent}
                          className={`${btnCls} justify-center bg-blue-600 text-white hover:bg-blue-700`}>
                          <FaPlus size={10} /> Add Event
                        </button>
                      </div>
                    </div>

                    {(selectedElement.events ?? []).length > 0 && (
                      <div className="grid gap-2 border-t border-slate-100 pt-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Events</p>
                        {(selectedElement.events ?? []).map((evt) => (
                          <div key={evt.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                            <div>
                              <p className="text-[10px] font-bold text-slate-700">
                                {EVENT_TYPE_LABELS[evt.eventType]} → {ACTION_TYPE_LABELS[evt.actionType]}
                              </p>
                              {evt.targetElementId && (
                                <p className="text-[9px] text-slate-400">Target: {elementLabel(evt.targetElementId)}</p>
                              )}
                            </div>
                            <button onClick={() => onDeleteEvent(selectedElement.id, evt.id)} className="text-red-400 hover:text-red-600">
                              <FaTrash size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-[11px] text-slate-400">Select an element to manage its events</p>
                )}
              </div>
            )}

            {/* CODE TAB */}
            {tab === "code" && (
              <div className="grid gap-3">
                {selectedElement ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Code for <span className="text-blue-600">{selectedElement.type}</span>
                      </p>
                      <select
                        value={selectedElement.codeLanguage || "typescript"}
                        onChange={(e) => onUpdateCode(selectedElement.id, selectedElement.customCode || "", e.target.value)}
                        className={selectCls}
                      >
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="css">CSS</option>
                      </select>
                    </div>
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-8 overflow-hidden rounded-l-xl bg-slate-100 py-2 text-right pr-1.5">
                        {(selectedElement.customCode || "").split("\n").map((_, i) => (
                          <div key={i} className="text-[9px] leading-[18px] text-slate-400">{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        value={selectedElement.customCode || ""}
                        onChange={(e) => onUpdateCode(selectedElement.id, e.target.value, selectedElement.codeLanguage || "typescript")}
                        spellCheck={false}
                        className="h-64 w-full resize-none rounded-xl bg-slate-50 py-2 pl-10 pr-3 font-mono text-[11px] leading-[18px] text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-blue-300"
                        placeholder={`// Write custom ${selectedElement.codeLanguage || "typescript"} code for this ${selectedElement.type}...`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateCode(selectedElement.id, selectedElement.customCode || "", selectedElement.codeLanguage || "typescript")}
                        className={`${btnCls} bg-blue-600 text-white hover:bg-blue-700`}
                      >
                        <FaFloppyDisk size={10} /> Save
                      </button>
                      <button
                        onClick={() => onUpdateCode(selectedElement.id, "", selectedElement.codeLanguage || "typescript")}
                        className={`${btnCls} bg-slate-100 text-slate-600 hover:bg-slate-200`}
                      >
                        <FaRotateLeft size={10} /> Reset
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-[11px] text-slate-400">Select an element to edit its code</p>
                )}

                {/* Global code section */}
                <div className="border-t border-slate-100 pt-3">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">All Element Code</p>
                  {elements.filter((el) => el.customCode).map((el) => (
                    <div key={el.id} className="mb-1.5 rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-bold text-slate-600">{el.type} - {el.text.slice(0, 20)}</p>
                      <p className="mt-0.5 text-[9px] text-slate-400 line-clamp-2 font-mono">{el.customCode?.slice(0, 80)}</p>
                    </div>
                  ))}
                  {elements.every((el) => !el.customCode) && (
                    <p className="text-[9px] text-slate-400">No custom code defined yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
