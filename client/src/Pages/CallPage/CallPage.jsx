import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./CallPage.css";

const SERVER_URL = "http://localhost:5000";

const CallPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    setPeerConnection(pc);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.onloadedmetadata = () => {
            localVideoRef.current.play();
          };
        }
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      })
      .catch((err) => {
        console.error("Media access error:", err);
        alert("Camera and microphone access is required.");
      });

    s.emit("join-room", roomId, s.id);

    s.on("user-connected", async (userId) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      s.emit("offer", { to: userId, sdp: offer, sender: s.id });
    });

    s.on("offer", async (data) => {
      if (data.sender === s.id) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      s.emit("answer", { to: data.sender, sdp: answer, sender: s.id });
    });

    s.on("answer", async (data) => {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    s.on("ice-candidate", async (data) => {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (e) {
        console.error("ICE candidate error", e);
      }
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        s.emit("ice-candidate", { to: roomId, candidate: event.candidate, sender: s.id });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play();
        };
      }
    };

    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (pc) pc.close();
      if (s) s.disconnect();
    };
  }, [roomId]);

  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
    setMicOn(prev => !prev);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
    setVideoOn(prev => !prev);
  };

  const startScreenShare = async () => {
    if (!peerConnection || !localStream) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

      screenTrack.onended = async () => {
        const cameraTrack = localStream.getVideoTracks()[0];
        if (sender) await sender.replaceTrack(cameraTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      };
    } catch (err) {
      console.error("Screen sharing error:", err);
    }
  };

  const startRecording = () => {
    if (!localStream) return;
    const recorder = new MediaRecorder(localStream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRecordedChunks([]);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecordedChunks(chunks);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

const endCall = () => {
  try {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
    }

    if (localVideoRef.current) {
      localVideoRef.current.pause();
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.pause();
      remoteVideoRef.current.srcObject = null;
    }

    if (peerConnection) {
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.close();
      setPeerConnection(null);
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(tempStream => {
        tempStream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
      
      });

    setTimeout(() => {
    navigate("/");
window.location.reload();

    }, 300);
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
};
  return (
    <div className="call-container">
      <div className="call-videos">
        <div>
          <h3>Your Video</h3>
          <video ref={localVideoRef} autoPlay muted playsInline />
        </div>
        <div>
          <h3>Remote Video</h3>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
      </div>

      <div className="call-controls">
        <button onClick={toggleMic}>{micOn ? "Mute" : "Unmute"}</button>
        <button onClick={toggleVideo}>{videoOn ? "Video Off" : "Video On"}</button>
        <button onClick={startScreenShare}>Share Screen</button>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button onClick={endCall}>Leave</button>
      </div>
    </div>
  );
};

export default CallPage;
