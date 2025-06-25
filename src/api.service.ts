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
  

  getLastCyclesMagazines(_keyTheme: any): Observable<any[]> {
    const body = {keyTheme : _keyTheme };
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
}
