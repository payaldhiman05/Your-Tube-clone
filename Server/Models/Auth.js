import mongoose from "mongoose";

const userschema = mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String },
    password: { type: String, required: true },
    desc: { type: String },
    joinedon: { type: Date, default: Date.now },
    points: { type: Number, default: 0 },//task1
    watchedVideos: {
        type:[String],
        default:[]
    },
    downloads: {
        date: { type: Date },
        count: { type: Number, default: 1 }
    },
    lastDownloadDate:{
        type:Date,
    },
    ispremium: { 
        type: Boolean, 
        default: false },
    downloadHistory:{
        type:[String],
        default:[],
    }

});

export default mongoose.model("User", userschema)