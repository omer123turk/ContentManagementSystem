
export class DtoMovieCast{
    name:String;
    poster:String;
    contentIdList:string[];
    castType:number;

    constructor(name:String,contentIdList:string[],castType:number, poster:String){
        this.name=name;
        this.contentIdList=contentIdList;
        this.castType=castType;
        this.poster=poster;
    }
}