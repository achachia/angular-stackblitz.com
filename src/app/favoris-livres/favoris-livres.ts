import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { NgIf, NgFor, NgClass ,NgStyle} from '@angular/common';
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
  selector: 'app-favoris-livres',
  imports: [NgIf, NgFor, NgClass, NgStyle, Header],
  templateUrl: './favoris-livres.html',
  styleUrl: './favoris-livres.css',
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
export class FavorisLivres implements OnInit{

  largeurPage: number = 0;

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

 

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.largeurPage = window.innerWidth;
  }

  getDynamicStyle() {
    if (this.largeurPage > 820) {
      return {
        'margin-left': '25%',
        'margin-right': '25%',
        'margin-top': '10%'
      };
    } else {
      return {        
        'margin-top': '10%'
      };
    }
  }

  ngOnInit() {
    // const fav = localStorage.getItem('favorites-livres');
    // this.favorites = fav ? JSON.parse(fav) : [];

    this.largeurPage = window.innerWidth;

    console.log('this.largeurPage =', this.largeurPage)

    this.getDataUser();

    console.log('this.favorites =', this.favorites);
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

        this.favorites = response.data.favoris_livres;

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

  isFavori(magazine: any): boolean {
    return this.favorites.some((fav: any) => fav.token === magazine.token);
  }

  toggleFavori(livre: any) {
    if (this.favorites && this.favorites.length > 0) {
      // Cherche l'index du livre dans favorites par token
      const index = this.favorites.findIndex(
        (fav: any) => fav.token === livre.token
      );

      if (index > -1) {
        // Supprime l'objet complet si déjà présent
        this.favorites.splice(index, 1);
      } else {
        // Ajoute l'objet complet dans le tableau
        this.favorites.push(livre);
      }
    } else {
      this.favorites.push(livre);
    }

    this.updateDataUser();

    // Stocker le tableau complet en localStorage
    // localStorage.setItem('favorites-livres', JSON.stringify(this.favorites));
  }

  updateDataUser() {
    const _token = this.authService.getTokenStorage;

    const objectUser = { token: _token, favoris_livres: this.favorites };

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

  selectCycleLivre(livre: any) {
    console.log('livre-favoris = ', livre);
    this.router.navigate([
      '/list-pages-by-livre',
      livre.keyTheme,
      livre.keyTheme,
      livre._id,
      livre.cover,
      encodeURIComponent(livre.titre),
    ]);
  }

  // Nouvelle méthode pour afficher une notification
  showToast(message: string, duration: number = 3000) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, duration);
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

  selectLivre(livre: any) {
    this.router.navigate(['/list-pages-by-livre', livre._id]);
  }

  goToLivresList() {
    this.router.navigate(['/list-themes-livres']);
  }
}
