import { Injectable } from '@angular/core';
import { DirectoryMockService, Employee } from './directory-mock.service';

type HistoryEntry = { timestamp: number; employeeIds: number[] };

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly key = 'sonabhy_history_entries';

  constructor(private directory: DirectoryMockService) {}

  addSnapshot(employeeIds: number[]) {
    const ids = Array.from(new Set(employeeIds));
    if (!ids.length) return;
    const entries = this.getEntries();
    entries.push({ timestamp: Date.now(), employeeIds: ids });
    localStorage.setItem(this.key, JSON.stringify(entries));
  }

  getEntries(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  clear() { localStorage.removeItem(this.key); }

  // Flatten employees for an entry
  employeesFor(entry: HistoryEntry): Employee[] {
    const all = this.directory.getEmployees();
    return entry.employeeIds
      .map(id => all.find(e => e.id === id))
      .filter((e): e is Employee => !!e);
  }

  // Utilities for grouping by date (YYYY-MM-DD)
  private dateKey(ts: number): string {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }

  groupByDate(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
    return entries.reduce((acc, e) => {
      const k = this.dateKey(e.timestamp);
      (acc[k] ||= []).push(e);
      return acc;
    }, {} as Record<string, HistoryEntry[]>);
  }

  employeesForEntries(entries: HistoryEntry[]): Employee[] {
    const seen = new Set<number>();
    const result: Employee[] = [];
    for (const entry of entries) {
      for (const emp of this.employeesFor(entry)) {
        if (!seen.has(emp.id)) {
          seen.add(emp.id);
          result.push(emp);
        }
      }
    }
    return result;
  }

  toCSV(employees: Employee[]): string {
    const header = ['id','prenom','nom','fonction','service','direction','email','telephone'];
    const rows = employees.map(e => {
      const service = this.directory.findServiceName(e.serviceId) || '';
      const dirId = (this.directory.getServices().find(s => s.id === e.serviceId)?.directionId) || 0;
      const direction = dirId ? (this.directory.findDirectionName(dirId) || '') : '';
      return [e.id, e.prenom, e.nom, e.fonction, service, direction, e.email || '', e.telephone || '']
        .map(v => String(v).replaceAll('"','""'))
        .map(v => `"${v}` + `"`).join(',');
    });
    return [header.join(','), ...rows].join('\n');
  }
}


