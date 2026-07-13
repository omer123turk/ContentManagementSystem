import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovieCast } from '../Models/MovieCast';
import { DtoMovieCast } from '../Models/DtoMovieCast';
import { DtoMovieCastUpdate } from '../Models/DtoMovieCastUpdate';


@Injectable({
    providedIn: 'root'
})
export class MovieCastService {
    private apiUrl = 'http://localhost:8080/rest/api';
    private http = inject(HttpClient);

    public addCast(movieCast: DtoMovieCast): Observable<MovieCast> {
        return this.http.post<MovieCast>(`${this.apiUrl}/add-cast`, movieCast);
    }


    public getCastsByContentId(id: string): Observable<MovieCast[]> {
        return this.http.get<MovieCast[]>(`${this.apiUrl}/get-casts-by-contentId/${id}`);
    }

    public getCastById(id: number): Observable<MovieCast> {
        return this.http.get<MovieCast>(`${this.apiUrl}/get-cast-by-id/${id}`);
    }

    public getAllCasts(): Observable<MovieCast[]> {
        return this.http.get<MovieCast[]>(`${this.apiUrl}/get-all-casts`);
    }

    public updateCast(movieCast: DtoMovieCastUpdate): Observable<MovieCast> {
        return this.http.put<MovieCast>(`${this.apiUrl}/update-cast`, movieCast);
    }

    public deleteCast(id: number): Observable<MovieCast> {
        return this.http.delete<MovieCast>(`${this.apiUrl}/delete-cast/${id}`);
    }

    public getPageCast(page: number, size: number): Observable<DtoMovieCast> {
        return this.http.get<DtoMovieCast>(`${this.apiUrl}/get-cast-page?page=${page}&size=${size}`);
    }

    public updateCastByContentId(id: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/update-cast-by-deleted-content/${id}`);
    }

}
