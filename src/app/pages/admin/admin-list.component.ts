import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <h2>Liste (Administration)</h2>
      <div class="filters">
        <input [(ngModel)]="q" placeholder="Filtrer..." />
      </div>

      <div class="cards">
        <article>
          <h3>Directions</h3>
          <table>
            <thead><tr><th>#</th><th>Nom</th></tr></thead>
            <tbody>
              <tr *ngFor="let d of directions" [hidden]="!matches(d.nom)">
                <td>{{ d.id }}</td><td>{{ d.nom }}</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article>
          <h3>Services</h3>
          <table>
            <thead><tr><th>#</th><th>Nom</th><th>Direction</th></tr></thead>
            <tbody>
              <tr *ngFor="let s of services" [hidden]="!matches(s.nom)">
                <td>{{ s.id }}</td><td>{{ s.nom }}</td><td>{{ directionNameById(s.directionId) }}</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article class="full">
          <h3>Employés</h3>
          <table>
            <thead><tr><th>#</th><th>Nom</th><th>Fonction</th><th>Service</th><th>Direction</th><th>Email</th><th>Téléphone</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of employees" [hidden]="!matches(e.prenom + ' ' + e.nom)">
                <td>{{ e.id }}</td>
                <td>{{ e.prenom }} {{ e.nom }}</td>
                <td>{{ e.fonction }}</td>
                <td>{{ serviceNameById(e.serviceId) }}</td>
                <td>{{ serviceDirectionId(e.serviceId) !== undefined ? directionNameById(serviceDirectionId(e.serviceId)!) : '' }}</td>
                <td>{{ e.email }}</td>
                <td>{{ e.telephone }}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </div>

      <div class="footer-actions">
        <button class="back" (click)="goBack()">← Retour</button>
      </div>
    </section>
  `,
  styles: [`
    .back { padding:.25rem .5rem }
    .filters { margin-bottom: .75rem; }
    input { padding: .5rem; width: 260px; }
    .cards { display:grid; grid-template-columns: 1fr 1fr; gap:1rem }
    .cards .full { grid-column: 1 / -1 }
    article { border:1px solid #e5e7eb; border-radius:.5rem; background:#fff; padding:1rem }
    table { width:100%; border-collapse: collapse; margin-top:.5rem }
    th, td { border:1px solid #e5e7eb; padding:.5rem; text-align:left }
    .footer-actions { margin-top: 1rem }
  `]
})
export class AdminListComponent {
  directions: Array<{ id:number; nom:string }> = [];
  services: Array<{ id:number; nom:string; direction_id:number; directionId:number }> = [];
  employees: Array<{ id:number; prenom:string; nom:string; fonction:string; email?:string; telephone?:string; service_id:number; serviceId:number }> = [];
  q = '';

  constructor(private api: ApiService) {
    this.api.getDirections().subscribe(d => this.directions = d);
    this.api.getServices().subscribe(s => this.services = s.map(x => ({ ...x, directionId: x.direction_id })));
    this.api.getEmployees().subscribe(e => this.employees = e.map(x => ({ ...x, serviceId: x.service_id })));
  }

  matches(value: string): boolean {
    if (!this.q.trim()) return true;
    return value.toLowerCase().includes(this.q.toLowerCase());
  }

  directionNameById(id: number): string | undefined {
    return this.directions.find(d => d.id === id)?.nom;
  }

  serviceNameById(id: number): string | undefined {
    return this.services.find(s => s.id === id)?.nom;
  }

  serviceDirectionId(serviceId: number): number | undefined {
    return this.services.find(s => s.id === serviceId)?.directionId;
  }

  goBack() {
    history.length > 1 ? history.back() : location.assign('/admin');
  }
}


