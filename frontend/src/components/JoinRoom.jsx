import { useState } from "react";
import socket from "../socket";

function JoinRoom() {
  const [roomId, setRoomId] = useState("");

  const joinRoom = () => {
    socket.emit("join-room", roomId);
    alert(`Joined Room ${roomId}`);
  };

  return (
    <div>
      <h2>Join Room</h2>

      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
    </div>
  );
}

export default JoinRoom;