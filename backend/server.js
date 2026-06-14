
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    const room =
      io.sockets.adapter.rooms.get(roomId);

    const userCount = room
      ? room.size
      : 0;

    console.log(
      `${socket.id} joined room ${roomId}`
    );

    console.log(
      `Users in room: ${userCount}`
    );

    io.to(roomId).emit(
      "room-user-count",
      userCount
    );

    socket
      .to(roomId)
      .emit("user-joined");
  });

  socket.on(
    "offer",
    ({ roomId, offer }) => {
      socket
        .to(roomId)
        .emit("offer", offer);
    }
  );

  socket.on(
    "answer",
    ({ roomId, answer }) => {
      socket
        .to(roomId)
        .emit("answer", answer);
    }
  );

  socket.on(
    "ice-candidate",
    ({ roomId, candidate }) => {
      socket
        .to(roomId)
        .emit(
          "ice-candidate",
          candidate
        );
    }
  );

  socket.on("disconnect", () => {
    console.log(
      `Disconnected: ${socket.id}`
    );

    socket.broadcast.emit(
      "peer-disconnected"
    );
  });
});

app.get("/", (req, res) => {
  res.send(
    "PeerBridge Backend Running 🚀"
  );
});

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});