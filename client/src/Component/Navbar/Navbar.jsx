import React, { useState, useEffect } from 'react'
import logo from "./logo.ico"
import "./Navbar.css"
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from "react-router-dom"
import { RiVideoAddLine } from "react-icons/ri"
import { IoMdNotificationsOutline } from "react-icons/io"
import { BiUserCircle } from "react-icons/bi"
import Searchbar from './Searchbar/Searchbar'
import Auth from '../../Pages/Auth/Auth'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { login } from "../../action/auth"
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { setcurrentuser } from '../../action/currentuser';
import { jwtDecode } from "jwt-decode"

const Navbar = ({ toggledrawer, seteditcreatechanelbtn }) => {
    const [authbtn, setauthbtn] = useState(false)
    const [user, setuser] = useState(null)
    const [profile, setprofile] = useState([])
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const currentuser = useSelector(state => state.currentuserreducer)

    const google_login = useGoogleLogin({
        onSuccess: tokenResponse => setuser(tokenResponse),
        onError: (error) => console.log("Login Failed", error)
    })

    useEffect(() => {
        if (profile?.email) {
            dispatch(login({ email: profile.email }))
        }
    }, [profile])

    useEffect(() => {
        if (user) {
            axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    Accept: 'application/json'
                }
            })
                .then((res) => setprofile(res.data))
                .catch((err) => console.error("Error fetching Google user info", err))
        }
    }, [user])

    const logout = () => {
        dispatch(setcurrentuser(null))
        googleLogout()
        localStorage.clear()
    }

    useEffect(() => {
        const storedProfile = JSON.parse(localStorage.getItem("Profile"))
        if (storedProfile?.token) {
            const decodedToken = jwtDecode(storedProfile.token)
            if (decodedToken.exp * 1000 < new Date().getTime()) {
                logout()
            } else {
                dispatch(setcurrentuser(storedProfile))
            }
        }
    }, [])

    const handleStartCall = (e) => {
        e.preventDefault()
        if (currentuser?.result?._id) {
            navigate(`/call-home`)
        } else {
            alert("Please login first.")
        }
    }

    return (
        <>
            <div className="Container_Navbar">
                <div className="Burger_Logo_Navbar">
                    <div className="burger" onClick={() => toggledrawer()}>
                        <p></p>
                        <p></p>
                        <p></p>
                    </div>
                    <Link to={"/"} className='logo_div_Navbar'>
                        <img src={logo} alt="" />
                        <p className="logo_title_navbar">Your-Tube</p>
                    </Link>
                </div>

                <div className="Searchbar_wrapper">
                    <Searchbar />
                </div>

                <div className="search-icon-mobile" onClick={() => alert("Open search here")}>
                    <FaSearch size={20} />
                </div>

                <div className="NavbarRightItems">
                    <button type="button" className="video-call-button" onClick={handleStartCall} title="Start Video Call">
                        <FontAwesomeIcon icon={faVideo} size="lg" />
                    </button>

                    <RiVideoAddLine size={22} className="vid_bell_Navbar" />

                    <div className="apps_Box">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div className="appBox" key={i}></div>
                        ))}
                    </div>

                    <IoMdNotificationsOutline size={22} className="vid_bell_Navbar" />

                    <div className="Auth_cont_Navbar">
                        {currentuser ? (
                            <Link to="/profile" className="Chanel_logo_App">
                                <p className="fstChar_logo_App">
                                    {currentuser?.result.name
                                        ? currentuser.result.name.charAt(0).toUpperCase()
                                        : currentuser?.result.email?.charAt(0).toUpperCase()}
                                </p>
                            </Link>
                        ) : (
                            <p className='Auth_Btn' onClick={() => google_login()}>
                                <BiUserCircle size={22} />
                                <b>Sign in</b>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {authbtn && (
                <Auth
                    seteditcreatechanelbtn={seteditcreatechanelbtn}
                    setauthbtn={setauthbtn}
                    user={currentuser}
                />
            )}
        </>
    )
}

export default Navbar
