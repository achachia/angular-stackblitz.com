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
  selector: 'app-list-pages-by-numero-magazine',
  imports: [PinchZoomComponent, NgIf, NgFor, FormsModule, Header],
  templateUrl: './list-pages-by-numero-magazine.html',
  styleUrl: './list-pages-by-numero-magazine.css',
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
export class ListPagesByNumeroMagazine {
  listPagesByCycleMagazine: any[] = [];

  keyTheme: any = '';

  nomTheme: any = '';

  cycle_magazine_id: any;

  nom_magazine: any = '';

  cover_magazine: any = '';

  currentIndex = 0;

  isZoomed = false;

  menuOpen = false;

  toastMessage = '';

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

  historique_navigation: any = {
    cycle_magazine_id: '',
    currentIndex: 0,
    currentIndexMax: 0,
    date: new Date(),
  };

  indexCycleMagHistNav = 0;

  hist_nav_json: any[] = [];

  isListModalOpen = false;

  listsLecture: List[] = []; // Tableau qui contiendra tes listes

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
      this.cycle_magazine_id = params.get('cycle_magazine_id');
      console.log('this.cycle_magazine_id =', this.cycle_magazine_id);
      this.cover_magazine = params.get('cover_magazine');
      const nomMagazineEncoded = params.get('nom_magazine');
      if (nomMagazineEncoded !== null) {
        this.nom_magazine = decodeURIComponent(nomMagazineEncoded);
      } else {
        this.nom_magazine = '';
      }

      /******************************************************* */

      // localStorage.removeItem('historique-navigation-cycle-magazines'); // test

      const hist_nav = localStorage.getItem(
        'historique-navigation-cycle-magazines'
      );
      if (hist_nav) {
        this.hist_nav_json = JSON.parse(hist_nav);

        const filtreCycleMagazine = this.hist_nav_json.filter(
          (cycleMag: any) => {
            return cycleMag.cycle_magazine_id === this.cycle_magazine_id;
          }
        );

        if (filtreCycleMagazine.length > 0) {
          this.indexCycleMagHistNav = this.hist_nav_json.findIndex(
            (cycleMag: any) => {
              return cycleMag.cycle_magazine_id === this.cycle_magazine_id;
            }
          );

          this.historique_navigation = filtreCycleMagazine[0];

          console.log(
            'filtreCycleMagazine[0].currentIndex =',
            filtreCycleMagazine[0].currentIndex
          );

          this.currentIndex = filtreCycleMagazine[0].currentIndex;

          console.log(
            'filtreCycleMagazine =',
            filtreCycleMagazine,
            this.currentIndex
          );
        } else {
          const histNavCycleMagazine = {
            cycle_magazine_id: this.cycle_magazine_id,
            currentIndex: 0,
            currentIndexMax: 0,
            date: new Date(),
          };
          this.hist_nav_json.push(histNavCycleMagazine);
          this.historique_navigation = histNavCycleMagazine;
          this.indexCycleMagHistNav = this.hist_nav_json.length - 1;
          localStorage.setItem(
            'historique-navigation-cycle-magazines',
            JSON.stringify(this.hist_nav_json)
          );
        }
      } else {
        const hist_nav_json = [];
        const histNavCycleMagazine = {
          cycle_magazine_id: this.cycle_magazine_id,
          currentIndex: 0,
          currentIndexMax: 0,
          date: new Date(),
        };
        hist_nav_json.push(histNavCycleMagazine);
        this.historique_navigation = histNavCycleMagazine;
        // Stocker le tableau complet en localStorage
        localStorage.setItem(
          'historique-navigation-cycle-magazines',
          JSON.stringify(hist_nav_json)
        );
      }

      /************************************************ */
      this.getListPagesByCycleMagazine();

      this.loadListeApi();

      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  ngOnInit() {
    this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.chatbotUrlUnsafe
    );
  }

  loadListeApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = { token: _token };

    this.magazineService
      .loadListeLecture(ObjectListeLecture)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.listsLecture = response.data;

        for (let i = 0; i < this.listsLecture.length; i++) {
          this.listsLecture[i].itemCount =
            this.listsLecture[i].pagesListe.length;
        }

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  getDataPageNavigationLecture() {
    const _token = this.authService.getTokenStorage;

    const ObjectNavigationPage: any = {
      token: _token,
      document_id: this.cycle_magazine_id,
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

            this.hist_nav_json[this.indexCycleMagHistNav].currentIndex =
              response.data.compteurPage;

            this.currentIndex = response.data.compteurPage;

            this.hist_nav_json[this.indexCycleMagHistNav].date = new Date();
          } else {
            checkControl = true;
          }

          if (
            response.data.compteurPageMaxi >
            this.historique_navigation.currentIndexMax
          ) {
            this.historique_navigation.currentIndex =
              response.data.compteurPageMaxi;

            this.hist_nav_json[this.indexCycleMagHistNav].currentIndexMax =
              response.data.compteurPageMaxi;

            this.hist_nav_json[this.indexCycleMagHistNav].date = new Date();
          } else {
            checkControl = true;
          }

          localStorage.setItem(
            'historique-navigation-cycle-magazines',
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

    console.log('document_id =', this.cycle_magazine_id);
    ObjectNavigationPage.document_id = this.cycle_magazine_id;

    console.log('nom_document =', this.nom_magazine);
    ObjectNavigationPage.nom_document = this.nom_magazine;

    console.log('compteurPage =', this.currentIndex);
    ObjectNavigationPage.compteurPage = this.currentIndex;

    console.log(
      'compteurPageMaxi =',
      this.hist_nav_json[this.indexCycleMagHistNav].currentIndexMax
    );
    ObjectNavigationPage.compteurPageMaxi =
      this.hist_nav_json[this.indexCycleMagHistNav].currentIndexMax;

    console.log('url_page =', this.listPagesByCycleMagazine[this.currentIndex]);
    ObjectNavigationPage.url_page =
      this.listPagesByCycleMagazine[this.currentIndex].url;

    console.log('cover_document =', this.cover_magazine);
    ObjectNavigationPage.cover_document = this.cover_magazine;

    console.log('keyTheme =', this.keyTheme);
    ObjectNavigationPage.keyTheme = this.keyTheme;

    console.log('nomTheme =', this.nomTheme);
    ObjectNavigationPage.nomTheme = this.nomTheme;

    ObjectNavigationPage.typeDocument = 'magazine';
    ObjectNavigationPage.keySection = 'magazines';

    const typeDocument = 'magazine'; // livre
    const keySection = 'magazines'; // livres

    this.magazineService
      .updateDataPageNavigationLecture(ObjectNavigationPage)
      .subscribe((response: any) => {});
  }

  getListPagesByCycleMagazine() {
    this.magazineService
      .listPagesByCycleMagazine(this.cycle_magazine_id)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);
        this.listPagesByCycleMagazine = response.listPageByNumeroMagazine; // si la réponse EST directement un tableau de magazines

        this.getDataPageNavigationLecture();

        /* console.log(
          'this.listPagesByCycleMagazine =',
          this.listPagesByCycleMagazine
        );*/

        // alert(response.reponse)
      });
  }

  get currentPage(): string {
    if (
      this.listPagesByCycleMagazine[this.currentIndex] &&
      this.listPagesByCycleMagazine[this.currentIndex].url
    ) {
      return this.listPagesByCycleMagazine[this.currentIndex].url;
    } else {
      return '';
    }
  }

  nextPage() {
    if (this.currentIndex < this.listPagesByCycleMagazine.length - 1) {
      this.currentIndex++;

      /********************************************************************* */

      this.hist_nav_json[this.indexCycleMagHistNav].currentIndex =
        this.currentIndex;
      this.hist_nav_json[this.indexCycleMagHistNav].date = new Date();

      if (
        this.hist_nav_json[this.indexCycleMagHistNav].currentIndexMax <
        this.currentIndex
      ) {
        this.hist_nav_json[this.indexCycleMagHistNav].currentIndexMax =
          this.currentIndex;
      }

      localStorage.setItem(
        'historique-navigation-cycle-magazines',
        JSON.stringify(this.hist_nav_json)
      );

      /********************************************************************* */
    }
  }

  prevPage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;

      /********************************************************************* */

      this.hist_nav_json[this.indexCycleMagHistNav].currentIndex =
        this.currentIndex;

      this.hist_nav_json[this.indexCycleMagHistNav].date = new Date();

      if (
        this.hist_nav_json[this.indexCycleMagHistNav].currentIndexMax <
        this.currentIndex
      ) {
        this.hist_nav_json[this.indexCycleMagHistNav].currentIndexMax =
          this.currentIndex;
      }

      localStorage.setItem(
        'historique-navigation-cycle-magazines',
        JSON.stringify(this.hist_nav_json)
      );

      /********************************************************************* */
    }
  }

  goToPage(index: number) {
    this.currentIndex = index;
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

  onModelChangeList() {
    this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.selectedModel
    );
  }

  openListModal() {
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
      nom_document: this.nom_magazine,
      type_document: 'magazine',
      url: this.listPagesByCycleMagazine[this.currentIndex].url,
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
