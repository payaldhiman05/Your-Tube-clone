import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDownloadVideos } from "../../action/download"; // ✅ Correct export name
import { Link } from "react-router-dom";
import moment from "moment";
import "./Download.css"; 

const Downloads = () => {
  const dispatch = useDispatch();
  const currentuser = useSelector((state) => state.currentuserreducer);
  const downloadedVideos = useSelector((state) => state.downloadreducer.downloads);

  useEffect(() => {
    if (currentuser?.result?._id) {
      dispatch(getDownloadVideos(currentuser.result._id));
    }
  }, [dispatch, currentuser]);

  return (
    <div className="downloads-container">
      <h2>Your Downloaded Videos</h2>
      {downloadedVideos.length === 0 ? (
        <p>No videos downloaded yet.</p>
      ) : (
        <div className="downloaded-list">
          {downloadedVideos.map((video) => (
            <div key={video._id} className="download-card">
              <video
                src={video.videoUrl}
                controls
                className="downloaded-video"
              ></video>
              <div className="video-meta">
                <h3>{video.videotitle}</h3>
                <p>Downloaded: {moment(video.downloadedAt).fromNow()}</p>
                <Link to={`/video/${video._id}`}>Go to Video</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Downloads;
