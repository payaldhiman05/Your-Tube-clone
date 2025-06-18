import React from "react";
import { useNavigate } from "react-router-dom";
import "./FrontPage.css";
import {v4 as uuidv} from "uuid";

const FrontPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    const roomId = uuidv();
        navigate(`/call/`);
  };

  return (
    <div className="frontpage-container">
      <h1 className="frontpage-title">Welcome to Video Call</h1>
      <button className="frontpage-button" onClick={handleStart}>
        Start Call
      </button>
    </div>
  );
};

export default FrontPage;
