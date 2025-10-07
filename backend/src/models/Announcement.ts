import mongoose, { Document, Schema } from "mongoose";

export interface IAnnouncement extends Document{
    titulo:string;
    contenido:string;
    fecha:Date;
}

const AnnouncementSchema:Schema =new Schema ({
    titulo:{type:String , required:true},
    contenido:{type:String , required:true},
    fecha:{type:Date , default :Date.now},
});

export default mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);