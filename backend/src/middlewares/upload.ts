import fs from "fs";
import multer from "multer";
import path from "path";

const storage =multer.diskStorage({destination:(req,file,cd)=>{
    const tripId=req.body.tripId || "Otros";
    const dir=path.join ("uploads", tripId);
    if(!fs.existsSync(dir))
        fs.mkdirSync(dir,{recursive:true});
    cd(null,dir);
},
filename:(req, file,cd)=>{
    const ext= path.extname(file.originalname);
    cd(null,`${Date.now()}${ext}`);
},
});
export const upload=multer({storage});