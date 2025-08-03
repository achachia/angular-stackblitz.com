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
  selector: 'app-list-pages-by-livre',
  imports: [PinchZoomComponent, NgIf, NgFor, FormsModule, Header],
  templateUrl: './list-pages-by-livre.html',
  styleUrl: './list-pages-by-livre.css',
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
export class ListPagesByLivre {
  listPagesByLivre: any[] = [];

  keyTheme: string | null = null;

  nomTheme: string | null = null;

  cover_livre: string | null = null;

  nom_livre: string | null = null;

  livre_id: any;

  currentIndex = 0;

  isZoomed = false;

  menuOpen = false;

  toastMessage = '';

  historique_navigation: any = {
    livre_id: '',
    currentIndex: 0,
    currentIndexMax: 0,
    date: new Date(),
  };

  indexLivreHistNav = 0;

  hist_nav_json: any[] = [];

  chatVisible: boolean = false;

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

  isListModalOpen = false;

  listsLecture: List[] = []; // Tableau qui contiendra tes listes

  showSessionExpiredModa: any = false;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    this.route.paramMap.subscribe((params) => {
      /**************************************************************** */
      this.keyTheme = params.get('keyTheme');
      this.nomTheme = params.get('nomTheme');
      this.livre_id = params.get('livre_id');
      console.log('this.livre_id=', this.livre_id);
      this.cover_livre = params.get('cover_livre');
      const nomLivreEncoded = params.get('nom_livre');
      if (nomLivreEncoded !== null) {
        this.nom_livre = decodeURIComponent(nomLivreEncoded);
      } else {
        this.nom_livre = '';
      }

      /******************************************************* */

      // localStorage.removeItem('historique-navigation-livres'); // test

      const hist_nav = localStorage.getItem('historique-navigation-livres');
      if (hist_nav) {
        this.hist_nav_json = JSON.parse(hist_nav);

        const filtreLivre = this.hist_nav_json.filter((livre: any) => {
          return livre.livre_id === this.livre_id;
        });

        if (filtreLivre.length > 0) {
          this.indexLivreHistNav = this.hist_nav_json.findIndex(
            (livre: any) => {
              return livre.livre_id === this.livre_id;
            }
          );

          this.historique_navigation = filtreLivre[0];

          console.log(
            'filtreLivre[0].currentIndex =',
            filtreLivre[0].currentIndex
          );

          this.currentIndex = filtreLivre[0].currentIndex;

          console.log('filtreLivre =', filtreLivre, this.currentIndex);
        } else {
          const histNavLivre = {
            livre_id: this.livre_id,
            currentIndex: 0,
            currentIndexMax: 0,
            date: new Date(),
          };
          this.hist_nav_json.push(histNavLivre);
          this.historique_navigation = histNavLivre;
          this.indexLivreHistNav = this.hist_nav_json.length - 1;
          localStorage.setItem(
            'historique-navigation-livres',
            JSON.stringify(this.hist_nav_json)
          );
        }
      } else {
        const hist_nav_json = [];
        const histNavLivre = {
          livre_id: this.livre_id,
          currentIndex: 0,
          currentIndexMax: 0,
          date: new Date(),
        };
        hist_nav_json.push(histNavLivre);
        this.historique_navigation = histNavLivre;
        // Stocker le tableau complet en localStorage
        localStorage.setItem(
          'historique-navigation-livres',
          JSON.stringify(hist_nav_json)
        );
      }

      /************************************************ */

      this.getListPagesByLivre();

      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  ngOnInit() {
    this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.chatbotUrlUnsafe
    );
  }

  getOCRPage() {
    const _token = this.authService.getTokenStorage;
    const infosOcr: any = {
      urlImage: this.listPagesByLivre[this.currentIndex].url,
      token: _token,
    };

    this.magazineService.getOCRPage(infosOcr).subscribe((response: any) => {
      console.log('Réponse JSON complète-OCR:', response);

      if (!response.ParsedText.IsErroredOnProcessing) {
        console.log('ocr = ', response.ParsedText.ParsedResults[0].ParsedText);
        alert(response.ParsedText.ParsedResults[0].ParsedText);
      }

      //console.log('this.magazines =', this.magazines)

      // alert(response.reponse)
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  loadListeApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = { token: _token };

    this.magazineService.loadListeLecture(ObjectListeLecture).subscribe(
      (response: any) => {
        console.log('Réponse JSON complète:', response);

        if (response.reponse) {
          this.listsLecture = response.data;

          for (let i = 0; i < this.listsLecture.length; i++) {
            this.listsLecture[i].itemCount =
              this.listsLecture[i].pagesListe.length;
          }

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

  getDataPageNavigationLecture() {
    const _token = this.authService.getTokenStorage;

    const ObjectNavigationPage: any = {
      token: _token,
      document_id: this.livre_id,
    };

    this.magazineService
      .getDataPageNavigationLecture(ObjectNavigationPage)
      .subscribe((response: any) => {
        console.log(
          'Réponse JSON complète-getDataPageNavigationLecture:',
          response
        );

        console.log('this.historique_navigation =', this.historique_navigation);

        console.log(
          'this.historique_navigation.currentIndex =',
          this.historique_navigation.currentIndex
        );

        console.log(
          'this.historique_navigation.currentIndexMax =',
          this.historique_navigation.currentIndexMax
        );

        /*********************************************************** */

        if (response.data) {
          let checkControl = false;

          if (
            response.data.compteurPage > this.historique_navigation.currentIndex
          ) {
            this.historique_navigation.currentIndex =
              response.data.compteurPage;

            this.hist_nav_json[this.indexLivreHistNav].currentIndex =
              response.data.compteurPage;

            this.hist_nav_json[this.indexLivreHistNav].date = new Date();
          } else {
            checkControl = true;
          }

          if (
            response.data.compteurPageMaxi >
            this.historique_navigation.currentIndexMax
          ) {
            this.historique_navigation.currentIndex =
              response.data.compteurPageMaxi;

            this.hist_nav_json[this.indexLivreHistNav].currentIndexMax =
              response.data.compteurPageMaxi;

            this.hist_nav_json[this.indexLivreHistNav].date = new Date();
          } else {
            checkControl = true;
          }

          localStorage.setItem(
            'historique-navigation-livres',
            JSON.stringify(this.hist_nav_json)
          );

          if (checkControl) {
            this.updateDataPageNavigationLecture();
          }
        }

        /*********************************************************** */

        // alert(response.reponse)
      });
  }

  updateDataPageNavigationLecture() {
    const token = this.authService.getTokenStorage;

    const ObjectNavigationPage: any = {};

    console.log('token = ', token);

    ObjectNavigationPage.token = token;

    console.log('document_id =', this.livre_id);
    ObjectNavigationPage.document_id = this.livre_id;

    console.log('nom_document =', this.nom_livre);
    ObjectNavigationPage.nom_document = this.nom_livre;

    console.log('compteurPage =', this.currentIndex);
    ObjectNavigationPage.compteurPage = this.currentIndex;

    console.log(
      'compteurPageMaxi =',
      this.hist_nav_json[this.indexLivreHistNav].currentIndexMax
    );
    ObjectNavigationPage.compteurPageMaxi =
      this.hist_nav_json[this.indexLivreHistNav].currentIndexMax;

    console.log('url_page =', this.listPagesByLivre[this.currentIndex]);
    ObjectNavigationPage.urlPage = this.listPagesByLivre[this.currentIndex].url;

    console.log('cover_document =', this.cover_livre);
    ObjectNavigationPage.cover_document = this.cover_livre;

    console.log('keyTheme =', this.keyTheme);
    ObjectNavigationPage.keyTheme = this.keyTheme;

    console.log('nomTheme =', this.nomTheme);
    ObjectNavigationPage.nomTheme = this.nomTheme;

    ObjectNavigationPage.typeDocument = 'livre';
    ObjectNavigationPage.keySection = 'livres';

    const typeDocument = 'livre';
    const keySection = 'livres';

    this.magazineService
      .updateDataPageNavigationLecture(ObjectNavigationPage)
      .subscribe((response: any) => {});
  }

  getListPagesByLivre() {
    this.magazineService
      .listPagesByLivre(this.livre_id)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);
        this.listPagesByLivre = response.listPageByLivre; // si la réponse EST directement un tableau de magazines

        this.getDataPageNavigationLecture();

        // console.log('this.listPagesByLivre =', this.listPagesByLivre);

        // alert(response.reponse)
      });
  }

  get currentPage(): string {
    if (
      this.listPagesByLivre[this.currentIndex] &&
      this.listPagesByLivre[this.currentIndex].url
    ) {
      return this.listPagesByLivre[this.currentIndex].url;
    } else {
      return '';
    }
  }

  nextPage() {
    if (this.currentIndex < this.listPagesByLivre.length - 1) {
      this.currentIndex++;

      /********************************************************************* */

      this.hist_nav_json[this.indexLivreHistNav].currentIndex =
        this.currentIndex;
      this.hist_nav_json[this.indexLivreHistNav].date = new Date();

      if (
        this.hist_nav_json[this.indexLivreHistNav].currentIndexMax <
        this.currentIndex
      ) {
        this.hist_nav_json[this.indexLivreHistNav].currentIndexMax =
          this.currentIndex;
      }

      localStorage.setItem(
        'historique-navigation-livres',
        JSON.stringify(this.hist_nav_json)
      );

      /********************************************************************* */
    }
  }

  prevPage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;

      /********************************************************************* */

      this.hist_nav_json[this.indexLivreHistNav].currentIndex =
        this.currentIndex;

      this.hist_nav_json[this.indexLivreHistNav].date = new Date();

      if (
        this.hist_nav_json[this.indexLivreHistNav].currentIndexMax <
        this.currentIndex
      ) {
        this.hist_nav_json[this.indexLivreHistNav].currentIndexMax =
          this.currentIndex;
      }

      localStorage.setItem(
        'historique-navigation-livres',
        JSON.stringify(this.hist_nav_json)
      );

      /********************************************************************* */
    }
  }

  goToPage(index: number) {
    this.currentIndex = index;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
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

  @HostListener('swipeleft', ['$event']) onSwipeLeft() {
    this.nextPage();
  }

  @HostListener('swiperight', ['$event']) onSwipeRight() {
    this.prevPage();
  }

  toggleZoom() {
    this.isZoomed = !this.isZoomed;
  }

  onModelChange() {
    this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.selectedModel
    );
  }

  openListModal() {
    this.loadListeApi();
    this.isListModalOpen = true;
  }

  closeListModal() {
    this.isListModalOpen = false;
  }

  assignPageToList(selectedList: any): void {
    // Exemple : console.log l'affectation — tu peux modifier selon ta logique métier
    console.log(
      `Page ${this.currentIndex + 1} affectée à la liste:`,
      selectedList.titre
    );

    selectedList.pagesListe.push({
      nom_document: this.nom_livre,
      type_document: 'livre',
      url: this.listPagesByLivre[this.currentIndex].url,
      indexPage: this.currentIndex,
    });

    // Ici tu peux appeler un service, modifier un état, etc.
    // Par exemple : this.listeService.assignPage(this.currentIndex, selectedList.id);

    // Fermer le modal après l’affectation (optionnel)
    this.editListeApi(selectedList);
  }

  editListeApi(selectedList: List) {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      titre: selectedList.titre,
      _id: selectedList._id,
      pagesListe: selectedList.pagesListe,
      tagsListe: selectedList.tagsListe,
    };

    this.magazineService
      .postEditListeLecture(ObjectListeLecture)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.loadListeApi();

        this.closeListModal(); // Ferme le modal après sauvegarde

        this.showToast(`La liste "${selectedList.titre}" a été à jour.`);

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
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
