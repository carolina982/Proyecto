import express from "express";
import multer from "multer";
import { createUser, deleteUser, getUser, getUserById, loginUser, registerUser, updateUser } from "../controllers/userController";


const router = express.Router();
const storage = multer.diskStorage({
    destination:function(req,file,cd){
        cd(null,"uploads/");
    },
    filename:function (req,file,cd){
        const uniqueSuffix = Date.now()+"-"+Math.round(Math.random()* 1e9);
        cd(null, uniqueSuffix+"-"+file.originalname);
    },
});

const upload =multer({storage});

router.get("/", getUser); 
router.get("/:id", getUserById); 
router.post("/login", loginUser);
router.post("/register", registerUser);       
router.post("/", createUser);            
router.patch("/:id", upload.single("photo"), updateUser);        
router.delete("/:id", deleteUser);       

export default router;