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
  const [hashStatus, setHashStatus] =
  useState("");
  const [dragActive, setDragActive] =
  useState(false);

 
const [sendSpeed, setSendSpeed] =
  useState("0 MB/s");
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
const generateHash = async (
  file
) => {
  const buffer =
    await file.arrayBuffer();

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      buffer
    );

  const hashArray =
    Array.from(
      new Uint8Array(hashBuffer)
    );

  return hashArray
    .map((b) =>
      b.toString(16)
        .padStart(2, "0")
    )
    .join("");
};

const handleDrop = (e) => {
  e.preventDefault();

  setDragActive(false);

  const file = e.dataTransfer.files[0];

  if (file) {
    setSelectedFile(file);
  }
};

const handleDragOver = (e) => {
  e.preventDefault();
};

const handleDragEnter = () => {
  setDragActive(true);
};

const handleDragLeave = () => {
  setDragActive(false);
};


  const sendFile = async () => {
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
setHashStatus(
  "Calculating..."
);

const fileHash =
  await generateHash(
    selectedFile
  );

setHashStatus(
  "Hash Generated ✅"
);
  const reader = new FileReader();

  reader.onload = () => {
  const startTime = Date.now();

  let progress = 0;

  const interval = setInterval(() => {
    progress += 5;

    setSendProgress(progress);

    const elapsed =
      (Date.now() - startTime) / 1000;

    const speed =
      (
        selectedFile.size /
        1024 /
        1024 /
        Math.max(elapsed, 0.1)
      ).toFixed(2);

    setSendSpeed(
      `${speed} MB/s`
    );

    if (progress >= 100) {
      clearInterval(interval);

      dataChannel.send(
        JSON.stringify({
         type: "file",
name: selectedFile.name,
content: reader.result,
hash: fileHash,
        })
      );

      console.log(
        "File Sent:",
        selectedFile.name
      );
    }
  }, 100);
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
  <div
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragEnter={handleDragEnter}
  onDragLeave={handleDragLeave}
  style={{
    border: dragActive
      ? "3px solid #4caf50"
      : "2px dashed gray",
    padding: "30px",
    margin: "20px 0",
    borderRadius: "10px",
    textAlign: "center",
  }}
>
  <p>
    Drag & Drop File Here
  </p>

  <input
    type="file"
    onChange={(e) =>
      setSelectedFile(
        e.target.files[0]
      )
    }
  />
</div>
  

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
      Send Progress:
      {" "}
      {sendProgress}%
    </p>

    <progress
      value={sendProgress}
      max="100"
    />

    <p>
      Send Speed:
      {" "}
      {sendSpeed}
    </p>

    <p>
  Hash Status:
  {" "}
  {hashStatus}
</p>
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