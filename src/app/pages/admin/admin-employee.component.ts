import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-employee',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <section>
      <h2>Gestion des Employés</h2>
      <div class="grid">
        <form (ngSubmit)="addEmployee()">
          <h3>Ajouter un employé</h3>
          <select [(ngModel)]="serviceId" name="serviceId" required>
            <option *ngFor="let s of services" [ngValue]="s.id">{{ s.nom }}</option>
          </select>
          <input [(ngModel)]="prenom" name="prenom" placeholder="Prénom" required />
          <input [(ngModel)]="nom" name="nom" placeholder="Nom" required />
          <input [(ngModel)]="fonction" name="fonction" placeholder="Fonction" required />
          <input [(ngModel)]="email" name="email" placeholder="Email" type="email" />
          <input [(ngModel)]="telephone" name="telephone" placeholder="Téléphone" />
          <button type="submit">Ajouter</button>
          <ul>
            <li *ngFor="let e of employees">
              <div class="emp-grid">
                <input [(ngModel)]="e.prenom" [ngModelOptions]="{standalone: true}" placeholder="Prénom"
                       (blur)="saveEmployeeRow(e)" (keyup.enter)="saveEmployeeRow(e)" />
                <input [(ngModel)]="e.nom" [ngModelOptions]="{standalone: true}" placeholder="Nom"
                       (blur)="saveEmployeeRow(e)" (keyup.enter)="saveEmployeeRow(e)" />
                <input [(ngModel)]="e.fonction" [ngModelOptions]="{standalone: true}" placeholder="Fonction"
                       (blur)="saveEmployeeRow(e)" (keyup.enter)="saveEmployeeRow(e)" />
                <select [(ngModel)]="e.serviceId" [ngModelOptions]="{standalone: true}"
                        (change)="saveEmployeeRow(e)">
                  <option *ngFor="let s of services" [ngValue]="s.id">{{ s.nom }}</option>
                </select>
                <input [(ngModel)]="e.email" [ngModelOptions]="{standalone: true}" placeholder="Email"
                       (blur)="saveEmployeeRow(e)" (keyup.enter)="saveEmployeeRow(e)" />
                <input [(ngModel)]="e.telephone" [ngModelOptions]="{standalone: true}" placeholder="Téléphone"
                       (blur)="saveEmployeeRow(e)" (keyup.enter)="saveEmployeeRow(e)" />
                <button type="button" (click)="saveEmployeeRow(e)">Modifier</button>
                <button type="button" (click)="removeEmployee(e.id)">Supprimer</button>
              </div>
            </li>
          </ul>
        </form>
      </div>
    </section>
  `,
  styles: [`
    :host { --green:#117a3d; --yellow:#f3c613; --red:#c5161d; --border:#e5e7eb; --black:#111827; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 1rem; align-items: start; max-width: 1000px; margin: 0 auto; }
    form { display: grid; gap: .6rem; border: 1px solid var(--border); padding: 1rem; border-radius: .6rem; background:#fff; box-shadow: 0 6px 16px rgba(0,0,0,.06); }
    form h3 { margin: 0 0 .25rem 0; color: var(--black); background: linear-gradient(90deg, var(--green), var(--yellow)); color: #fff; padding: .5rem .75rem; border-radius: .5rem; }
    input, select { padding: .55rem .65rem; border:1px solid var(--border); border-radius:.4rem; outline:none; }
    input:focus, select:focus { box-shadow: 0 0 0 3px rgba(17,122,61,.15); border-color: var(--green); }
    button { padding: .5rem .75rem; border-radius: .4rem; border:1px solid var(--border); background:#fff; cursor: pointer; }
    button:hover { background:#f3f4f6; }
    form button[type="submit"], .emp-grid button:first-of-type { background: var(--green); color:#fff; border-color: var(--green); }
    form button[type="submit"]:hover, .emp-grid button:first-of-type:hover { filter: brightness(1.05); }
    ul { list-style: none; margin: .5rem 0 0; padding: 0; display: grid; gap: .6rem; }
    .emp-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .5rem; align-items: center; }
    .emp-grid input, .emp-grid select { width: 100%; }
  `]
})
export class AdminEmployeeComponent {
  services: Array<{ id: number; nom: string; direction_id: number; directionId: number }> = [];
  employees: Array<{ id: number; prenom: string; nom: string; fonction: string; service_id: number; serviceId: number; email?: string; telephone?: string }> = [];
  
  serviceId: number | undefined;
  prenom = '';
  nom = '';
  fonction = '';
  email = '';
  telephone = '';
  saveEmployeeOk = false;

  constructor(private api: ApiService) {
    this.refreshAll();
  }

  private refreshAll() {
    this.api.getServices().subscribe(s => {
      this.services = s.map(x => ({ ...x, directionId: x.direction_id }));
      const firstId = this.services[0]?.id;
      if (this.serviceId == null || !this.services.some(x => x.id === this.serviceId)) {
        this.serviceId = firstId;
      }
    });
    this.api.getEmployees().subscribe(e => this.employees = e.map(x => ({ ...x, serviceId: x.service_id })));
  }

  addEmployee() {
    if (this.serviceId == null && this.services.length) {
      this.serviceId = this.services[0].id;
    }
    if (!this.serviceId || !this.prenom.trim() || !this.nom.trim() || !this.fonction.trim()) {
      console.warn('addEmployee: missing required fields or serviceId');
      return;
    }
    this.api.createEmployee({ service_id: this.serviceId, prenom: this.prenom.trim(), nom: this.nom.trim(), fonction: this.fonction.trim(), email: this.email.trim() || undefined, telephone: this.telephone.trim() || undefined }).subscribe({
      next: () => { this.refreshAll(); this.prenom = this.nom = this.fonction = this.email = this.telephone = ''; alert('Employé ajouté'); },
      error: (err) => { console.error('createEmployee failed', err); alert('Échec ajout employé'); }
    });
  }

  removeEmployee(id: number) { 
    if(confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
        this.api.deleteEmployee(id).subscribe({ next: () => { this.refreshAll(); alert('Employé supprimé'); }, error: (e) => { console.error('deleteEmployee failed', e); alert('Échec suppression employé'); } }); 
    }
  }

  saveEmployeeRow(e: { id: number; prenom: string; nom: string; fonction: string; serviceId: number; email?: string; telephone?: string }) {
    this.api.updateEmployee(e.id, { prenom: e.prenom.trim(), nom: e.nom.trim(), fonction: e.fonction.trim(), service_id: e.serviceId, email: e.email?.trim(), telephone: e.telephone?.trim() })
      .subscribe(ne => {
        const mapped = { ...ne, serviceId: ne.service_id };
        const i = this.employees.findIndex(x => x.id === ne.id);
        if (i >= 0) this.employees[i] = mapped; else this.refreshAll();
        this.saveEmployeeOk = true;
        setTimeout(() => this.saveEmployeeOk = false, 1500);
        alert('Employé modifié');
      });
  }
}
