import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Content } from '../Models/Content';
import { DtoContent } from '../Models/DtoContent';
import { DtoContentComplete } from '../Models/DtoContentComplete';
import { DtoSeason } from '../Models/DtoSeason';
import { DtoEpisode } from '../Models/DtoEpisode';
import { DtoAllEpisode } from '../Models/DtoAllEpisode';

@Injectable({
    providedIn: 'root'
})
export class ContentService {
    private apiUrl = 'http://localhost:8080/rest/api';

    private http = inject(HttpClient);

    public getAllContents(): Observable<Content[]> {
        return this.http.get<Content[]>(`${this.apiUrl}/get-all-content`);
    }

    public getContentById(id: String): Observable<Content> {
        return this.http.get<Content>(`${this.apiUrl}/get-content-by-id/${id}`);
    }

    public getContentByTitle(title: String): Observable<Content> {
        return this.http.get<Content>(`${this.apiUrl}/get-content-by-title/${title}`);
    }

    public addContent(content: DtoContent): Observable<Content> {
        return this.http.post<Content>(`${this.apiUrl}/add-content`, content);
    }

    public updateContent(content: DtoContent): Observable<Content> {
        return this.http.put<Content>(`${this.apiUrl}/update-content`, content);
    }

    public deleteContent(id: string): Observable<Content> {
        return this.http.delete<Content>(`${this.apiUrl}/delete-content/${id}`);
    }

    public getSeasonsInformations(id: String, seasonNumber: number): Observable<any> {
        return this.http.get<any>(`http://www.omdbapi.com/?i=${id}&apikey=357a94f0&Season=${seasonNumber}`);
    }

    public getSeriesInformation(id: String): Observable<any> {
        return this.http.get<any>(`http://www.omdbapi.com/?i=${id}&apikey=357a94f0`);
    }

    public addContentComplete(content: DtoContentComplete): Observable<Content> {
        return this.http.post<Content>(`${this.apiUrl}/add-content-complete`, content);
    }

    public addSeasonToSeries(season: DtoSeason): Observable<Content> {
        return this.http.post<Content>(`${this.apiUrl}/add-season-to-series`, season);
    }

    public addEpisodeToSeason(episode: DtoEpisode): Observable<Content> {
        return this.http.post<Content>(`${this.apiUrl}/add-episode-to-season`, episode);
    }

    public getCompleteContentById(id: String): Observable<DtoContentComplete> {
        return this.http.get<DtoContentComplete>(`${this.apiUrl}/get-complete-content-by-id/${id}`);
    }

    public updateCompleteContent(content: DtoContentComplete): Observable<boolean> {
        return this.http.put<boolean>(`${this.apiUrl}/update-complete-content`, content);
    }

     public getPageContentByType(contentType: number,page:number,size:number): Observable<DtoContentComplete> {
        return this.http.get<DtoContentComplete>(`${this.apiUrl}/get-page-content?type=${contentType}&page=${page}&size=${size}`);
    }

     public getPageEpisodeContentBySeason(seasonId: string,page:number,size:number): Observable<DtoContentComplete> {
        return this.http.get<DtoContentComplete>(`${this.apiUrl}/get-episode-content-page?seasonId=${seasonId}&page=${page}&size=${size}`);
    }

     public addAllEpisodes(episodeList: DtoAllEpisode[]): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/add-all-episode`, episodeList);
    }

}
