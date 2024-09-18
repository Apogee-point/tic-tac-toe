/* eslint-disable no-unused-vars */
import { useState, useRef,useEffect } from 'react'
import io from 'socket.io-client'
import Peer from 'simple-peer'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { TextField, Button, IconButton } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PhoneIcon from '@mui/icons-material/Phone'
import LoginPage from './components/LoginPage'
import Board from './components/Board'



import './App.css'
import Chat from './components/Chat'
import ChatInput from './components/ChatInput'


window.global = window;

const socket = io('http://localhost:5050') // connect to the socket server using the socket.io client

function App() {
  const [result, setResult] = useState({
    winner : "none",
    state : "none"
  })
  const [me, setMe] = useState('')
  const [stream, setStream] = useState()
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState('')
  const [callerName, setCallerName] = useState('')
  const [callerSignal, setCallerSignal] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  const [idToCall, setIdToCall] = useState('')
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState(localStorage.getItem('name'))
  const [messages, setMessages] = useState([]);
  const [documentId, setDocumentId] = useState('')
  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (myVideo.current) myVideo.current.srcObject = stream
        setStream(stream)
      })

    //Get ur id from backend... -> socket id.
    socket.on('me', (id) => setMe(id))

    // This is the event that is emitted when the call is accepted by the other person. The signal data is sent to the other person to establish the connection.
    socket.on('callUser', (data) => {
      setReceivingCall(true)
      setCaller(data.from)
      setCallerName(data.name)
      setCallerSignal(data.signal) // set the caller signal here..
      setDocumentId(me)
    })

    socket.on('chat', (message) => {
      setMessages([...messages, message]);
    });

  }, [me, messages]);
  // This is the function that is called when the call button is clicked. It is used to establish the connection between the two clients.
  const callUser = (id) => {
    setDocumentId(id)
    // create a new peer.
		const peer = new Peer({ //Peer is a class from simple-peer which is used to create a new peer connection which is used to send and receive data
			initiator: true,
			trickle: false,
			stream: stream
		}) // initiator is the person who calls the other person, trickle is used to send the signal data to the other person, stream is the stream of the video

    // On signal is emitted when 
		peer.on("signal", (data) => { //when the peer connection is established, the signal event is emitted which is used to send the signal data to the other person
			socket.emit("callUser", {
				userToCall: id,
				signalData: data, // signal data is the metadata used to establish the connection eg:
				from: me,
				name: name
			})
		})
    // On stream waits for the stream from the other user..
		peer.on("stream", (stream) => {
				userVideo.current.srcObject = stream
        console.log(stream.id)
			
		})
    // Call Accepted 
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal) // Calls the user using the signal data sent by the other person
		})

		connectionRef.current = peer
	}

  const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		}) //sending the signal data to the caller to establish the connection
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal) //signal data is sent to the caller to establish the connection
		connectionRef.current = peer //setting the connectionRef to the peer object
	}
  
  const sendMessage = (message) => {
    socket.emit('chat', message);
  }
  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const pc = connectionRef.current.pc;

      // Check if the peer connection is properly initialized
      if (pc && pc.getSenders) {
        // Get the existing video track sender
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track.kind === 'video');

        // Remove existing video track if found
        if (sender) {
          pc.removeTrack(sender);
        }

        // Add the new screen track
        pc.addTrack(videoTrack, screenStream);

        // Update local video element
        if (myVideo.current) {
          myVideo.current.srcObject = screenStream;
        }

        // Handle screen sharing ending
        screenStream.getTracks().forEach(track => {
          track.onended = () => {
            // Resume the webcam stream
            if (myVideo.current) {
              myVideo.current.srcObject = stream; // Resume the original webcam stream
            }

            // Replace the track back with the original webcam track
            const originalVideoTrack = stream.getVideoTracks()[0];
            if (pc) {
              const sender = pc.getSenders().find(s => s.track.kind === 'video');
              if (sender) {
                pc.removeTrack(sender);
                pc.addTrack(originalVideoTrack, stream);
              }
            }
          };
        });
      } else {
        console.error('Peer connection is not properly initialized or does not support getSenders');
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const leaveCall = () => {
    setCallEnded(true)
    connectionRef.current.destroy()
  }

  return (
    <div style={{display:'flex', flexDirection:'row'}}>
        <div className='container'>
            <div className='header' style={{display: 'flex',flexDirection:'row',alignItems:'center'}}>
              <LoginPage/>
              <div style={{display: 'flex', justifyContent: 'center',alignItems:'center',marginLeft:'500px' }}>
                <h1 style={{color: 'white' }}>GDocs</h1>
              </div>
            </div>
          <div className="container">
            <div className="video-container">
              <div className="video">
                {stream &&  <video playsInline muted ref={myVideo} autoPlay />}
              </div>
              <div className="video">
                {(callAccepted && !callEnded) ?
                <video playsInline ref={userVideo} autoPlay  />:
                null}
              </div>
            </div>
          <div className="myId">
            <div className="user">
              <TextField
                id="filled-basic"
                label="Name"
                variant="filled"
                color='primary'
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: "20px" }}
                inputProps={{ style: { color: 'black' } }} 
                InputLabelProps={{ style: { color: 'black' } }}
              />
              <CopyToClipboard text={me} style={{ marginBottom: "2rem",marginLeft:"1rem" }}>
                <Button variant="outlined" color="primary"
                startIcon={<AssignmentIcon fontSize="large" />}
                >
                  Copy ID
                </Button>
              </CopyToClipboard>
            </div>

            <div className="user">
              <TextField
                id="filled-basic"
                label="ID to call"
                variant="filled"
                color='primary'
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
                inputProps={{ style: { color: 'black' } }} 
                InputLabelProps={{ style: { color: 'grey' } }}
              />
              <div className="call-button">
                {callAccepted && !callEnded ? (
                  <Button variant="contained" color="secondary" onClick={leaveCall} style={{ margin: '10px' }}>
                    End Call
                  </Button>
                ) : (
                  <IconButton color="secondary" aria-label="call" onClick={() => callUser(idToCall)} style={{ margin: '10px' }}>
                    <PhoneIcon fontSize="large" />
                  </IconButton>
                )}
              </div>
            </div>
          </div>
          <div>
            {receivingCall && !callAccepted ? (
                <div className="caller">
                  <h1 >{callerName} is calling...</h1>
                  <Button variant="contained" color="primary" onClick={answerCall}>
                    Answer
                  </Button>
                </div>
            ) : null}
          </div>
        </div>
    <div id="chatBox" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
      <h1>Chat</h1>
      <div id="messages" style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
        {messages.map((message, index) => (
          <Chat key={index} text={message} />
        ))}
        <ChatInput sendChat={sendMessage} />
      </div>
      
    </div>
		</div>
        {callAccepted && !callEnded ? (<Board socket={socket} result={result} setResult={setResult}/>) : null}
    </div>
		
	)
}

export default App
//Peer connection under the hood uses WebRTC to establish a peer to peer connection between two clients. It is used to send and receive data between the clients.
//WebRTC works under the hood by using a signaling server to exchange the metadata between the clients. The metadata is used to establish the connection between the clients.