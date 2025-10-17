import mongoose, { Document, Schema } from "mongoose";

interface IAnnouncement extends Document{
    titulo:string;
    descripcion:string;
    fecha :Date;
}

const announcementSchema = new Schema<IAnnouncement>({
    titulo:{type:String , required:true},
    descripcion:{type:String ,required:true},
    fecha:{type:Date , default:Date.now},
});

export default mongoose.model<IAnnouncement>("Announcement",announcementSchema);