import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DirectoryMockService, Employee } from '../../services/directory-mock.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section *ngIf="employee; else notFound">
      <article class="card">
        <h2>{{ employee.prenom }} {{ employee.nom }}</h2>
        <p class="fn">{{ employee.fonction }}</p>
        <p class="meta">{{ serviceName(employee.serviceId) }} • {{ directionNameOf(employee.serviceId) }}</p>
        <div class="contact">
          <div *ngIf="employee.telephone">📞 {{ employee.telephone }}</div>
          <div *ngIf="employee.email">✉️ {{ employee.email }}</div>
        </div>
      </article>
      <div class="footer-actions">
        <button (click)="goBack()">← Retour</button>
      </div>
    </section>
    <ng-template #notFound>
      <p>Employé introuvable.</p>
    </ng-template>
  `,
  styles: [`
    .card { border:1px solid #e5e7eb; border-radius:.5rem; padding:1rem; background:#fff; max-width:540px }
    .fn { margin:.25rem 0; color:#374151 }
    .meta { color:#6b7280; margin-bottom:.5rem }
    .contact { display:grid; gap:.25rem }
    .footer-actions { margin-top: .75rem }
  `]
})
export class EmployeeDetailComponent {
  employee: Employee | undefined;
  constructor(private route: ActivatedRoute, private directory: DirectoryMockService) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.employee = this.directory.getEmployees().find(e => e.id === id);
  }

  directionNameOf(serviceId: number): string | undefined {
    const s = this.directory.getServices().find(x => x.id === serviceId);
    return s ? this.directory.findDirectionName(s.directionId) : undefined;
  }

  serviceName(serviceId: number): string | undefined {
    return this.directory.findServiceName(serviceId);
  }

  goBack() {
    history.length > 1 ? history.back() : location.assign('/results');
  }
}


