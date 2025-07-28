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

@Component({
  selector: 'app-favoris-livres',
  imports: [NgIf, NgFor, NgClass, Header],
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
export class FavorisLivres {
  favorites: any[] = []; // ou charger depuis localStorage ou un service

  readonly radius = 26;

  readonly circumference = 2 * Math.PI * this.radius;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router
  ) {}

  ngOnInit() {
    const fav = localStorage.getItem('favorites-livres');
    this.favorites = fav ? JSON.parse(fav) : [];

    console.log('this.favorites =', this.favorites);
  }

  isFavori(magazine: any): boolean {
    return this.favorites.some((fav: any) => fav.token === magazine.token);
  }

  toggleFavori(magazine: any) {
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

    // Stocker le tableau complet en localStorage
    localStorage.setItem('favorites-livres', JSON.stringify(this.favorites));
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
