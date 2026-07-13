import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Metadata } from '../Models/Metadata';
import { Meta } from '@angular/platform-browser';
import { DtoMetadata } from '../Models/DtoMetadata';
import { DtoMetadataUpdate } from '../Models/DtoMetadataUpdate';



@Injectable({
    providedIn:'root'
})
export class MetadataService {
    private apiUrl='http://localhost:8080/rest/api';
    private http=inject(HttpClient);

    public addMetadata(metadata:DtoMetadata):Observable<Metadata>{
        return this.http.post<Metadata>(`${this.apiUrl}/add-metadata`,metadata);
    }

    public getMetadataById(id:number):Observable<Metadata>{
        return this.http.get<Metadata>(`${this.apiUrl}/get-metadataById/${id}`);
    }
    public getAllMetadatas():Observable<Metadata[]>{
        return this.http.get<Metadata[]>(`${this.apiUrl}/get-all-metadata`);
    }

    public updateMetadata(metadata:DtoMetadataUpdate):Observable<Metadata>{
        return this.http.put<Metadata>(`${this.apiUrl}/update-metadata`,metadata);
    }

    public deleteMetadata(id:number):Observable<Metadata>{
        return this.http.delete<Metadata>(`${this.apiUrl}/delete-metadata/${id}`);
    }

    public getMetadataInformations(id:String):Observable<any>{
        return this.http.get<any>(`http://www.omdbapi.com/?i=${id}&apikey=357a94f0`)
    }


}
