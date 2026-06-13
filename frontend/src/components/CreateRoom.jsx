import { useEffect, useState } from "react";
import socket from "../socket";
import {
  peerConnection,
  dataChannel,
} from "../webrtc";

function CreateRoom() {
  const [roomId, setRoomId] = useState("");
  const [peerConnected, setPeerConnected] =
    useState(false);

  const createRoom = () => {
    const id = Math.random()
      .toString(36)
      .substring(2, 8);

    setRoomId(id);

    socket.emit("join-room", id);
  };

  const sendMessage = () => {
    dataChannel.send("Hello Peer 🚀");
  };

  useEffect(() => {
    socket.on("user-joined", async () => {
      setPeerConnected(true);

      const offer =
        await peerConnection.createOffer();

      await peerConnection.setLocalDescription(
        offer
      );

      socket.emit("offer", {
        roomId,
        offer,
      });
    });

    socket.on("answer", async (answer) => {
      await peerConnection.setRemoteDescription(
        answer
      );

      console.log("WebRTC Connected");
    });

    return () => {
      socket.off("user-joined");
      socket.off("answer");
    };
  }, [roomId]);

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

              <button
                onClick={sendMessage}
              >
                Send Hello
              </button>
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