import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
    name: {
    type: String,
    required: true,
    trim: true,    
    },
email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    },
password: {
    type: String,
    required: true
},
securityQuestion: {
    type: String,
    required: true
},
securityAnswer: {
    type: String,
    required: true
},
tokenVersion: {
    type: Number,
    default: 0
},
avatar: {
    type: String,
    default: ""
}
},{timestamps:true}
);

export default mongoose.model(`user`,userSchema);