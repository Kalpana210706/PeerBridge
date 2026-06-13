import { useEffect, useState } from "react";
import socket from "../socket";
import {
  peerConnection,
  createDataChannel,
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

  useEffect(() => {
    socket.on("user-joined", async () => {
      setPeerConnected(true);

      createDataChannel();

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
      socket.off("user-joined");
      socket.off("answer");
      socket.off("ice-candidate");
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
            <p>Peer Connected ✅</p>
          ) : (
            <p>Waiting for Peer...</p>
          )}
        </>
      )}
    </div>
  );
}

export default CreateRoom;