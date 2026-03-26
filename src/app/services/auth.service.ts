import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'sonabhy_token';
  private readonly roleKey = 'sonabhy_role'; // 'admin' | 'user'
  private readonly usersKey = 'sonabhy_users'; // storage for mock users
  private readonly _isAuthenticated = signal<boolean>(!!localStorage.getItem(this.tokenKey));

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  getRole(): 'admin' | 'user' | null {
    return (localStorage.getItem(this.roleKey) as 'admin' | 'user' | null) ?? null;
  }

  login(username: string, password: string): boolean {
    // Admin fixe
    if (username === 'Administrateur' && password === '2Na@1234') {
      localStorage.setItem(this.tokenKey, 'mock-admin');
      localStorage.setItem(this.roleKey, 'admin');
      this._isAuthenticated.set(true);
      return true;
    }
    // Utilisateur simple (mock): vérifier dans le registre local
    if (username && password) {
      const users = this.readUsers();
      const found = users.find(u => u.fullName.toLowerCase() === username.toLowerCase() && u.password === password);
      if (found) {
        localStorage.setItem(this.tokenKey, 'mock-token');
        localStorage.setItem(this.roleKey, 'user');
        this._isAuthenticated.set(true);
        return true;
      }
    }
    return false;
  }

  registerUser(firstName: string, lastName: string, email: string, password: string): { ok: boolean; message?: string } {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!firstName || !lastName || !email || !password) {
      return { ok: false, message: 'Champs requis manquants' };
    }
    const users = this.readUsers();
    if (users.some(u => u.fullName.toLowerCase() === fullName.toLowerCase())) {
      return { ok: false, message: 'Utilisateur déjà existant' };
    }
    users.push({ fullName, email, password });
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return { ok: true };
  }

  private readUsers(): Array<{ fullName: string; email: string; password: string }> {
    try {
      const raw = localStorage.getItem(this.usersKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this._isAuthenticated.set(false);
    this.router.navigateByUrl('/');
  }
}


