const express = require('express');
const mongoose=require("mongoose")
const mongodbURI = require("./constants");
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const port = 5050;
const http = require('http'); 
const server = http.createServer(app); //creating a http server using express app
const cors = require('cors');
const Document=require('./models/Document')
const User = require('./models/User');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//load env variables
require('dotenv').config();

const defaultData=''    //default data for the document

const {Server} = require('socket.io'); //importing socket.io 
const io = new Server(server, {
    cors: {
        origin: '*',
    }
}); //creating a new socket.io server


io.on('connection', socket => {
    console.log('connected userId :', socket.id);
    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
        console.log('disconnected userId :', socket.id);
        socket.broadcast.emit('callEnded')
    })

    socket.on('send message', body => {
        io.emit('message', body)
    })

    socket.on('callUser', data => {
        io.to(data.userToCall).emit('callUser', { signal: data.signalData, from: data.from, name: data.name })
    });

    socket.on('answerCall', data => {
        io.to(data.to).emit('callAccepted', data.signal)
    });

    socket.on('get-document',async documentId=>{
        // console.log(documentId)
        const document=await findOrCreateDocument(documentId)
        
        socket.join(documentId) //joining the room with documentId

        socket.emit('load-document',document.data) //sending the document data to the client

        socket.on('send-changes',delta=>{
            socket.broadcast.to(documentId).emit('get-changes',delta)
        }) //broadcasting the changes to all the clients in the room using delta which is the change in the document given by quill

        socket.on('save-document', async data=>{
            await Document.findByIdAndUpdate(documentId, { data })
        })

    })

    socket.on('save-code', async data => {
        //set docId as the codeId
        const docId = data.codeId;
        //find the document with the codeId
        const document = await findOrCreateDocument(docId);
        //update the document with the new code
        await Document.findByIdAndUpdate(docId, { code: data.code }); //only code is updated and not the data

    });

    socket.on("move" , (data) => {
        console.log("move", data);
        socket.broadcast.emit("move", data);
    })

    socket.on("win", (player) => {
        io.emit("win", player);
    });

    socket.on("chat", (data) => {
        io.emit("chat", data);
    });

    socket.on("tie", () => {
        io.emit("tie");
    });

    socket.on("reset", () => {
        io.emit("reset");
    }); 
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to the server"})
});

app.post("/api/register", async (req, res) => {
    const {username, email, password} = req.body;
    try{
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "User already exists"});
        }
        user = new User({username, email, password});
        await user.save();
        return res.status(200).json({message: "User created successfully"});
    } catch(err){
        console.error(err.message);
        res.status(500).json({message: "Server error",err});
    }
});

app.post('/api/login', async (req,res) => {

    const {email, password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"}); //!400 -> bad request 
        }
        const token = jwt.sign(
            {user: {id: user.id, name:user.username}}, //payload
            process.env.JWT_SECRET, {expiresIn: 3600}
        );
        return res.status(200).json({token:token,name:user.username});

    } catch(err){
        console.log(err);
        res.status(500).json({message: "Server error"});
    }
})


const findOrCreateDocument = async (id) => {
    try {
        if (!id) return;

        let document = await Document.find({_id:id})

        if (!document) {
            console.log("creating a document")
            document = await Document.create({ _id: id, data: defaultData });
        }

        return document;
    } catch (error) {
        console.error("Error in findOrCreateDocument:", error);
        throw error;
    }
};




server.listen(port, () => console.log(`Listening on port ${port}`));

mongoose
	.connect(mongodbURI)
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.log("ERROR: " + err);
	});