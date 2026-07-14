import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MovieCast } from '../../../Models/MovieCast';
import { Metadata } from '../../../Models/Metadata';
import { ContentService } from '../../../Services/content.service';
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
    MatButtonModule],
  templateUrl: './cast-pop-up.html',
  styleUrl: './cast-pop-up.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class CastPopUp {

  metadatas: Metadata[] = [];
  castForm!: FormGroup;

  assignedContents: string[] = [];
  unassignedContents: string[] = [];

  selectedContentToAdd: string = '';

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

    this.data?.contentIdList.forEach(contentElement => {
      contentList.push(contentElement);

    });
    console.log(this.data?.name);



    if (this.data && contentList) {
      this.assignedContents = [...contentList];
    } else {
      this.assignedContents = [];
    }

    this.updateUnassignedList();

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

  }


  updateUnassignedList(): void {

    this.metadatas.forEach(element => {
      if (!this.assignedContents.includes(element.title)) {
        this.unassignedContents.push(element.title);
      }
    });


    this.selectedContentToAdd = ''; 
  }


  addContent(): void {
    if (this.selectedContentToAdd) {
      this.assignedContents.push(this.selectedContentToAdd);
      this.updateUnassignedList();
    }
  }

  onSubmit(): void {

    if (this.castForm.valid) {


      let movieCastUpdate: DtoMovieCastUpdate = this.castForm.value;
      let castType = this.castForm.value;
      movieCastUpdate.contentIdList = this.assignedContents;

      if (castType.castType == "Actor")
        movieCastUpdate.castType = 0;
      else if (castType.castType == "Director")
        movieCastUpdate.castType = 1;
      else
        movieCastUpdate.castType = 2;


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
      }else{

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
