# PeerBridge

PeerBridge is a decentralized peer-to-peer file sharing application built using React, WebRTC, Socket.io, and Node.js.

Files are transferred directly between browsers using WebRTC Data Channels without being stored on any central server, ensuring privacy, security, and low-latency transfers.

## Features

* Direct browser-to-browser file transfer using WebRTC
* Room creation with unique room IDs
* Shareable room invite links
* Real-time signaling using Socket.io
* SHA-256 file integrity verification
* Transfer progress tracking
* Transfer speed monitoring
* Drag-and-drop file upload
* Automatic file download on receiver side
* Connection status monitoring
* User count monitoring
* File size validation (up to 100 MB)
* Graceful peer disconnect handling

## Tech Stack

### Frontend

* React
* Vite
* Socket.io Client

### Backend

* Node.js
* Express.js
* Socket.io

### Communication

* WebRTC Data Channels
* STUN Servers

## Project Architecture

Sender Browser
│
▼
Socket.io Signaling Server
│
▼
Receiver Browser

After signaling:

Sender Browser
│
▼
WebRTC Data Channel
│
▼
Receiver Browser

All file transfers occur directly between peers.

## How It Works

1. User creates a room.
2. A unique Room ID and shareable invite link are generated.
3. Another user joins the room.
4. WebRTC establishes a direct peer-to-peer connection.
5. Files are selected using drag-and-drop or file picker.
6. SHA-256 hash is generated before transfer.
7. File transfer progress and speed are displayed in real time.
8. Receiver verifies file integrity and automatically downloads the file.

## Installation

### Clone Repository

```bash
git clone https://github.com/Kalpana210706/PeerBridge.git
cd PeerBridge
```

## Backend Setup

```bash
cd backend
npm install
npm start
```



## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```



## Deployment

### Frontend

Vercel

### Backend

Render

## Live Demo

Frontend:
https://peer-bridge-opal.vercel.app/

Backend:
https://peerbridge-9szr.onrender.com

## Future Improvements

* Multi-peer file sharing
* End-to-end encryption
* Larger file support
* Transfer resume functionality
* TURN server support
* Enhanced UI/UX
* File transfer history

## Author

Kalpana


