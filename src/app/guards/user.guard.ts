import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Autorise l'accès uniquement si non-admin (utilisateur ou non connecté)
export const userOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.getRole();
  if (role === 'admin') {
    router.navigateByUrl('/admin');
    return false;
  }
  return true;
};


