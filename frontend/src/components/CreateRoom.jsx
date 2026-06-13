import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import {
  peerConnection,
  createDataChannel,
  dataChannel,
} from "../webrtc";

function CreateRoom() {
  const [roomId, setRoomId] = useState("");
  const [peerStatus, setPeerStatus] =
    useState("Waiting...");
  const [userCount, setUserCount] =
    useState(1);
const [selectedFile, setSelectedFile] =
  useState(null);
  const roomRef = useRef("");
const [sendProgress, setSendProgress] =
  useState(0);
  const createRoom = () => {
    const id = Math.random()
      .toString(36)
      .substring(2, 8);

    roomRef.current = id;
    setRoomId(id);

    socket.emit("join-room", id);

    console.log("Created Room:", id);
  };

  useEffect(() => {
    const handleUserJoined = async () => {
      setPeerStatus("Connected ✅");

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

    const handleAnswer = async (
      answer
    ) => {
      await peerConnection.setRemoteDescription(
        answer
      );

      console.log(
        "WebRTC Connected"
      );
    };

    const handleIceCandidate =
      async (candidate) => {
        try {
          await peerConnection.addIceCandidate(
            candidate
          );
        } catch (err) {
          console.error(err);
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

    socket.on(
      "room-user-count",
      (count) => {
        setUserCount(count);
      }
    );

    socket.on(
      "peer-disconnected",
      () => {
        setPeerStatus(
          "Disconnected ❌"
        );
      }
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
      socket.off("user-joined");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("room-user-count");
      socket.off(
        "peer-disconnected"
      );
    };
  }, []);

  const sendFile = () => {
    setSendProgress(0);
  if (!selectedFile) {
    alert("Please select a file");
    return;
  }

  if (
    selectedFile.size >
    100 * 1024 * 1024
  ) {
    alert(
      "Maximum file size is 100 MB"
    );
    return;
  }

  if (
    !dataChannel ||
    dataChannel.readyState !== "open"
  ) {
    alert(
      "Data Channel not ready"
    );
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
   let progress = 0;

const interval = setInterval(() => {
  progress += 10;

  setSendProgress(progress);

  if (progress >= 100) {
    clearInterval(interval);

    dataChannel.send(
      JSON.stringify({
        type: "file",
        name: selectedFile.name,
        content: reader.result,
      })
    );

    console.log(
      "File Sent:",
      selectedFile.name
    );
  }
}, 100);

    console.log(
      "File Sent:",
      selectedFile.name
    );
  };

  reader.readAsDataURL(selectedFile);
};
  
  return (
    <div>
      <button onClick={createRoom}>
        Create Room
      </button>

      {roomId && (
        <>
          <h2>Room ID: {roomId}</h2>

          <p>
            👥 Users in Room:{" "}
            {userCount}
          </p>

          <p>
            Peer Status:{" "}
            {peerStatus}
          </p>

          {peerStatus ===
            "Connected ✅" && (
            <>
  <input
    type="file"
    onChange={(e) =>
      setSelectedFile(
        e.target.files[0]
      )
    }
  />

  {selectedFile && (
    <>
      <p>
        Selected File:
        {" "}
        {selectedFile.name}
      </p>

      <button
        onClick={sendFile}
      >
        Send File
      </button>
    </>
  )}

  {sendProgress > 0 && (
  <>
    <p>
      Sending: {sendProgress}%
    </p>

    <progress
      value={sendProgress}
      max="100"
    />
  </>
)}
</>


          )}
        </>
      )}
    </div>
  );
}

export default CreateRoom;