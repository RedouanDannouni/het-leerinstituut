"use client";

import { useEffect, useState } from "react";
import { CalendarClock, UserPlus, X } from "lucide-react";
import type { TenantId } from "@/lib/domain/types";
import { Field, Input, Select } from "@/components/ui/Form";
import { assignUser, listAssignments, removeAssignment } from "@/lib/paths/store";
import type { PathAssignment } from "@/lib/paths/types";
import { personInitials, type Person } from "@/lib/paths/people";

export function AssignStep({
  tenantId,
  pathId,
  people,
  canAssign,
}: {
  tenantId: TenantId;
  pathId: string;
  people: Person[];
  canAssign: boolean;
}) {
  const [assignments, setAssignments] = useState<PathAssignment[]>([]);
  const [picked, setPicked] = useState("");
  const [due, setDue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void listAssignments(tenantId, pathId).then((list) => {
      if (active) {
        setAssignments(list);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [tenantId, pathId]);

  const assignedIds = new Set(assignments.map((a) => a.userId));
  const candidates = people.filter((p) => !assignedIds.has(p.id));

  const handleAdd = async () => {
    if (!picked) return;
    const assignment = await assignUser(tenantId, pathId, picked, due ? new Date(due).toISOString() : null);
    setAssignments((current) => [...current, assignment]);
    setPicked("");
    setDue("");
  };

  const handleRemove = async (assignment: PathAssignment) => {
    setAssignments((current) => current.filter((a) => a.id !== assignment.id));
    await removeAssignment(tenantId, assignment.id);
  };

  const personById = (id: string | null) => people.find((p) => p.id === id);

  return (
    <div className="wizard-step stack">
      <div className="card stack-sm">
        <div className="card-header">
          <div>
            <h3>Toewijzen aan deelnemers</h3>
            <p className="muted">Kies wie dit leerpad krijgt. Publiceren kan ook zonder toewijzing — later toewijzen mag.</p>
          </div>
        </div>

        {canAssign ? (
          <div className="grid grid-2" style={{ alignItems: "end" }}>
            <Field label="Deelnemer">
              <Select value={picked} onChange={(event) => setPicked(event.target.value)}>
                <option value="">Kies een deelnemer…</option>
                {candidates.map((person) => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Deadline (optioneel)">
              <Input type="date" value={due} onChange={(event) => setDue(event.target.value)} />
            </Field>
            <div>
              <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={!picked}>
                <UserPlus size={15} aria-hidden /> Toewijzen
              </button>
            </div>
          </div>
        ) : (
          <p className="muted">Je hebt geen rechten om toe te wijzen. Vraag een coach of teamleider.</p>
        )}
      </div>

      <div className="card stack-sm">
        <h3>Toegewezen ({assignments.length})</h3>
        {loading ? (
          <p className="muted">Laden…</p>
        ) : assignments.length ? (
          <ul className="assignment-list">
            {assignments.map((assignment) => {
              const person = personById(assignment.userId);
              return (
                <li key={assignment.id} className="assignment-row">
                  <span className="avatar avatar--sm" aria-hidden>{person ? personInitials(person) : "?"}</span>
                  <div className="assignment-main">
                    <strong>{person?.name ?? "Onbekende deelnemer"}</strong>
                    {assignment.dueAt ? (
                      <span className="muted assignment-due">
                        <CalendarClock size={12} aria-hidden /> deadline {new Date(assignment.dueAt).toLocaleDateString("nl-NL")}
                      </span>
                    ) : null}
                  </div>
                  {canAssign ? (
                    <button type="button" className="icon-btn icon-btn--danger" aria-label="Toewijzing verwijderen" onClick={() => handleRemove(assignment)}>
                      <X size={15} aria-hidden />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">Nog niemand toegewezen.</p>
        )}
      </div>
    </div>
  );
}
