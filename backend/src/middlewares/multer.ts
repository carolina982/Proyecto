import multer from "multer";
import path from "path";

const storage=multer.diskStorage({
    destination:function(req,file,cd){
        cd (null,"uplads");
    },
    filename:function(req,file,cd){
        const ext =path.extname(file.originalname);
        cd(null.Date.now()+ext);
    },
});
export const upload =multer({storage});