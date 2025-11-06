import mongoose, { Document, Schema } from "mongoose";

export interface IViatic extends Document {
  tripId:mongoose.Types.ObjectId;      

  factura?:string;

}

const viaticSchema = new Schema<IViatic>({
  tripId: {type:mongoose.Schema.Types.ObjectId, ref:"Trip", required:true},     
 
  factura:{type:String},

});

export default mongoose.model<IViatic>("Viatic",viaticSchema);