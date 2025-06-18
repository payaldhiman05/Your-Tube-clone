import mongoose from "mongoose"
const historyschema=mongoose.Schema({
    videoid:{type:String,require:true},
   viewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likedon:{type:Date,default:Date.now()}
})

export default mongoose.model("History",historyschema)