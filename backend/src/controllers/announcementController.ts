import { Request, Response } from "express";
import Announcement from "../models/Announcement";

export const getAnnouncements =async (req:Request , res:Response) =>{
    try {
        const announcements=await Announcement.find ().sort ({fecha:-1});
        res.json (announcements);
    }catch (error){
        res.status(500).json({error:"Error  cargando anuncios"});
    }
};

export const createAnnouncements = async (req:Request , res:Response)=>{
    try {
        console.log("Body recibido", req.body);
        console.log("Archivo recibido" , req.file);
        const {titulo,contenido}=req.body;
        if(!titulo || !contenido){
            console.log("Campos faltantes",{titulo,contenido});
            return res.status(400).json({message:"Faltan campos obligatorios"});
        }
        const newAnnouncement =new Announcement ({
            titulo ,contenido,
            fecha: new Date (),
            image:req.file ?`/uploads/announcements/${req.file.filename}`:null,
        });
        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    }catch (error){
        console.error("Error creando anuncio",error);
        res.status(500).json({message:"Error al crear el anuncio"});
    }
};
export const updateAnnouncement =async (req:Request, res:Response) =>{
    try {
        const {titulo, contenido} =req.body;
        const image =req.file?`/uploads/${req.file.filename}`:undefined;
        const updated=await Announcement.findByIdAndUpdate(req.params.id, {titulo,contenido,image},
            {new:true}
        );
        res.json(updated);
    }catch (err){
        res.status(400).json({error:"Error actualizando anuncio"});
    }
};
export  const deleteAnnouncement =async (req:Request , res:Response) =>{
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({message:"Anuncio eliminado "});
    }catch (err){
        res.status (400). json({error:"Error eliminado anuncio"});
    }
}