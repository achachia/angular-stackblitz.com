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
import { Header } from '../header/header';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-view-liste-livree-lecture',
  imports: [NgIf, NgFor, FormsModule, Header],
  templateUrl: './view-liste-livree-lecture.html',
  styleUrl: './view-liste-livree-lecture.css',
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
export class ViewListeLivreeLecture {
  nom_liste: any = '';

  liste_id: any = '';

  listLivres: any[] = [];

  listLivresTemp: any[] = [];

  periodes: number[] = [];

  types: string[] = [];

  selectedPeriode: string = '';

  selectedType = '';

  isLoading: boolean = true;

  readonly radius = 26;

  readonly circumference = 2 * Math.PI * this.radius;

  selectedLivre: any = null;

  isListModalOpen = false;

  toastMessage = '';

  selectedListe: any = null;

  showSessionExpiredModa: any = false;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router,
    private authService: AuthService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.nom_liste = params.get('nom_liste');
      this.liste_id = params.get('liste_id');
      this.getListLectureLivresById();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  ngOnInit() {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  getListLectureLivresById() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      liste_id: this.liste_id,
    };

    this.magazineService
      .loadListeLectureLivreById(ObjectListeLecture)
      .subscribe(
        (response: any) => {
          if (response.reponse) {
            this.isLoading = false;
            console.log('Réponse JSON complète:', response);
            this.listLivres = response.data.livresListe; // si la réponse EST directement un tableau de magazines

            this.selectedListe = response.data;

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
          }
        },
        (error) => {
          // Ici, tu interceptes les erreurs réseau ou serveur
          console.error(error);
          if (error.error.msg === 'token_not_valid') {
            this.showSessionExpiredModa = true;
          }
          // this.errorMessage = "Impossible d'accéder au service. Veuillez vérifier votre connexion ou réessayer plus tard.";
        }
      );
  }

  selectLivre(livre: any) {
    /*this.router.navigate([
      '/list-pages-by-livre',
      this.keyTheme,
      this.nomTheme,
      livre._id,
      livre.cover,
      encodeURIComponent(livre.titre),
    ]); */

    this.selectedLivre = livre;
  }

  applyFiltersType() {}

  applyFiltersYear() {
    // console.log('this.selectedPeriode =', this.selectedPeriode);
    this.listLivres = this.listLivresTemp;

    if (this.selectedPeriode != '') {
      this.listLivres = this.listLivresTemp.filter((livre) => {
        return livre.year == this.selectedPeriode;
      });
    }
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

  closeActionSheet() {
    this.selectedLivre = null;
  }

  actionLire() {
    // Logique pour lire le livre selectedLivre
    console.log('Lire', this.selectedLivre);
    this.router.navigate([
      '/list-pages-by-livre',
      this.selectedLivre.keyTheme,
      this.selectedLivre.keyTheme,
      this.selectedLivre._id,
      this.selectedLivre.cover,
      encodeURIComponent(this.selectedLivre.titre),
    ]);
    this.closeActionSheet();
  }

  RetirerByListe() {
    this.selectedListe.livresListe = this.selectedListe.livresListe.filter(
      (liste: any) => liste._id !== this.selectedLivre._id
    );

    this.editListeApi();
  }

  editListeApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      titre: this.selectedListe.titre,
      _id: this.selectedListe._id,
      livresListe: this.selectedListe.livresListe,
      tagsListe: this.selectedListe.tagsListe,
    };

    this.magazineService
      .postEditListeLectureLivre(ObjectListeLecture)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.showToast(
          `La liste "${ObjectListeLecture.titre}" a été mettre à jour avec succées.`
        );

        this.getListLectureLivresById();

        this.closeActionSheet();

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  actionPartager() {
    // Logique partage
    console.log('Partager', this.selectedLivre);
    this.closeActionSheet();
  }

  // Nouvelle méthode pour afficher une notification
  showToast(message: string, duration: number = 3000) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, duration);
  }
}
