import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom'; // https://www.npmjs.com/package/@meddv/ngx-pinch-zoom
import { NgIf, NgFor } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-list-pages-by-livre',
  imports: [PinchZoomComponent, NgIf, NgFor],
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

  constructor(
    private route: ActivatedRoute,
    private magazineService: MagazineService,
    public router: Router
  ) {
    this.route.paramMap.subscribe((params) => {
      this.livre_id = params.get('livre_id');
      console.log('this.cycle_magazine_id =', this.livre_id);
      this.getListPagesByLivre();
      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
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
    return this.listPagesByLivre[this.currentIndex].url;
  }

  nextPage() {
    if (this.currentIndex < this.listPagesByLivre.length - 1) {
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
