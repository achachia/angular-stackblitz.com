import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Magazine {
  id: number;
  titre: string;
  // autres propriétés selon ton JSON
}

@Injectable({ providedIn: 'root' })
export class MagazineService {
  private apiUrl = 'https://backend-mega-book-theta.vercel.app/api'; // adapte l’URL à ton API

  constructor(private http: HttpClient) {}

  /* getMagazines(): Observable<Magazine[]> {
    return this.http.get<Magazine[]>(this.apiUrl);
  }*/

  /* getMagazines(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }*/

  getOCRPage(infosOcr: any): Observable<any[]> {
    const body = { urlImage: infosOcr.urlImage, token: infosOcr.token };
    const Url = this.apiUrl + '/getOcrPageLive';
    return this.http.post<any[]>(Url, body);
  }

  getIdentificationUser(_email: any, _password: any): Observable<any[]> {
    const objectUser = { email: _email, password: _password };
    const body = { objectUser };
    const Url = this.apiUrl + '/auth/signin';
    return this.http.post<any[]>(Url, body);
  }

  getDataUser(objectUser: any): Observable<any[]> {
    const body = { token: objectUser.token };
    const Url = this.apiUrl + '/getDataUserApp';
    return this.http.post<any[]>(Url, body);
  }

  updateDataUser(objectUser: any): Observable<any[]> {
    let body: any = {};

    if (objectUser.token && objectUser.token != '') {
      body.token = objectUser.token;
    }

    if (objectUser.email && objectUser.email != '') {
      body.email = objectUser.email;
    }

    if (objectUser.favoris_magazines) {
      body.favoris_magazines = objectUser.favoris_magazines;
    }

    if (objectUser.favoris_livres) {
      body.favoris_livres = objectUser.favoris_livres;
    }

    const Url = this.apiUrl + '/postUpdateUserApp';
    return this.http.post<any[]>(Url, body);
  }

  getListRecomandationsLivres(infos: any): Observable<any[]> {
    const body = {token : infos.token};
    const Url = this.apiUrl + '/getListRecommandationsLectureLivre';
    return this.http.post<any[]>(Url, body);
  }

  getListRecomandationsMagazines(infos: any): Observable<any[]> {
    const body = {token : infos.token, keyTheme: infos.keyTheme};
    const Url = this.apiUrl + '/getListRecommandationsLectureMagazine';
    return this.http.post<any[]>(Url, body);
  }

  getListHistoriquesConsultation(infos: any): Observable<any[]> {
    const body = {token : infos.token};
    const Url = this.apiUrl + '/getListHistoriqueNavigationLecture';
    return this.http.post<any[]>(Url, body);
  }

  getLastCyclesMagazines(_keyTheme: any): Observable<any[]> {
    const body = { keyTheme: _keyTheme };
    const Url = this.apiUrl + '/getLastCyclesMagazines';
    return this.http.post<any[]>(Url, body);
  }

  getLastLivres(): Observable<any[]> {
    const body = {};
    const Url = this.apiUrl + '/getLastLivres';
    return this.http.post<any[]>(Url, body);
  }

  getListeThemes(): Observable<any[]> {
    const body = {};
    const Url = this.apiUrl + '/getListeItemsBySectionMenuApp';
    return this.http.post<any[]>(Url, body);
  }

  getLastMagazinesByTheme(): Observable<any[]> {
    const body = { keyTheme: 'Science' };
    const Url = this.apiUrl + '/getLastCyclesMagazines';
    return this.http.post<any[]>(Url, body);
  }

  listMagazines(nomTheme: any): Observable<any[]> {
    const body = { keyTheme: nomTheme };
    const Url = this.apiUrl + '/listMagazinesBytheme';
    return this.http.post<any[]>(Url, body);
  }

  listCyclesMagazine(keyMagazine: any): Observable<any[]> {
    const body = { keyMagazine: keyMagazine };
    const Url = this.apiUrl + '/listNumeroMagazine';
    return this.http.post<any[]>(Url, body);
  }

  listPagesByCycleMagazine(cycle_magazine_id: any): Observable<any[]> {
    const body = { cycle_magazine_id: cycle_magazine_id };
    const Url = this.apiUrl + '/listPagesByMagazine';
    return this.http.post<any[]>(Url, body);
  }

  listLivresByTheme(keyTheme: any): Observable<any[]> {
    const body = { keyTheme: keyTheme };
    const Url = this.apiUrl + '/listLivresBytheme';
    return this.http.post<any[]>(Url, body);
  }

  listPagesByLivre(livre_id: any): Observable<any[]> {
    const body = { livre_id: livre_id };
    const Url = this.apiUrl + '/listPagesByLivre';
    return this.http.post<any[]>(Url, body);
  }

  getDataPageNavigationLecture(ObjectNavigationPage: any): Observable<any[]> {
    const body = { ObjectNavigationPage };
    const Url = this.apiUrl + '/getDataPageNavigationLecture';
    return this.http.post<any[]>(Url, body);
  }

  updateDataPageNavigationLecture(
    ObjectNavigationPage: any
  ): Observable<any[]> {
    const body = { ObjectNavigationPage };
    const Url = this.apiUrl + '/postUpdatePageNavigationLecture';
    return this.http.post<any[]>(Url, body);
  }

  loadListeNotesLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = { token: ObjectListeLecture.token };
    const Url = this.apiUrl + '/getListeNote';
    return this.http.post<any[]>(Url, body);
  }

  loadListeNoteLectureById(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      liste_id: ObjectListeLecture.liste_id,
    };
    const Url = this.apiUrl + '/getListeNoteById';
    return this.http.post<any[]>(Url, body);
  }

  postAddNoteListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      titre: ObjectListeLecture.titre,
      notesListe: ObjectListeLecture.notesListe,
      tagsListe: ObjectListeLecture.tagsListe,
    };
    const Url = this.apiUrl + '/postAddListeNote';
    return this.http.post<any[]>(Url, body);
  }

  postEditListeNoteLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      liste_id: ObjectListeLecture.liste_id,
      token: ObjectListeLecture.token,
      titre: ObjectListeLecture.titre,
      notesListe: ObjectListeLecture.notesListe,
      tagsListe: ObjectListeLecture.tagsListe,
    };
    const Url = this.apiUrl + '/postEditListeNote';
    return this.http.post<any[]>(Url, body);
  }

  loadListeLectureLivre(ObjectListeLecture: any): Observable<any[]> {
    const body = { token: ObjectListeLecture.token };
    const Url = this.apiUrl + '/getListeLectureLivre';
    return this.http.post<any[]>(Url, body);
  }

  loadListeLectureLivreById(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      liste_id: ObjectListeLecture.liste_id,
    };
    const Url = this.apiUrl + '/getListeLectureLivreById';
    return this.http.post<any[]>(Url, body);
  }

  postAddListeLectureLivre(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      titre: ObjectListeLecture.titre,
      livresListe: ObjectListeLecture.livresListe,
      tagsListe: ObjectListeLecture.tagsListe,
    };
    const Url = this.apiUrl + '/postAddListeLectureLivre';
    return this.http.post<any[]>(Url, body);
  }

  postEditListeLectureLivre(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      liste_id: ObjectListeLecture._id,
      token: ObjectListeLecture.token,
      titre: ObjectListeLecture.titre,
      livresListe: ObjectListeLecture.livresListe,
      tagsListe: ObjectListeLecture.tagsListe,
    };
    const Url = this.apiUrl + '/postEditListeLectureLivre';
    return this.http.post<any[]>(Url, body);
  }

  deleteListeNoteLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      liste_id: ObjectListeLecture._id,
    };
    const Url = this.apiUrl + '/postDeleteListeNote';
    return this.http.post<any[]>(Url, body);
  }

  deleteListeLectureLivre(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      liste_id: ObjectListeLecture._id,
    };
    const Url = this.apiUrl + '/postDeleteListeLectureLivre';
    return this.http.post<any[]>(Url, body);
  }

  loadListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = { token: ObjectListeLecture.token };
    const Url = this.apiUrl + '/getListeLecture';
    return this.http.post<any[]>(Url, body);
  }

  loadDataListeLectureById(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      liste_id: ObjectListeLecture.liste_id,
    };
    const Url = this.apiUrl + '/getListeLectureById';
    return this.http.post<any[]>(Url, body);
  }

  postAddListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      titre: ObjectListeLecture.titre,
      pagesListe: ObjectListeLecture.pagesListe,
      tagsListe: ObjectListeLecture.tagsListe,
    };
    const Url = this.apiUrl + '/postAddListeLecture';
    return this.http.post<any[]>(Url, body);
  }

  postEditListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      liste_id: ObjectListeLecture._id,
      token: ObjectListeLecture.token,
      titre: ObjectListeLecture.titre,
      pagesListe: ObjectListeLecture.pagesListe,
      tagsListe: ObjectListeLecture.tagsListe,
    };
    const Url = this.apiUrl + '/postEditListeLecture';
    return this.http.post<any[]>(Url, body);
  }

  deleteListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = {
      token: ObjectListeLecture.token,
      liste_id: ObjectListeLecture._id,
    };
    const Url = this.apiUrl + '/postDeleteListeLecture';
    return this.http.post<any[]>(Url, body);
  }
}
