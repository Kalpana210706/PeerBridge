export const peerConnection = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
});


export const dataChannel =
  peerConnection.createDataChannel("chat");

dataChannel.onopen = () => {
  console.log("Data Channel Opened");
};

dataChannel.onmessage = (event) => {
  console.log("Received:", event.data);
};