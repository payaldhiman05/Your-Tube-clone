import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JoinRoom.css";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId.trim()) {
      navigate(`/call/${roomId.trim()}`); 
     } else {
      alert("Please enter a room code");
    }
  };

  return (
    <div className="join-room-container">
      <h2 className="join-title">Join a Video Call</h2>
      <input
        type="text"
        placeholder="Enter Room Id"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="join-input"
      />
      <button onClick={handleJoin} className="join-button">
        Join Call
      </button>
    </div>
  );
};

export default JoinRoom;
