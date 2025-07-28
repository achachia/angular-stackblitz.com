import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { StorageService } from '../../storage.service';
import { AuthService } from '../../auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgIf, NgFor],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menuOpen = false;

  isLoggedIn: Boolean = false;

  private sub?: Subscription;

  constructor(
    private storage: StorageService,
    public router: Router,
    private authService: AuthService
  ) {
    this.checkUserInStorage();
  }

  ngOnInit() {
     this.sub = this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      console.log('this.isLoggedIn-0= ', this.isLoggedIn);
    });

 
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  checkUserInStorage(): void {
    const user = this.storage.get<any>('user');

    if (!user || !user.token) {
      console.warn('user introuvable.');
    } else {
      console.log('user existant :', user);
      this.isLoggedIn = true;
    }

    console.log('this.isLoggedIn-1 =', this.isLoggedIn);
  }

  logout() {
    this.storage.remove('user');
    this.sub?.unsubscribe();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
    // Rediriger éventuellement vers la page d'accueil ou de login
  }
}
