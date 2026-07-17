import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Content } from '../Models/Content';
import { DtoContent } from '../Models/DtoContent';
import { DtoContentComplete } from '../Models/DtoContentComplete';
import { DtoSeason } from '../Models/DtoSeason';
import { DtoEpisode } from '../Models/DtoEpisode';
import { DtoAllEpisode } from '../Models/DtoAllEpisode';
import { DtoAddContent } from '../Models/DtoAddContent';
import { DtoEpisodeWithActors } from '../Models/DtoEpisodeWithActors';

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

     public getPageContentByType(contentType: number,page:number,size:number,query:string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/get-page-content?type=${contentType}&page=${page}&size=${size}&query=${query}`);
    }

     public getPageEpisodeContentBySeason(seasonId: string,page:number,size:number,query:string): Observable<DtoContent[]> {
        return this.http.get<DtoContent[]>(`${this.apiUrl}/get-episode-content-page?seasonId=${seasonId}&page=${page}&size=${size}&query=${query}`);
    }

     public addAllEpisodes(episodeList: DtoAllEpisode[]): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/add-all-episode`, episodeList);
    }

    public addContentWithActors(content: DtoAddContent): Observable<Content> {
        return this.http.post<Content>(`${this.apiUrl}/add-content-with-actors`, content);
    }

    public updateContentWithActors(content: DtoAddContent): Observable<boolean> {
        return this.http.put<boolean>(`${this.apiUrl}/update-content-with-actors`, content);
    }

     public deleteCompleteContent(id: string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/delete-complete-content/${id}`);
    }

    public addEpisodeWithActorsToSeason(episode: DtoEpisodeWithActors): Observable<Content> {
        return this.http.post<Content>(`${this.apiUrl}/add-episode-with-actors-to-season`, episode);
    }

     public getSeasonsBySeriesId(id: String): Observable<DtoContentComplete[]> {
        return this.http.get<DtoContentComplete[]>(`${this.apiUrl}/get-seasons-by-series-id/${id}`);
    }

     public deleteEpisode(seasonId: string,episodeId:string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/delete-episode?seasonId=${seasonId}&episodeId=${episodeId}`);
    }

      public getContentNames(contentIdList: string[]): Observable<string[]> {
        return this.http.put<string[]>(`${this.apiUrl}/get-content-names`,contentIdList);
    }

    
}
