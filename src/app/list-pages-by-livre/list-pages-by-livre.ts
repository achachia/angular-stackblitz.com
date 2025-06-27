import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom'; // https://www.npmjs.com/package/@meddv/ngx-pinch-zoom
import { NgIf, NgFor } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // 👈 à importer ici

@Component({
  selector: 'app-list-pages-by-livre',
  imports: [PinchZoomComponent, NgIf, NgFor, FormsModule],
  templateUrl: './list-pages-by-livre.html',
  styleUrl: './list-pages-by-livre.css',
  animations: [
    trigger('fadeImage', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ListPagesByLivre {
  listPagesByLivre: any[] = [];

  livre_id: any;

  currentIndex = 0;

  isZoomed = false;

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

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.route.paramMap.subscribe((params) => {
      this.livre_id = params.get('livre_id');
      console.log('this.livre_id =', this.livre_id);

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

  getListPagesByLivre() {
    this.magazineService
      .listPagesByLivre(this.livre_id)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);
        this.listPagesByLivre = response.listPageByLivre; // si la réponse EST directement un tableau de magazines

        console.log('this.listPagesByLivre =', this.listPagesByLivre);

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
}
