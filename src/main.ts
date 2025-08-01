import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { delayWhen } from 'rxjs/operators';
import { timer } from 'rxjs';

import { FormsModule } from '@angular/forms';

import { Header } from './app/header/header';

import { MagazineService } from './api.service';

import { ListThemesMagazine } from './app/list-themes-magazine/list-themes-magazine';

import { ListThemesLivres } from './app/list-themes-livres/list-themes-livres';
import { StorageService } from './storage.service';
import { Login } from './app/login/login';
import { AuthService } from './auth.service';
import { FavorisMagazines } from './app/favoris-magazines/favoris-magazines';
import { FavorisLivres } from './app/favoris-livres/favoris-livres';
import { MyListes } from './app/my-listes/my-listes';
import { ListLectureLivres } from './app/list-lecture-livres/list-lecture-livres';
import { ListPageListeLecture } from './app/list-page-liste-lecture/list-page-liste-lecture';
import { ViewListeLivreeLecture } from './app/view-liste-livree-lecture/view-liste-livree-lecture';
import { ListNotesLecture } from './app/list-notes-lecture/list-notes-lecture';
import { ViewNoteLecture } from './app/view-note-lecture/view-note-lecture';

const routes: Routes = [
  {
    path: 'favoris-magazines',
    component: FavorisMagazines,
  },
  {
    path: 'favoris-livres',
    component: FavorisLivres,
  },
  {
    path: 'my-listes',
    component: MyListes,
  },
  {
    path: 'my-notes',
    component: ListNotesLecture,
  },
  {
    path: 'view-liste-note-lecture/:nom_liste/:liste_id',
    component: ViewNoteLecture,
  },
  {
    path: 'my-liste-lecture-livres',
    component: ListLectureLivres,
  },
  {
    path: 'view-liste-lecture-livres/:nom_liste/:liste_id',
    component: ViewListeLivreeLecture,
  },
  {
    path: 'liste-pages-my-liste/:nom_liste/:liste_id',
    component: ListPageListeLecture,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'list-themes-livres',
    component: ListThemesLivres,
  },
  {
    path: 'livres/:keyTheme/:nomTheme',
    // component: MagazineList,
    loadComponent: () =>
      import('./app/list-livres-by-theme/list-livres-by-theme').then(
        (m) => m.ListLivresByTheme
      ),
  },
  {
    path: 'list-pages-by-livre/:keyTheme/:nomTheme/:livre_id/:cover_livre/:nom_livre',
    // component: MagazineList,
    loadComponent: () =>
      import('./app/list-pages-by-livre/list-pages-by-livre').then(
        (m) => m.ListPagesByLivre
      ),
  },
  {
    path: 'list-themes-magazines',
    component: ListThemesMagazine,
  },
  {
    path: 'magazines/:keyTheme/:nomTheme',
    // component: MagazineList,
    loadComponent: () =>
      import('./app/magazine-list/magazine-list').then((m) => m.MagazineList),
  },
  {
    path: 'list-numeros-by-magazine/:keyTheme/:nomTheme/:keyMagazine/:nomMagazine',
    // component: MagazineList,
    loadComponent: () =>
      import('./app/list-numeros-magazine/list-numeros-magazine').then(
        (m) => m.ListNumerosMagazine
      ),
  },
  {
    path: 'list-pages-by-numero-magazine/:keyTheme/:nomTheme/:cycle_magazine_id/:cover_magazine/:nom_magazine',
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
  lastLivres: any[] = [];

  lastMagazinesScience: any[] = [];

  lastMagazinesFinance: any[] = [];

  lastMagazinesInformatique: any[] = [];

  isLoading: boolean = true;

  constructor(
    private magazineService: MagazineService,
    public router: Router,
    private storage: StorageService,
    private authService: AuthService
  ) {}

  checkUserInStorage(): void {
    const user = this.storage.get<any>('user');

    if (!user || !user.token) {
      console.warn('user introuvable.');
      this.router.navigate(['/login']);
    } else {
      console.log('user existant :', user);
      this.authService.setLoggedIn(true);
      this.getLastMagazinesLivres();
    }
  }

  ngOnInit() {
    this.checkUserInStorage();
  }

  getLastMagazinesLivres() {
    /************************************************** */

    this.magazineService
      .getLastLivres()
      .pipe(
        delayWhen(() => timer(5000)) // ⏱️ Pause de 5 secondes après réception
      )
      .subscribe((response: any) => {
        // console.log('Réponse JSON complète:', response);
        this.lastLivres = response.lastLivres; // si la réponse EST directement un tableau de magazines

        // console.log('lastLivres =', this.lastLivres);

        // alert(response.reponse)
      });
    /************************************************** */
    this.magazineService
      .getLastCyclesMagazines('Science')
      .pipe(
        delayWhen(() => timer(5000)) // ⏱️ Pause de 5 secondes après réception
      )
      .subscribe((response: any) => {
        // console.log('Réponse JSON complète:', response);
        this.lastMagazinesScience = response.lastCyclesMagazines; // si la réponse EST directement un tableau de magazines

        // console.log('lastMagazinesScience =', this.lastMagazinesScience);

        // alert(response.reponse)
      });

    /********************************************* */

    this.magazineService
      .getLastCyclesMagazines('Informatique')
      .pipe(
        delayWhen(() => timer(5000)) // ⏱️ Pause de 5 secondes après réception
      )
      .subscribe((response: any) => {
        // console.log('Réponse JSON complète:', response);
        this.lastMagazinesInformatique = response.lastCyclesMagazines; // si la réponse EST directement un tableau de magazines

        // console.log('magazinesInformatique =', this.lastMagazinesInformatique);

        // alert(response.reponse)
      });

    /********************************************** */

    this.magazineService
      .getLastCyclesMagazines('Finance')
      .pipe(
        delayWhen(() => timer(5000)) // ⏱️ Pause de 5 secondes après réception
      )
      .subscribe((response: any) => {
        // console.log('Réponse JSON complète:', response);
        this.lastMagazinesFinance = response.lastCyclesMagazines; // si la réponse EST directement un tableau de magazines

        // console.log('lastMagazinesFinance =', this.lastMagazinesFinance);

        // alert(response.reponse)
      });

    /******************Finance**************************** */
    this.isLoading = false;
  }

  selectMagazine(magazine: any, nom_theme: any, key_theme: any) {
    this.router.navigate([
      '/list-pages-by-numero-magazine',
      nom_theme,
      key_theme,
      magazine._id,
      magazine.cover,
      magazine.titre,
    ]);
  }

  selectLivre(livre: any) {
    this.router.navigate([
      '/list-pages-by-livre',
      livre.keyTheme,
      livre.keyTheme,
      livre._id,
      livre.cover,
      livre.titre,
    ]);
  }
}

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideRouter(routes), provideAnimations()],
});
