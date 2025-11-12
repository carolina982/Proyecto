import fs from "fs";
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

export const upload =multer({storage});