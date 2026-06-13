import { useEffect, useState } from "react";
import socket from "../socket";

function CreateRoom() {
  const [roomId, setRoomId] = useState("");
  const [peerConnected, setPeerConnected] = useState(false);

  useEffect(() => {
    socket.on("user-joined", () => {
      setPeerConnected(true);
    });

    return () => {
      socket.off("user-joined");
    };
  }, []);

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8);

    setRoomId(id);

    socket.emit("join-room", id);
  };

  return (
    <div>
      <button onClick={createRoom}>
        Create Room
      </button>

      {roomId && (
        <>
          <h3>Room ID: {roomId}</h3>

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