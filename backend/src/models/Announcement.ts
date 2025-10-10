import mongoose, { Document, Schema } from "mongoose";

export interface IAnnouncement extends Document{
    titulo:string;
    contenido:string;
    fecha:Date;
    image?:string;
}

const AnnouncementSchema:Schema =new Schema ({
    titulo:{type:String , required:true},
    contenido:{type:String , required:true},
    fecha:{type:Date , default :Date.now},
    image:{type:String},
});

export default mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);