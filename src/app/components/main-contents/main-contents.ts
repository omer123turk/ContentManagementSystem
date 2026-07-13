import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ContentService } from '../../Services/content.service';
import { Content } from '../../Models/Content';
import { CommonModule } from '@angular/common';
import { response } from 'express';
import { error } from 'console';
import { HttpErrorResponse } from '@angular/common/http';
import { MetadataService } from '../../Services/metadata.service';
import { MovieCastService } from '../../Services/movie-cast.service';
import { Metadata } from '../../Models/Metadata';
import { MovieCast } from '../../Models/MovieCast';
import { finalize } from 'rxjs';
import { DtoMovieCast } from '../../Models/DtoMovieCast';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { DtoContentComplete } from '../../Models/DtoContentComplete';

type ContentType = 'movies' | 'series';

@Component({
  selector: 'app-main-contents',
  imports: [RouterLink],
  templateUrl: './main-contents.html',
  styleUrl: './main-contents.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class MainContents implements OnInit {
  public contents: Content[] = [];
  public metadatas: Metadata[] = [];
  public moviecasts: MovieCast[] = [];
  public findMetadata: any = null;
  public isLoading: boolean = true;
  public findMovieCastList: Array<MovieCast> = new Array();
  public findDirector: any = null;
  public findContent: any;
  activeContentType: ContentType = 'movies';
  public movieContents:DtoContentComplete[]=[];
  public seriesContents:DtoContentComplete[]=[];

  currentPage: number = 1;     // Aktif sayfa (1'den başlar)
  pageSize: number = 10;       // Sayfa başına gösterilecek kayıt sayısı
  totalElements: number = 0;   // Backend'den gelen toplam kayıt sayısı
  totalPages: number = 0;      // Toplam sayfa sayısı
  pageNumbers: number[] = [];  // Sayfa buton numaraları dizisi [1, 2, 3...]
  
  // HTML şablonunda Math fonksiyonunu kullanabilmek için
  protected Math = Math;


  //contructor
  constructor(private contentService: ContentService,
    private metadataService: MetadataService,
    private moviecastService: MovieCastService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.getAllCasts();
    this.loadData();
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
      this.cdr.detectChanges();

    }, 500)
  }



 

  public getAllCasts(): void {
    this.moviecastService.getAllCasts().subscribe(
      (response: MovieCast[]) => {
        this.moviecasts = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    )
  }

  public getMetadataById(id: number): void {
    this.findMetadata = null;
    this.metadatas.forEach(element => {
      if (element.id == id) {
        this.findMetadata = element;
      }
    });
  }

  public getDirectorById(id: number): boolean {
    this.findDirector = null;
    this.moviecasts.forEach(element => {
      if (element.id == id) {
        this.findDirector = element;
      }
    });
    return true;
  }

  public getCastsById(id: string): boolean {

    this.moviecastService.getCastsByContentId(id).subscribe(
      (response: MovieCast[]) => {
        this.findMovieCastList = new Array();
        this.findMovieCastList = response;
        //this.cdr.markForCheck();
        //this.cdr.detectChanges();

      },
      (error: HttpErrorResponse) => {
        alert(error.message);

      }
    )
    return true;
  }

  public getContentById(id: string): void {
    this.contentService.getContentById(id).subscribe({
      next: (data) => {
        this.findContent = data;
        console.log("success");
        this.cdr.markForCheck();
        this.cdr.detectChanges();

      },
      error: (err) => {
        console.error("API Hatası:", err);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  public update() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onDelete(id: string) {

    //update Casts
    this.getCastsById(id);
    this.findMovieCastList.forEach(element => {
      this.getDirectorById(element.id);
      let contentIdList: string[] = this.findDirector.contentIdList;
      let index: number = 0;
      contentIdList.forEach(contentId => {
        if (contentId == id) {
          index = contentIdList.indexOf(contentId);
        }
      });
      contentIdList.splice(index, 1);
      this.findDirector.contentIdList = contentIdList;

      this.moviecastService.updateCast(this.findDirector).subscribe({
        next: (response) => {
        },
        error: (err) => {
          console.error('Kayıt esnasında hata oluştu:', err);

        }
      });
    });

    //Update Director


    this.getContentById(id);
    setTimeout(() => {
      this.getDirectorById(this.findContent.directorId);
      setTimeout(() => {
        let contentIdList: string[] = this.findDirector.contentIdList;
        let index: number = 0;
        contentIdList.forEach(contentId => {
          if (contentId == id) {
            index = contentIdList.indexOf(contentId);
          }
        });
        contentIdList.splice(index, 1);
        this.findDirector.contentIdList = contentIdList;

        this.moviecastService.updateCast(this.findDirector).subscribe({
          next: (response) => {
          },
          error: (err) => {
            console.error('Kayıt esnasında hata oluştu:', err);

          }
        });
      }, 300)
    }, 300)


    //Delete Metadata

    setTimeout(() => {
      this.getMetadataById(this.findContent.metadataId);
      setTimeout(() => {
        this.metadataService.deleteMetadata(this.findMetadata.id).subscribe({
          next: (response) => {
          },
          error: (err) => {
            console.error('Kayıt esnasında hata oluştu:', err);

          }
        });
      }, 300)
    }, 300)






    //Delete Content

    setTimeout(() => {
      this.contentService.deleteContent(this.findContent.id).subscribe({
        next: (response) => {
        },
        error: (err) => {
          console.error('Kayıt esnasında hata oluştu:', err);

        }
      });
    }, 300)


  }

  setContentType(type: ContentType): void {
    this.activeContentType = type;
    this.currentPage = 1; // Her sekme değişiminde ilk sayfaya dön
    this.loadData();
  }


  loadData(): void {
    this.isLoading = true;
    
    // Backend API'nizin beklentisine göre sayfa indeksini ayarlayın (0 tabanlı veya 1 tabanlı)
    // Çoğu backend (Spring Boot, .NET vb.) sayfaları 0'dan başlatır: (this.currentPage - 1)
    const pageParam = this.currentPage-1; 
    let contentType:number=0;
    if(this.activeContentType=='series')
      contentType=1;

    this.contentService.getPageContentByType(contentType, pageParam, this.pageSize)
      .subscribe({
        next: (response: any) => {
          // Backend'den genellikle şöyle bir nesne döner: { content: [...], totalElements: 100, totalPages: 10 }
          if (this.activeContentType === 'movies') {
            this.movieContents = response.content;
          } else {
            this.seriesContents = response.content;
          }

          // Sayfalama metadatalarını güncelliyoruz
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.generatePageNumbers();
          
          this.isLoading = false;
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Veri yüklenirken hata oluştu:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Sayfa butonlarının [1, 2, 3...] dinamik dizisini oluşturur
   */
  generatePageNumbers(): void {
    this.pageNumbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageNumbers.push(i);
    }
  }

  /**
   * Kullanıcı bir sayfaya tıkladığında tetiklenen fonksiyon
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData(); // Yeni sayfayı backend'den çek
    }
  }



  

}
