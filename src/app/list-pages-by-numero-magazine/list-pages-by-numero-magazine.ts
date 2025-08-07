import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MagazineService } from './../../api.service';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom'; // https://www.npmjs.com/package/@meddv/ngx-pinch-zoom
import { NgIf, NgFor, NgClass } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // 👈 à importer ici
import { AuthService } from '../../auth.service';
import { Header } from '../header/header';
import {
  AngularEditorConfig,
  AngularEditorModule,
} from '@kolkov/angular-editor';

interface List {
  _id?: string;
  titre: string;
  itemCount?: number; // Exemple: nombre d'éléments dans la liste
  tagsListe?: [];
  pagesListe: [];
}

interface ListNote {
  _id?: string;
  titre: string;
  itemCount?: number; // Exemple: nombre d'éléments dans la liste
  tagsListe?: [];
  notesListe: [];
}

@Component({
  selector: 'app-list-pages-by-numero-magazine',
  imports: [
    PinchZoomComponent,
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    Header,
    AngularEditorModule,
  ],
  templateUrl: './list-pages-by-numero-magazine.html',
  styleUrl: './list-pages-by-numero-magazine.css',
  encapsulation: ViewEncapsulation.None,
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

  listRocommandationsCycleMag: any[] = [];

  keyTheme: any = '';

  nomTheme: any = '';

  cycle_magazine_id: any;

  nom_magazine: any = '';

  cover_magazine: any = '';

  currentIndex = 0;

  isZoomed = false;

  menuOpen = false;

  toastMessage = '';

  toastType: 'success' | 'error' | 'warning' = 'success';

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
    {
      value: 'Custom-ai-deepseek-chat',
      label: 'Custom-ai (deepseek-chat)',
    },
    {
      value: 'Custom-ai-gemini-2.0-flash',
      label: 'Custom-ai (gemini-2.0-flash)',
    },
    {
      value: 'Custom-ai-gemini-1.5-flash',
      label: 'Custom-ai (gemini-1.5-flash)',
    },
    {
      value: 'Custom-ai-grok-beta',
      label: 'Custom-ai (grok-beta)',
    },
    {
      value: 'Custom-ai-claude-sonnet-4',
      label: 'Custom-ai (claude-sonnet-4)',
    },
    {
      value: 'Custom-ai-o3-mini',
      label: 'Custom-ai (o3-mini)',
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

  showSessionExpiredModa: any = false;

  isListModalOpenEdit: boolean = false;

  note: any = '';

  source: any = '';

  note_id: any = '';

  selectedListeNote: any = null;

  listsNotes: ListNote[] = []; // Tableau qui contiendra tes listes

  isConfirmOpenOcr: boolean = false;

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [['bold']],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };

  isFormModalOpenAddListe: boolean = false; // Pour contrôler l'affichage du modal ajouter une liste

  currentList: List = {
    _id: '',
    titre: '',
    itemCount: 0,
    tagsListe: [],
    pagesListe: [],
  }; // L'objet liste lié au formulaire

  model: string = 'deepseek-chat'; // deepseek-chat / gemini-2.0-flash / gemini-1.5-flash / grok-beta / claude-sonnet-4 / o3-mini

  questionUser: any = '';

  messages: any[] = [
    {
      from: 'bot',
      text: 'Bonjour ! Comment puis-je vous aider ?<span class="timestamp" >' +  this.getCurrentTime() + '</span>',
      time: new Date(),
    },
  ];

  isLoading: boolean = false;

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
        this.source = decodeURIComponent(nomMagazineEncoded) + ' (Magazine)';
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
      this.loadListeNotesApi();
      this.getListRecomandationsMagazines();

      // Tu peux maintenant utiliser ce paramètre pour filtrer ou charger les magazines
    });
  }

  async ngOnInit() {
    this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.chatbotUrlUnsafe
    );

    await this.loadPuterScript();

    if (!(window as any).puter || !(window as any).puter.ai?.chat) {
      this.showToast('Erreur: Script Puter non chargé.', 'error');
      return;
    }
  }

  // Chargement dynamique du script Puter
  loadPuterScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('puterjs')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'puterjs';
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Chargement du script Puter échoué'));
      document.body.appendChild(script);
    });
  }

  getCurrentTime(): string {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  async askQuestion() {
    try {
      // console.log('this.questionUser = ', this.questionUser);

      this.isLoading = true;

      if (this.messages.length > 0) {
        const filtreMessage = this.messages.filter((msg: any) => {
          return msg.text === this.questionUser && msg.from === 'user';
        });

        if (filtreMessage.length <= 0) {
          this.messages.push({
            from: 'user',
            text: this.questionUser + '<span class="timestamp" >' + this.getCurrentTime() + '</span>',
            time: new Date(),
          });
        }
      } else {
        this.messages.push({
          from: 'user',
          text: this.questionUser + '<span class="timestamp" >' + this.getCurrentTime() +'</span>',
          time: new Date(),
        });
      }

      await this.runDeepseekChat();
      // await this.runDeepseekReasoner();
    } catch (error: any) {
      const msg = error?.message || error || 'Erreur inconnue';
      // this.deepseekChatOutput = `<span style="color:red;">Erreur: ${msg}</span>`;
      // this.deepseekReasonerOutput = `<span style="color:red;">Erreur: ${msg}</span>`;
    }
  }

  // Appel DeepSeek Chat avec streaming
  async runDeepseekChat() {
    const puter = (window as any).puter;
    // this.deepseekChatOutput = '<h1>DeepSeek Chat:</h1>\n';

    const chatResp = await puter.ai.chat(this.questionUser, {
      model: this.model,
      stream: true,
    });

    // console.log('chatResp =', chatResp);

    let objectMessage = { from: 'bot', text: '', time: new Date() };

    for await (const part of chatResp) {
      const text = part?.text?.replace(/\n/g, '<br>') ?? '';
      objectMessage.text += text;
      // For Angular change detection to update view, we can trigger manually if needed.
      // await this.delay(10); // permet la mise à jour progressive (optionnel)
    }

    objectMessage.text += '<span class="timestamp" >' + this.getCurrentTime() +' (' +  this.model + ')</span>';

    this.messages.push(objectMessage);

    this.isLoading = false;
  }

  async extractText() {
    if (!(window as any).puter) {
      // this.result =   "Le script Puter n'est pas encore chargé. Veuillez essayer dans un instant.";

      this.showToast(
        "Le script Puter n'est pas encore chargé. Veuillez essayer dans un instant.",
        'error'
      );
      return;
    }

    // this.result = 'Extraction en cours...';

    try {
      const puter = (window as any).puter;
      // Appel à img2txt avec URL de l'image
      const texte = await puter.ai.img2txt(
        this.listPagesByCycleMagazine[this.currentIndex].url
      );
      this.note = texte;
      this.isListModalOpenEdit = true;
    } catch (error: any) {
      // this.result =  "Erreur lors de l'extraction du texte : " + (error.message || error);
      this.showToast(
        "Erreur lors de l'extraction du texte : " + (error.message || error),
        'error'
      );
    }
  }

  getOCRPage() {
    const _token = this.authService.getTokenStorage;
    const infosOcr: any = {
      urlImage: this.listPagesByCycleMagazine[this.currentIndex].url,
      token: _token,
    };

    this.magazineService.getOCRPage(infosOcr).subscribe((response: any) => {
      console.log('Réponse JSON complète-OCR:', response);

      if (!response.ParsedText.IsErroredOnProcessing) {
        console.log('ocr = ', response.ParsedText.ParsedResults[0].ParsedText);
        // alert(response.ParsedText.ParsedResults[0].ParsedText);

        this.note = this.note + response.ParsedText.ParsedResults[0].ParsedText;

        this.source = this.nom_magazine + ' (magazine)';
      } else {
        this.extractText();
      }

      //console.log('this.magazines =', this.magazines)

      // alert(response.reponse)
    });
  }

  closeFormModalAddListe(): void {
    this.isFormModalOpenAddListe = false;
  }

  goToAddNewList() {
    this.isFormModalOpenAddListe = true;
  }

  saveListeApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = {
      token: _token,
      titre: this.currentList.titre,
      pagesListe: [],
      tagsListe: [],
    };

    this.magazineService
      .postAddListeLecture(ObjectListeLecture)
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
          pagesListe: [],
          itemCount: 0,
        }; // Réinitialise pour une nouvelle création

        this.closeFormModalAddListe(); // Ferme le modal après sauvegarde

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  onSelectNoteChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    // Par exemple, retrouver l'objet ListNote sélectionné :
    const selectedNote = this.listsNotes.find(
      (note) => note._id === selectedValue
    );
    if (selectedNote) {
      // Vous pouvez aussi mettre à jour d'autres propriétés selon vos besoins
      console.log('Notes affichées :', selectedNote);
      this.selectedListeNote = selectedNote;
    }
  }

  loadListeNotesApi() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeLecture = { token: _token };

    this.magazineService.loadListeNotesLecture(ObjectListeLecture).subscribe(
      (response: any) => {
        console.log('Réponse JSON complète:', response);

        if (response.reponse) {
          this.listsNotes = response.data;

          //console.log('this.magazines =', this.magazines)

          // alert(response.reponse)
        }
      },
      (error) => {
        // Ici, tu interceptes les erreurs réseau ou serveur
        console.error(error);
        if (
          error.error.msg === 'token_not_valid' ||
          error.error.msg === 'token_required'
        ) {
          this.showSessionExpiredModa = true;
        }
        // this.errorMessage = "Impossible d'accéder au service. Veuillez vérifier votre connexion ou réessayer plus tard.";
      }
    );
  }

  closeListModalEdit() {
    this.isListModalOpenEdit = false;
  }

  editNoteForm() {
    this.selectedListeNote.notesListe.push({
      note: this.note,
      source: this.source,
    });

    console.log('this.selectedListeNote =', this.selectedListeNote);

    this.updateDataListeNote();
  }

  // Annuler le suivi ocr (fermer le modal)
  cancelSuiviOcr(): void {
    this.editNoteForm();
  }

  confirmActionOcrNote() {
    this.isConfirmOpenOcr = false;
    this.isListModalOpenEdit = false;
    this.note_id = this.selectedListeNote._id;
  }

  updateDataListeNote() {
    const _token = this.authService.getTokenStorage;

    const ObjectListeNote = {
      token: _token,
      titre: this.selectedListeNote.titre,
      notesListe: this.selectedListeNote.notesListe,
      tagsListe: this.selectedListeNote.tagsListe,
      liste_id: this.selectedListeNote._id,
    };

    // console.log('ObjectListeNote =', ObjectListeNote);

    this.magazineService
      .postEditListeNoteLecture(ObjectListeNote)
      .subscribe((response: any) => {
        console.log('Réponse JSON complète:', response);

        this.showToast(
          `La liste "${ObjectListeNote.titre}" a été enregistré avec succées.`
        );
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
        if (
          error.error.msg === 'token_not_valid' ||
          error.error.msg === 'token_required'
        ) {
          this.showSessionExpiredModa = true;
        }
        // this.errorMessage = "Impossible d'accéder au service. Veuillez vérifier votre connexion ou réessayer plus tard.";
      }
    );
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

    ObjectNavigationPage.dateConsultation = new Date();

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
    ObjectNavigationPage.urlPage =
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
    // console.log('this.selectedModel =', this.selectedModel);

    if (
      this.selectedModel ===
        'https://app.vectorshift.ai/chatbots/deployed/685c47a653eb91b72fc8d3e6' ||
      this.selectedModel ===
        'https://app.vectorshift.ai/chatbots/deployed/685edb8a20d9549cc6bce368'
    ) {
      this.chatbotUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.selectedModel
      );
    }

    if (this.selectedModel === 'Custom-ai-deepseek-chat') {
      this.model = 'deepseek-chat';
    }

    if (this.selectedModel === 'Custom-ai-gemini-2.0-flash') {
      this.model = 'gemini-2.0-flash';
    }

    if (this.selectedModel === 'Custom-ai-gemini-1.5-flash') {
      this.model = 'gemini-1.5-flash';
    }

    if (this.selectedModel === 'Custom-ai-grok-beta') {
      this.model = 'grok-beta';
    }

    if (this.selectedModel === 'Custom-ai-claude-sonnet-4') {
      this.model = 'claude-sonnet-4';
    }

    if (this.selectedModel === 'Custom-ai-o3-mini') {
      this.model = 'o3-mini';
    }
  }

  onModelChangeList() {
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
  /*
  this.showToast('Enregistré avec succès!', 'success');
    this.showToast('Une erreur est survenue.', 'error');
    this.showToast('Attention : saisie incomplète.', 'warning');
  */
  showToast(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success',
    duration: number = 3000
  ) {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, duration);
  }

  getListRecomandationsMagazines() {
    const _token = this.authService.getTokenStorage;
    const infos: any = {
      token: _token,
      keyTheme: this.keyTheme,
    };

    this.magazineService
      .getListRecomandationsMagazines(infos)
      .subscribe((response: any) => {
        console.log(
          'Réponse JSON complète-getListRecomandationsMagazines:',
          response
        );

        this.listRocommandationsCycleMag = response.listNumerosMagazine;

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  selectCycleMagRecommande(cycleMag: any) {
    this.router.navigate([
      '/list-pages-by-numero-magazine',
      this.nomTheme,
      this.keyTheme,
      cycleMag._id,
      cycleMag.cover,
      cycleMag.titre,
    ]);
  }
}
