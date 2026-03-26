import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sonabhy');
  constructor(private auth: AuthService, private router: Router) {}
  loggedIn() { return this.auth.isLoggedIn(); }
  role() { return this.auth.getRole(); }
  logout() { this.auth.logout(); }
  isLoginPage() { return this.router.url.startsWith('/login'); }
  isHistoryPage() { return this.router.url.startsWith('/history'); }
}
