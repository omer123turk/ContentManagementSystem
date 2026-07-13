

export class DtoContentComplete{
    created_at:Date;
	directorId:number;
	movieCastIdList:number[];
	id:string;
	contentType:number;
	seasonList:string[];
	episodeList:string[];
	number:number;
	
    title:string;
	plot:string;
	poster:string;
	year:string;
	language:string;
	country:string;

    constructor(id:string,
        movieCastIdList:number[],
        directorId:number,
        created_at:Date,
        contentType:number,
        seasonList:string[],
        episodeList:string[],
        number:number,
        title:string,
        plot:string,
	    poster:string,
	    year:string,
	    language:string,
	    country:string,
                        ){
        this.id=id;
        this.movieCastIdList=movieCastIdList;
        this.directorId=directorId;
        this.created_at=created_at;
        this.contentType=contentType;
        this.seasonList=seasonList;
        this.episodeList=episodeList;
        this.number=number;
        this.title=title;
        this.plot=plot;
        this.poster=poster;
        this.year=year;
        this.language=language;
        this.country=country;
    }    
}