import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Content } from '../../Models/Content';
import { ContentService } from '../../Services/content.service';
import { MetadataService } from '../../Services/metadata.service';
import { MovieCastService } from '../../Services/movie-cast.service';
import { Metadata } from '../../Models/Metadata';
import { MovieCast } from '../../Models/MovieCast';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DtoContent } from '../../Models/DtoContent';
import { DtoMetadata } from '../../Models/DtoMetadata';
import { DtoMetadataUpdate } from '../../Models/DtoMetadataUpdate';
import { DtoEpisode } from '../../Models/DtoEpisode';
import { DtoContentComplete } from '../../Models/DtoContentComplete';
import { DtoAllEpisode } from '../../Models/DtoAllEpisode';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { DtoAddContent } from '../../Models/DtoAddContent';
import { DtoEpisodeWithActors } from '../../Models/DtoEpisodeWithActors';
import { AlertService } from '../../Services/alert';

interface Episode {
  id: string;
  title: string;
  plot: String;
  poster: String;
  year: String;
  language: String;
  country: String;
  casts: String[];
  director: String;
}

@Component({
  selector: 'app-show-episodes-components',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './show-episodes-components.html',
  styleUrl: './show-episodes-components.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ShowEpisodesComponents implements OnInit {

  isLoading: boolean = false;
  episodeContents: Content[] = [];
  episodeForm!: FormGroup;

  metadatas: Metadata[] = [];
  movieCasts: MovieCast[] = [];
  idFromUrl: string = "";
  season: any;
  episodes: Episode[] = [];


  availableCasts: any[] = [];


  directorSearchCtrl = new FormControl('');
  castSearchCtrl = new FormControl('');

  filteredDirectors: any[] = [];
  filteredCasts: any[] = [];
  showDirectorDropdown = false;
  showCastDropdown = false;


  selectedDirectorObj: any = null;
  currentlySelectedCast: any = null;


  isModalOpen = false;
  isEditMode = false;
  currentEpisodeId?: string;


  currentPage: number = 1;     
  pageSize: number = 10;       
  totalElements: number = 0;   
  totalPages: number = 0;      
  pageNumbers: number[] = [];  

  isFetching = false;

  protected Math = Math;

  constructor(
    private contentService: ContentService,
    private metadataService: MetadataService,
    private movieCastService: MovieCastService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private alertService:AlertService

  ) { }


  public getAllMetadatas(): void {
    this.metadataService.getAllMetadatas().subscribe(
      (response: Metadata[]) => {
        this.metadatas = response;
        this.getAllCasts();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    )
  }

  public getAllCasts(): void {
    this.movieCastService.getAllCasts().subscribe(
      (response: MovieCast[]) => {
        this.movieCasts = response;
        this.loadEpisodes();
        this.loadAvailableCasts();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    )
  }


  ngOnInit(): void {
    this.initForm();

    const idFromUrln = this.route.snapshot.paramMap.get('id');
    if (idFromUrln != null) {
      this.idFromUrl = idFromUrln;
    }

    this.getAllMetadatas();
    this.setupDirectorSearch();
    this.setupCastSearch();

  }

  initForm() {
    this.episodeForm = this.fb.group({
      title: ['', Validators.required],
      plot: [''],
      poster: [''],
      year: [new Date().getFullYear()],
      language: [''],
      country: [''],
      casts: this.fb.array([]),
      director: ['']
    });
  }


  loadEpisodes(): void {
    this.isLoading = true;

    const pageParam = this.currentPage - 1;

    this.contentService.getPageEpisodeContentBySeason(this.idFromUrl, pageParam, this.pageSize)
      .subscribe({
        next: (response: any) => {
          this.episodeContents = [];
          this.episodeContents = response.content;
          console.log(response);
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;

          this.generatePageNumbers();
          this.loadEpisodesInformations();
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Bölümler yüklenirken hata:', err);
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
      this.loadEpisodes(); // Sayfa değiştikçe backend'den yeni veriyi çek
    }
  }


  loadEpisodesInformations() {
    this.episodes = [];
    this.episodeContents.forEach(contentElement => {
      this.metadatas.forEach(metadataElement => {
        if (metadataElement.id == contentElement.metadataId) {

          this.episodes.push({
            id: contentElement.id,
            title: metadataElement.title,
            plot: metadataElement.plot,
            poster: metadataElement.poster,
            year: metadataElement.year,
            language: metadataElement.language,
            country: metadataElement.country,
            casts: this.loadCasts(contentElement.movieCastIdList),
            director: this.loadDirector(contentElement.directorId)
          })
        }
      });
    });

    this.isLoading = false;
    this.cdr.detectChanges();
    this.cdr.markForCheck();
  }

  loadCasts(moviecastIdList: number[]): String[] {
    let casts: String[] = [];
    moviecastIdList.forEach(Id => {
      this.movieCasts.forEach(cast => {
        if (cast.id == Id) {
          casts.push(cast.name);
        }
      });
    });


    return casts;
  }



  loadDirector(directorId: number): String {
    let director: String = "";
    this.movieCasts.forEach(element => {
      if (element.id == directorId) {
        director = element.name;
      }
    });
    return director;
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentEpisodeId = undefined;
    this.episodeForm.reset({ year: new Date().getFullYear() });
    this.castsFormArray.clear(); 
    this.isModalOpen = true;
  }

  openEditModal(episode: Episode) {
    this.isEditMode = true;
    this.currentEpisodeId = episode.id;


    this.episodeForm.patchValue({
      title: episode.title,
      plot: episode.plot,
      poster: episode.poster,
      year: episode.year,
      language: episode.language,
      country: episode.country,
    });


    this.castsFormArray.clear();
    if (episode.casts && Array.isArray(episode.casts)) {
      episode.casts.forEach(castName => {
        this.castsFormArray.push(
          new FormControl({ value: castName, disabled: true }, Validators.required)
        );
      });
    }

    let directorName:string=`${episode.director}`;
    
    this.directorSearchCtrl.setValue(directorName);

    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onSubmit() {
    if (this.episodeForm.invalid) return;

    const episodeData = this.episodeForm.getRawValue();

    //Find Episode
    let episode: any;
    let episodeId: string = "";
    if (this.currentEpisodeId != null)
      episodeId = this.currentEpisodeId;
    this.contentService.getContentById(episodeId).subscribe({
      next: (data) => {
        episode = data;

        //Director
        let directorName: string = "";
        const writtenName = this.directorSearchCtrl.value?.trim();
        if (writtenName != null)
          directorName = writtenName;
        //Casts
        let movieCastIdList: number[] = [];
        let casts: string[] = [];
        casts = episodeData.casts;


        if (this.isEditMode && this.currentEpisodeId) {

          let completeContent: DtoAddContent = new DtoAddContent(this.currentEpisodeId, casts, directorName, new Date, 3, [], [], episode.number, episodeData.title, episodeData.plot, episodeData.poster, episodeData.year, episodeData.language, episodeData.country);
          this.contentService.updateContentWithActors(completeContent).subscribe({
            next: (data) => {
              this.alertService.show("Update",'Update successfully completed.',"success");
              this.closeModal();
              this.loadEpisodes();
            }
          });
        }
        else {

          let contentId: string = Math.random().toString(36).substring(2, 11);

          let dtoEpisode: DtoEpisodeWithActors = new DtoEpisodeWithActors(contentId, casts, directorName, new Date, episodeData.title, episodeData.plot, episodeData.poster, episodeData.year, episodeData.language, episodeData.country, this.idFromUrl);
          this.contentService.addEpisodeWithActorsToSeason(dtoEpisode).subscribe({
            next: (data) => {
              this.alertService.show("Add",'Adding successfully completed.',"success");
            }
          });

        }
      }
    })


  }

  deleteEpisode(id: string | undefined) {
    if (!id) return;

    this.contentService.deleteEpisode(this.idFromUrl,id).subscribe({
      next:(data)=>{
         alert('Episode deleted successfully.');
      }
    })



  }

  get castsFormArray(): FormArray {
    return this.episodeForm.get('casts') as FormArray;
  }

  loadAvailableCasts() {
    this.availableCasts = this.movieCasts;
  }


  addCastToForm() {
    const writtenName = this.castSearchCtrl.value?.trim();
    if (!writtenName) return;

    const existingNames = this.castsFormArray.value;
    if (existingNames.includes(writtenName)) {
      this.resetCastInput();
      return;
    }

    if (this.currentlySelectedCast) {
      this.castsFormArray.push(new FormControl(this.currentlySelectedCast.name));
      this.resetCastInput();
    } else {


      this.availableCasts.push(writtenName);
      this.castsFormArray.push(new FormControl(writtenName));
      this.resetCastInput();
    }
  }

  private resetCastInput() {
    this.castSearchCtrl.setValue('');
    this.currentlySelectedCast = null;
    this.filteredCasts = [];
    this.showCastDropdown = false;
  }


  removeCastFromForm(index: number) {
    this.castsFormArray.removeAt(index);
  }

  fetchSeasonDataFromBackend(): void {

    this.isFetching=true;

    let episodeList: DtoAllEpisode[] = [];
    let i: number = 0;
    let j: number = 0;
    let totalepisode: number = 0;
    let seriesId: string = this.idFromUrl.split("/")[0];
    this.contentService.getSeasonsInformations(seriesId, Number(this.idFromUrl.split("/")[1])).subscribe({
      next: (data) => {
        let episodes: any[] = data.Episodes;
        totalepisode += episodes.length;
        episodes.forEach(episode => {
          this.metadataService.getMetadataInformations(episode.imdbID).subscribe({
            next: (episodeData) => {
              let seasonId: number = Number(episodeData.Season);
              let episodeNumber:number=episodeData.Episode;
              let allEpisode: DtoAllEpisode = new DtoAllEpisode(episode.imdbID, episodeData.Actors, episodeData.Director, new Date, episodeData.Title, episodeData.Plot, episodeData.Poster, episodeData.Year, episodeData.Language, episodeData.Country, this.idFromUrl,episodeNumber);
              episodeList.push(allEpisode);
              j++;
              if (totalepisode == j) {
                this.contentService.addAllEpisodes(episodeList).subscribe({
                  next: (data) => {
                    this.isFetching=false;
                    this.alertService.show("Fetching",'Fetching is completed.',"success");
                    this.getAllMetadatas();
                    this.cdr.detectChanges();
                    this.cdr.markForCheck();
                  }
                })
              }

            }
          })

        });
      }
    });

  }

  setupDirectorSearch() {
    this.directorSearchCtrl.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(value => {
      const searchStr = value?.toLowerCase().trim();

      if (this.selectedDirectorObj && this.selectedDirectorObj.name !== value) {
        this.selectedDirectorObj = null;
        this.episodeForm.get('director')?.setValue('');
      }

      if (!searchStr || searchStr.length < 2) {
        this.filteredDirectors = [];
        return;
      }

       this.movieCastService.getFilteredDirectors(searchStr).subscribe({
          next:(data)=>{
            this.filteredDirectors=data;
            this.cdr.detectChanges();
          }
        })
    });
  }

  selectDirector(cast: any) {
    this.selectedDirectorObj = cast;
    this.directorSearchCtrl.setValue(cast.name, { emitEvent: false });
    this.episodeForm.get('director')?.setValue(cast.name);
    this.showDirectorDropdown = false;
  }


  setupCastSearch() {
    this.castSearchCtrl.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(value => {
      const searchStr = value?.toLowerCase().trim();

      if (this.currentlySelectedCast && this.currentlySelectedCast.name !== value) {
        this.currentlySelectedCast = null;
      }

      if (!searchStr || searchStr.length < 2) {
        this.filteredCasts = [];
        return;
      }


      const existingNames = this.castsFormArray.value;

      this.movieCastService.getFilteredCasts(searchStr).subscribe({
          next:(data)=>{
            this.filteredCasts=data;
            this.cdr.detectChanges();
          }
        })
    });
  }

  selectCastFromDropdown(cast: any) {
    this.castSearchCtrl.setValue(cast.name, { emitEvent: false });
    this.currentlySelectedCast = cast;
    this.showCastDropdown = false;
  }
}
