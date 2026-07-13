export class DtoAllEpisode {
    created_at: Date;
    directorName: string;
    actors: string;
    id: string;

    title: string;
    plot: string;
    poster: string;
    year: string;
    language: string;
    country: string;
    seasonId:string

    constructor(id: string,
        actors: string,
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
        this.actors = actors;
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