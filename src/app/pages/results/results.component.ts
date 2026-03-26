import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Observable, of } from 'rxjs';
import type { Employee as ApiEmployee, Direction as ApiDirection, Service as ApiServiceType } from '../../services/api.service';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section>
      <h2>Recherches</h2>

      <form class="filters" (ngSubmit)="onSubmit()">
        <input type="text" [(ngModel)]="currentQuery" name="q" placeholder="Rechercher (nom, prénom, email, téléphone, fonction)"
               autocomplete="off" autofocus
               (input)="onQueryChange()" (ngModelChange)="onQueryChange()" />
        <button type="submit">Rechercher</button>
        <select [(ngModel)]="directionId" name="direction" (change)="onDirectionChange()">
          <option [ngValue]="undefined">Toutes les directions</option>
          <option *ngFor="let d of directions" [ngValue]="d.id">{{ d.nom }}</option>
        </select>

        <select [(ngModel)]="serviceId" name="service" (change)="onServiceChange()">
          <option [ngValue]="undefined">Tous les services</option>
          <option *ngFor="let s of services" [ngValue]="s.id">{{ s.nom }}</option>
        </select>
        <small *ngIf="pending" class="pending-hint">En attente de recherche… cliquez sur "Rechercher"</small>
      </form>

      <p *ngIf="filtered.length">{{ filtered.length }} résultat(s)</p>
      <p *ngIf="!filtered.length && !pending">Aucun résultat</p>

      <div class="cards">
        <article class="card" *ngFor="let e of filtered">
          <h3>{{ e.prenom }} {{ e.nom }}</h3>
          <p>{{ e.fonction }}</p>
          <small>{{ serviceName(e.serviceId) }} • {{ directionNameOf(e.serviceId) }}</small>
          <div class="contact">
            <div *ngIf="e.telephone">📞 {{ e.telephone }}</div>
            <div *ngIf="e.email">✉️ {{ e.email }}</div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
    .filters {
      display: grid;
      grid-template-columns: 2fr auto 1fr 1fr;
      gap: .75rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    .card {
      border: 1px solid #e5e7eb;
      border-radius: .5rem;
      padding: 1rem;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .card h3 { margin: 0 0 .25rem 0; }
    .card p { margin: 0 0 .5rem 0; color: #374151; }
    .card small { color: #6b7280; }
    .card .contact { margin-top: .5rem; display: grid; gap: .25rem; }

    .pending-hint {
      color: #6b7280;
      margin-top: .25rem;
      display: inline-block;
    }

    @media (max-width: 900px) {
      .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .filters { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 600px) {
      .cards { grid-template-columns: 1fr; }
      .filters { grid-template-columns: 1fr; }
    }
    `
  ]
})
export class ResultsComponent {
  directions: ApiDirection[] = [];
  services: ApiServiceType[] = [];

  directionId: number | undefined = undefined;
  serviceId: number | undefined = undefined;
  viewMode: 'list' | 'card' = 'card';
  pending = false; // indicates inputs changed since last submit

  // Use a local shape for display compatibility (serviceId alias)
  filtered: Array<ApiEmployee & { serviceId: number }> = [];
  currentQuery = '';
  private showAllExplicit = false; // when user clicks Rechercher with no filters, show everyone

  constructor(private route: ActivatedRoute, private api: ApiService, private history: HistoryService) {
    // load directions/services initially
    this.api.getDirections().subscribe(d => this.directions = d);
    this.api.getServices().subscribe(s => this.services = s);
    this.directionId = undefined;
    this.serviceId = undefined;
    this.route.queryParamMap.subscribe((params) => {
      const q = (params.get('q') || '');
      this.currentQuery = q;
      // Ne pas rechercher automatiquement: attendre un clic explicite
      this.showAllExplicit = false;
      this.pending = !!q;
      this.filtered = [];
    });
  }

  private normalize(value: string): string {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // strip accents
  }

  onDirectionChange() {
    this.api.getServices(this.directionId).subscribe(s => this.services = s);
    if (this.serviceId && !this.services.some(s => s.id === this.serviceId)) {
      this.serviceId = undefined;
    }
    // Do not auto-apply filters; wait for explicit submit
    this.showAllExplicit = false;
    this.pending = true;
    this.filtered = [];
  }

  onQueryChange() {
    // Typing should not trigger filtering; require explicit submit
    this.showAllExplicit = false;
    this.pending = true;
    this.filtered = [];
  }

  onSubmit() {
    const q = (this.currentQuery || '').trim();
    // If nothing is set, show everyone explicitly
    if (!q && !this.directionId && !this.serviceId) {
      this.showAllExplicit = true;
    }
    console.log('onSubmit search with', { q: this.currentQuery, directionId: this.directionId, serviceId: this.serviceId });
    this.applyFilters(this.currentQuery).subscribe({
      next: (emps) => {
        console.log('search response', emps);
        this.filtered = emps.map(e => ({ ...e, serviceId: e.service_id }));
        this.pending = false;
        const ids = this.filtered.map(e => e.id);
        if (ids.length) this.history.addSnapshot(ids);
      },
      error: () => {
        console.error('search request failed');
        this.pending = false;
        this.filtered = [];
      }
    });
  }

  applyFilters(query: string = ''): Observable<ApiEmployee[]> {
    const q = (query || '').trim();
    const hasAnyFilter = !!q || !!this.directionId || !!this.serviceId || this.showAllExplicit;
    if (!hasAnyFilter) { this.filtered = []; return of([]); }
    return this.api.getEmployees({ q, directionId: this.directionId, serviceId: this.serviceId });
  }

  onServiceChange() {
    // Do not auto-apply; just mark pending and clear current results
    this.showAllExplicit = false;
    this.pending = true;
    this.filtered = [];
  }

  directionIdOf(serviceId: number): number | undefined {
    const s = this.services.find(x => x.id === serviceId);
    return s?.direction_id;
  }

  directionNameOf(serviceId: number): string | undefined {
    const dirId = this.directionIdOf(serviceId);
    return dirId ? this.directions.find(d => d.id === dirId)?.nom : undefined;
  }

  serviceName(serviceId: number): string | undefined {
    return this.services.find(s => s.id === serviceId)?.nom;
  }
}


