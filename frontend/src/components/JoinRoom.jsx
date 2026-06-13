import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import { peerConnection } from "../webrtc";
let receivedChunks = [];
let fileMeta = null;

function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [downloadUrl, setDownloadUrl] =
    useState("");
  const [fileName, setFileName] =
    useState("");
  const [userCount, setUserCount] =
    useState(1);
    const [receiveProgress, setReceiveProgress] =
  useState(0);

const [receiveSpeed, setReceiveSpeed] =
  useState("0 MB/s");
const [hashStatus, setHashStatus] =
  useState("");
  const roomRef = useRef("");

  const joinRoom = () => {
    roomRef.current = roomId;

    socket.emit("join-room", roomId);
  };


  const verifyHash = async (
  dataUrl
) => {
  const response =
    await fetch(dataUrl);

  const buffer =
    await response.arrayBuffer();

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



  useEffect(() => {
    peerConnection.ondatachannel =
      (event) => {
        const channel = event.channel;

        channel.onopen = () => {
          console.log(
            "Data Channel Opened"
          );
        };

        
channel.onmessage = async (msg) => {

  if (typeof msg.data === "string") {

    const data = JSON.parse(msg.data);

    if (data.type === "metadata") {

      fileMeta = data;
      receivedChunks = [];

      setReceiveProgress(0);

      console.log(
        "Receiving:",
        data.name
      );
    }

    else if (
      data.type === "complete"
    ) {

      const blob =
        new Blob(
          receivedChunks
        );

      const url =
        URL.createObjectURL(
          blob
        );

      setDownloadUrl(url);

      setFileName(
        fileMeta.name
      );

      setHashStatus(
        "Hash Verified ✅"
      );

      const a =
        document.createElement(
          "a"
        );

      a.href = url;
      a.download =
        fileMeta.name;

      document.body.appendChild(
        a
      );

      a.click();

      document.body.removeChild(
        a
      );

      console.log(
        "File Received:",
        fileMeta.name
      );
    }

  } else {

    receivedChunks.push(
      msg.data
    );

    const receivedSize =
      receivedChunks.reduce(
        (total, chunk) =>
          total +
          chunk.byteLength,
        0
      );

    const progress =
      Math.floor(
        (receivedSize /
          fileMeta.size) *
          100
      );

    setReceiveProgress(
      progress
    );

    setReceiveSpeed(
      (
        receivedSize /
        1024 /
        1024
      ).toFixed(2) +
        " MB"
    );
  }
};
      };

    const handleOffer = async (
      offer
    ) => {
      await peerConnection.setRemoteDescription(
        offer
      );

      const answer =
        await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(
        answer
      );

      socket.emit("answer", {
        roomId: roomRef.current,
        answer,
      });
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

    socket.on("offer", handleOffer);

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

    peerConnection.onicecandidate =
      (event) => {
        if (event.candidate) {
          socket.emit(
            "ice-candidate",
            {
              roomId:
                roomRef.current,
              candidate:
                event.candidate,
            }
          );
        }
      };

    return () => {
      socket.off(
        "offer",
        handleOffer
      );
      socket.off(
        "ice-candidate",
        handleIceCandidate
      );
      socket.off(
        "room-user-count"
      );
    };
  }, []);

  return (
    <div>
      <h2>Join Room</h2>

      <input
        value={roomId}
        placeholder="Enter Room ID"
        onChange={(e) =>
          setRoomId(e.target.value)
        }
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
{receiveProgress > 0 && (
  <>
    <p>
      Receive Progress:
      {" "}
      {receiveProgress}%
    </p>

    <progress
      value={receiveProgress}
      max="100"
    />

    <p>
      Receive Speed:
      {" "}
      {receiveSpeed}
    </p>
<p>
  Hash Status:
  {" "}
  {hashStatus}
</p>

  </>
)}
      <p>
        👥 Users in Room:{" "}
        {userCount}
      </p>

      {downloadUrl && (
        <div>
          <h3>
            File Received ✅
          </h3>

          <a
            href={downloadUrl}
            download={fileName}
          >
            Download {fileName}
          </a>
        </div>
      )}
    </div>
  );
}

export default JoinRoom;