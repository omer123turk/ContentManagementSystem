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
  contents: Content[] = [];
  seasonContents: Season[] = [];

  seriesId: string = "";
  title: string = "";
  metadata: any = null;
  content: any;

  constructor(private route: ActivatedRoute,
    private contentService: ContentService,
    private cdr: ChangeDetectorRef,
    private metadataService: MetadataService,
    private movieCastService: MovieCastService

  ) {

  }

  ngOnInit(): void {
    this.getContents();
  }

  getContents() {
    this.contentService.getAllContents().subscribe({
      next: (data) => {
        this.contents = data;
        this.getSeasons();
      },
      error: (err) => {
        console.error("API Hatası:", err);
      }
    });
  }

  getMetadata(id: number) {
    this.metadataService.getMetadataById(id).subscribe({
      next: (data) => {
        this.metadata = data;
        this.getSeasons();
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error("API Hatası:", err);
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    })
  }

  getSeasons() {
    const idFromUrl = this.route.snapshot.paramMap.get('id');
    if (idFromUrl != null)
      this.seriesId = idFromUrl;

    let i: number = 0;
    this.contents.forEach(element => {
      if (element.id == this.seriesId) {
        this.content = element;
        this.getMetadata(element.metadataId);
        element.seasonList.forEach(Seasonelement => {
          this.seasons.push({ id: Seasonelement, name: `${this.metadata.title}: Season ${i + 1}` });
          i++;
        });

      }

    });

    this.cdr.detectChanges();
    this.cdr.markForCheck();

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
