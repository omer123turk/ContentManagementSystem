import { Content } from "./Content";

export class DtoContent implements Content{
    id:string;
    metadataId:number;
    movieCastIdList:Array<number>;
    directorId:number;
    created_at:Date;
    contentType: number;
    seasonList:string[];
    episodeList:string[];
    number:number;

    constructor(id:string,metadataId:number,movieCastIdList:Array<number>,directorId:number,created_at:Date,contentType:number,seasonList:string[],episodeList:string[],number:number){
        this.id=id;
        this.metadataId=metadataId;
        this.movieCastIdList=movieCastIdList;
        this.directorId=directorId;
        this.created_at=created_at;
        this.contentType=contentType;
        this.seasonList=seasonList;
        this.episodeList=episodeList;
        this.number=number;
    }    
}