import { Component } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-list-livres-by-theme',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './list-livres-by-theme.html',
  styleUrl: './list-livres-by-theme.css',
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
export class ListLivresByTheme {
  keyTheme: string | null = null;

  nomTheme: string | null = null;

  listLivres: any[] = [];

  listLivresTemp: any[] = [];

  periodes: number[] = [];

  types: string[] = [];

  selectedPeriode: string = '';

  selectedType = '';

  favorites: any[] = []; // ou charger depuis localStorage ou un service

  isLoading: boolean = true;

  readonly radius = 26;

  readonly circumference = 2 * Math.PI * this.radius;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router
  ) {
    this.route.paramMap.subscribe((params) => {
      this.keyTheme = params.get('keyTheme');
      this.nomTheme = params.get('nomTheme');
      this.getListLivresByTheme();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  ngOnInit() {
    const fav = localStorage.getItem('favorites-livres');
    this.favorites = fav ? JSON.parse(fav) : [];
  }

  getListLivresByTheme() {
    this.magazineService
      .listLivresByTheme(this.keyTheme)
      .subscribe((response: any) => {
        this.isLoading = false;
        console.log('Réponse JSON complète:', response);
        this.listLivres = response.listLivres; // si la réponse EST directement un tableau de magazines

        console.log('this.listLivres =', this.listLivres);

        this.listLivresTemp = [...this.listLivres];

        this.periodes = [
          ...new Set(
            this.listLivres.map((livre: any) =>
              new Date(livre.year).getFullYear()
            )
          ),
        ].sort((a, b) => b - a); // Trie décroissant (facultatif)

        // alert(response.reponse)
      });
  }

  toggleFavori(livre: any) {
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

    // Stocker le tableau complet en localStorage
    localStorage.setItem('favorites-livres', JSON.stringify(this.favorites));
  }

  isFavori(livre: any): boolean {
    return this.favorites.some((fav: any) => fav.token === livre.token);
  }

  applyFiltersYear() {
    // console.log('this.selectedPeriode =', this.selectedPeriode);
    this.listLivres = this.listLivresTemp;

    if (this.selectedPeriode != '') {
      this.listLivres = this.listLivresTemp.filter((livre) => {
        return livre.year == this.selectedPeriode;
      });
    }
  }

  selectLivre(livre: any) {
    this.router.navigate([
      '/list-pages-by-livre',
      this.keyTheme,
      this.nomTheme,
      livre._id,
      livre.cover,
      encodeURIComponent(livre.titre),
    ]);
  }

  applyFiltersType() {}

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
}
