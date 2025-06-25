import { Component } from '@angular/core';
import { NgStyle, NgIf, NgFor } from '@angular/common';
import { MagazineService } from './../../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-themes-livres',
  imports: [NgStyle, NgIf, NgFor],
  templateUrl: './list-themes-livres.html',
  styleUrl: './list-themes-livres.css',
})
export class ListThemesLivres {
  listThemes: any[] = [];

  constructor(private magazineService: MagazineService, public router: Router) {
    this.getThemesLivre();
  }

  getThemesLivre() {
    this.magazineService.getListeThemes().subscribe((response: any) => {
      console.log('Réponse JSON complète:', response);
      const listThemes = response.data[1].listThemes; // si la réponse EST directement un tableau de magazines

      this.listThemes = listThemes.map((theme: any) => ({
        name: theme.valueTheme,
        keyTheme: theme.keyTheme,
        description: 'Un thème violet/orangé pour une touche créative.',
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 12C17.5 14.5 15.5 16.5 13 16.5H11C8.5 16.5 6.5 14.5 6.5 12S8.5 7.5 11 7.5H13C15.5 7.5 17.5 9.5 17.5 12ZM12 9C10.3 9 9 10.3 9 12S10.3 15 12 15S15 13.7 15 12S13.7 9 12 9ZM12 2L15.39 5.39C13.71 4.5 11.84 4.5 10.16 5.39L12 2ZM20 12L16.61 15.39C17.5 13.71 17.5 11.84 16.61 10.16L20 12ZM12 22L8.61 18.61C10.29 19.5 12.16 19.5 13.84 18.61L12 22ZM4 12L7.39 8.61C6.5 10.29 6.5 12.16 7.39 13.84L4 12Z" fill="white"/>
          </svg>`,
        gradient: this.getRandomGradient(),
      }));

      console.log('this.listThemes =', this.listThemes);

      // alert(response.reponse)
    });
  }

  getRandomColor(): string {
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`;
  }

  // Fonction pour générer un gradient CSS aléatoire
  getRandomGradient(): string {
    const color1 = this.getRandomColor();
    const color2 = this.getRandomColor();
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }

  selectTheme(theme: any) {
    // Action à réaliser lors du clic sur un thème
    // alert(`Thème sélectionné : ${theme.name}`);
    this.router.navigate(['/livres', theme.keyTheme]);
  }
}
