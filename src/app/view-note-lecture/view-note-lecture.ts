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
  isLoading: boolean = false;

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

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router,
    private authService: AuthService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.nom_liste = params.get('nom_liste');
      this.liste_id = params.get('liste_id');
      this.getListNotesLectureById();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  ngOnInit() {}

  getListNotesLectureById() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      liste_id: this.liste_id,
    };

    this.magazineService
      .loadListeNoteLectureById(ObjectListeLecture)
      .subscribe((response: any) => {
        this.isLoading = false;
        console.log('Réponse JSON complète:', response);
        this.listNotes = response.data.notesListe; // si la réponse EST directement un tableau de magazines

        this.selectedListe = response.data;

        console.log('this.listNotes =', this.listNotes);

        this.listNotesTemp = [...this.listNotes];

        // alert(response.reponse)
      });
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

    console.log('ObjectListeNote =', ObjectListeNote);

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
