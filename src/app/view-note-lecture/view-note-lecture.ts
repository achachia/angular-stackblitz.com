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
  selector: 'app-view-note-lecture',
  imports: [NgIf, NgFor, FormsModule, Header],
  templateUrl: './view-note-lecture.html',
  styleUrl: './view-note-lecture.css',
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
export class ViewNoteLecture {
  isLoading: boolean = true;

  nom_liste: any = '';

  liste_id: any = '';

  listNotes: any[] = [];

  listNotesTemp: any[] = [];

  toastMessage = '';

  selectedListe: any = null;

  menuOpen = false;

  isListModalOpen = false;

  note: any = '';

  source: any = '';

  showSessionExpiredModa: any = false;

  selectedNote: any = null;

  indexNote: number = 0;

  isListModalOpenEdit: boolean = false;

  isConfirmOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router,
    private authService: AuthService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.nom_liste = params.get('nom_liste');
      this.liste_id = params.get('liste_id');
      this.source = params.get('nom_liste');
      this.getListNotesLectureById();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  ngOnInit() {}

  onNoteAction(objectNote: any, index: number): void {
    // Ton action : ouvrir une modal, ajouter une note, etc.
    console.log('Note sélectionnée:', objectNote);

    this.selectedNote = objectNote;
    this.indexNote = index;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  closeListModalEdit() {
    this.isListModalOpenEdit = false;
  }

  actionEdierNote() {
    console.log('this.selectedNote =', this.selectedNote);
    console.log('this.indexNote =', this.indexNote);
    this.source = this.selectedNote.source;
    this.note = this.selectedNote.note;
    this.isListModalOpenEdit = true;
  }

  editNoteForm() {
    this.selectedListe.notesListe[this.indexNote].source = this.source;

    this.selectedListe.notesListe[this.indexNote].note = this.note;

    this.updateDataListe();

    this.isListModalOpenEdit = false;
  }

  // Annuler la suppression (fermer le modal)
  cancelDelete(): void {
    this.selectedNote = null;
    this.isConfirmOpen = false;
  }

  openModalConfirmation() {
    this.isConfirmOpen = true;
  }

  actionDeleteNote() {
    // console.log('this.selectedNote =', this.selectedNote)

    this.listNotes = this.listNotes.filter(
      (objectNote: any) => objectNote.note !== this.selectedNote.note
    );

    // console.log('this.listNotes =', this.listNotes)

    this.selectedListe.notesListe = this.listNotes;

    // console.log('this.selectedListe.notesListe =', this.selectedListe.notesListe)

    this.isConfirmOpen = false;

    this.updateDataListe();
  }

  closeActionSheet() {
    this.selectedNote = null;
  }

  getListNotesLectureById() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      liste_id: this.liste_id,
    };

    this.magazineService.loadListeNoteLectureById(ObjectListeLecture).subscribe(
      (response: any) => {
        if (response.reponse) {
          console.log('Réponse JSON complète:', response);
          this.listNotes = response.data.notesListe; // si la réponse EST directement un tableau de magazines

          this.selectedListe = response.data;

          console.log('this.listNotes =', this.listNotes);

          this.listNotesTemp = [...this.listNotes];

          this.isLoading = false;

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

  addNote() {
    this.isListModalOpen = true;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeListModal() {
    this.isListModalOpen = false;
  }

  updateDataListe() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeNote = {
      token: _token,
      titre: this.selectedListe.titre,
      notesListe: this.selectedListe.notesListe,
      tagsListe: this.selectedListe.tagsListe,
      liste_id: this.selectedListe._id,
    };

    // console.log('ObjectListeNote =', ObjectListeNote);

    this.magazineService
      .postEditListeNoteLecture(ObjectListeNote)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.showToast(
          `La liste "${ObjectListeNote.titre}" a été enregistré avec succées.`
        );

        this.getListNotesLectureById();

        this.closeActionSheet(); // Ferme le modal après sauvegarde
      });
  }

  saveNoteApi() {
    // console.log('note =', this.note)

    this.selectedListe.notesListe.push({
      note: this.note,
      source: this.source,
    });

    const _token = this.authService.getTokenStorage;

    const ObjectListeNote = {
      token: _token,
      titre: this.selectedListe.titre,
      notesListe: this.selectedListe.notesListe,
      tagsListe: this.selectedListe.tagsListe,
      liste_id: this.selectedListe._id,
    };

    // console.log('ObjectListeNote =', ObjectListeNote);

    this.magazineService
      .postEditListeNoteLecture(ObjectListeNote)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.showToast(
          `La liste "${ObjectListeNote.titre}" a été enregistré avec succées.`
        );

        this.getListNotesLectureById();

        this.note = '';

        this.closeListModal(); // Ferme le modal après sauvegarde
      });
  }

  // Nouvelle méthode pour afficher une notification
  showToast(message: string, duration: number = 3000) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, duration);
  }
}
