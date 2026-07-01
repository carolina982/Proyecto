import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage =new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"announcements",
        allowed_formats:["jpg","png","jpeg"]
    }as any,
});


export const upload=multer({storage});