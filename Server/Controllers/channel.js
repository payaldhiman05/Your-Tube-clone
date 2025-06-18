import mongoose from "mongoose";
import users from "../Models/Auth.js"//task1

export const getProfile= async(req,res)=>{
    try{
         console.log("Requesting profile for user ID:", req.userid);
        const user=await users.findById(req.userid).select("-password");
        if(!user){
            return res.status(404).json({message:"user not found"});
        }
        res.status(200).json(user);
        }catch(error){
            res.status(500).json({message:"Server Error",error:error.message});
        }
    }//task1
export const addPointstoUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.points += 5;
     await user.save({ validateBeforeSave: false });
    res.status(200).json({ message: "Points added successfully", updatedUser: user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const makeUserPremium = async (req, res) => {
    const userId = req.params.id;

    try {
        const updatedUser = await users.findByIdAndUpdate(
            userId,
            { isPremium: true },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User upgraded to premium", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};//task2
export const handleVideoDownload = async (req, res) => {
    const userId = req.userid;

    try {
        const user = await users.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const today = new Date().toISOString().split("T")[0];
        const lastDownloadDate = user.lastDownloadDate?.toISOString().split("T")[0];

        if (user.isPremium || lastDownloadDate !== today) {
            
            user.lastDownloadDate = new Date(); // update the date
            await user.save();
            return res.status(200).json({ message: "Download allowed" });
        } else {
            return res.status(403).json({ message: "Daily download limit reached. Upgrade to premium." });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};//task2


export const updatechaneldata=async(req,res)=>{
    const {id:_id}=req.params;
    const {name,desc}=req.body;
    if(!mongoose.Types.ObjectId.isValid(_id)){
        return res.status(400).send("Channel unavailable..")
    }
    try {
        const updatedata=await users.findByIdAndUpdate(
            _id,{
                $set:{
                    name:name,
                    desc:desc,
                },
            },
            {new:true}
        );
        res.status(200).json(updatedata)
    } catch (error) {
        res.status(405).json({message:error.message})
        return
    }
}

export const getallchanels=async(req,res)=>{
    try {
        const allchanels=await users.find();
        const allchaneldata=[]
        allchanels.forEach((channel)=>{
            allchaneldata.push({
                _id:channel._id,
                name:channel.name,
                email:channel.email,
                desc:channel.desc
            });
        });
        res.status(200).json(allchaneldata)
    } catch (error) {
        res.status(405).json({message:error.message})
        return
    }
}