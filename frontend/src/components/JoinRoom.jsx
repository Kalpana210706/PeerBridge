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

      channel.onopen = () => {
        console.log(
          "Data Channel Opened"
        );
      };

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

    socket.on(
      "ice-candidate",
      async (candidate) => {
        try {
          await peerConnection.addIceCandidate(
            candidate
          );
        } catch (err) {
          console.log(err);
        }
      }
    );

    peerConnection.onicecandidate = (
      event
    ) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    return () => {
      socket.off("offer");
      socket.off("ice-candidate");
    };
  }, [roomId]);

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
    </div>
  );
}

export default JoinRoom;