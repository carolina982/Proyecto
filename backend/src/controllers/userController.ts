import { Request, Response } from "express";
import User, { IUser } from "../models/User";



//lista  todos los usuarios
export const getUser= async (req:Request , res:Response)=>{
    try{
        const users:IUser []= await User.find ();
        res.json (users);
    }catch (error ){
        console.error (error);
        res.status(500).json({message:"Something wen wrong"});
    }
};
export const getUserById =async (req:Request , res:Response) =>{
    try{
        const {id} =req.params;
        const user:IUser | null =await User.findById (id);
        res.json(user);
    }catch (error) {
        res.status (500).json ({message:"Error  en el servidor "});
    }
};


export const createUser = async (req: Request, res: Response) => {
 
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error creando usuario:", error.message);
    res.status(500).json({ message: "Error creando usuario", error: error.message });
}
};
//registro de usuarios 

export const registerUser =async (req:Request , res:Response) =>{
    const{nombre , email,password,rol}:IUser =req .body;
    try{
        const existingUser =await User.findOne({email});
        if (existingUser) return res.status(400).json ({message:"Usuario ya exite"});

        const user =await User.create({nombre,email,password,rol});
        res.status(201).json({user});
    }catch (error){
        console.error(error);
        res.status(500).json({message:"Error en el servidor"});
    }
};

//login

export const loginUser =async (req:Request , res:Response) =>{
    const {email, password}:{email:string; password:string} =req.body;
    try{
        const user=await User.findOne({email,password});
        if (!user) return res.status(401).json({message:"Usuario  o contraseña incorrectos"});
        res.json({user});
    }catch (error){
        console.error (error);
        res.status(500).json ({message:"Error en el servidor"});
    }
}

// Actualizar usuario 

export const updateUser =async (req:Request , res:Response) =>{
try{
    const user=await User.findByIdAndUpdate(req.params.id, req.body, {new:true});
    res.json(user);
}catch (error){
    console.error (error );
    res.status(500).json({message:"Error actualizando usuario"});
}
};

//  Eliminar 

export const deleteUser =async (req:Request , res:Response) =>{
    try{
        await User.findByIdAndDelete(req.params.id);
        res.json({message:"Usuario eliminado"});
} catch (error) {
    console.error (error);
    res.status(500).json({message:"Error eliminando usuario"})
}
};