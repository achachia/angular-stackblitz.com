import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom'; // https://www.npmjs.com/package/@meddv/ngx-pinch-zoom
import { NgIf, NgFor } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-list-pages-by-numero-magazine',
  imports: [PinchZoomComponent, NgIf, NgFor],
  templateUrl: './list-pages-by-numero-magazine.html',
  styleUrl: './list-pages-by-numero-magazine.css',
  animations: [
    trigger('fadeImage', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ListPagesByNumeroMagazine {
  listPagesByCycleMagazine: any[] = [];

  cycle_magazine_id: any;

  currentIndex = 0;

  isZoomed = false;

  chatVisible: boolean = false;

  chatbotUrlUnsafe: string =
    'https://app.vectorshift.ai/chatbots/deployed/685c47a653eb91b72fc8d3e6';

  chatbotUrlSafe!: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.route.paramMap.subscribe((params) => {
      this.cycle_magazine_id = params.get('cycle_magazine_id');
      console.log('this.cycle_magazine_id =', this.cycle_magazine_id);
      this.getListPagesByCycleMagazine();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  ngOnInit() {
    this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.chatbotUrlUnsafe
    );
  }

  getListPagesByCycleMagazine() {
    this.magazineService
      .listPagesByCycleMagazine(this.cycle_magazine_id)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);
        this.listPagesByCycleMagazine = response.listPageByNumeroMagazine; // si la réponse EST directement un tableau de magazines

        console.log(
          'this.listPagesByCycleMagazine =',
          this.listPagesByCycleMagazine
        );

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
    }
  }

  prevPage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
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
}
