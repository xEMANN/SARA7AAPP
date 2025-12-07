import mongoose, {Schema} from "mongoose";

const messageSchema = new Schema(
    {
        content :{
          type: String,  
          required: true,
          minLength: [2, "message must be a least 2 characters long"],
          maxLength:[500, "message must be a most 500 characters long"],
        },
        receiverId:{
          type: mongoose.Schema.Types.ObjectId,  
          required: true,
          ref:"user",
        },
            
    },

    {
        timestamps:true,
    }
);

const messagemodel = 
  mongoose.models.message || mongoose.model("message", messageSchema);

export default messagemodel;