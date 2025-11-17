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

interface ListLangue {
  _id?: string;
  label: string;
}

@Component({
  selector: 'app-list-pages-by-livre',
  imports: [
    PinchZoomComponent,
    NgIf,
    NgFor,
    FormsModule,
    Header,
    NgClass,
    AngularEditorModule,
  ],
  templateUrl: './list-pages-by-livre.html',
  styleUrl: './list-pages-by-livre.css',
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
export class ListPagesByLivre {
  infosLivre: any = { _id: null, listSommaires: [] };

  listPagesByLivre: any[] = [];

  listRocommandationsLivre: any[] = [];

  keyTheme: string | null = null;

  nomTheme: string | null = null;

  cover_livre: string | null = null;

  nom_livre: string | null = null;

  livre_id: any;

  currentIndex = 0;

  isZoomed = false;

  menuOpen = false;

  toastMessage = '';

  toastType: 'success' | 'error' | 'warning' = 'success';

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
    {
      value: 'Custom-ai-gpt-5-nano',
      label: 'Custom-ai (gpt-5-nano)',
    },
  ];

  listModelsIA = [
    {
      value: 'deepseek-chat',
      label: 'Custom-ai (deepseek-chat)',
    },
    {
      value: 'gemini-2.0-flash',
      label: 'Custom-ai (gemini-2.0-flash)',
    },
    {
      value: 'gemini-1.5-flash',
      label: 'Custom-ai (gemini-1.5-flash)',
    },
    {
      value: 'grok-beta',
      label: 'Custom-ai (grok-beta)',
    },
    {
      value: 'claude-sonnet-4',
      label: 'Custom-ai (claude-sonnet-4)',
    },
    {
      value: 'o3-mini',
      label: 'Custom-ai (o3-mini)',
    },
  ]; // 'deepseek-chat'; // deepseek-chat / gemini-2.0-flash / gemini-1.5-flash / grok-beta / claude-sonnet-4 / o3-mini

  listTypesPromptsModelsIA = [
    {
      value:
        "Veuillez lire le texte suivant et en résumer brièvement les points principaux. Concentrez-vous uniquement sur les thèmes, idées ou événements clés présentés. N'incluez aucune explication ou description supplémentaire en dehors du résumé lui-même. Voici le texte.[texte: {text}]",
      label:
        "Veuillez lire le texte suivant et en résumer brièvement les points principaux. Concentrez-vous uniquement sur les thèmes, idées ou événements clés présentés. N'incluez aucune explication ou description supplémentaire en dehors du résumé lui-même. Voici le texte.[texte: {text}]",
    },
    {
      value:
        'Peux-tu extraire et mettre en évidence les idées principales de ce texte .[texte: {text}]',
      label:
        'Peux-tu extraire et mettre en évidence les idées principales de ce texte .[texte: {text}]',
    },
    {
      value:
        'Résume ce texte sous forme de bullet points clairs et concis .[texte: {text}]',
      label:
        'Résume ce texte sous forme de bullet points clairs et concis .[texte: {text}]',
    },
  ];

  typePrompt: any = '';

  textPrompt: any = '';

  selectedModel =
    'https://app.vectorshift.ai/chatbots/deployed/685c47a653eb91b72fc8d3e6';

  isListModelsIAModalOpen: any = false;

  isListModalOpen = false;

  listsLecture: List[] = []; // Tableau qui contiendra tes listes

  showSessionExpiredModa: any = false;

  isListModalOpenEdit: boolean = false;

  isListModalOpenTranslate: boolean = false;

  textTranslat: any = '';

  langue_id: any = 'anglais';

  listsLangues: ListLangue[] = [
    { _id: '', label: '' },
    { _id: 'francais', label: 'Francais' },
    { _id: 'anglais', label: 'Anglais' },
    { _id: 'arabe', label: 'Arabe' },
  ]; // Tableau qui contiendra tes listes

  selectedListeLangue: any = 'anglais';

  isLoadingTranslat: boolean = false;

  isShowTranslationModalPage: boolean = false;

  translatePageText = '';

  isListModalOpenSummarizingText: boolean = false;

  isLoadingSummarizingText: boolean = false;

  summarizingText: any = '';

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
      text:
        'Bonjour ! Comment puis-je vous aider ?<span class="timestamp" >' +
        this.getCurrentTime() +
        '</span>',
      time: new Date(),
    },
  ];

  histListObjectBots: any[] = [];

  indexObjectBot = -1;

  isLoading: boolean = false;

  isListModalOpenSommaire: boolean = false;

  nouveauTitreSommaire: string = '';

  nouveauNumeroPage: number | null = null;

  isModalEditItemSommaire: boolean = false;

  currentItemSommaire = {
    curentIndex: 0,
    titre: '',
    page: 0,
    resumeText: '',
  }; // L'objet Item Sommaire  au formulaire

  selectedSommaire: any = null;

  selectedIndexItemSommaire: any = null;

  isConfirmOpen: boolean = false;

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
      this.infosLivre._id = params.get('livre_id');
      this.getDataLivreApi();
      console.log('this.livre_id=', this.livre_id);
      this.cover_livre = params.get('cover_livre');
      const nomLivreEncoded = params.get('nom_livre');
      if (nomLivreEncoded !== null) {
        this.nom_livre = decodeURIComponent(nomLivreEncoded);
        this.source = decodeURIComponent(nomLivreEncoded) + ' (Livre)';
      } else {
        this.nom_livre = '';
      }

      /******************************************************* */

      // localStorage.removeItem('historique-navigation-livres'); // test

      this.nouveauNumeroPage = this.currentIndex;

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

          this.nouveauNumeroPage = this.currentIndex;

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

      const histMessagesBot = localStorage.getItem('historique-messages-bot');

      if (histMessagesBot) {
        const histMessagesBotJson = JSON.parse(histMessagesBot);

        this.histListObjectBots = histMessagesBotJson;

        const filtreMessagesBotLivre = histMessagesBotJson.filter(
          (objectBot: any) => {
            return (
              objectBot.type === 'livre' && objectBot._id === this.livre_id
            );
          }
        );

        if (filtreMessagesBotLivre.length === 1) {
          this.messages = filtreMessagesBotLivre[0].messages;
          this.indexObjectBot = histMessagesBotJson.findIndex(
            (objectBot: any) => {
              return (
                objectBot.type === 'livre' && objectBot._id === this.livre_id
              );
            }
          );
        }
      }

      /************************************************ */

      this.getListPagesByLivre();

      this.loadListeNotesApi();

      this.getListRecomandationsLivres();

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

  getSommaireLivre() {
    this.isListModalOpenSommaire = true;
  }

  ajouterSommaire() {
    if (!this.nouveauTitreSommaire || !this.nouveauNumeroPage) {
      alert('Merci de remplir le titre et le numéro de page.');
      return;
    }

    this.infosLivre.listSommaires.push({
      titre: this.nouveauTitreSommaire,
      page: this.nouveauNumeroPage,
    });

    this.updateDataLivreApi();

    // Réinitialiser les champs de saisie
    this.nouveauTitreSommaire = '';
    this.nouveauNumeroPage = null;
  }

  // Méthode appelée par le bouton "Modifier"
  modifierSommaire(item: { titre: string; page: number }) {
    // Exemple simple d'édition dans une prompt
    const nouveauTitre = prompt('Modifier le titre', item.titre);
    const nouvellePageStr = prompt(
      'Modifier le numéro de page',
      item.page.toString()
    );
    const nouvellePage = Number(nouvellePageStr);

    if (
      nouveauTitre &&
      nouvellePage &&
      !isNaN(nouvellePage) &&
      nouvellePage > 0
    ) {
      item.titre = nouveauTitre;
      item.page = nouvellePage;
      this.updateDataLivreApi();
    } else {
      alert('Modification annulée ou valeurs invalides.');
    }
  }

  modifierSommaireFormModal(index: number) {
    this.isModalEditItemSommaire = true;

    this.currentItemSommaire.curentIndex = index;

    this.currentItemSommaire.titre = this.infosLivre.listSommaires[index].titre;

    this.currentItemSommaire.page = this.infosLivre.listSommaires[index].page;

    this.currentItemSommaire.resumeText =
      this.infosLivre.listSommaires[index].resumeText;
  }

  submitFormEditItemSommaire() {
    console.log('this.currentItemSommaire =', this.currentItemSommaire);

    const _index = this.currentItemSommaire.curentIndex;

    this.infosLivre.listSommaires[_index].titre =
      this.currentItemSommaire.titre;

    this.infosLivre.listSommaires[_index].page = this.currentItemSommaire.page;

    this.infosLivre.listSommaires[_index].resumeText =
      this.currentItemSommaire.resumeText;

    this.updateDataLivreApi();
  }

  closeModalEditItemSommaire() {
    this.isModalEditItemSommaire = false;
  }

  // Méthode appelée par le bouton "Supprimer"
  supprimerSommaire(item: { titre: string; page: number }) {
  /*  const confirmSupp = confirm(
      `Supprimer la section "${item.titre}" (page ${item.page}) ?`
    );
    if (confirmSupp) {
      const index = this.infosLivre.listSommaires.indexOf(item);
      if (index > -1) {
        this.infosLivre.listSommaires.splice(index, 1);
        this.updateDataLivreApi();
      }
    }*/

    this.selectedSommaire = item;

    this.isConfirmOpen = true;
  }

  getDataLivreApi() {
    const _token = this.authService.getTokenStorage;

    this.magazineService.getDataLivre(this.infosLivre._id, _token).subscribe(
      (dataRep: any) => {
        console.log('Réponse JSON complète:', dataRep);

        if (dataRep.reponse) {
          this.infosLivre.listSommaires = dataRep.dataLivre.listSommaires;

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

  updateDataLivreApi() {
    const _token = this.authService.getTokenStorage;

    this.magazineService.updateDataLivre(this.infosLivre, _token).subscribe(
      (dataResponse: any) => {
        console.log('Réponse JSON complète:', dataResponse);

        if (dataResponse.reponse) {
          this.listsNotes = dataResponse.data;

          this.getDataLivreApi();

          this.isModalEditItemSommaire = false;

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

  accederPage(numeroPage: number) {
    // Ici, logique pour accéder à la page :
    // par exemple, navigation dans l'application ou affichage du contenu de la page
    console.log('Accès à la page', numeroPage);
    // Exemple : this.router.navigate(['/page', numeroPage]);

    this.currentIndex = numeroPage;
  }

  closeShowSommaireLivre() {
    this.isListModalOpenSommaire = false;
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

  backupdataChatBot() {
    if (this.indexObjectBot >= 0) {
      this.histListObjectBots[this.indexObjectBot].messages = this.messages;
    } else {
      if (this.histListObjectBots.length > 0) {
        this.indexObjectBot = this.histListObjectBots.length;
      } else {
        this.indexObjectBot = 0;
      }

      const histMessagesBot: any = {
        type: 'livre',
        _id: this.livre_id,
        messages: this.messages,
      };

      this.histListObjectBots.push(histMessagesBot);
    }

    localStorage.setItem(
      'historique-messages-bot',
      JSON.stringify(this.histListObjectBots)
    );
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
            text:
              this.questionUser +
              '<span class="timestamp" >' +
              this.getCurrentTime() +
              '</span>',
            time: new Date(),
          });

          this.backupdataChatBot();
        }
      } else {
        this.messages.push({
          from: 'user',
          text:
            this.questionUser +
            '<span class="timestamp" >' +
            this.getCurrentTime() +
            '</span>',
          time: new Date(),
        });

        this.backupdataChatBot();
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

    objectMessage.text +=
      '<span class="timestamp" >' +
      this.getCurrentTime() +
      ' (' +
      this.model +
      ')</span>';

    this.messages.push(objectMessage);

    this.backupdataChatBot();

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
        this.listPagesByLivre[this.currentIndex].url
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

  getListRecomandationsLivres() {
    const _token = this.authService.getTokenStorage;
    const infos: any = {
      token: _token,
    };

    this.magazineService
      .getListRecomandationsLivres(infos)
      .subscribe((response: any) => {
        console.log(
          'Réponse JSON complète-getListRecomandationsLivres:',
          response
        );

        /*
 
         {
    "date": "2023-03-06T07:07:49.436Z",
    "activation": 1,
    "_id": "640591583f61a369304ffe70",
    "titre": "Univers Bitcoin Lancez vous et investissez",
    "token": "1dc101a4-086c-4ad3-8aa6-c59d40363828",
    "cover": "https://i.gyazo.com/fd4f60e23d642812d04a298bd75e2d1f.jpg",
    "auteur": "Thibault Coussin",
    "year": "2022",
    "keyTheme": "Crypto-monnaie/Blockchain",
    "nbr_pages": 187
     }
        */

        this.listRocommandationsLivre = response.listLivres;

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
      });
  }

  selectLivreRecommande(livre: any) {
    this.router.navigate([
      '/list-pages-by-livre',
      livre.keyTheme,
      livre.keyTheme,
      livre._id,
      livre.cover,
      livre.titre,
    ]);
  }

  getOCRPage() {
    const _token = this.authService.getTokenStorage;
    const infosOcr: any = {
      urlImage: this.listPagesByLivre[this.currentIndex].url,
      token: _token,
    };

    this.magazineService.getOCRPage(infosOcr).subscribe(
      (response: any) => {
        console.log('Réponse JSON complète-OCR:', response);

        if (!response.ParsedText.IsErroredOnProcessing) {
          console.log(
            'ocr = ',
            response.ParsedText.ParsedResults[0].ParsedText
          );
          // alert(response.ParsedText.ParsedResults[0].ParsedText);

          this.note =
            this.note + response.ParsedText.ParsedResults[0].ParsedText;

          this.source = this.nom_livre + ' (livre)';

          this.isListModalOpenEdit = true;
        } else {
          this.extractText();
        }

        //console.log('this.magazines =', this.magazines)

        // alert(response.reponse)
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
        this.extractText();
        // this.errorMessage = "Impossible d'accéder au service. Veuillez vérifier votre connexion ou réessayer plus tard.";
      }
    );
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

  closeListModelsIAModal() {
    this.isListModelsIAModalOpen = false;
  }

  onSelectModelIAChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    // Par exemple, retrouver l'objet ListNote sélectionné :
  }

  onSelectTypePromptModelIAChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    // Par exemple, retrouver l'objet ListNote sélectionné :

    this.textPrompt = this.typePrompt.replace('{text}', this.note);

    console.log('typePrompt =', this.typePrompt);
  }

  saveSettingModelsIAForm() {
    this.isListModalOpenSummarizingText = true;

    this.isLoadingSummarizingText = true;

    this.runSummarizingTextChatAi();

    // this.SummarizingTextByAi();
  }

  editNoteForm() {
    this.selectedListeNote.notesListe.push({
      note: this.note,
      source: this.source,
    });

    console.log('this.selectedListeNote =', this.selectedListeNote);

    this.updateDataListeNote();
  }

  SummarizingTextByAi() {
    this.isListModelsIAModalOpen = true;
  }

  closeListModalSummarizingText() {
    this.isListModalOpenSummarizingText = false;
  }

  SummarizingTextForm() {
    this.infosLivre.listSommaires[this.selectedIndexItemSommaire].resumeText =
      this.summarizingText;
    this.updateDataLivreApi();
    this.showToast('Enregistré avec succès!', 'success');
  }

  async runSummarizingTextChatAi() {
    const puter = (window as any).puter;
    // this.deepseekChatOutput = '<h1>DeepSeek Chat:</h1>\n';
    // + this.selectedListeLangue + ' : ' + this.note;

    this.summarizingText = '';

    const chatResp = await puter.ai.chat(this.textPrompt, {
      model: this.model,
      stream: true,
    });

    // console.log('chatResp =', chatResp);

    for await (const part of chatResp) {
      const text = part?.text?.replace(/\n/g, '<br>') ?? '';
      this.summarizingText += text;
      // For Angular change detection to update view, we can trigger manually if needed.
      // await this.delay(10); // permet la mise à jour progressive (optionnel)
    }

    this.isLoadingSummarizingText = false;
  }

  traductionTextByAi() {
    this.isListModalOpenTranslate = true;
    this.isLoadingTranslat = true;
    this.runTranslateTextChatAi();
  }

  closeListModalTranslate() {
    this.isListModalOpenTranslate = false;
  }

  translateTextOcrForm() {
    const _token = this.authService.getTokenStorage;
    const dataPage: any = {
      page_id: this.listPagesByLivre[this.currentIndex]._id,
      token: _token,
      traductionText: this.textTranslat,
    };

    this.magazineService
      .updateDataPageByLivre(dataPage)
      .subscribe((data: any) => {
        if (data.reponse) {
          this.showToast(`La traduction à été bien enregistré`);

          this.translatePageText = this.textTranslat;
        }
      });
  }

  onSelectItemSommaireChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    // Par exemple, retrouver l'objet ListNote sélectionné :

    console.log(
      'selectedValue =',
      selectedValue,
      this.infosLivre.listSommaires
    );
    const selectedIndexItemSommaire = this.infosLivre.listSommaires.findIndex(
      (item: any) => item.titre === selectedValue
    );
    if (selectedIndexItemSommaire) {
      // Vous pouvez aussi mettre à jour d'autres propriétés selon vos besoins
      console.log(
        'selectedIndexItemSommaire affichées :',
        selectedIndexItemSommaire
      );

      this.selectedIndexItemSommaire = selectedIndexItemSommaire;
    }
  }

  onSelectLangueChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    // Par exemple, retrouver l'objet ListNote sélectionné :
    const selectedLangue = this.listsLangues.find(
      (langue) => langue._id === selectedValue
    );
    if (selectedLangue) {
      // Vous pouvez aussi mettre à jour d'autres propriétés selon vos besoins
      console.log('selectedLangue affichées :', selectedLangue);
      this.selectedListeLangue = selectedLangue;
      this.isLoadingTranslat = true;
      this.runTranslateTextChatAi();
    }
  }

  async runTranslateTextChatAi() {
    const puter = (window as any).puter;
    // this.deepseekChatOutput = '<h1>DeepSeek Chat:</h1>\n';
    // + this.selectedListeLangue + ' : ' + this.note;

    this.textTranslat = '';

    const prompt =
      ' traduire ce texte en ' +
      this.selectedListeLangue._id +
      ' : [translate:' +
      this.note +
      '] ';

    console.log('prompt = ', prompt);

    const chatResp = await puter.ai.chat(prompt, {
      model: this.model,
      stream: true,
    });

    // console.log('chatResp =', chatResp);

    for await (const part of chatResp) {
      const text = part?.text?.replace(/\n/g, '<br>') ?? '';
      this.textTranslat += text;
      // For Angular change detection to update view, we can trigger manually if needed.
      // await this.delay(10); // permet la mise à jour progressive (optionnel)
    }

    this.isLoadingTranslat = false;
  }

  getTranslatePage() {
    if (
      this.listPagesByLivre[this.currentIndex].traductionText &&
      this.listPagesByLivre[this.currentIndex].traductionText != ''
    ) {
      this.isShowTranslationModalPage = true;

      this.translatePageText =
        this.listPagesByLivre[this.currentIndex].traductionText;
    } else {
      this.showToast(`Aucune traduction à été trouvé`);
    }
  }

  closeShowTranslationModalPage() {
    this.isShowTranslationModalPage = false;
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
        } else {
          alert('toto');
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
      return 'https://i.postimg.cc/g04kQFrv/Pngtree-colorful-loading-icon-5326551.png';
    }
  }

  nextPage() {
    if (this.currentIndex < this.listPagesByLivre.length - 1) {
      this.currentIndex++;

      this.nouveauNumeroPage = this.currentIndex;

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

      this.nouveauNumeroPage = this.currentIndex;

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

  nextPageTranslate() {
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

      this.getTranslatePage();
    }
  }

  prevPageTranslate() {
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

      this.getTranslatePage();

      /********************************************************************* */
    }
  }

  goToPage(index: number) {
    this.currentIndex = index;
    this.nouveauNumeroPage = this.currentIndex;
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

    // Annuler la suppression (fermer le modal)
    cancelDelete(): void {
      this.isConfirmOpen = false;
    }

      // Méthode appelée si l'utilisateur confirme
  confirmDeleteSommaire(): void {
    if (this.selectedSommaire) {
      /*this.lists = this.lists.filter(
          (l) => l.titre !== this.listToDelete!.titre
        );*/
        const index = this.infosLivre.listSommaires.indexOf(this.selectedSommaire);
        if (index > -1) {
          this.infosLivre.listSommaires.splice(index, 1);
          this.updateDataLivreApi();
          this.showToast(`La liste "${this.selectedSommaire.titre}" a été supprimée.`);
          this.selectedSommaire = null;
          this.isConfirmOpen = false;
        }      
    
    }
  }

}
