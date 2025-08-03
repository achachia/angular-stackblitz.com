import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom'; // https://www.npmjs.com/package/@meddv/ngx-pinch-zoom
import { NgIf, NgFor } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // 👈 à importer ici
import { AuthService } from '../../auth.service';
import { Header } from '../header/header';

interface List {
  _id?: string;
  titre: string;
  itemCount?: number; // Exemple: nombre d'éléments dans la liste
  tagsListe?: [];
  pagesListe: [];
}

@Component({
  selector: 'app-list-page-liste-lecture',
  imports: [PinchZoomComponent, NgIf, NgFor, FormsModule, Header],
  templateUrl: './list-page-liste-lecture.html',
  styleUrl: './list-page-liste-lecture.css',
  animations: [
    trigger('fadeImage', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
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
export class ListPageListeLecture {
  curentListe: any = {};

  curentPage: any = {};

  currentIndex = 0;

  isZoomed = false;

  menuOpen = false;

  chatVisible: boolean = false;

  toastMessage = '';

  chatbotUrlUnsafe: string =
    'https://app.vectorshift.ai/chatbots/deployed/685c47a653eb91b72fc8d3e6';

  chatbotUrlSafe!: SafeResourceUrl;

  chatbotModels = [
    {
      value:
        'https://app.vectorshift.ai/chatbots/deployed/685c47a653eb91b72fc8d3e6',
      label: 'perplexity.ai',
    },
    {
      value:
        'https://app.vectorshift.ai/chatbots/deployed/685edb8a20d9549cc6bce368',
      label: 'Gemini',
    },
  ];

  selectedModel =
    'https://app.vectorshift.ai/chatbots/deployed/685c47a653eb91b72fc8d3e6';

  showSessionExpiredModa: any = false;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.curentListe._id = params.get('liste_id');

      this.curentListe.titre = params.get('nom_liste');

      this.curentPage = { type_document: '', nom_document: '' };

      this.getDataListeLectureById();
    });
  }

  ngOnInit() {
    this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.chatbotUrlUnsafe
    );
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  getDataListeLectureById() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      liste_id: this.curentListe._id,
    };

    this.magazineService.loadDataListeLectureById(ObjectListeLecture).subscribe(
      (response: any) => {
        console.log('Réponse JSON complète:', response);

        if (response.reponse) {
          this.curentListe.pagesListe = response.data.pagesListe;

          this.curentListe.tagsListe = response.data.tagsListe;

          this.curentListe.titre = response.data.titre;

          this.curentListe._id = response.data._id;

          this.curentPage = this.curentListe.pagesListe[0];

          console.log('this.curentPage =', this.curentPage);

          // console.log('this.curentListe.pagesListe =', this.curentListe.pagesListe );

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

  deletePageByListe() {
    console.log(
      'this.curentListe.pagesListe[this.currentIndex] =',
      this.curentListe.pagesListe[this.currentIndex]
    );
    this.curentListe.pagesListe = this.curentListe.pagesListe.filter(
      (page: any) =>
        page.url !== this.curentListe.pagesListe[this.currentIndex].url
    );

    if (this.curentListe.pagesListe.length > 0) {
      this.curentPage = this.curentListe.pagesListe[0];

      this.currentIndex = 0;

      this.updateDataListeApi();
    }
  }

  updateDataListeApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      titre: this.curentListe.titre,
      _id: this.curentListe._id,
      pagesListe: this.curentListe.pagesListe,
      tagsListe: this.curentListe.tagsListe,
    };

    this.magazineService
      .postEditListeLecture(ObjectListeLecture)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.showToast(`La liste "${this.curentListe.titre}" a été à jour.`);

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onModelChange() {
    this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.selectedModel
    );
  }

  openFullscreen() {
    const elem = document.querySelector('.main-image') as HTMLElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen(); // Safari
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen(); // IE11
    }
  }

  toggleZoom() {
    this.isZoomed = !this.isZoomed;
  }

  get currentPage(): string {
    if (
      this.curentListe.pagesListe[this.currentIndex] &&
      this.curentListe.pagesListe[this.currentIndex].url
    ) {
      this.curentPage = this.curentListe.pagesListe[this.currentIndex];
      return this.curentListe.pagesListe[this.currentIndex].url;
    } else {
      return '';
    }
  }

  goToPage(index: number) {
    this.currentIndex = index;
  }

  nextPage() {
    if (this.currentIndex < this.curentListe.pagesListe.length - 1) {
      this.currentIndex++;
      this.curentPage = this.curentListe.pagesListe[this.currentIndex];
    }
  }

  prevPage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.curentPage = this.curentListe.pagesListe[this.currentIndex];
    }
  }

  // Nouvelle méthode pour afficher une notification
  showToast(message: string, duration: number = 3000) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, duration);
  }
}
