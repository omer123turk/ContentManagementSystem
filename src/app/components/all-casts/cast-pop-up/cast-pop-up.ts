import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { MovieCast } from '../../../Models/MovieCast';
import { Metadata } from '../../../Models/Metadata';
import { MetadataService } from '../../../Services/metadata.service';
import { MovieCastService } from '../../../Services/movie-cast.service';
import { DtoMovieCastUpdate } from '../../../Models/DtoMovieCastUpdate';


@Component({
  selector: 'app-cast-pop-up',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule],
  templateUrl: './cast-pop-up.html',
  styleUrl: './cast-pop-up.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class CastPopUp {

  metadatas: Metadata[] = [];
  castForm!: FormGroup;

  
  // Listelerimiz
  assignedContents: string[] = [];
  unassignedContents: string[] = []; // Tüm atanmamış içeriklerin ana listesi
  
  // Autocomplete ve RxJS Arama Kontrolleri
  unassignedSearchControl = new FormControl('');
  filteredUnassignedContents!: Observable<string[]>;
  selectedContentToAdd: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CastPopUp>,
    @Inject(MAT_DIALOG_DATA) public data: MovieCast | null,
    private metadataService: MetadataService,
    private movieCastService: MovieCastService,
    private cdr: ChangeDetectorRef,
  ) { }




  getDatas() {
    let contentList: string[] = [];

    if (this.data?.castType == 0) {
      this.data?.contentIdList.forEach(contentElement => {
        contentList.push(contentElement);

      });
    }
    else {
      this.data?.directedContentIdList.forEach(contentElement => {
        contentList.push(contentElement);

      });
    }


    if (this.data && contentList) {
      this.assignedContents = [...contentList];
    } else {
      this.assignedContents = [];
    }

    this.cdr.markForCheck();
    this.cdr.detectChanges();

  }


  getAllMetadatas() {
    this.metadataService.getAllMetadatas().subscribe({
      next: (data) => {
        this.metadatas = data;
        console.log("success");
        this.getDatas();

      },
      error: (err) => {
        console.error("API Hatası:", err);
      }
    });
  }



  ngOnInit(): void {
    let castType: string;
    if (this.data?.castType == 0)
      castType = "Actor";
    else if (this.data?.castType == 1)
      castType = "Director";
    else
      castType = "Both";


    this.castForm = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      poster: [this.data?.poster || '', Validators.required],
      castType: [castType, Validators.required]
    });
    this.getAllMetadatas();

    this.setupUnassignedSearch();

  }

  setupUnassignedSearch(): void {
    this.filteredUnassignedContents = this.unassignedSearchControl.valueChanges.pipe(
      debounceTime(400),                 
      distinctUntilChanged(),           
      switchMap(value => {
        const searchTerm = (value || '').trim().toLowerCase();
    
        if (!searchTerm) {
          return of(this.unassignedContents);
        }

        const filtered:string[]=[];

        this.metadataService.getFilteredMetadatas(searchTerm).subscribe({
          next:(data)=>{
            data.forEach(element => {
              filtered.push(element.title);
            });
            this.cdr.detectChanges();
            this.cdr.markForCheck();
          }
        })

        return of(filtered);
      })
    );
  }


  onContentSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedContentToAdd = event.option.viewValue;
  }

  // Seçilen içeriği "Assigned" listesine ekler
  addContent(): void {
    const writtenName = this.unassignedSearchControl.value?.trim();
    
    // Eğer listeden seçilen bir şey varsa onu ekle, yoksa elle yazılanı ekle
    const contentToAdd = this.selectedContentToAdd || writtenName;

    if (contentToAdd) {
      // Çift eklemeyi önlemek için kontrol et
      if (!this.assignedContents.includes(contentToAdd)) {
        this.assignedContents.push(contentToAdd);
        
        // "Unassigned" ana listesinden de çıkarıyoruz
        this.unassignedContents = this.unassignedContents.filter(c => c !== contentToAdd);
      }

      // Input ve seçim durumlarını sıfırla
      this.resetSearchInput();
    }
  }

  // Çarpı butonuna basıldığında içeriği kaldırır
  removeContent(contentToRemove: string): void {
    // "Assigned" listesinden kaldır
    this.assignedContents = this.assignedContents.filter(c => c !== contentToRemove);
    
    // "Unassigned" listesine geri ekle
    this.unassignedContents.push(contentToRemove);
    
    // Filtrelenmiş listeyi otomatik tetiklemek için input değerini yenile
    this.unassignedSearchControl.setValue(this.unassignedSearchControl.value);
  }

  // Input ve autocomplete durumunu temizleme
  resetSearchInput(): void {
    this.unassignedSearchControl.setValue('', { emitEvent: true });
    this.selectedContentToAdd = null;
  }



  onSubmit(): void {

    if (this.castForm.valid) {


      let movieCastUpdate: DtoMovieCastUpdate = this.castForm.value;
      let castType = this.castForm.value;
      movieCastUpdate.contentIdList = this.assignedContents;

      if (castType.castType == "Actor") {
        movieCastUpdate.castType = 0;
        movieCastUpdate.contentIdList = this.assignedContents;
        movieCastUpdate.directedContentIdList = [];
      }
      else if (castType.castType == "Director") {
        movieCastUpdate.castType = 1;
        movieCastUpdate.contentIdList = [];
        movieCastUpdate.directedContentIdList = this.assignedContents;
      }
      else {
        movieCastUpdate.castType = 2;
        movieCastUpdate.contentIdList = this.assignedContents;
        movieCastUpdate.directedContentIdList = [];
      }



      let id: number = 0;

      if (this.data != null) {

        //Update Cast
        movieCastUpdate.id = this.data.id;

        this.movieCastService.updateCast(movieCastUpdate).subscribe({
          next: (data) => {
            console.log("success");

          },
          error: (err) => {
            console.error("API Hatası:", err);
          }
        });
      }
      else {

        //Save Cast
        this.movieCastService.addCastComplete(movieCastUpdate).subscribe({
          next: (data) => {
            console.log("success");
            id = data.id;

          },
          error: (err) => {
            console.error("API Hatası:", err);
          }
        });

      }



      this.dialogRef.close(movieCastUpdate);
    }

  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
