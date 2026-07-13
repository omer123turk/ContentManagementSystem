export class DtoEpisodeWithActors{
    created_at: Date;
    directorName: string;
    movieCastNameList: string[];
    id: string;

    title: string;
    plot: string;
    poster: string;
    year: string;
    language: string;
    country: string;
    seasonId:string

    constructor(id: string,
        movieCastNameList: string[],
        directorName: string,
        created_at: Date,
        title: string,
        plot: string,
        poster: string,
        year: string,
        language: string,
        country: string,
        seasonId:string,
    ) {
        this.id = id;
        this.movieCastNameList = movieCastNameList;
        this.directorName = directorName;
        this.created_at = created_at;
        this.title = title;
        this.plot = plot;
        this.poster = poster;
        this.year = year;
        this.language = language;
        this.country = country;
        this.seasonId=seasonId;
    }
}