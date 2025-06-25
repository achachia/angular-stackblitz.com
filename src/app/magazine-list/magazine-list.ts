import { Component } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MagazineService } from './../../api.service';
import { NgIf, NgFor } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom'; // https://www.npmjs.com/package/@meddv/ngx-pinch-zoom

@Component({
  selector: 'app-magazine-list',
  imports: [NgIf, NgFor, PinchZoomComponent, RouterLink, RouterLinkActive], // Ajoute NgIf ici !
  templateUrl: './magazine-list.html',
  styleUrl: './magazine-list.css',
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
export class MagazineList {
  public menuOpen = false;

  theme: string | null = null;

  listMagazines: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router
  ) {
    this.route.paramMap.subscribe((params) => {
      this.theme = params.get('theme');
      this.getListMagazineByTheme();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  getListMagazineByTheme() {
    this.magazineService
      .listMagazines(this.theme)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);
        this.listMagazines = response.listMagazines; // si la réponse EST directement un tableau de magazines

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  goDetailMagazine(magazine: any) {}

  selectMagazine(magazine: any) {
    this.router.navigate(['/list-numeros-by-magazine', magazine._id]);
  }
}
