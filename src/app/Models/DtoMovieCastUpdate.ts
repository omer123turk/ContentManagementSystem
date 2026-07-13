export class DtoMovieCastUpdate{
    id:number;
    name:String;
    poster:String;
    castType:number;
    contentIdList:string[];

    constructor(id:number, name:String,poster:String,castType:number,contentIdList:string[]){
        this.id=id;
        this.name=name;
        this.poster=poster;
        this.castType=castType;
        this.contentIdList=contentIdList;
    }
}