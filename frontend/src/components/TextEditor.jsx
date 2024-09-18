import  { useState } from 'react'
import Quill from "quill";
import "quill/dist/quill.snow.css"
import { useCallback,useEffect } from 'react';
import { io } from "socket.io-client"
const SAVE_INTERVAL_MS = 200

const OPTIONS=[
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block","video"],
    ["clean"],
]

const socket = io('http://localhost:5050')

const TextEditor = (id) => {
    const [quill,setQuill] = useState();
    const documentId=id.id;

    // console.log(documentId)

    // Used to save the document to the database every 200ms.
    useEffect(()=>{
        if (socket == null || quill == null) return
        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())
            }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval)
        }
    },[quill])

    // This useEffect is used to load the document from the database when the document is opened.
    useEffect(()=>{
        if(socket==null || quill==null) return;
        socket.once('load-document',(document)=>{ //once is used to load the document only once and not multiple times.
            quill.setContents(document)
            quill.enable() //enable the quill editor after the document is loaded which means the document is ready to be edited.
        })

        socket.emit('get-document',documentId); 

    },[quill,documentId])

    // This useEffect is used to send the changes to the other clients when the document is edited.
    useEffect(()=>{
        if(socket == null || quill == null){
            return;
        }
        const handleChanges = (delta , oldDelta , source)=>{
            if(source !== 'user') return;
            socket.emit('send-changes',delta)
        }
        quill.on("text-change",handleChanges); //text-change is an event that is emitted when the text is changed in the quill editor.

        return ()=>{
            quill.off('text-change',handleChanges);
        }
    },[quill])

    // This useEffect is used to get the changes from the other clients and update the document accordingly.
    useEffect(()=>{
        if(socket == null || quill == null){
            return;
        }
        const handleChanges = (delta)=>{
            quill.updateContents(delta)
        }
        socket.on('get-changes',handleChanges);

        return ()=>{
            socket.off('get-changes',handleChanges);
        }
    },[quill])

    // UseCallback is used to create a memoized callback that only changes if one of the dependencies has changed.
    const wrapper=useCallback(element =>{
        if(element== null) return
        element.innerHTML=""
        const editor=document.createElement("div")
        element.append(editor)
        const q=new Quill(editor,{
            theme:"snow",
            modules:{toolbar:OPTIONS},
        })
        q.disable()
        q.setText('Document is Loading ...')
        setQuill(q);
    },[])
    return (
        <div className='container' ref={wrapper}></div>
    )
}

export default TextEditor