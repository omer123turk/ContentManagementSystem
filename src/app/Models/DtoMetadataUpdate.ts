
export class DtoMetadataUpdate{
	id:number;
	title:String;
	plot:String;
	poster:String;
	year:String;
	language:String;
	country:String;

    constructor(id:number,title:String,plot:String,poster:String,year:String,language:String,country:String){
        this.id=id;
        this.title=title;
        this.plot=plot;
        this.poster=poster;
        this.year=year;
        this.language=language;
        this.country=country;
    }

	
}