import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="screen">
    <div class="frame">
    <div class="login-shell">
      <aside class="brand-panel" aria-label="SONABHY">
        <div class="brand-content">
          <div class="brand-box">
            <div class="brand-title">SonabhyNexus</div>
            <img src="/images/sonabhy-logo.png.jpg" alt="Logo SONABHY" />
          </div>
        </div>
      </aside>
      <section class="login form-panel">
        <h2>Connexion</h2>

        <!-- Formulaire unique de connexion -->
        <form (ngSubmit)="onSubmit()" *ngIf="userMode==='login'">
          <input name="username" [(ngModel)]="username" placeholder="Identifiant ou nom complet" required />
          <div class="pwd">
            <input name="password" [(ngModel)]="password" placeholder="Mot de passe" [type]="showPwdLogin ? 'text' : 'password'" required />
            <button type="button" (click)="showPwdLogin = !showPwdLogin">{{ showPwdLogin ? 'Masquer' : 'Afficher' }}</button>
          </div>
          <button type="submit">Se connecter</button>
          <p *ngIf="error" class="error">Identifiants invalides</p>
        </form>

        <!-- Lien pour les nouveaux utilisateurs -->
        <div *ngIf="userMode==='login'" style="margin-top:.5rem">
          <small>Nouvel utilisateur ?</small>
          <button type="button" (click)="userMode='register'" style="background:#f3f4f6;color:var(--black);border:1px solid var(--border);">Créer un compte</button>
        </div>

        <!-- Formulaire d'inscription -->
        <form (ngSubmit)="onRegister()" *ngIf="userMode==='register'" style="margin-top:1rem">
          <div class="grid">
            <input name="firstName" [(ngModel)]="firstName" placeholder="Prénom" required />
            <input name="lastName" [(ngModel)]="lastName" placeholder="Nom" required />
          </div>
          <input name="email" [(ngModel)]="email" placeholder="Email" type="email" required />
          <div class="pwd">
            <input name="passwordR" [(ngModel)]="password" placeholder="Mot de passe" [type]="showPwdRegister ? 'text' : 'password'" required />
            <button type="button" (click)="showPwdRegister = !showPwdRegister">{{ showPwdRegister ? 'Masquer' : 'Afficher' }}</button>
          </div>
          <div style="display:flex; gap:.5rem; align-items:center;">
            <button type="submit">Créer un compte</button>
            <button type="button" (click)="userMode='login'" style="background:#f3f4f6;color:var(--black);border:1px solid var(--border);">Annuler</button>
          </div>
          <p *ngIf="registerError" class="error">{{ registerError }}</p>
          <p *ngIf="registerOk" class="ok">Compte créé, connectez-vous.</p>
        </form>
      </section>
    </div>
    </div>
    </div>
  `,
  styles: [
    `
    :host { --green:#117a3d; --red:#c5161d; --yellow:#f3c613; --black:#111827; --border:#e5e7eb; --bg:#f5f6f8; --blue:#0b4d8a; }
    .screen { 
      min-height: calc(100vh - 64px); display:flex; align-items:center; justify-content:center; padding: 2rem;
      /* SONABHY background: slightly more saturated green → yellow */
      background:
        radial-gradient(1000px 500px at 10% 15%, rgba(17,122,61,.28), transparent 60%),
        radial-gradient(800px 400px at 90% 85%, rgba(243,198,19,.28), transparent 60%),
        linear-gradient(120deg, #dff3e6 0%, #fff3cc 100%);
    }
    .frame { 
      width: min(1240px, 96vw);
      margin: 0 auto; padding: 7px; border-radius: 1.3rem;
      background: linear-gradient(90deg, var(--green), var(--yellow), var(--red));
      box-shadow: 0 10px 28px rgba(0,0,0,.06);
    }
    .login-shell {
      width: min(1100px, 92vw);
      display: grid;
      grid-template-columns: 1.8fr 1fr;
      gap: 0; align-items: stretch;
      background: #ffffff;
      border: 1px solid var(--border);
      /* Card with more rounded corners */
      border-radius: 1.1rem;
      box-shadow: 0 12px 36px rgba(0,0,0,.10);
      overflow: hidden;
    }
    .brand-panel { background: #ffffff; display:flex; align-items:center; justify-content:center; padding: 2rem; min-height: 70vh; }
    .brand-content { text-align:center; display:flex; align-items:center; justify-content:center; width:100%; }
    .brand-box { width: min(645px, 88%); aspect-ratio: 1 / 1; display:flex; flex-direction: column; gap: .6rem; align-items:center; justify-content:center; }
    .brand-box img { width: 100%; height: 100%; object-fit: contain; }
    .brand-title {
      font-weight: 800;
      letter-spacing: .3px;
      font-size: clamp(26px, 3vw, 40px);
      background: linear-gradient(90deg, var(--green), var(--yellow), var(--red));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-align: center;
    }
    input {
      padding: .65rem .75rem;
      border: 1px solid var(--border);
      border-radius: .35rem;
      outline: none;
      width: 100%;
    }
    input:focus { box-shadow: 0 0 0 3px rgba(17,122,61,.15); border-color: var(--green); }
    button { cursor: pointer; border: 1px solid transparent; border-radius: .35rem; padding: .55rem .85rem; background: var(--green); color: #fff; }
    .form-panel { border-left: 1px solid #d1d5db; }
    .login { max-width: 640px; margin: 0; padding: 2.5rem 2.25rem; background: #fff; }
    h2 { margin: 0 0 1.1rem 0; color: var(--black); }
    form { display: grid; gap: 1rem; }
    .pwd input { flex:1; }
    .pwd button { background:#f3f4f6; color: var(--black); border:1px solid var(--border); }

    /* Removed header stripe above the login card */
    /* Tabs: default white pills with border; only active is green */
    .login .tabs { display:flex; gap:.5rem; margin:.75rem 0 1.1rem; }
    .login .tabs button { background:#fff; color: var(--black); border:1px solid var(--border); border-radius:.35rem; }
    .login .tabs .active { background: var(--green); color:#fff; border-color: var(--green); }

    @media (max-width: 900px) {
      .screen { padding: 1rem; }
      .frame { width: min(680px, 98vw); padding: 10px; border-radius: 1rem; }
      .login-shell { grid-template-columns: 1fr; width: 100%; }
      .brand-panel { display:none; }
      .form-panel { border-left: none; }
      .login { padding: 1.5rem; }
    }
    @media (max-width: 520px) { .grid { grid-template-columns: 1fr; } }
    `
  ]
})
export class LoginComponent {
  username = '';
  password = '';
  error = false;
  mode: 'admin' | 'user' = 'admin';
  userMode: 'login' | 'register' = 'login';
  firstName = '';
  lastName = '';
  email = '';
  registerError = '';
  registerOk = false;
  showPwdAdmin = false;
  showPwdLogin = false;
  showPwdRegister = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    const role = this.auth.getRole();
    if (this.auth.isLoggedIn()) {
      if (role === 'admin') this.router.navigateByUrl('/admin');
      else this.router.navigateByUrl('/recherches');
    }
  }

  onSubmit() {
    this.error = false;
    const ok = this.auth.login(this.username.trim(), this.password.trim());
    if (ok) {
      const role = this.auth.getRole();
      if (role === 'admin') {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/recherches');
      }
    } else {
      this.error = true;
    }
  }

  onRegister() {
    this.registerError = '';
    this.registerOk = false;
    const res = this.auth.registerUser(this.firstName.trim(), this.lastName.trim(), this.email.trim(), this.password.trim());
    if (!res.ok) {
      this.registerError = res.message || 'Erreur';
      return;
    }
    this.registerOk = true;
    // Pré-remplir le champ identifiant avec le nom complet AVANT de vider les champs
    const full = `${this.firstName} ${this.lastName}`.trim();
    this.userMode = 'login';
    this.username = full;
    // Puis vider les champs du formulaire d'inscription
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
  }
}


