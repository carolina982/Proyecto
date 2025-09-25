import mongoose from "mongoose";
const connectDB = async( )=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/volta");
        console.log("MongoDB conectado correctamete ") ;

    }catch (error){
        console.error("error conectado a MongoDB" , error );
        process.exit(1);
    }
    
};
export default connectDB ;