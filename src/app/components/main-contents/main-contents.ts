import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ContentService } from '../../Services/content.service';
import { Content } from '../../Models/Content';
import { MetadataService } from '../../Services/metadata.service';
import { MovieCastService } from '../../Services/movie-cast.service';
import { Metadata } from '../../Models/Metadata';
import { RouterLink } from '@angular/router';
import { DtoAddContent } from '../../Models/DtoAddContent';
import { AlertService } from '../../Services/alert';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

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
  public isLoading: boolean = true;
  public findContent: any;
  activeContentType: ContentType = 'movies';
  public movieContents: DtoAddContent[] = [];
  public seriesContents: DtoAddContent[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  pageNumbers: number[] = [];


  contentNumber: number = 0;

  protected Math = Math;

  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;


  //contructor
  constructor(private contentService: ContentService,
    private metadataService: MetadataService,
    private moviecastService: MovieCastService,
    private cdr: ChangeDetectorRef,
    private alertService:AlertService
  ) {
  }

  ngOnInit(): void {
    this.searchQuery="";
    this.loadData();
    this.setupContentSearch();
  }

  setupContentSearch(){
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 1; 
          this.loadData();
    });
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

  onDelete(id: string) {

    this.contentService.deleteCompleteContent(id).subscribe({
      next: (data) => {
        this.loadData();
        this.alertService.show("Delete",'Delete successfully completed.',"success");
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    })

  }

  setContentType(type: ContentType): void {
    this.activeContentType = type;
    this.currentPage = 1;
    this.searchQuery = '';
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    const pageParam = this.currentPage - 1;
    let contentType: number = 0;
    if (this.activeContentType == 'series')
      contentType = 1;

    let query:string="";
    if(this.searchQuery=="")
      query=".null";
    else
      query=this.searchQuery;

    this.contentService.getPageContentByType(contentType, pageParam, this.pageSize,query)
      .subscribe({
        next: (response: any) => {

          if (this.activeContentType === 'movies') {
            this.movieContents = response.content;
          } else {
            this.seriesContents = response.content;
          }


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

  generatePageNumbers(): void {
    this.pageNumbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageNumbers.push(i);
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

}