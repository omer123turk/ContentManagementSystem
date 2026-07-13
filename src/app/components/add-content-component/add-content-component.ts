import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DtoContentComplete } from '../../Models/DtoContentComplete';
import { ContentService } from '../../Services/content.service';
import { MovieCastService } from '../../Services/movie-cast.service';
import { MovieCast } from '../../Models/MovieCast';
import { Metadata } from '../../Models/Metadata';
import { MetadataService } from '../../Services/metadata.service';
import { DtoMovieCast } from '../../Models/DtoMovieCast';

@Component({
  selector: 'app-add-content-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-content-component.html',
  styleUrl: './add-content-component.css',
})
export class AddContentComponent implements OnInit {

  mediaForm!: FormGroup;
  castList: MovieCast[] = [];
  selectedCastsList: MovieCast[] = [];

  constructor(private fb: FormBuilder,
    private contentService: ContentService,
    private movieCastService: MovieCastService,
    private metadataService: MetadataService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.watchContentType();
    this.loadCasts();
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

  // ContentType değişimini izleyen metot
  watchContentType(): void {
    this.mediaForm.get('contentType')?.valueChanges.subscribe((value) => {
      const seasonsControl = this.mediaForm.get('numberOfSeasons');

      if (value === 'Series') {
        // Eğer Series seçilirse, alanı zorunlu yap
        seasonsControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        // Movie seçilirse veya temizlenirse, alanı sıfırla ve doğrulamayı kaldır
        seasonsControl?.clearValidators();
        seasonsControl?.setValue('');
      }
      // Değişikliklerin forma yansıması için validasyonu güncelle
      seasonsControl?.updateValueAndValidity();
    });
  }

  loadCasts(): void {
    // Backend API'sine istek atan servis fonksiyonun
    this.movieCastService.getAllCasts().subscribe({
      next: (data) => {
        this.castList = data;
      },
      error: (err) => {
        console.error('Cast listesi yüklenirken hata oluştu:', err);
      }
    });
  }

  getAvailableCasts(): MovieCast[] {
    return this.castList.filter(cast => !this.selectedCastsList.some(s => s.id === cast.id));
  }

  // "Add Cast" butonuna basıldığında tetiklenir
  addCastMember(castId: string): void {
    if (!castId) return;

    const castMember = this.castList.find(c => c.id === Number(castId));
    if (castMember && !this.selectedCastsList.some(c => c.id === Number(castId))) {
      // 1. Ekranda görünecek listeye ekle
      this.selectedCastsList.push(castMember);

      // 2. Form modelindeki casts array'ini güncelle
      this.updateFormCasts();
    }
  }

  // Chip üzerindeki (x) butonuna basıldığında listeden kaldırır
  removeCastMember(castId: number): void {
    // 1. Ekran listesinden temizle
    this.selectedCastsList = this.selectedCastsList.filter(c => c.id !== castId);

    // 2. Form modelindeki casts array'ini güncelle
    this.updateFormCasts();
  }

  // Seçili nesnelerin ID'lerini form kontrolüne set eder
  private updateFormCasts(): void {
    const ids = this.selectedCastsList.map(c => c.id);
    this.mediaForm.get('casts')?.setValue(ids);
  }

  onSubmit(): void {
    if (this.mediaForm.valid) {
      console.log('Form Verisi:', this.mediaForm.value);

      let contentType: number = 0;
      let number: number = 0;
      if (this.mediaForm.value.contentType != "Movie") {
        contentType = 1; number = this.mediaForm.value.numberOfSeasons;
      }

      let Content: DtoContentComplete = new DtoContentComplete(this.mediaForm.value.id, this.mediaForm.value.casts, Number(this.mediaForm.value.director), new Date, contentType, [], [], number, this.mediaForm.value.title, this.mediaForm.value.plot, this.mediaForm.value.poster, this.mediaForm.value.year, this.mediaForm.value.language, this.mediaForm.value.country);
      this.contentService.addContentComplete(Content).subscribe({
        next: (response) => {
          console.log(response);
          this.mediaForm.reset();
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

    // Kendi içerik servisiniz üzerinden backend API çağrısı
    this.metadataService.getMetadataInformations(contentId).subscribe({
      next: (data: any) => {
        if (data) {
          // Backend'den gelen verileri reaktif form alanlarına güvenle eşleştiriyoruz
          let contentType: string = "";
          if (data.Type == "movie")
            contentType = "Movie";
          else
            contentType = "Series";
          //Director
          let directorId: number = 0;
          let findDirector: boolean = false;
          this.castList.forEach(element => {
            if (element.name == data.Director) {
              directorId = element.id;
              findDirector = true;
            }
          });
          if (!findDirector) {
            let name: string = data.Director;
            let cast: DtoMovieCast = new DtoMovieCast(name, [], 1, "");
            this.movieCastService.addCast(cast).subscribe({
              next: (data) => {
                let movieCast = { id: data.id, name: name, poster: "", contentIdList: [], castType: 1 };
                this.castList.push(movieCast);
                directorId = movieCast.id;
              }
            })
          }

          this.mediaForm.patchValue({
            title: data.Title || '',
            contentType: contentType || 'Movie',
            year: data.Year || null,
            plot: data.Plot || '',
            poster: data.Poster || '',
            language: data.Language || '',
            country: data.Country || '',
            director: directorId || '' ,
            numberOfSeasons:data.totalSeasons
          });

          // Eğer backend'den oyuncu listesi (casts) nesnesi de geliyorsa onları chip listesine ekleyebilirsiniz
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
}
