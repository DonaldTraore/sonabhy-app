import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-service',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <section>
      <h2>Gestion des Services</h2>
      <div class="grid">
        <form (ngSubmit)="addService()">
          <h3>Ajouter un service</h3>
          <select [(ngModel)]="directionId" name="directionId" required>
            <option *ngFor="let d of directions" [ngValue]="d.id">{{ d.nom }}</option>
          </select>
          <input [(ngModel)]="newService" name="service" placeholder="Nom du service" required />
          <button type="submit">Ajouter</button>
          <ul>
            <li *ngFor="let s of services">
              <input [(ngModel)]="s.nom" [ngModelOptions]="{standalone: true}" placeholder="Nom du service"
                     (blur)="saveServiceRow(s)" (keyup.enter)="saveServiceRow(s)" />
              <select [(ngModel)]="s.directionId" [ngModelOptions]="{standalone: true}"
                      (change)="saveServiceRow(s)">
                <option *ngFor="let d of directions" [ngValue]="d.id">{{ d.nom }}</option>
              </select>
              <button type="button" (click)="saveServiceRow(s)">Modifier</button>
              <button type="button" (click)="removeService(s.id)">Supprimer</button>
            </li>
          </ul>
        </form>
      </div>
    </section>
  `,
  styles: [`
    :host { --green:#117a3d; --yellow:#f3c613; --red:#c5161d; --border:#e5e7eb; --black:#111827; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 1rem; align-items: start; max-width: 800px; margin: 0 auto; }
    form { display: grid; gap: .6rem; border: 1px solid var(--border); padding: 1rem; border-radius: .6rem; background:#fff; box-shadow: 0 6px 16px rgba(0,0,0,.06); }
    form h3 { margin: 0 0 .25rem 0; color: var(--black); background: linear-gradient(90deg, var(--red), var(--green)); color: #fff; padding: .5rem .75rem; border-radius: .5rem; }
    input, select { padding: .55rem .65rem; border:1px solid var(--border); border-radius:.4rem; outline:none; }
    input:focus, select:focus { box-shadow: 0 0 0 3px rgba(17,122,61,.15); border-color: var(--green); }
    button { padding: .5rem .75rem; border-radius: .4rem; border:1px solid var(--border); background:#fff; cursor: pointer; }
    button:hover { background:#f3f4f6; }
    form button[type="submit"] { background: var(--green); color:#fff; border-color: var(--green); }
    form button[type="submit"]:hover { filter: brightness(1.05); }
    ul { list-style: none; margin: .5rem 0 0; padding: 0; display: grid; gap: .6rem; }
    ul li { display: grid; gap: .5rem; align-items: center; grid-template-columns: 1fr 1fr auto auto; }
  `]
})
export class AdminServiceComponent {
  directions: Array<{ id: number; nom: string }> = [];
  services: Array<{ id: number; nom: string; direction_id: number; directionId: number }> = [];
  newService = '';
  directionId: number | undefined;
  saveServiceOk = false;

  constructor(private api: ApiService) {
    this.refreshAll();
  }

  private refreshAll() {
    this.api.getDirections().subscribe(d => {
      this.directions = d;
      if (!this.directionId) this.directionId = d[0]?.id;
    });
    this.api.getServices().subscribe(s => {
      this.services = s.map(x => ({ ...x, directionId: x.direction_id }));
    });
  }

  addService() {
    if (!this.newService.trim() || !this.directionId) return;
    this.api.createService({ nom: this.newService.trim(), direction_id: this.directionId }).subscribe({
      next: () => { this.newService = ''; this.refreshAll(); alert('Service ajouté'); },
      error: (err) => { console.error('createService failed', err); alert('Échec ajout service'); }
    });
  }

  removeService(id: number) { 
    if(confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
        this.api.deleteService(id).subscribe({ next: () => { this.refreshAll(); alert('Service supprimé'); }, error: (e) => { console.error('deleteService failed', e); alert('Échec suppression service'); } }); 
    }
  }

  saveServiceRow(s: { id: number; nom: string; directionId: number }) {
    this.api.updateService(s.id, { nom: s.nom.trim(), direction_id: s.directionId }).subscribe(ns => {
      const mapped = { ...ns, directionId: ns.direction_id };
      const i = this.services.findIndex(x => x.id === ns.id);
      if (i >= 0) this.services[i] = mapped; else this.refreshAll();
      this.saveServiceOk = true;
      setTimeout(() => this.saveServiceOk = false, 1500);
      alert('Service modifié');
    });
  }
}
