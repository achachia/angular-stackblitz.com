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

  listLivres: any[] = [];

  listLivresTemp: any[] = [];

  periodes: number[] = [];

  types: string[] = [];

  selectedPeriode: string = '';

  selectedType = '';

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router
  ) {
    this.route.paramMap.subscribe((params) => {
      this.keyTheme = params.get('theme');
      this.getListLivresByTheme();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  getListLivresByTheme() {
    this.magazineService
      .listLivresByTheme(this.keyTheme)
      .subscribe((response: any) => {
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

  applyFilters() {}

  selectCycleLivre(livre: any) {
    this.router.navigate(['/list-pages-by-livre', livre._id]);
  }
}
