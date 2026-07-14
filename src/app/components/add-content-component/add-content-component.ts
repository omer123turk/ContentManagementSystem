import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ContentService } from '../../Services/content.service';
import { MovieCastService } from '../../Services/movie-cast.service';
import { MovieCast } from '../../Models/MovieCast';
import { MetadataService } from '../../Services/metadata.service';
import { DtoMovieCast } from '../../Models/DtoMovieCast';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { DtoAddContent } from '../../Models/DtoAddContent';

@Component({
  selector: 'app-add-content-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-content-component.html',
  styleUrl: './add-content-component.css',
})
export class AddContentComponent implements OnInit {

  mediaForm!: FormGroup;
  castList: MovieCast[] = [];
  directors: MovieCast[] = [];
  actors: MovieCast[] = [];
  selectedCastsList: MovieCast[] = [];

  directorSearchCtrl = new FormControl('');
  castSearchCtrl = new FormControl('');

  filteredDirectors: MovieCast[] = [];
  filteredCasts: MovieCast[] = [];
  showDirectorDropdown = false;
  showCastDropdown = false;

  currentlySelectedCast: any = null;

  selectedDirectorObj: any = null;

  constructor(private fb: FormBuilder,
    private contentService: ContentService,
    private movieCastService: MovieCastService,
    private metadataService: MetadataService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.watchContentType();
    this.loadCasts();
    this.setupDirectorSearch();
    this.setupCastSearch();
  }

  initForm(): void {
    this.mediaForm = this.fb.group({
      id: [''],
      contentType: ['Movie'],
      year: [''],
      title: ['', Validators.required],
      director: [''],
      casts: [[]],
      plot: [''],
      poster: [''],
      language: [''],
      country: [''],
      numberOfSeasons: ['']

    });
  }

  watchContentType(): void {
    this.mediaForm.get('contentType')?.valueChanges.subscribe((value) => {
      const seasonsControl = this.mediaForm.get('numberOfSeasons');

      if (value === 'Series') {

        seasonsControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {

        seasonsControl?.clearValidators();
        seasonsControl?.setValue('');
      }

      seasonsControl?.updateValueAndValidity();
    });
  }

  loadCasts(): void {
    this.movieCastService.getAllCasts().subscribe({
      next: (data) => {
        this.castList = data;
        this.getcastByType();
      },
      error: (err) => {
        console.error('Cast listesi yüklenirken hata oluştu:', err);
      }
    });
  }

  //Seçilebilir castleri bul
  getAvailableCasts(): MovieCast[] {
    return this.castList.filter(cast => !this.selectedCastsList.some(s => s.id === cast.id));
  }

  //Casti sil 
  removeCastMember(castId: number): void {
    this.selectedCastsList = this.selectedCastsList.filter(c => c.id !== castId);

    this.updateFormCasts();
  }

  //cast formunu güncelle
  private updateFormCasts(): void {
    const ids = this.selectedCastsList.map(c => c.id);
    this.mediaForm.get('casts')?.setValue(ids);
  }


  setupDirectorSearch() {
    this.directorSearchCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || value.length < 1) {
          this.filteredDirectors = [];
          return of([]);
        }
        // Backend servis araması (Kendi API'ne göre uyarla)
        this.movieCastService.getFilteredCasts(value).subscribe({
          next:(data)=>{
            this.filteredDirectors=data;
             this.cdr.detectChanges();
          }
        })
        return this.filteredDirectors;

      })
    ).subscribe((results: any) => {
      this.filteredDirectors = results;
    });
  }

  selectDirector(director: any) {
    this.directorSearchCtrl.setValue(director.name, { emitEvent: false });

    this.mediaForm.get('director')?.setValue(director.id);
    this.showDirectorDropdown = false;
  }


  setupCastSearch() {
    this.castSearchCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || value.length < 1) {
          this.filteredCasts = [];
          return of([]);
        }

        this.filteredCasts = [];
         this.movieCastService.getFilteredCasts(value).subscribe({
          next:(data)=>{
            this.filteredCasts=data;
            this.cdr.detectChanges();
          }
        })
        return this.filteredCasts;
      })
    ).subscribe((results: any) => {

      if (this.filteredCasts.length > 1)
        this.filteredCasts = results.filter((c: any) => !this.selectedCastsList.some(sc => sc.id === c.id));
    });
  }

  selectCastFromDropdown(cast: any) {
    this.castSearchCtrl.setValue(cast.name, { emitEvent: false });
    this.currentlySelectedCast = cast;
    this.showCastDropdown = false;
  }

  addSelectedCast() {

    const writtenName = this.castSearchCtrl.value?.trim();
    if (!writtenName) return;

    if (this.currentlySelectedCast) {
      if (!this.selectedCastsList.some(c => c.id === this.currentlySelectedCast.id)) {
        this.selectedCastsList.push(this.currentlySelectedCast);
      }

      this.castSearchCtrl.setValue('');
      this.currentlySelectedCast = null;
    }
    else {
      let movieCast: MovieCast = { id: 0, name: writtenName, poster: "", contentIdList: [], castType: 0 };
      this.selectedCastsList.push(movieCast);
      this.castSearchCtrl.setValue('');
      this.currentlySelectedCast = null;
      this.filteredCasts = [];
    }
  }
  

  onSubmit(): void {
    if (this.mediaForm.valid) {
      console.log('Form Verisi:', this.mediaForm.value);

      //Content Type
      let contentType: number = 0;
      let number: number = 0;
      if (this.mediaForm.value.contentType != "Movie") {
        contentType = 1; number = this.mediaForm.value.numberOfSeasons;
      }

      //Director
      const writtenName = this.directorSearchCtrl.value?.trim();
      let directorName: string = "";
      if (writtenName != null)
        directorName = writtenName;

      //Casts
      let movieCastNameList: String[] = [];
      this.selectedCastsList.forEach(element => {
        movieCastNameList.push(element.name);
      });

      let Content: DtoAddContent = new DtoAddContent(this.mediaForm.value.id, movieCastNameList, directorName, new Date, contentType, [], [], number, this.mediaForm.value.title, this.mediaForm.value.plot, this.mediaForm.value.poster, this.mediaForm.value.year, this.mediaForm.value.language, this.mediaForm.value.country);
      this.contentService.addContentWithActors(Content).subscribe({
        next: (response) => {
          console.log(response);
          this.mediaForm.reset();
          this.directorSearchCtrl.setValue("");
          this.selectedCastsList=[];
          alert('Content added successfully');
        }
      });
    } else {
      // Form geçersizse tüm alanları işaretle
      this.mediaForm.markAllAsTouched();
    }
  }

  searchContentById(): void {
    const contentId = this.mediaForm.get('id')?.value;

    if (!contentId || contentId.trim() === '') {
      alert('Lütfen arama yapmak için geçerli bir ID girin.');
      return;
    }

    this.metadataService.getMetadataInformations(contentId).subscribe({
      next: (data: any) => {
        if (data) {
          let contentType: string = "";
          if (data.Type == "movie")
            contentType = "Movie";
          else
            contentType = "Series";


          this.mediaForm.patchValue({
            title: data.Title || '',
            contentType: contentType || 'Movie',
            year: data.Year || null,
            plot: data.Plot || '',
            poster: data.Poster || '',
            language: data.Language || '',
            country: data.Country || '',
            director: '',
            numberOfSeasons: data.totalSeasons
          });

          //Director
          this.directorSearchCtrl.setValue(data.Director.trim());


          //Casts
          let actorsString: string = data.Actors;
          let actorsName: string[] = actorsString.split(', ');
          actorsName.forEach(nameElement => {
            let isFound: boolean = false;
            this.castList.forEach(castElement => {
              if (castElement.name == nameElement.trim()) {
                isFound = true;
                this.selectedCastsList.push(castElement);
              }
            });
            if (!isFound) {
              let cast: DtoMovieCast = new DtoMovieCast(nameElement, [], 0, "");
              this.movieCastService.addCast(cast).subscribe({
                next: (data) => {
                  let movieCast = { id: data.id, name: nameElement, poster: "", contentIdList: [], castType: 0 };
                  this.castList.push(movieCast);
                  this.selectedCastsList.push(movieCast);
                }
              })
            }
          });

          if (data.casts && Array.isArray(data.casts)) {
            this.selectedCastsList = [...data.casts];
          }

          alert('İçerik bilgileri başarıyla getirildi ve form dolduruldu!');
        } else {
          alert('Bu ID ile eşleşen bir içerik bulunamadı.');
        }
      },
      error: (err) => {
        console.error('Arama yapılırken hata oluştu:', err);
        alert('Backend sorgusu sırasında bir hata meydana geldi.');
      }
    });
  }

  getcastByType() {
    this.actors = this.castList.filter(cast => cast.castType === 0);
    this.directors = this.castList.filter(cast => cast.castType === 1);
  }
}
