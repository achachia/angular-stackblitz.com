import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { MagazineService } from './../../api.service';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { Header } from '../header/header';

interface List {
  _id?: string;
  titre: string;
  itemCount?: number; // Exemple: nombre d'éléments dans la liste
  tagsListe?: [];
  livresListe: [];
}

@Component({
  selector: 'app-list-lecture-livres',
  imports: [ReactiveFormsModule, NgIf, NgFor, FormsModule, Header],
  templateUrl: './list-lecture-livres.html',
  styleUrl: './list-lecture-livres.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),
  ],
})
export class ListLectureLivres {
  lists: List[] = []; // Tableau qui contiendra tes listes

  isLoading: boolean = true;

  isFormModalOpenAddListe: boolean = false; // Pour contrôler l'affichage du modal ajouter une liste
  isFormModalOpenEditListe: boolean = false; // Pour contrôler l'affichage du modal
  isEditing: boolean = false; // Pour savoir si on édite ou on crée
  currentList: List = {
    _id: '',
    titre: '',
    itemCount: 0,
    tagsListe: [],
    livresListe: [],
  }; // L'objet liste lié au formulaire
  toastMessage = '';

  isConfirmOpen: boolean = false; // Pour afficher ou cacher le modal de confirmation

  listToDelete: List | null = null; // La liste sélectionnée à supprimer

  showSessionExpiredModa: any = false;

  constructor(
    private magazineService: MagazineService,
    private authService: AuthService,
    public router: Router
  ) {
    this.loadListeApi();
  }

  ngOnInit(): void {
    // Initialisation des données (ex: appel à un service pour récupérer les listes)
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  loadListeApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = { token: _token };

    this.magazineService.loadListeLectureLivre(ObjectListeLecture).subscribe(
      (response: any) => {
        console.log('Réponse JSON complète:', response);

        if (response.reponse) {
          this.lists = response.data;

          for (let i = 0; i < this.lists.length; i++) {
            this.lists[i].itemCount = this.lists[i].livresListe.length;
          }

          this.isLoading = false;

          //console.log('this.magazines =', this.magazines)

          // alert(response.reponse)
        }
      },
      (error) => {
        // Ici, tu interceptes les erreurs réseau ou serveur
        console.error(error);
        if (error.error.msg === 'token_not_valid' ||
        error.error.msg === 'token_required') {
          this.showSessionExpiredModa = true;
        }
        // this.errorMessage = "Impossible d'accéder au service. Veuillez vérifier votre connexion ou réessayer plus tard.";
      }
    );
  }

  // --- Méthodes pour le modal de formulaire ---

  openFormModalForEdit(list: List): void {
    this.isEditing = true;
    // Crée une copie pour éviter la modification directe avant la sauvegarde
    this.currentList = { ...list };
    this.isFormModalOpenEditListe = true;

    console.log('list_edit =', this.currentList);
  }

  closeFormModalAddListe(): void {
    this.isFormModalOpenAddListe = false;
  }

  closeFormModalEditListe(): void {
    this.isFormModalOpenEditListe = false;
  }

  addNewList(): void {
    // this.openFormModalForCreate(); // Ouvre le modal pour la création
    this.isFormModalOpenAddListe = true;
  }

  saveListeApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      titre: this.currentList.titre,
      livresListe: [],
      tagsListe: [],
    };

    this.magazineService
      .postAddListeLectureLivre(ObjectListeLecture)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.showToast(
          `La liste "${ObjectListeLecture.titre}" a été enregistré avec succées.`
        );

        this.loadListeApi();

        this.currentList = {
          _id: '',
          titre: '',
          tagsListe: [],
          livresListe: [],
          itemCount: 0,
        }; // Réinitialise pour une nouvelle création

        this.closeFormModalAddListe(); // Ferme le modal après sauvegarde

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  editListeApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      titre: this.currentList.titre,
      _id: this.currentList._id,
      livresListe: this.currentList.livresListe,
      tagsListe: this.currentList.tagsListe,
    };

    this.magazineService
      .postEditListeLectureLivre(ObjectListeLecture)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.showToast(
          `La liste "${ObjectListeLecture.titre}" a été mettre à jour avec succées.`
        );

        this.loadListeApi();

        this.closeFormModalEditListe(); // Ferme le modal après sauvegarde

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  deleteListeApi(list: List) {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      _id: list._id,
    };

    this.magazineService
      .deleteListeLectureLivre(ObjectListeLecture)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.showToast(
          `La liste "${list.titre}" a été supprimée avec succées.`
        );

        this.loadListeApi();

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  // Modification de la méthode deleteList pour afficher le modal au lieu du confirm natif
  deleteList(list: List): void {
    this.listToDelete = list;
    this.isConfirmOpen = true;
  }

  // Méthode appelée si l'utilisateur confirme
  confirmDelete(): void {
    if (this.listToDelete) {
      /*this.lists = this.lists.filter(
          (l) => l.titre !== this.listToDelete!.titre
        );*/
      this.deleteListeApi(this.listToDelete);
      this.showToast(`La liste "${this.listToDelete.titre}" a été supprimée.`);
      this.listToDelete = null;
      this.isConfirmOpen = false;
    }
  }

  // Annuler la suppression (fermer le modal)
  cancelDelete(): void {
    this.listToDelete = null;
    this.isConfirmOpen = false;
  }

  /*saveList(): void {
    if (this.isEditing) {
      // Logique pour éditer une liste existante
      const index = this.lists.findIndex((l) => l.titre === this.currentList.titre);
      if (index !== -1) {
        this.lists[index] = { ...this.currentList }; // Met à jour l'objet dans le tableau
        // alert(`La liste "${this.currentList.name}" a été mise à jour.`);
        this.showToast(
          `La liste "${this.currentList.titre}" a été mise à jour.`
        );
      }
    } else {
      // Logique pour créer une nouvelle liste
      // Génère un ID unique (simplifié pour cet exemple)
      const newId =
        this.lists.length > 0
          ? Math.max(...this.lists.map((l) => l.id)) + 1
          : 1;
      const newList = { ...this.currentList, id: newId, itemCount: 0 }; // itemCount à 0 pour une nouvelle liste
      this.lists.push(newList);
      // alert(`La liste "${newList.name}" a été créée.`);
      this.showToast(`La liste "${newList.titre}" a été créée.`);
    }
    this.closeFormModal(); // Ferme le modal après sauvegarde
  }*/

  // --- Méthodes existantes mises à jour ---

  viewList(list: List): void {
    console.log('Consulter la liste:', list.titre);
    // Implémente ici la logique pour consulter la liste
    // Ex: Naviguer vers une page de détails: this.router.navigate(['/list', list.id]);

    this.router.navigate(['/view-liste-lecture-livres', list.titre, list._id]);
  }

  editList(list: List): void {
    this.openFormModalForEdit(list); // Ouvre le modal pour l'édition
  }

  // Nouvelle méthode pour afficher une notification
  showToast(message: string, duration: number = 3000) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, duration);
  }
}
