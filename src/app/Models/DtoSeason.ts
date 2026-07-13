export class DtoSeason{
    seriesId:string;
	name:string;
	id:string;
	created_at:Date;

    constructor(seriesId:string,
	name:string,
	id:string,
	created_at:Date,){
        this.seriesId=seriesId;
        this.name=name;
        this.id=id;
        this.created_at=created_at;
       
    }
}