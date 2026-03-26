import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <h2>Administration</h2>
      <div class="actions">
        <a class="btn" routerLink="/admin/list">Liste globale</a>
      </div>
      
      <div class="dashboard-grid">
        <div class="card direction-card">
          <h3>Directions</h3>
          <p>Gérer les directions de l'entreprise.</p>
          <a routerLink="/admin/directions" class="card-btn">Gérer les Directions</a>
        </div>

        <div class="card service-card">
          <h3>Services</h3>
          <p>Gérer les services rattachés aux directions.</p>
          <a routerLink="/admin/services" class="card-btn">Gérer les Services</a>
        </div>

        <div class="card employee-card">
          <h3>Employés</h3>
          <p>Gérer les employés et leurs affectations.</p>
          <a routerLink="/admin/employees" class="card-btn">Gérer les Employés</a>
        </div>
      </div>

    </section>
  `,
  styles: [`
    :host { --green:#117a3d; --yellow:#f3c613; --red:#c5161d; --border:#e5e7eb; --black:#111827; }

    .dashboard-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
      gap: 1.5rem; 
      margin-top: 2rem;
    }

    .card {
      border: 1px solid var(--border);
      border-radius: .6rem;
      padding: 1.5rem;
      background: #fff;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0,0,0,0.1);
    }

    .card h3 {
      margin-top: 0;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .direction-card h3 { color: var(--red); }
    .service-card h3 { color: var(--green); }
    .employee-card h3 { color: var(--yellow); text-shadow: 0px 0px 1px #000; } /* Yellow can be hard to read on white */

    .card p {
      color: #6b7280;
      margin-bottom: 1.5rem;
      flex-grow: 1;
    }

    .card-btn {
      display: inline-block;
      padding: .5rem 1rem;
      background-color: var(--black);
      color: #fff;
      text-decoration: none;
      border-radius: .4rem;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .card-btn:hover {
      background-color: #374151;
    }

    .actions { display:flex; justify-content: flex-end; gap: .5rem; margin-bottom: .75rem; }
    .actions .btn { padding: .5rem .75rem; border: 1px solid var(--black); border-radius: .4rem; text-decoration: none; background:#111827; color:#fff; }
    .actions .btn:hover { filter: brightness(1.1); }
  `]
})
export class AdminComponent { }
