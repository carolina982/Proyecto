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
export const createAnnouncements =async (req:Request , res:Response) =>{
    try {
        const {titulo , contenido } =req.body;
        const newAnnouncement =new Announcement({titulo , contenido});
        await newAnnouncement.save();
        res.json(newAnnouncement);
    }catch (err){
        res.status(400).json({error:"Error creando anuncio "});
    }
};

export const updateAnnouncement =async (req:Request, res:Response) =>{
    try {
        const {titulo, contenido} =req.body;
        const updated=await Announcement.findByIdAndUpdate(req.params.id, {titulo,contenido},
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