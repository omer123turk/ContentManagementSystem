import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MovieCast } from '../../Models/MovieCast';
import { CastPopUp } from './cast-pop-up/cast-pop-up';
import { MovieCastService } from '../../Services/movie-cast.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DtoMovieCastUpdate } from '../../Models/DtoMovieCastUpdate';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ContentService } from '../../Services/content.service';
import { MetadataService } from '../../Services/metadata.service';

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
export class AllCasts implements OnInit, OnDestroy {

  casts: MovieCast[] = [];
  displayedColumns: string[] = ['name', 'poster', 'castType', 'contentList', 'edit', 'delete'];
  contentList: string[] = [];

  isLoading: boolean = false;
  currentPage: number = 1;     
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  pageNumbers: number[] = [];
  protected Math = Math;

  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;


  constructor(private dialog: MatDialog, private http: HttpClient,
    private movieCastService: MovieCastService,
    private contentService: ContentService,
    private cdr: ChangeDetectorRef,
    private metadataService: MetadataService,
  ) { }

  ngOnInit(): void {
    // 1. Debounce mekanizmasını kuruyoruz
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Kullanıcı yazmayı bıraktıktan sonra 300ms bekle
      distinctUntilChanged() // Sadece değer gerçekten değiştiyse tetikle (örn: boşluk basıp silerse tetikleme)
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 1; // Yeni aramada sayfayı mutlaka 1'e çekiyoruz
      this.loadCasts();
    });
    this.loadCasts();
  }

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchSubject.next(inputElement.value);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 1;
    this.searchSubject.next('');
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
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
    const pageParam = this.currentPage - 1;
    let query:string="";
    if(this.searchQuery=="")
      query=".null";
    else
      query=this.searchQuery;
    this.movieCastService.getPageCast(pageParam, this.pageSize, query)
      .subscribe({
        next: (response: any) => {
          this.casts = response.content; 
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;

       
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

  onPageChange(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.loadCasts();
  }
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(CastPopUp, {
      width: '400px',
      data: null 
    });

    dialogRef.afterClosed().subscribe((result: DtoMovieCastUpdate) => {
      this.loadCasts();
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    });
  }

  openEditDialog(cast: DtoMovieCastUpdate): void {
    const dialogRef = this.dialog.open(CastPopUp, {
      width: '400px',
      data: { ...cast } 
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadCasts();
      this.cdr.detectChanges();
      this.cdr.markForCheck();

    });
  }

  deleteCast(id: number | undefined): void {
    if (!id) return;

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
