import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MovieCast } from '../../Models/MovieCast';
import { MovieCastService } from '../../Services/movie-cast.service';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../Services/content.service';
import { DtoContentComplete } from '../../Models/DtoContentComplete';


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
                director: director
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
   * Seçim havuzundan (Select box) seçilen oyuncuyu listeye (FormArray) ekler
   */
  addCastFromPool(castId: string): void {
    if (!castId) return;

    // Select elementinden gelen string ID'yi number'a çeviriyoruz
    const numericId = parseInt(castId, 10);
    const selectedCast = this.allCasts.find(c => c.id === numericId);

    if (selectedCast) {
      // Aynı oyuncunun listede zaten olup olmadığını kontrol ediyoruz (Mükerrer kaydı önler)
      const isAlreadyAdded = this.cardArray.controls.some(
        control => control.get('id')?.value === selectedCast.id
      );

      if (!isAlreadyAdded) {
        this.cardArray.push(this.fb.group({
          id: [selectedCast.id],
          value: [selectedCast.name]
        }));
      } else {
        alert('This cast member is already added!');
      }
    }
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

    let movieCastIdList: number[] = [];
    let casts: any[] = this.cardArray.value;
    casts.forEach(element => {
      movieCastIdList.push(element.id);
    });

    this.contentService.getContentById(this.idFromUrl).subscribe({
      next: (data) => {
        let CompleteContent: DtoContentComplete = new DtoContentComplete(this.idFromUrl, movieCastIdList, Number(this.editForm.value.director), this.editForm.value.created_at, this.editForm.value.selectedContentType, data.seasonList, data.episodeList, data.number, this.editForm.value.title, this.editForm.value.plot, this.editForm.value.poster, this.editForm.value.year, this.editForm.value.language, this.editForm.value.country);
        this.contentService.updateCompleteContent(CompleteContent).subscribe({
          next:(data)=>{

          }
        });
      }
    })


  }
}
