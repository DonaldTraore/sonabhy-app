import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Direction } from '../../services/api.service';

@Component({
  selector: 'app-admin-direction',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <section>
      <h2>Gestion des Directions</h2>
      <div class="grid">
        <form (ngSubmit)="addDirection()">
          <h3>Ajouter une direction</h3>
          <input [(ngModel)]="newDirection" name="direction" placeholder="Nom de la direction" required />
          <button type="submit">Ajouter</button>
          <ul>
            <li *ngFor="let d of directions">
              <input [(ngModel)]="d.nom" [ngModelOptions]="{standalone: true}" placeholder="Nom de la direction"
                     (blur)="saveDirectionRow(d)" (keyup.enter)="saveDirectionRow(d)" />
              <button type="button" (click)="saveDirectionRow(d)">Modifier</button>
              <button type="button" (click)="removeDirection(d.id)">Supprimer</button>
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
    input { padding: .55rem .65rem; border:1px solid var(--border); border-radius:.4rem; outline:none; }
    input:focus { box-shadow: 0 0 0 3px rgba(17,122,61,.15); border-color: var(--green); }
    button { padding: .5rem .75rem; border-radius: .4rem; border:1px solid var(--border); background:#fff; cursor: pointer; }
    button:hover { background:#f3f4f6; }
    form button[type="submit"] { background: var(--red); color:#fff; border-color: var(--red); }
    form button[type="submit"]:hover { filter: brightness(1.05); }
    ul { list-style: none; margin: .5rem 0 0; padding: 0; display: grid; gap: .6rem; }
    ul li { display: grid; gap: .5rem; align-items: center; grid-template-columns: 1fr auto auto; }
  `]
})
export class AdminDirectionComponent implements OnInit {
  directions: Direction[] = [];
  newDirection = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDirections();
  }

  loadDirections() {
    this.api.getDirections().subscribe({
      next: (data) => this.directions = data,
      error: (err) => console.error('Erreur chargement directions:', err)
    });
  }

  addDirection() {
    if (!this.newDirection.trim()) return;
    
    this.api.createDirection({ nom: this.newDirection }).subscribe({
      next: () => {
        this.newDirection = '';
        this.loadDirections();
      },
      error: (err) => console.error('Erreur ajout direction:', err)
    });
  }

  saveDirectionRow(direction: Direction) {
    if (!direction.nom.trim()) return;
    
    this.api.updateDirection(direction.id, { nom: direction.nom }).subscribe({
      next: () => this.loadDirections(),
      error: (err) => console.error('Erreur mise à jour direction:', err)
    });
  }

  removeDirection(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette direction ? Cela supprimera aussi tous les services et employés associés.')) return;
    
    this.api.deleteDirection(id).subscribe({
      next: () => this.loadDirections(),
      error: (err) => console.error('Erreur suppression direction:', err)
    });
  }
}
