import { useEffect, useState } from "react";
import socket from "../socket";
import { peerConnection } from "../webrtc";

function JoinRoom() {
  const [roomId, setRoomId] = useState("");

  const joinRoom = () => {
    socket.emit("join-room", roomId);
  };

  useEffect(() => {
    peerConnection.ondatachannel = (
      event
    ) => {
      const channel = event.channel;

      channel.onmessage = (msg) => {
        console.log(
          "Received:",
          msg.data
        );
      };
    };

    socket.on("offer", async (offer) => {
      await peerConnection.setRemoteDescription(
        offer
      );

      const answer =
        await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(
        answer
      );

      socket.emit("answer", {
        roomId,
        answer,
      });
    });

    return () => {
      socket.off("offer");
    };
  }, [roomId]);

  return (
    <div>
      <h2>Join Room</h2>

      <input
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) =>
          setRoomId(e.target.value)
        }
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}

export default JoinRoom;