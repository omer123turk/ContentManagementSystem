export class DtoEpisode {
    created_at: Date;
    directorId: number;
    movieCastIdList: number[];
    id: string;

    title: string;
    plot: string;
    poster: string;
    year: string;
    language: string;
    country: string;
    seasonId:string
    episode:number;

    constructor(id: string,
        movieCastIdList: number[],
        directorId: number,
        created_at: Date,
        title: string,
        plot: string,
        poster: string,
        year: string,
        language: string,
        country: string,
        seasonId:string,
         episode:number
    ) {
        this.id = id;
        this.movieCastIdList = movieCastIdList;
        this.directorId = directorId;
        this.created_at = created_at;
        this.title = title;
        this.plot = plot;
        this.poster = poster;
        this.year = year;
        this.language = language;
        this.country = country;
        this.seasonId=seasonId;
        this.episode=episode;
    }
}