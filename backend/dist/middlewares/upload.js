"use strict";
/*import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir =path.join(__dirname,"../../uploads");
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true});
}
const storage=multer.diskStorage({
    destination:(_, __, cd)=> cd (null,uploadDir),
    filename:(_, file, cd)=>{
        const name =`${Date.now()}-${file.originalname.replace(/\s+/g,"-")}`;
        cd (null, name);
    },
});

export const upload =multer({storage});*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => ({
        folder: "units",
        allowed_formats: ["jpg", "jpeg", "png"],
    }),
});
exports.upload = (0, multer_1.default)({ storage });
