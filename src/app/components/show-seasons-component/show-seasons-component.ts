import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../Services/content.service';
import { Content } from '../../Models/Content';
import { MetadataService } from '../../Services/metadata.service';
import { Metadata } from '../../Models/Metadata';
import { Meta } from '@angular/platform-browser';
import { DtoMetadata } from '../../Models/DtoMetadata';
import { DtoContent } from '../../Models/DtoContent';
import { DtoSeason } from '../../Models/DtoSeason';
import { DtoEpisode } from '../../Models/DtoEpisode';
import { MovieCastService } from '../../Services/movie-cast.service';
import { DtoAllEpisode } from '../../Models/DtoAllEpisode';
import { DtoContentComplete } from '../../Models/DtoContentComplete';

interface Season {
  id: string;
  name: string;
}

@Component({
  selector: 'app-show-seasons-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './show-seasons-component.html',
  styleUrl: './show-seasons-component.css',
  changeDetection: ChangeDetectionStrategy.Eager

})
export class ShowSeasonsComponent implements OnInit {


  seasons: Season[] = [];
  seasonContents: Season[] = [];

  seriesId: string = "";
  title: string = "";
  metadata: any = null;
  content: any;

  completeContents: DtoContentComplete[] = [];

  constructor(private route: ActivatedRoute,
    private contentService: ContentService,
    private cdr: ChangeDetectorRef,
    private metadataService: MetadataService,
    private movieCastService: MovieCastService

  ) {

  }

  ngOnInit(): void {
   this.getSeasons();
  }

 

  getSeasons() {
    const idFromUrl = this.route.snapshot.paramMap.get('id');
    if (idFromUrl != null)
      this.seriesId = idFromUrl;

    this.seasons = [];
    let i: number = 0;

    this.contentService.getSeasonsBySeriesId(this.seriesId).subscribe({
      next: (data) => {
        this.completeContents = data;

        data.forEach(element => {
          this.seasons.push({ id: element.id, name: `${element.title}` });
          i++;
        });
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    })

    



  }

  addSeason() {
    const nextId = `${this.seriesId}/${this.seasons.length + 1}`;
    const newSeason: Season = {
      id: nextId,
      name: `${this.metadata.title}: Season ${this.seasons.length + 1}`
    };
    this.seasons.push(newSeason);
    this.saveSeason();

  }

  saveSeason() {

    let Season: DtoSeason = new DtoSeason(this.seriesId, `${this.metadata.title}: Sezon ${this.seasons.length}`, this.seriesId + `/${this.seasons.length}`, new Date);

    this.contentService.addSeasonToSeries(Season).subscribe({
      next: (data) => {

      }
    })

  }



}
