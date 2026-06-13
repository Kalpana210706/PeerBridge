import { useState } from "react";

function CreateRoom() {
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8);
    setRoomId(id);
  };

  return (
    <div>
      <h2>Create Room</h2>

      <button onClick={createRoom}>
        Create Room
      </button>

      {roomId && (
        <h3>Room ID: {roomId}</h3>
      )}
    </div>
  );
}

export default CreateRoom;