import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { provideAnimations} from '@angular/platform-browser/animations';


import 'hammerjs';

import { FormsModule } from '@angular/forms';

import { Header } from './app/header/header';

import { MagazineService } from './api.service';

import { ListThemesMagazine } from './app/list-themes-magazine/list-themes-magazine';

import { ListThemesLivres } from './app/list-themes-livres/list-themes-livres';

const routes: Routes = [
  {
    path: 'list-themes-magazines',
    component: ListThemesMagazine,
  },
  {
    path: 'list-themes-livres',
    component: ListThemesLivres,
  },
  {
    path: 'magazines/:theme',
    // component: MagazineList,
    loadComponent: () =>
      import('./app/magazine-list/magazine-list').then((m) => m.MagazineList),
  },
  {
    path: 'list-numeros-by-magazine/:keyMagazine',
    // component: MagazineList,
    loadComponent: () =>
      import('./app/list-numeros-magazine/list-numeros-magazine').then(
        (m) => m.ListNumerosMagazine
      ),
  },
  {
    path: 'list-pages-by-numero-magazine/:cycle_magazine_id',
    // component: MagazineList,
    loadComponent: () =>
      import(
        './app/list-pages-by-numero-magazine/list-pages-by-numero-magazine'
      ).then((m) => m.ListPagesByNumeroMagazine),
  },

  // tu peux ajouter d'autres routes ici
];

@Component({
  selector: 'app-root',
  templateUrl: 'main.html',
  styleUrls: ['./main.scss'],
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule, Header],
  standalone: true,
})
export class App {
  name = 'Angular';

  themes = [
    {
      name: 'Science',
      description: 'Un thème bleu apaisant pour une expérience relaxante.',
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21ZM14 15.5C14 14.1 15.1 13 16.5 13S19 14.1 19 15.5V16H20C20.6 16 21 16.4 21 17V21C21 21.6 20.6 22 20 22H13C12.4 22 12 21.6 12 21V17C12 16.4 12.4 16 13 16H14V15.5Z" fill="white"/>
      </svg>`,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    },
    {
      name: 'Forêt',
      description: 'Un thème vert naturel pour une ambiance zen.',
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C8.36 20 8.86 19.87 9.34 19.7L10.29 22L12.18 21.34C11.5 20 11.2 18.4 11.2 16.8C11.2 15.2 11.5 13.6 12.18 12.26C13.5 14.24 15.8 15.5 18.5 15.5C19.75 15.5 20.9 15.16 21.82 14.56C22.7 13.96 23.3 13.1 23.6 12.1C23.9 11.1 23.8 10 23.3 9.1C22.8 8.2 21.9 7.5 20.9 7.2C19.9 6.9 18.8 7 17.9 7.5C17 8 16.3 8.9 16 9.9C15.7 10.9 15.8 12 16.3 12.9C16.8 13.8 17.7 14.5 18.7 14.8C18.5 14.9 18.3 15 18 15C16.3 15 14.8 14.2 13.9 12.9C13 11.6 12.7 10 13.1 8.5C13.5 7 14.5 5.8 15.9 5.2C17.3 4.6 18.9 4.6 20.3 5.2C21.7 5.8 22.7 7 23.1 8.5C23.5 10 23.2 11.6 22.3 12.9C21.4 14.2 19.9 15 18.2 15C17.9 15 17.6 14.9 17.3 14.8C17.8 13.9 17.9 12.8 17.6 11.8C17.3 10.8 16.6 9.9 15.7 9.4C14.8 8.9 13.7 8.8 12.7 9.1C11.7 9.4 10.8 10.1 10.3 11C9.8 11.9 9.7 13 10 14C10.3 15 11 15.9 11.9 16.4C12.8 16.9 13.9 17 14.9 16.7C15.9 16.4 16.8 15.7 17.3 14.8C17.6 14.9 17.9 15 18.2 15C19.9 15 21.4 14.2 22.3 12.9C23.2 11.6 23.5 10 23.1 8.5C22.7 7 21.7 5.8 20.3 5.2C18.9 4.6 17.3 4.6 15.9 5.2C14.5 5.8 13.5 7 13.1 8.5C12.7 10 13 11.6 13.9 12.9C14.8 14.2 16.3 15 18 15C18.3 15 18.5 14.9 18.7 14.8C17.7 14.5 16.8 13.8 16.3 12.9C15.8 12 15.7 10.9 16 9.9C16.3 8.9 17 8 17.9 7.5C18.8 7 19.9 6.9 20.9 7.2C21.9 7.5 22.8 8.2 23.3 9.1C23.8 10 23.9 11.1 23.6 12.1C23.3 13.1 22.7 13.96 21.82 14.56C20.9 15.16 19.75 15.5 18.5 15.5C15.8 15.5 13.5 14.24 12.18 12.26C11.5 13.6 11.2 15.2 11.2 16.8C11.2 18.4 11.5 20 12.18 21.34L10.29 22L9.34 19.7C8.86 19.87 8.36 20 8 20C7.64 20 7.14 19.87 6.66 19.7L5.71 22L3.82 21.34C5.9 16.17 8 10 17 8Z" fill="white"/>
      </svg>`,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      name: 'Crépuscule',
      description: 'Un thème violet/orangé pour une touche créative.',
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 12C17.5 14.5 15.5 16.5 13 16.5H11C8.5 16.5 6.5 14.5 6.5 12S8.5 7.5 11 7.5H13C15.5 7.5 17.5 9.5 17.5 12ZM12 9C10.3 9 9 10.3 9 12S10.3 15 12 15S15 13.7 15 12S13.7 9 12 9ZM12 2L15.39 5.39C13.71 4.5 11.84 4.5 10.16 5.39L12 2ZM20 12L16.61 15.39C17.5 13.71 17.5 11.84 16.61 10.16L20 12ZM12 22L8.61 18.61C10.29 19.5 12.16 19.5 13.84 18.61L12 22ZM4 12L7.39 8.61C6.5 10.29 6.5 12.16 7.39 13.84L4 12Z" fill="white"/>
      </svg>`,
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
    },
  ];

  magazines: any[] = [];

  constructor(
    private magazineService: MagazineService,
    public router: Router
  ) {}

  ngOnInit() {
    /* this.magazineService.getMagazines().subscribe((response: any) => {
      console.log('Réponse JSON complète:', response);
      this.magazines = response.lastCyclesMagazines; // si la réponse EST directement un tableau de magazines

      // alert(response.reponse)
    });*/
  }

  selectTheme(theme: any) {
    // Action à réaliser lors du clic sur un thème
    // alert(`Thème sélectionné : ${theme.name}`);
    this.router.navigate(['/magazines', theme.name]);
  }

  goToMagazines() {
    this.router.navigate(['/magazines']);
  }
}

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideRouter(routes), provideAnimations()],
});
