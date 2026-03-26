import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section>
      <h1>Annuaire SONABHY</h1>
      <p>Consultez la liste des employés et utilisez les filtres et la recherche sur la page Résultats.</p>
    </section>
  `,
})
export class HomeComponent {
  query = '';
  constructor(private router: Router) {}
  onSearch() {
    const q = this.query.trim();
    this.router.navigate(['/results'], { queryParams: q ? { q } : {} });
  }
}


