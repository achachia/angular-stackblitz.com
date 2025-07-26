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

  getIdentificationUser(_email: any, _password: any): Observable<any[]> {
    const objectUser = { email: _email, password: _password };
    const body = { objectUser };
    const Url = this.apiUrl + '/auth/signin';
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

  updateDataPageNavigationLecture(ObjectNavigationPage: any): Observable<any[]> {
    const body = { ObjectNavigationPage };
    const Url = this.apiUrl + '/postUpdatePageNavigationLecture';
    return this.http.post<any[]>(Url, body);
  }

  loadListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = { token : ObjectListeLecture.token};
    const Url = this.apiUrl + '/getListeLecture';
    return this.http.post<any[]>(Url, body);
  }

  loadDataListeLectureById(ObjectListeLecture: any): Observable<any[]> {
    const body = { token : ObjectListeLecture.token, liste_id: ObjectListeLecture.liste_id};
    const Url = this.apiUrl + '/getListeLectureById';
    return this.http.post<any[]>(Url, body);
  }

  postAddListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = { token : ObjectListeLecture.token, titre :  ObjectListeLecture.titre, pagesListe : ObjectListeLecture.pagesListe, tagsListe: ObjectListeLecture.tagsListe};
    const Url = this.apiUrl + '/postAddListeLecture';
    return this.http.post<any[]>(Url, body);
  }

  postEditListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = { liste_id : ObjectListeLecture._id, token : ObjectListeLecture.token, titre :  ObjectListeLecture.titre, pagesListe : ObjectListeLecture.pagesListe, tagsListe: ObjectListeLecture.tagsListe};
    const Url = this.apiUrl + '/postEditListeLecture';
    return this.http.post<any[]>(Url, body);
  }

  deleteListeLecture(ObjectListeLecture: any): Observable<any[]> {
    const body = { token : ObjectListeLecture.token , liste_id: ObjectListeLecture._id};
    const Url = this.apiUrl + '/postDeleteListeLecture';
    return this.http.post<any[]>(Url, body);
  }

}
