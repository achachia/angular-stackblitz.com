import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Comportement privé pour gérer le statut
  private loggedIn = new BehaviorSubject<boolean>(false);

  // Observable public pour s'abonner à l'état
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();

  constructor(private storage: StorageService, private router: Router) {
    this.checkUserInStorage();
  }

  checkUserInStorage(): void {
    const user = this.storage.get<any>('user');
    if (!user || !user.token) {
      this.loggedIn.next(false);
      this.router.navigate(['/login']);
    } else {
      this.loggedIn.next(true);
    }
  }

  // Met à jour la valeur de connexion (true/false)
  setLoggedIn(value: boolean): void {
    this.loggedIn.next(value);
  }

  // Optionnel : obtenir la valeur courante synchroniquement
  get isLoggedIn(): boolean {
    return this.loggedIn.getValue();
  }
}
