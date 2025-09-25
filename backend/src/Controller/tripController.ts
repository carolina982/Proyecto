import { Request, Response } from "express";
import Trip, { ITrip } from "../models/Trip";

export const createTrip =async (req:Request , res:Response)=>{
    const tripData :ITrip = req.body as ITrip;
    try{
        const trip :ITrip=await 
        Trip.create(tripData);
        res.status(201).json(trip);
    }catch (error ){
        res.status(500).json({message:"Error creando viaje"});
    }
};

export const getTrips =async (req:Request , res:Response) =>{
    try{
        const trips:ITrip [] =await Trip.find().populate("chofer");
        res.json(trips);
    }catch (error){
        res.status(500).json({message:"Error obteniendo Viajes"});
    }
};

