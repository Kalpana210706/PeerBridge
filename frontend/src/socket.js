import { io } from "socket.io-client";

const socket = io("https://peerbridge-9szr.onrender.com");

export default socket;