
export class DtoMetadata {
	title:String;
	plot:String;
	poster:String;
	year:String;
	language:String;
	country:String;
	contentId:string;
	
    constructor(title:String,plot:String,poster:String,year:String,language:String,country:String,contentId:string){
        this.title=title;
        this.plot=plot;
        this.poster=poster;
        this.year=year;
        this.language=language;
        this.country=country;
        this.contentId=contentId;
    }
}