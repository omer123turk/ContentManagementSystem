import { Metadata } from './Metadata';
import { MovieCast } from './MovieCast';

export interface Content{
    id:string;
    metadataId:number;
    movieCastIdList:Array<number>;
    directorId:number;
    created_at:Date;
    contentType:number;
    seasonList:string[];
    episodeList:string[];
    number:number;
        
}