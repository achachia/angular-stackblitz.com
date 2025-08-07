import { Component } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { NgIf, NgFor, NgClass } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Header } from '../header/header';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-favoris-magazines',
  imports: [NgIf, NgFor, NgClass, Header],
  templateUrl: './favoris-magazines.html',
  styleUrl: './favoris-magazines.css',
  animations: [
    trigger('itemAnim', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)'),
      ]),
      transition('* => void', [
        animate('200ms', style({ opacity: 0, transform: 'translateY(-20px)' })),
      ]),
    ]),
  ],
})
export class FavorisMagazines {
  favorites: any[] = []; // ou charger depuis localStorage ou un service

  readonly radius = 26;

  readonly circumference = 2 * Math.PI * this.radius;

  toastMessage = '';

  showSessionExpiredModa: any = false;

  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // const fav = localStorage.getItem('favorites-magazines');
    // this.favorites = fav ? JSON.parse(fav) : [];

    this.getDataUser();

    //console.log('this.favorites =', this.favorites);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  getDataUser() {
    const _token = this.authService.getTokenStorage;

    const objectUser = { token: _token };

    this.magazineService.getDataUser(objectUser).subscribe(
      (response: any) => {
        console.log('Réponse JSON complète:', response);

        this.favorites = response.data.favoris_magazines;

        this.isLoading = false;

        // alert(response.reponse)
      },
      (error) => {
        // Ici, tu interceptes les erreurs réseau ou serveur
        console.error(error);
        if (
          error.error.msg === 'token_not_valid' ||
          error.error.msg === 'token_required'
        ) {
          this.showSessionExpiredModa = true;
        }
        // this.errorMessage = "Impossible d'accéder au service. Veuillez vérifier votre connexion ou réessayer plus tard.";
      }
    );
  }

  updateDataUser() {
    const _token = this.authService.getTokenStorage;

    const objectUser = { token: _token, favoris_magazines: this.favorites };

    this.magazineService.updateDataUser(objectUser).subscribe(
      (response: any) => {
        console.log('Réponse JSON complète:', response);

        if (response.reponse) {
          this.showToast('la mise a jour à été éffectué avec succées');
        }

        // alert(response.reponse)
      },
      (error) => {
        // Ici, tu interceptes les erreurs réseau ou serveur
        console.error(error);
        if (
          error.error.msg === 'token_not_valid' ||
          error.error.msg === 'token_required'
        ) {
          this.showSessionExpiredModa = true;
        }
        // this.errorMessage = "Impossible d'accéder au service. Veuillez vérifier votre connexion ou réessayer plus tard.";
      }
    );
  }

  isFavori(magazine: any): boolean {
    return this.favorites.some((fav: any) => fav.token === magazine.token);
  }

  toggleFavori(magazine: any) {
    if (this.favorites && this.favorites.length > 0) {
      // Cherche l'index du magazine dans favorites par token
      const index = this.favorites.findIndex(
        (fav: any) => fav.token === magazine.token
      );

      if (index > -1) {
        // Supprime l'objet complet si déjà présent
        this.favorites.splice(index, 1);
      } else {
        // Ajoute l'objet complet dans le tableau
        this.favorites.push(magazine);
      }
    } else {
      this.favorites.push(magazine);
    }

    this.updateDataUser();

    // Stocker le tableau complet en localStorage
    // localStorage.setItem('favorites-magazines', JSON.stringify(this.favorites));
  }

  getProgress(token: string): number {
    const data = localStorage.getItem('readingProgress');
    if (data) {
      const progressMap = JSON.parse(data);
      return Math.min(100, Math.round(progressMap[token] || 0));
    }
    return 0;
  }

  getDashOffset(token: string): number {
    const percent = this.getProgress(token);
    return this.circumference * (1 - percent / 100);
  }

  updateProgress(token: string, currentPage: number, totalPages: number) {
    const percent = Math.floor((currentPage / totalPages) * 100);
    const data = localStorage.getItem('readingProgress');
    const progressMap = data ? JSON.parse(data) : {};
    progressMap[token] = percent;
    localStorage.setItem('readingProgress', JSON.stringify(progressMap));
  }

  onImageError(event: any) {
    event.target.src = 'https://img.icons8.com/?size=50&id=123439&format=png';
  }

  selectCycleMagazine(cycleMag: any) {
    console.log('cycleMag =', cycleMag);
    this.router.navigate([
      '/list-pages-by-numero-magazine',
      cycleMag.keyTheme,
      cycleMag.keyTheme,
      cycleMag._id,
      cycleMag.cover,
      encodeURIComponent(cycleMag.titre),
    ]);
  }

  goToMagazinesList() {
    this.router.navigate(['/list-themes-magazines']);
  }

  // Nouvelle méthode pour afficher une notification
  showToast(message: string, duration: number = 3000) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, duration);
  }
}
