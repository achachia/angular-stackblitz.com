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
  private apiUrl =
    'https://backend-mega-book-theta.vercel.app/api'; // adapte l’URL à ton API

  constructor(private http: HttpClient) {}

  /* getMagazines(): Observable<Magazine[]> {
    return this.http.get<Magazine[]>(this.apiUrl);
  }*/

  /* getMagazines(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }*/

  getLastMagazinesByTheme(): Observable<any[]> {
    const body = { keyTheme: 'Science' };
    this.apiUrl = this.apiUrl + '/getLastCyclesMagazines'
    return this.http.post<any[]>(this.apiUrl, body);
  }

  listMagazines(nomTheme: any): Observable<any[]> {
    const body = { keyTheme: nomTheme };
    this.apiUrl = this.apiUrl + '/listMagazinesBytheme'
    return this.http.post<any[]>(this.apiUrl, body);
  }
}
