import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MovieCast } from '../../Models/MovieCast';
import { MovieCastService } from '../../Services/movie-cast.service';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../Services/content.service';
import { DtoContentComplete } from '../../Models/DtoContentComplete';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { DtoAddContent } from '../../Models/DtoAddContent';


@Component({
  selector: 'app-edit-component',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-component.html',
  styleUrl: './edit-component.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class EditComponent implements OnInit {
  editForm!: FormGroup;
  cardForm!: FormGroup;
  isLoading: boolean = true;
  idFromUrl: string = "";

  // Backend'den çekilecek tüm oyuncu havuzu (Hem Director hem Cast seçimi için ortak)
  allCasts: MovieCast[] = [];

  // Arama kontrolleri ve dropdown durumları
  directorSearchCtrl = new FormControl('');
  castSearchCtrl = new FormControl('');
  
  filteredDirectors: any[] = [];
  filteredCasts: any[] = [];
  showDirectorDropdown = false;
  showCastDropdown = false;

  // Seçili nesne referansları
  selectedDirectorObj: any = null;
  currentlySelectedCast: any = null;

  constructor(private fb: FormBuilder,
    private movieCastService: MovieCastService,
    private route: ActivatedRoute,
    private contentService: ContentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadInitialData();
    let idFromUrln = this.route.snapshot.paramMap.get('id');

    if (idFromUrln != null) {
      this.idFromUrl = idFromUrln;
    }

    this.setupDirectorSearch();
    this.setupCastSearch();

  }

  /**
   * Form yapılarını ilklendirir
   */
  private initForms(): void {
    // Ana Düzenleme Formu
    this.editForm = this.fb.group({
      selectedContentType: ['0'],
      year: [''],
      created_at: [''],
      title: [''],
      plot: [''],
      poster: [''],
      language: [''],
      country: [''],
      director: [''] // Tek bir Director ID'si tutacak
    });

    // Cast Formu (FormArray barındıran yapı)
    this.cardForm = this.fb.group({
      cards: this.fb.array([])
    });
  }


  get cardArray(): FormArray {
    return this.cardForm.get('cards') as FormArray;
  }


  private loadInitialData(): void {
    this.isLoading = true;

    // SIMÜLASYON: Backend'den tüm oyuncuların gelmesi
    // Gerçek projede: this.castService.getAll().subscribe(data => this.allCasts = data);
    this.movieCastService.getAllCasts().subscribe({
      next: (data) => {
        this.allCasts = data;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    })

    // SIMÜLASYON: Düzenlenecek içeriğin detaylarının backend'den gelmesi
    // Gerçek projede: this.contentService.getById(id).subscribe(content => { ... });

    let idFromUrln = this.route.snapshot.paramMap.get('id');

    if (idFromUrln != null)
      this.idFromUrl = idFromUrln;

    this.contentService.getCompleteContentById(this.idFromUrl).subscribe({
      next: (data) => {

        if (data.directorId != 0) {
          this.movieCastService.getCastById(data.directorId).subscribe({
            next: (director) => {
              // Ana formu backend'den gelen verilerle dolduruyoruz
              this.editForm.patchValue({
                selectedContentType: data.contentType,
                year: data.year,
                created_at: data.created_at,
                title: data.title,
                plot: data.plot,
                poster: data.poster,
                language: data.language,
                country: data.country,
              });

              this.directorSearchCtrl.setValue(director.name);

              // Mevcut cast'leri FormArray'e dolduruyoruz

              data.movieCastIdList.forEach(element => {
                this.movieCastService.getCastById(element).subscribe({
                  next: (cast) => {
                    this.cardArray.push(this.fb.group({
                      id: [cast.id],
                      value: [cast.name]
                    }));
                  }
                })
              });

              this.isLoading = false;
              this.cdr.detectChanges();
              this.cdr.markForCheck();

            }
          })
        }
        else {
          // Ana formu backend'den gelen verilerle dolduruyoruz
          this.editForm.patchValue({
            selectedContentType: data.contentType,
            year: data.year,
            created_at: data.created_at,
            title: data.title,
            plot: data.plot,
            poster: data.poster,
            language: data.language,
            country: data.country,
            director: ""
          });

          // Mevcut cast'leri FormArray'e dolduruyoruz
          data.movieCastIdList.forEach(element => {
            this.movieCastService.getCastById(element).subscribe({
              next: (cast) => {
                this.cardArray.push(this.fb.group({
                  id: [cast.id],
                  value: [cast.name]
                }));

              }
            })
          });

          this.isLoading = false;
          this.cdr.detectChanges();
          this.cdr.markForCheck();
        }


      }
    })


  }



  /**
   * Seçilen oyuncuyu FormArray listesinden indeksine göre siler
   */
  removeCast(index: number): void {
    this.cardArray.removeAt(index);
  }

  /**
   * Update butonuna basıldığında hem ana formu hem de cast listesini birleştirip backend'e gönderir
   */
  update(): void {
    if (this.editForm.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    // İki formun verilerini tek bir payload altında birleştiriyoruz
    const finalPayload = {
      ...this.editForm.value,
      casts: this.cardArray.value // [{id: 103, value: 'Cillian Murphy'}, ...] şeklinde gider
    };

    console.log('Backend\'e gönderilecek güncel veri:', finalPayload);

    let idFromUrln = this.route.snapshot.paramMap.get('id');

    if (idFromUrln != null)
      this.idFromUrl = idFromUrln;

    let movieCastNameList: string[] = [];
    let casts: any[] = this.cardArray.value;
    casts.forEach(element => {
      movieCastNameList.push(element.value);
    });

   const writtenName = this.directorSearchCtrl.value?.trim();
      let directorName:string="";
      if(writtenName!=null)
        directorName=writtenName;

    this.contentService.getContentById(this.idFromUrl).subscribe({
      next: (data) => {
        let CompleteContent: DtoAddContent = new DtoAddContent(this.idFromUrl, movieCastNameList, directorName, this.editForm.value.created_at, this.editForm.value.selectedContentType, data.seasonList, data.episodeList, data.number, this.editForm.value.title, this.editForm.value.plot, this.editForm.value.poster, this.editForm.value.year, this.editForm.value.language, this.editForm.value.country);
        this.contentService.updateContentWithActors(CompleteContent).subscribe({
          next:(data)=>{
            alert('Update successfully completed.');
          }
        });
      }
    })


  }


  // === DIRECTOR ARAMA MANTIĞI ===
  setupDirectorSearch() {
    this.directorSearchCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(value => {
        if (this.selectedDirectorObj && this.selectedDirectorObj.name !== value) {
          this.selectedDirectorObj = null;
          this.editForm.get('director')?.setValue('');
        }
        if (!value || value.length < 0) {
          this.filteredDirectors = this.allCasts;
          return of([]);
        }
        this.filteredDirectors = [];
        this.allCasts.forEach(element => {
          let name: string = String(value);
          if (element.name.toLowerCase().includes(name.toLowerCase().trim())) {
            this.filteredDirectors.push(element);
          }
        });;
        return this.filteredCasts;
      })
    ).subscribe((results: any) => {
      this.filteredDirectors = results;
    });
  }

  selectDirector(director: any) {
    this.selectedDirectorObj = director;
    this.directorSearchCtrl.setValue(director.name, { emitEvent: false });
    this.editForm.get('director')?.setValue(director.id);
    this.showDirectorDropdown = false;
  }

  setupCastSearch() {
    this.castSearchCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(value => {
        if (this.currentlySelectedCast && this.currentlySelectedCast.name !== value) {
          this.currentlySelectedCast = null;
        }
        if (!value || value.length < 1) {
          this.filteredCasts = [];
          return of([]);
        }
       this.filteredCasts = [];
        // Backend servis araması (Kendi API'ne göre uyarla)
        this.allCasts.forEach(element => {
          let name: string = String(value);
          if (element.name.includes(name)) {
            this.filteredCasts.push(element);
          }
        });;
        return this.filteredCasts;
      })
    ).subscribe((results: any) => {
      // Listede halihazırda ekli olanları dropdown'da gizle
      const existingIds = this.cardArray.value.map((c: any) => c.id);
      this.filteredCasts = results.filter((c: any) => !existingIds.includes(c.id));
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
      this.pushCastToFormArray(this.currentlySelectedCast);
      this.resetCastInput();
    } else {
       this.cardArray.push(new FormGroup({
        id: new FormControl(0),
        value: new FormControl(writtenName)
      }));
    }
  }

  pushCastToFormArray(cast: any) {
    const existingIds = this.cardArray.value.map((c: any) => c.id);
    if (!existingIds.includes(cast.id)) {
      this.cardArray.push(new FormGroup({
        id: new FormControl(cast.id),
        value: new FormControl(cast.name)
      }));
    }
  }

  resetCastInput() {
    this.castSearchCtrl.setValue('');
    this.currentlySelectedCast = null;
    this.filteredCasts = [];
    this.showCastDropdown = false;
  }
}
