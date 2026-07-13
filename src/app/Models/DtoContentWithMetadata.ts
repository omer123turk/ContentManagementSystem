export interface DtoContentWithMetadata{
    contentId:string;
    created_at:string;
	title:String;
	plot:String;
	poster:String;
	year:String;
	language:String;
	country:String;
	director:String;
	selectedContentType:number;
	seasonList:string[];
    episodeList:string[];
	number:number;
}