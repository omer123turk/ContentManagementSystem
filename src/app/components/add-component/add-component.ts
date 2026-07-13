import { Component, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, } from '@angular/core';
import { ContentService } from '../../Services/content.service';
import { MetadataService } from '../../Services/metadata.service';
import { MovieCastService } from '../../Services/movie-cast.service';
import { finalize } from 'rxjs';
import { Content } from '../../Models/Content';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Metadata } from '../../Models/Metadata';
import { DtoContentWithMetadata } from '../../Models/DtoContentWithMetadata';
import { metadata } from '@angular/forms/signals';
import { DtoMetadata } from '../../Models/DtoMetadata';
import { DtoContent } from '../../Models/DtoContent';
import { parse } from 'date-fns';
import { delay } from 'rxjs/operators';
import { DtoMovieCast } from '../../Models/DtoMovieCast';
import { HttpClient } from '@angular/common/http';
import { from, concatMap } from 'rxjs';
import { LoadingComponent } from '../loading-component/loading-component';


@Component({
  selector: 'app-add-component',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, LoadingComponent],
  templateUrl: './add-component.html',
  styleUrl: './add-component.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class AddComponent implements OnInit {

  showLoading: boolean = false;
  loadingMessage: string = 'Loading...';

  searchQuery: string = '';
  foundMovie: any = null;
  isfoundMovie: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  castlist: string[] = [];

  contentForm: FormGroup;
  isSubmittingContent: boolean = false;
  successMessageContent: string = '';

  cardForm!: FormGroup;

  series: any;
  seasons: any[] = [];
  episodes: any[][] = [];

  constructor(private contentService: ContentService,
    private metadataService: MetadataService,
    private moviecastService: MovieCastService,
    private cdr: ChangeDetectorRef,
    private fbContent: FormBuilder,
    private fbCast: FormBuilder,
    private http: HttpClient
  ) {
    this.contentForm = this.fbContent.group({
      contentId: ['',],
      created_at: ['',],
      title: ['',],
      plot: ['',],
      poster: ['',],
      language: ['',],
      country: ['',],
      year: ['',],
      director: ['',],
      selectedContentType: ['',]
    });

  }

  ngOnInit(): void {
    this.cardForm = this.fbCast.group({
      cards: this.fbCast.array([])
    });
  }

  get cardArray(): FormArray {
    return this.cardForm.get('cards') as FormArray;
  }


  onSearch() {

    if (!this.searchQuery.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.foundMovie = null;
    this.isfoundMovie = false;
    this.castlist = [];

    this.metadataService.getMetadataInformations(this.searchQuery).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        if (data) {
          this.isLoading = false;
          this.foundMovie = data;
          this.castlist = String(this.foundMovie.Actors).split(',');

          //Type Finding
          let type: string = data.Type;
          let id: number = 0;
          if (type == "movie")
            id = 0;
          else if (type == "series")
            id = 1;
          else if (type == "episode")
            id = 2;


          this.contentForm.patchValue({
            contentId: data.imdbID,
            year: data.Year,
            title: data.Title,
            plot: data.Plot,
            poster: data.Poster,
            language: data.Language,
            country: data.Country,
            director: data.Director,
            selectedContentType: id
          });

          this.cdr.markForCheck();
          this.cdr.detectChanges();



        } else {
          this.errorMessage = 'Eşleşen herhangi bir içerik bulunamadı.';
        }
      },
      error: (err) => {
        console.error('Arama hatası:', err);
        this.errorMessage = 'İçerik aranırken bir hata oluştu (404 veya Sunucu Hatası).';

      }
    });

    setTimeout(() => {
      this.isfoundMovie = true;
      this.cdr.markForCheck();
      this.cdr.detectChanges();


      this.cardArray.clear();
      this.castlist.forEach(element => {
        this.cardArray.push(this.createCard(1, element))
      });

      this.cdr.markForCheck();
      this.cdr.detectChanges();

    }, 1000)

  }

  manuelAdd() {
    if (this.contentForm.invalid) {
      this.contentForm.markAllAsTouched();
      return;
    }

    this.showLoading = true;

    this.isSubmittingContent = true;
    this.successMessageContent = '';
    let metadataId: number = 0;

    const newContentForm: DtoContentWithMetadata = this.contentForm.value;
    const dtoMetadata: DtoMetadata = new DtoMetadata(newContentForm.title, newContentForm.plot, newContentForm.poster, newContentForm.year, newContentForm.language, newContentForm.country, newContentForm.contentId);
    let movieCastIdList: Array<number> = new Array();

    //Saving Casts
    const formValues = this.cardArray.value;
    const names: string[] = formValues.map((card: any) => card.value);
    names.forEach(element => {
      let contentIdList: string[] = [newContentForm.contentId];
      let dtoMovieCast: DtoMovieCast = new DtoMovieCast(element, contentIdList, 0, "");
      this.moviecastService.addCast(dtoMovieCast).subscribe({
        next: (response) => {
          movieCastIdList.push(response.id);

        },
        error: (err) => {
          console.error('Kayıt esnasında hata oluştu:', err);

        }
      });

    });

    //Saving Director
    let contentIdList: string[] = [newContentForm.contentId];
    let dtoDirector: DtoMovieCast = new DtoMovieCast(newContentForm.director, contentIdList, 1, "");
    let directorId: number = 0;
    this.moviecastService.addCast(dtoDirector).subscribe({
      next: (response) => {
        directorId = response.id;
        movieCastIdList.push(response.id);
      },
      error: (err) => {
        console.error('Kayıt esnasında hata oluştu:', err);

      }
    });

    //Saving Metadata
    this.metadataService.addMetadata(dtoMetadata).subscribe({
      next: (response) => {
        metadataId = response.id;

        this.isLoading = false;
        let seasonList: string[] = [];
        let episodeList: string[] = [];

        //Content Movie
        if (newContentForm.selectedContentType == 0) {
          const newContent: DtoContent = new DtoContent(newContentForm.contentId, metadataId, movieCastIdList, directorId, parse(newContentForm.created_at, 'yyyy-MM-dd', new Date()), newContentForm.selectedContentType, seasonList, episodeList, 0);
          this.contentService.addContent(newContent).subscribe({
            next: (response) => {
              console.log('Veri başarıyla kaydedildi:', response);
              this.contentForm.reset(); // Formu temizle
              this.cardForm.reset();
              this.isSubmittingContent = false;
              this.showLoading = false;
            },
            error: (err) => {
              console.error('Kayıt esnasında hata oluştu:', err);
              this.isSubmittingContent = false;
              this.showLoading = false;
            }
          });
        } else {

          this.getSeasonAndEpisodeInformations(newContentForm.contentId, metadataId, movieCastIdList, directorId, newContentForm.created_at, newContentForm.selectedContentType);

        }

      },
      error: (err) => {
        console.error('Kayıt esnasında hata oluştu:', err);

      }
    });



    this.foundMovie = null;
    this.searchQuery = "";
    this.isfoundMovie = false;


  }

  createCard(id: number, value: string = ''): FormGroup {
    return this.fbCast.group({
      id: [id],
      value: [value]
    });
  }

  addNewCart() {
    const yeniId = Date.now();
    this.cardArray.push(this.createCard(yeniId, ''));
  }

  getSeasonAndEpisodeInformations(id: string, metadataId: number, movieCastIdList: number[], directorId: number, created_at: string, selectedContentType: number) {


    //Get Series
    this.contentService.getSeriesInformation(id).subscribe({
      next: (seriesResponse) => {
        this.series = seriesResponse;

        //Get Seasons

        //IdList
        let idList: number[] = [];
        let numberOfSeasons: number = this.series.totalSeasons;
        for (let a = 0; a < numberOfSeasons; a++) {
          idList.push(a + 1);

        }


        let seasonNumber: number = 0;
        from(idList).pipe(
          concatMap(seasonId => {
            //console.log(`İstek başladı: ID ${seasonId}`);
            return this.contentService.getSeasonsInformations(id, seasonId);
          })
        ).subscribe({
          next: (seasonData) => {
            //console.log('Bir istek başarıyla tamamlandı:', seasonData);

            this.seasons.push(seasonData);
            const row: any[] = [];

            //Get Episodes
            let Episodes: any[] = seasonData.Episodes;
            let episodeNumber: number = 0;

            //IdList
            let idList: string[] = [];
            for (let a = 0; a < Episodes.length; a++) {
              idList.push(Episodes[a].imdbID);

            }

            from(idList).pipe(
              concatMap(episodeId => {
                //console.log(`İstek başladı: ID ${episodeId}`);
                return this.metadataService.getMetadataInformations(episodeId);
              })
            ).subscribe({
              next: (episodeData) => {
                //console.log('Bir istek başarıyla tamamlandı:', episodeData);

                row.push(episodeData);
                if (episodeNumber == Episodes.length - 1) {
                  this.episodes.push(row);
                  if (seasonNumber == numberOfSeasons - 1) {
                    this.saveEpisodes(id, metadataId, movieCastIdList, directorId, created_at, selectedContentType);
                  }

                  seasonNumber++;
                }

                episodeNumber++;
              },
              error: (err) => {
                console.error('Hata oluştu:', err);
              },
              complete: () => {
                console.log('Tüm istekler sırasıyla bitti! 🎉');
              }
            });


          },
          error: (err) => {
            console.error('Hata oluştu:', err);
          },
          complete: () => {
            console.log('Tüm istekler sırasıyla bitti! 🎉');
          }
        });

      }
    })
  }

  saveEpisodes(id: string, metadataId: number, movieCastIdList: number[], directorId: number, created_at: string, selectedContentType: number) {

    let seasonList: string[] = [];
    for (let i = 0; i < this.seasons.length; i++) {
      let numberofEpisodes: number = this.seasons[i].Episodes.length;
      let episodeList: string[] = [];
      for (let j = 0; j < numberofEpisodes; j++) {

        //Saving Episodes

        episodeList.push(this.episodes[i][j].imdbID);
        //Saving Casts

        let episodeMovieCastIdList: number[] = [];
        let actorsString: string = this.episodes[i][j].Actors;
        let actors: string[] = actorsString.split(', ').map(item => item.trim());
        let episodeContentList: string[] = [this.episodes[i][j].imdbID];

        actors.forEach(element => {
          let dtoMovieCast: DtoMovieCast = new DtoMovieCast(element.trim(), episodeContentList, 0, "");
          this.moviecastService.addCast(dtoMovieCast).subscribe({
            next: (moviecastResponse) => {
              episodeMovieCastIdList.push(moviecastResponse.id);
            },
            error: (err) => {
              console.error('Kayıt esnasında hata oluştu:', err);

            }
          });
        });


        //Saving Director
        let contentIdList: string[] = [this.episodes[i][j].imdbID];
        let dtoDirector: DtoMovieCast = new DtoMovieCast(this.episodes[i][j].Director, contentIdList, 1, "");
        let directorId: number = 0;
        this.moviecastService.addCast(dtoDirector).subscribe({
          next: (responseDirector) => {
            directorId = responseDirector.id;
            episodeMovieCastIdList.push(responseDirector.id);
          },
          error: (err) => {
            console.error('Kayıt esnasında hata oluştu:', err);

          }
        });


        //Saving Metadata
        let dtoMetadata: DtoMetadata = new DtoMetadata(this.episodes[i][j].Title, this.episodes[i][j].Plot, this.episodes[i][j].Poster, this.episodes[i][j].Year, this.episodes[i][j].Language, this.episodes[i][j].Country, this.episodes[i][j].imdbID);

        this.metadataService.addMetadata(dtoMetadata).subscribe({
          next: (response) => {
            let metadataId: number = response.id;


            //Saving Content
            const newContent: DtoContent = new DtoContent(this.episodes[i][j].imdbID, metadataId, episodeMovieCastIdList, directorId, new Date, 3, [], [], j + 1);
            this.contentService.addContent(newContent).subscribe({
              next: (response) => {
                console.log('Veri başarıyla kaydedildi:', response);

              },
              error: (err) => {
                console.error('Kayıt esnasında hata oluştu:', err);

              }
            });

          },
          error: (err) => {
            console.error('Kayıt esnasında hata oluştu:', err);

          }
        });

      }

      //Save Seasons
      seasonList.push(id + `/${i + 1}`);

      //Saving Metadata
      let dtoMetadata: DtoMetadata = new DtoMetadata(`Season: ${i + 1}`, "", "", "", "", "", id + `/${i + 1}`);

      this.metadataService.addMetadata(dtoMetadata).subscribe({
        next: (response) => {
          let metadataId = response.id;

          //Saving Content
          const newContent: DtoContent = new DtoContent(id + `/${i + 1}`, metadataId, [], 0, new Date, 2, [], episodeList, i + 1);
          this.contentService.addContent(newContent).subscribe({
            next: (response) => {
              console.log('Veri başarıyla kaydedildi:', response);

            },
            error: (err) => {
              console.error('Kayıt esnasında hata oluştu:', err);

            }
          });

        },
        error: (err) => {
          console.error('Kayıt esnasında hata oluştu:', err);

        }
      });

    }

    //Save Series
    setTimeout(() => {
      const newContent: DtoContent = new DtoContent(id, metadataId, movieCastIdList, directorId, parse(created_at, 'yyyy-MM-dd', new Date()), selectedContentType, seasonList, [], 0);
      this.contentService.addContent(newContent).subscribe({
        next: (response) => {
          console.log('Veri başarıyla kaydedildi:', response);
          this.contentForm.reset(); // Formu temizle
          this.cardForm.reset();
          this.isSubmittingContent = false;
          this.showLoading = false;
        },
        error: (err) => {
          console.error('Kayıt esnasında hata oluştu:', err);
          this.isSubmittingContent = false;
          this.showLoading = false;
        }
      });

    }, 500);

  }
}
