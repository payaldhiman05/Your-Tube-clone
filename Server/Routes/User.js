import express from "express"
import { login } from "../Controllers/Auth.js"
import { updatechaneldata,getallchanels,addPointstoUser,getProfile,makeUserPremium } from "../Controllers/channel.js";
import auth from "../middleware/auth.js"

const routes=express.Router();

routes.post('/login',login)
routes.patch('/makepremium/:id', makeUserPremium);//task2
routes.patch('/update/:id',updatechaneldata)
routes.get('/getallchannel',getallchanels)
routes.patch('/addpoints/:id',auth,addPointstoUser);//task1
routes.get('/profile',auth,getProfile);//task1

routes.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ result: user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default routes;