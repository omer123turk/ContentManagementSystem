import { HttpClient } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { MediaAsset } from '../Models/MediaAsset';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaAssetService {
  private apiUrl = 'http://localhost:8080/rest/api/media-assets';

  constructor(private http: HttpClient) {}

  getAssetsByContentId(contentId: string): Observable<MediaAsset[]> {
    return this.http.get<MediaAsset[]>(`${this.apiUrl}/content/${contentId}`);
  }

  addMediaAsset(asset: MediaAsset): Observable<MediaAsset> {
    return this.http.post<MediaAsset>(this.apiUrl, asset);
  }

  deleteMediaAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateMediaAsset(id: number, asset: MediaAsset): Observable<MediaAsset> {
    return this.http.put<MediaAsset>(`${this.apiUrl}/${id}`, asset);
    }
}
