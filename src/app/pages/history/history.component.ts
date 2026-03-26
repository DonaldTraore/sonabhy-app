import { Component } from '@angular/core';
declare const XLSX: any; // SheetJS global from index.html
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../services/history.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>Historique des recherches</h2>
      <div class="actions">
        <button (click)="clear()">Vider</button>
        <ng-container *ngIf="entries.length">
          <button (click)="exportAllCSV()">Exporter Excel (tout)</button>
          <button (click)="exportAllPDF()">Exporter PDF (tout)</button>
        </ng-container>
      </div>
      <div *ngIf="!entries.length">Aucun historique.</div>

      <ng-container *ngFor="let day of days">
        <div class="day">
          <h3>{{ day | date:'fullDate' }}</h3>
          <div class="export">
            <button (click)="exportDayCSV(day)">Exporter Excel (jour)</button>
            <button (click)="exportDayPDF(day)">Exporter PDF (jour)</button>
          </div>
          <table>
            <thead><tr><th>Nom</th><th>Fonction</th><th>Service</th><th>Direction</th><th>Email</th><th>Téléphone</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of employeesOfDay(day)">
                <td>{{ e.prenom }} {{ e.nom }}</td>
                <td>{{ e.fonction }}</td>
                <td>{{ serviceName(e.serviceId) }}</td>
                <td>{{ directionNameOf(e.serviceId) }}</td>
                <td>{{ e.email }}</td>
                <td>{{ e.telephone }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .actions { display:flex; justify-content:flex-end; margin-bottom:.75rem }
    table { width:100%; border-collapse: collapse; margin:.5rem 0 }
    th, td { border:1px solid #e5e7eb; padding:.5rem; text-align:left }
    .export { display:flex; gap:.5rem; margin:.5rem 0 1rem }
  `]
})
export class HistoryComponent {
  entries: ReturnType<HistoryService['getEntries']> = [];
  days: Date[] = [];
  // backend caches
  employees: Array<{ id:number; prenom:string; nom:string; fonction:string; email?:string; telephone?:string; service_id:number; serviceId:number }> = [];
  services: Array<{ id:number; nom:string; direction_id:number }> = [];
  directions: Array<{ id:number; nom:string }> = [];

  constructor(private history: HistoryService, private api: ApiService) {
    this.entries = this.history.getEntries();
    const groups = this.history.groupByDate(this.entries);
    this.days = Object.keys(groups).map(k => new Date(k));
    // Load backend data used to resolve IDs
    this.api.getDirections().subscribe(d => this.directions = d);
    this.api.getServices().subscribe(s => this.services = s);
    this.api.getEmployees().subscribe(e => {
      this.employees = e.map(x => ({ ...x, serviceId: x.service_id }));
    });
  }

  employeesOfDay(day: Date) {
    const key = day.toISOString().slice(0,10);
    const groups = this.history.groupByDate(this.entries);
    const list = groups[key] || [];
    const idSet = new Set<number>();
    for (const e of list) for (const id of e.employeeIds) idSet.add(id);
    return this.employees.filter(e => idSet.has(e.id));
  }
  serviceName(serviceId: number) { return this.services.find(s => s.id === serviceId)?.nom; }
  directionNameOf(serviceId: number) {
    const s = this.services.find(x => x.id === serviceId);
    return s ? this.directions.find(d => d.id === s.direction_id)?.nom : undefined;
  }

  clear() { this.history.clear(); this.entries = this.history.getEntries(); this.days = []; }

  exportDayCSV(day: Date) {
    // Build a real Excel workbook from day employees
    const data = this.mapEmployeesToExcelRows(this.employeesOfDay(day));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historique');
    XLSX.writeFile(wb, `historique_${day.toISOString().slice(0,10)}.xlsx`);
  }
  exportDayPDF(day: Date) {
    // Generate a real PDF and trigger download
    // @ts-ignore
    const { jsPDF } = (window as any).jspdf || (window as any).jspdf || {};
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgUrl = '/images/sonabhy-logo.png.jpg';
    const addHeader = (title: string) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const imgW = 20, imgH = 20;
          const x = (pageWidth - imgW) / 2;
          doc.addImage(img, 'PNG', x, 8, imgW, imgH);
          doc.setFontSize(14);
          doc.text(title, pageWidth / 2, 8 + imgH + 6, { align: 'center' });
          const autoTable = (doc as any).autoTable;
          const employees = this.employeesOfDay(day);
          const body = employees.map(e => [
            `${e.prenom} ${e.nom}`,
            e.fonction,
            this.serviceName(e.serviceId) || '',
            this.directionNameOf(e.serviceId) || '',
            e.email || '',
            e.telephone || ''
          ]);
          autoTable.call(doc, { startY: 8 + imgH + 10, head: [['Nom', 'Fonction', 'Service', 'Direction', 'Email', 'Téléphone']], body, styles: { fontSize: 10 } });
          doc.save(`historique_${day.toISOString().slice(0,10)}.pdf`);
        };
        img.onerror = () => {
          doc.setFontSize(14);
          doc.text(title, pageWidth / 2, 20, { align: 'center' });
          const autoTable = (doc as any).autoTable;
          const employees = this.employeesOfDay(day);
          const body = employees.map(e => [
            `${e.prenom} ${e.nom}`,
            e.fonction,
            this.history['directory'].findServiceName(e.serviceId) || '',
            (() => { const s = this.history['directory'].getServices().find((x: any) => x.id === e.serviceId); return s ? (this.history['directory'].findDirectionName(s.directionId) || '') : '' })(),
            e.email || '',
            e.telephone || ''
          ]);
          autoTable.call(doc, { startY: 28, head: [['Nom', 'Fonction', 'Service', 'Direction', 'Email', 'Téléphone']], body, styles: { fontSize: 10 } });
          doc.save(`historique_${day.toISOString().slice(0,10)}.pdf`);
        };
        img.src = imgUrl;
      } catch {
        doc.setFontSize(14);
        doc.text(title, pageWidth / 2, 20, { align: 'center' });
        const autoTable = (doc as any).autoTable;
        const employees = this.employeesOfDay(day);
        const body = employees.map(e => [
          `${e.prenom} ${e.nom}`,
          e.fonction,
          this.serviceName(e.serviceId) || '',
          this.directionNameOf(e.serviceId) || '',
          e.email || '',
          e.telephone || ''
        ]);
        autoTable.call(doc, { startY: 28, head: [['Nom', 'Fonction', 'Service', 'Direction', 'Email', 'Téléphone']], body, styles: { fontSize: 10 } });
        doc.save(`historique_${day.toISOString().slice(0,10)}.pdf`);
      }
    };
    addHeader(`Historique du ${day.toLocaleDateString()}`);
  }

  // Export complet au format Excel (.xlsx)
  exportAllCSV() {
    const idSet = new Set<number>();
    for (const e of this.entries) for (const id of e.employeeIds) idSet.add(id);
    const all = this.employees.filter(e => idSet.has(e.id));
    const data = this.mapEmployeesToExcelRows(all);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historique');
    XLSX.writeFile(wb, 'historique_complet.xlsx');
  }

  exportAllPDF() {
    // Generate a real PDF and trigger download
    // @ts-ignore
    const { jsPDF } = (window as any).jspdf || (window as any).jspdf || {};
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgUrl = '/images/sonabhy-logo.png.jpg';
    const addHeader = (title: string) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const imgW = 20, imgH = 20;
          const x = (pageWidth - imgW) / 2;
          doc.addImage(img, 'PNG', x, 8, imgW, imgH);
          doc.setFontSize(14);
          doc.text(title, pageWidth / 2, 8 + imgH + 6, { align: 'center' });
          const autoTable = (doc as any).autoTable;
          const idSet = new Set<number>();
          for (const e of this.entries) for (const id of e.employeeIds) idSet.add(id);
          const employees = this.employees.filter((x:any) => idSet.has(x.id));
          const body = employees.map(e => [
            `${e.prenom} ${e.nom}`,
            e.fonction,
            this.serviceName(e.serviceId) || '',
            this.directionNameOf(e.serviceId) || '',
            e.email || '',
            e.telephone || ''
          ]);
          autoTable.call(doc, { startY: 8 + imgH + 10, head: [['Nom', 'Fonction', 'Service', 'Direction', 'Email', 'Téléphone']], body, styles: { fontSize: 10 } });
          doc.save('historique_complet.pdf');
        };
        img.onerror = () => {
          doc.setFontSize(14);
          doc.text(title, pageWidth / 2, 20, { align: 'center' });
          const autoTable = (doc as any).autoTable;
          const idSet = new Set<number>();
          for (const e of this.entries) for (const id of e.employeeIds) idSet.add(id);
          const employees = this.employees.filter((x:any) => idSet.has(x.id));
          const body = employees.map(e => [
            `${e.prenom} ${e.nom}`,
            e.fonction,
            this.serviceName(e.serviceId) || '',
            this.directionNameOf(e.serviceId) || '',
            e.email || '',
            e.telephone || ''
          ]);
          autoTable.call(doc, { startY: 28, head: [['Nom', 'Fonction', 'Service', 'Direction', 'Email', 'Téléphone']], body, styles: { fontSize: 10 } });
          doc.save('historique_complet.pdf');
        };
        img.src = imgUrl;
      } catch {
        doc.setFontSize(14);
        doc.text(title, pageWidth / 2, 20, { align: 'center' });
        const autoTable = (doc as any).autoTable;
        const idSet = new Set<number>();
        for (const e of this.entries) for (const id of e.employeeIds) idSet.add(id);
        const employees = this.employees.filter((x:any) => idSet.has(x.id));
        const body = employees.map(e => [
          `${e.prenom} ${e.nom}`,
          e.fonction,
          this.serviceName(e.serviceId) || '',
          this.directionNameOf(e.serviceId) || '',
          e.email || '',
          e.telephone || ''
        ]);
        autoTable.call(doc, { startY: 28, head: [['Nom', 'Fonction', 'Service', 'Direction', 'Email', 'Téléphone']], body, styles: { fontSize: 10 } });
        doc.save('historique_complet.pdf');
      }
    };
    addHeader('HISTORIQUE COMPLET');
  }

  private mapEmployeesToExcelRows(employees: any[]) {
    const dir = (sid: number) => {
      const s = this.services.find((x: any) => x.id === sid);
      return s ? (this.directions.find(d => d.id === s.direction_id)?.nom || '') : '';
    };
    return employees.map(e => ({
      ID: e.id,
      Prenom: e.prenom,
      Nom: e.nom,
      Fonction: e.fonction,
      Service: this.serviceName(e.serviceId) || '',
      Direction: dir(e.serviceId),
      Email: e.email || '',
      Telephone: e.telephone || ''
    }));
  }
}


