import mongoose from "mongoose";


export const genderEnum = {
    MALE: "MALE",
    FEMALE: "FEMALE",
};

export const providerEnum = {
    SYSTEM: "SYSTEM",
    GOOGLE: "GOOGLE",
};

export const roleEnum = {
    USER: "USER",
    ADMIN: "ADMIN",
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "First Name must be at least 2 characters long"],
      maxLength: [20, "First Name must be at most 20 characters long"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "Last Name must be at least 2 characters long"],
      maxLength: [20, "Last Name must be at most 20 characters long"],
    },
    email: {
      type:String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
        type:String,
        required: function(){
          return providerEnum.GOOGLE ? false : true;
        },
    },
    gender: {
        type:String,
        enum: {
            values: Object.values(genderEnum),
            message:"{Value} is not a valid gender"
        },
        default: genderEnum.MALE,
    },


     provider: {
        type:String,
        enum: {
            values: Object.values(providerEnum),
            message:"{Value} is not a valid provider"
        },
        default: providerEnum.SYSTEM,
    },

     role : {
        type:String,
        enum: {
          values: Object.values(roleEnum),
          message:"{Value} is not a valid role"
        },
        default: roleEnum.USER,
    },

    phone: String,
    profileImage:String,
    coverImages:[String],
    cloudProfileImage: {public_id:String, secure_url:String },
    cloudCoverImages : [
  {
    public_id: String,
    secure_url: String
  }
],
    freezedAt: Date,
    freezedBy: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    restoredAt: Date,
    restoredBy:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    confirmEmail: Date,
    confirmEmailOTP: String,
    confirmEmailOTPExpires: Date,
    forgetPasswordOTP: String,

  },
  {timestamps:true}

);

const UserModel = mongoose.models.user || mongoose.model("user", userSchema);

export default UserModel;