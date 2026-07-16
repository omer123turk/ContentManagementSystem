
export class DtoMovieCast{
    name:String;
    poster:String;
    contentIdList:string[];
    castType:number;
    directedContentIdList:string[];

    constructor(name:String,contentIdList:string[],castType:number, poster:String,directedContentIdList:string[]){
        this.name=name;
        this.contentIdList=contentIdList;
        this.castType=castType;
        this.poster=poster;
        this.directedContentIdList=directedContentIdList;
    }
}