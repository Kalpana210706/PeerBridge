export const peerConnection = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
});

export let dataChannel = null;

export const createDataChannel = () => {
  dataChannel =
    peerConnection.createDataChannel(
      "fileTransfer"
    );

  dataChannel.onopen = () => {
    console.log("Data Channel Opened");
  };

  dataChannel.onclose = () => {
    console.log("Data Channel Closed");
  };

  return dataChannel;
};