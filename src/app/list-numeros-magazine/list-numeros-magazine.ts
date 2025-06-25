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
  selector: 'app-list-numeros-magazine',
  imports: [NgIf, NgFor, FormsModule],
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

  listCyclesMagazine: any[] = [];

  listCyclesMagazineTemp: any[] = [];

  periodes: number[] = [];

  types: string[] = [];

  selectedPeriode: string = '';

  selectedType = '';

  filteredMagazines: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router
  ) {
    this.route.paramMap.subscribe((params) => {
      this.keyMagazine = params.get('keyMagazine');
      this.getListCyclesMagazine();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  getListCyclesMagazine() {
    this.magazineService
      .listCyclesMagazine(this.keyMagazine)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);
        this.listCyclesMagazine = response.listNumerosMagazine; // si la réponse EST directement un tableau de magazines

        console.log('this.listCyclesMagazine =', this.listCyclesMagazine);

        this.periodes = [
          ...new Set(
            this.listCyclesMagazine.map((m) => new Date(m.date).getFullYear())
          ),
        ].sort((a, b) => b - a); // Trie décroissant (facultatif)

        this.types = [...new Set(this.listCyclesMagazine.map((m) => m.type))];
        this.listCyclesMagazineTemp = [...this.listCyclesMagazine];

        // alert(response.reponse)
      });
  }

  applyFilters(): void {
    console.log('this.selectedPeriode =', this.selectedPeriode);
    this.listCyclesMagazine = this.listCyclesMagazineTemp;

    if (this.selectedPeriode != '') {
      this.listCyclesMagazine = this.listCyclesMagazineTemp.filter((mag) => {
        const annee = new Date(mag.date).getFullYear();

        console.log('annee =', annee);

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

  selectCycleMagazine(cycleMag: any) {
    this.router.navigate(['/list-pages-by-numero-magazine', cycleMag._id]);
  }
}
