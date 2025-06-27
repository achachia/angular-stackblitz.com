import { Component } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-list-numeros-magazine',
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './list-numeros-magazine.html',
  styleUrl: './list-numeros-magazine.css',
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
export class ListNumerosMagazine {
  keyMagazine: string | null = null;

  nomMagazine: string | null = null;

  listCyclesMagazine: any[] = [];

  listCyclesMagazineTemp: any[] = [];

  periodes: number[] = [];

  types: string[] = [];

  selectedPeriode: string = '';

  selectedType = '';

  filteredMagazines: any[] = [];

  isLoading: boolean = true;

  hasError: boolean = false;

  favorites: any[] = []; // ou charger depuis localStorage ou un service

  readonly radius = 26;

  readonly circumference = 2 * Math.PI * this.radius;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router
  ) {
    /* this.route.paramMap.subscribe((params) => {
      this.keyMagazine = params.get('keyMagazine');
      this.getListCyclesMagazine();     
    });*/

    this.keyMagazine = this.route.snapshot.paramMap.get('keyMagazine');
    this.nomMagazine = this.route.snapshot.paramMap.get('nomMagazine');
    this.getListCyclesMagazine();
  }

  ngOnInit() {
    const fav = localStorage.getItem('favorites-magazines');
    this.favorites = fav ? JSON.parse(fav) : [];
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
    localStorage.setItem('favorites-magazines', JSON.stringify(this.favorites));
  }

  isFavori(magazine: any): boolean {
    return this.favorites.some((fav: any) => fav.token === magazine.token);
  }

  getListCyclesMagazine() {
    this.isLoading = true;
    this.hasError = false; // optionnel si tu veux afficher une erreur à l'écran

    this.magazineService.listCyclesMagazine(this.keyMagazine).subscribe({
      next: (response: any) => {
        // console.log('Réponse JSON complète:', response);
        this.listCyclesMagazine = response.listNumerosMagazine || [];

        this.periodes = [
          ...new Set(
            this.listCyclesMagazine.map((m) => new Date(m.date).getFullYear())
          ),
        ].sort((a, b) => b - a);

        this.types = [...new Set(this.listCyclesMagazine.map((m) => m.type))];
        this.listCyclesMagazineTemp = [...this.listCyclesMagazine];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des magazines:', error);
        this.isLoading = false;
        this.hasError = true; // à utiliser dans le template si besoin
      },
    });
  }

  applyFiltersYear(): void {
    // console.log('this.selectedPeriode =', this.selectedPeriode);
    this.listCyclesMagazine = this.listCyclesMagazineTemp;

    if (this.selectedPeriode != '') {
      this.listCyclesMagazine = this.listCyclesMagazineTemp.filter((mag) => {
        const annee = new Date(mag.date).getFullYear();

        // console.log('annee =', annee);

        return annee == Number(this.selectedPeriode);

        /*  const matchPeriode = this.selectedPeriode
          ? annee === this.selectedPeriode
          : false;
  
         const matchType = this.selectedType
          ? mag.type === this.selectedType
          : true;
  
        return matchPeriode && matchType;
  
        return matchPeriode;*/
      });
    }
  }

  applyFiltersType(): void {
    // console.log('this.selectedPeriode =', this.selectedPeriode);
    this.listCyclesMagazine = this.listCyclesMagazineTemp;

    if (this.selectedType != '') {
      this.listCyclesMagazine = this.listCyclesMagazineTemp.filter((mag) => {
        return mag.type == this.selectedType;
      });
    }
  }

  selectCycleMagazine(cycleMag: any) {
    this.router.navigate(['/list-pages-by-numero-magazine', cycleMag._id]);
  }
}
