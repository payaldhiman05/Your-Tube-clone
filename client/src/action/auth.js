import * as api from "../Api";
import { setcurrentuser } from "./currentuser";
export const login=(authdata)=> async (dispatch)=>{
    try {
        const {data}=await api.login(authdata);
        localStorage.setItem("Profile",JSON.stringify(data))
        dispatch({type:"AUTH",data});
        dispatch(setcurrentuser(data));
        // dispatch(setcurrentuser(JSON.parse(localStorage.getItem('Profile'))))//not used now
    } catch (error) {
        alert(error?.response?.data?.message||"Login failed");
    }
}