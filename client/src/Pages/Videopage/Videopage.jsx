import React, { useEffect, useRef, useState } from 'react';
import './Videopage.css';
import { login } from '../../action/auth';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import Likewatchlatersavebtns from './Likewatchlatersavebtns';
import Comment from '../../Component/Comment/Comment';
import { viewvideo } from '../../action/video';
import { addtohistory } from '../../action/history';
import { useSelector, useDispatch } from 'react-redux';
import { getallvideo as fetchVideos } from '../../action/video';

const Videopage = () => {
  const [pointsEarned, setPointsEarned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const hasAddedPoints = useRef(false);
  const { vid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const vids = useSelector((state) => state.videoreducer);
  const currentuser = useSelector((state) => state.currentuserreducer);
  const vv = vids?.data?.find((q) => q._id === vid);

  useEffect(() => {
    if (!vids?.data || vids?.data.length === 0) {
      dispatch(fetchVideos());
    }
  }, [dispatch, vids?.data?.length]);

  useEffect(() => {
    if (vids?.data && vids?.data.length > 0) {
      setIsLoading(false);
    }
  }, [vids]);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("Profile"));
    if (
      localUser?.result &&
      localUser.result.ispremium !== currentuser?.result?.ispremium
    ) {
      dispatch(login(localUser));
    }
  }, []);
  useEffect(() => {
  if (pointsEarned) {
    const timer = setTimeout(() => setPointsEarned(false), 3000);
    return () => clearTimeout(timer);
  }
}, [pointsEarned]);

  useEffect(() => {
    if(!vv)return;

    if (currentuser?.result?._id && vid && !hasAddedPoints.current ) {
      handlehistory();
      handleviews();
      handleRewardPoints();
      localStorage.setItem("lastWatchedVideoId", vid);
      hasAddedPoints.current=true;
    }
  }, [currentuser?.result?._id, vid, vv]);

const handleRewardPoints = async () => {
  if (pointsEarned) return;

  const token = JSON.parse(localStorage.getItem("Profile"))?.token;
  if (!token || !vid || !currentuser?.result._id) return;

  try {
    const res = await axios.patch(
      `http://localhost:5000/user/addpoints/${currentuser?.result._id}`,
      { videoId: vid },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.status === 200) {
      setPointsEarned(true);

      const updatedUser = {
        result: res.data.updatedUser,
        token,
      };

      localStorage.setItem("Profile", JSON.stringify(updatedUser));
      dispatch({ type: "SET_CURRENT_USER", payload: updatedUser });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};


  const handleDownload = async (e) => {
    e?.preventDefault();
    console.log("download initiated")
    try {
      if (!currentuser?.result?.ispremium) {
        const limitCheck = await axios.get(`http://localhost:5000/api/download/check-limit/${currentuser.result._id}`);
        if (limitCheck.data?.limitReached) {
          setShowUpgradeBanner(true);
          return;
        }
      }

      const videoUrl = `http://localhost:5000/${vv?.filepath}`;
      await axios.post("http://localhost:5000/api/download/video", {
        videoUrl,
        userId: currentuser.result._id,
        videoId: vv._id,
        title: vv?.title,
      });

      alert("Video saved to your Downloads section!");
      navigate("/");

    } catch (error) {
      console.error("Download failed:", error.response?.data || error.message);
      if (!currentuser?.result?.ispremium) {
        setShowUpgradeBanner(true);
      }
    }
  };


  const handleviews = () => {
    dispatch(viewvideo({ id: vid }));
  };

  const handlehistory = () => {
    dispatch(addtohistory({
      videoid: vid,
      viewer: currentuser?.result._id,
    }));
  };

  if (isLoading) return <div className="loading">Loading video...</div>;

  if (!vv) {
    return (
      <div className="loading-message">
        <h3>Oops! Video not found.</h3>
        <p>
          Try refreshing the page or <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => navigate('/')}>go back home</span>.
        </p>
      </div>
    );
  }

  return (
    <>
     {pointsEarned && (
      <div className="points-alert">
       You've earned 5 points for watching this video!
      </div>
    )}
      <div className="container_videoPage">
        <div className="container2_videoPage">
          <div className="video_display_screen_videoPage">
            <video src={`http://localhost:5000/${vv?.filepath}`} className="video_ShowVideo_videoPage" controls />
            <div className="video_details_videoPage">
              <div className="video_btns_title_VideoPage_cont">
                <p className="video_title_VideoPage">{vv?.title}</p>
                <div className="views_date_btns_VideoPage">
                  <div className="views_videoPage">
                    {vv?.views} views <div className="dot"></div> {moment(vv?.createdat).fromNow()}
                  </div>
                  <p className="chanel_name_videoPage">
                    {vv.uploader}
                    {currentuser?.result?.ispremium && (
                      <span className="premium-badge">Premium</span>
                    )}
                  </p>
                  <button type='button' className="youtube-style-download"
                    onClick={handleDownload}>
                    <FontAwesomeIcon icon={faDownload} /> Download
                  </button>
                  <Likewatchlatersavebtns vv={vv} vid={vid} />
                </div>
              </div>
              <Link to={'/'} className="chanel_details_videoPage">
                <b className="chanel_logo_videoPage">
                  <p>{vv?.uploader.charAt(0).toUpperCase()}</p>
                </b>
                <p className="chanel_name_videoPage">{vv.uploader}</p>
              </Link>
              <div className="comments_VideoPage">
                <h2><u>Comments</u></h2>
                <Comment videoid={vv._id} />
              </div>
            </div>
          </div>
          <div className="moreVideoBar">More videos</div>
        </div>

        {!currentuser?.result?.ispremium && showUpgradeBanner && (
          <div className="upgrade-banner">
            <p>You've reached your daily download limit. <span>Upgrade to Premium</span> for unlimited downloads!</p>
            <button onClick={() => navigate('/premium')}>Upgrade Now</button>
            <button onClick={() => setShowUpgradeBanner(false)}>Close</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Videopage;
