import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import {
  peerConnection,
  createDataChannel,
  dataChannel,
} from "../webrtc";

function CreateRoom() {
  const [roomId, setRoomId] = useState("");
  const [peerConnected, setPeerConnected] =
    useState(false);

  const roomRef = useRef("");

  const createRoom = () => {
    const id = Math.random()
      .toString(36)
      .substring(2, 8);

    roomRef.current = id;
    setRoomId(id);

    socket.emit("join-room", id);
  };

  useEffect(() => {
    const handleUserJoined = async () => {
      setPeerConnected(true);

      createDataChannel();

      const offer =
        await peerConnection.createOffer();

      await peerConnection.setLocalDescription(
        offer
      );

      socket.emit("offer", {
        roomId: roomRef.current,
        offer,
      });
    };

    const handleAnswer = async (answer) => {
      await peerConnection.setRemoteDescription(
        answer
      );

      console.log("WebRTC Connected");
    };

    const handleIceCandidate =
      async (candidate) => {
        try {
          await peerConnection.addIceCandidate(
            candidate
          );
        } catch (err) {
          console.log(err);
        }
      };

    socket.on(
      "user-joined",
      handleUserJoined
    );

    socket.on("answer", handleAnswer);

    socket.on(
      "ice-candidate",
      handleIceCandidate
    );

    peerConnection.onicecandidate = (
      event
    ) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId: roomRef.current,
          candidate: event.candidate,
        });
      }
    };

    return () => {
      socket.off(
        "user-joined",
        handleUserJoined
      );

      socket.off(
        "answer",
        handleAnswer
      );

      socket.off(
        "ice-candidate",
        handleIceCandidate
      );
    };
  }, []);

  const sendFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!dataChannel) {
      alert("Data Channel not created");
      return;
    }

    if (dataChannel.readyState !== "open") {
      alert("Data Channel not open");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      dataChannel.send(
        JSON.stringify({
          type: "file",
          name: file.name,
          content: reader.result,
        })
      );

      console.log(
        "File Sent:",
        file.name
      );
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <button onClick={createRoom}>
        Create Room
      </button>

      {roomId && (
        <>
          <h2>Room ID: {roomId}</h2>

          {peerConnected ? (
            <>
              <p>Peer Connected ✅</p>

              <input
                type="file"
                onChange={sendFile}
              />
            </>
          ) : (
            <p>Waiting for Peer...</p>
          )}
        </>
      )}
    </div>
  );
}

export default CreateRoom;