import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MovieCast } from '../../Models/MovieCast';
import { CastPopUp } from './cast-pop-up/cast-pop-up';
import { MovieCastService } from '../../Services/movie-cast.service';
import { DtoMovieCast } from '../../Models/DtoMovieCast';
import { DtoMovieCastUpdate } from '../../Models/DtoMovieCastUpdate';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import {
  MatHeaderCellDef,
  MatCellDef,
  MatHeaderRowDef,
  MatRowDef,
  MatColumnDef
} from '@angular/material/table';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ContentService } from '../../Services/content.service';
import { Content } from '../../Models/Content';
import { MetadataService } from '../../Services/metadata.service';
import { Metadata } from '../../Models/Metadata';

@Component({
  selector: 'app-all-casts',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './all-casts.html',
  styleUrl: './all-casts.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class AllCasts implements OnInit {

  casts: MovieCast[] = [];
  displayedColumns: string[] = ['name', 'poster', 'castType', 'contentList', 'edit', 'delete'];
  contents: Content[] = [];
  metadatas: Metadata[] = [];
  contentList: string[] = [];

  isLoading: boolean = false;
  currentPage: number = 1;     
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  pageNumbers: number[] = [];
  protected Math = Math;


  constructor(private dialog: MatDialog, private http: HttpClient,
    private movieCastService: MovieCastService,
    private contentService: ContentService,
    private cdr: ChangeDetectorRef,
    private metadataService: MetadataService,
  ) { }

  ngOnInit(): void {
    this.loadCasts();
    this.getAllContents();
  }


  getAllContents() {
    this.contentService.getAllContents().subscribe({
      next: (data) => {
        this.contents = data;
        console.log("success");
        this.getAllMetadatas();


      },
      error: (err) => {
        console.error("API Hatası:", err);
      }
    });
  }

  getAllMetadatas() {
    this.metadataService.getAllMetadatas().subscribe({
      next: (data) => {
        this.metadatas = data;
        console.log("success");


      },
      error: (err) => {
        console.error("API Hatası:", err);
      }
    });
  }


  getCastType(id: number): string {
    if (id == 0) {
      return "Actor";
    }
    else if (id == 1) {
      return "Director";
    }
    else {
      return "Both";
    }
  }

  loadCasts(): void {
    const pageParam = this.currentPage - 1; // Backend için 0 tabanlı yapıyoruz
    this.movieCastService.getPageCast(pageParam, this.pageSize)
      .subscribe({
        next: (response: any) => {
          this.casts = response.content; // Doğrudan array'e atıyoruz
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;

          // Sayfa numaralarını üretiyoruz [1, 2, 3...]
          this.pageNumbers = [];
          for (let i = 1; i <= this.totalPages; i++) {
            this.pageNumbers.push(i);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Cast listesi yüklenirken hata oluştu:', err);
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Paginator üzerinden sayfa veya sayfa boyutu değiştirildiğinde tetiklenir
   */
  onPageChange(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.loadCasts();
  }
}



  openAddDialog(): void {
    const dialogRef = this.dialog.open(CastPopUp, {
      width: '400px',
      data: null // Yeni ekleme olduğu için boş gidiyor
    });


  }

  // PUT: Cast Düzenleme
  openEditDialog(cast: DtoMovieCastUpdate): void {
    const dialogRef = this.dialog.open(CastPopUp, {
      width: '400px',
      data: { ...cast } // Mevcut bilgileri klonlayarak gönderiyoruz
    });

    dialogRef.afterClosed().subscribe((result: DtoMovieCastUpdate) => {


    });
  }

  // DELETE: Satır Silme
  deleteCast(id: number | undefined): void {
    if (!id) return;

    this.casts.forEach(moviecast => {
      if (moviecast.id == id) {
        moviecast.contentIdList.forEach(contentId => {
          this.contents.forEach(content => {
            if (content.id == contentId) {
              let i: number = 0;
              content.movieCastIdList.forEach(element => {
                if (element == moviecast.id) {
                  content.movieCastIdList.splice(i, 1);

                }
                i = i + 1;
                if (moviecast.castType == 1) {
                  content.directorId = 0;
                }
              });

              this.contentService.updateContent(content).subscribe({
                next: () => {
                },
                error: () => {

                }
              });
            }
          });
        });
      }
    });

    if (confirm('Are you sure ?')) {
      this.movieCastService.deleteCast(id).subscribe({
        next: () => {
          this.loadCasts();
        },
        error: () => {

        }
      });
    }
  }
}
