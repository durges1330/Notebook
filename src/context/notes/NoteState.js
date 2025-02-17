import React, { useState } from "react";
import noteContext from "./noteContext";

const NoteState = (props) => {
  const host = "http://localhost:5000"
  const notesInitial = []

  const [notes, setNotes] = useState(notesInitial)
  //Get a Node
  const getNotes = async () => {
    // to do API call
    const response = await fetch(`${host}/api/note/fetchallNotes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
      }
    });

    const json = await response.json()
    
    setNotes(json)
  }


  //Add a Note
  const addNote = async (title, description, tag) => {
    // to do API call
    const response =await fetch(`${host}/api/note/addnote`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({title, description, tag})
    });
    const note = await response.json();
    
    setNotes(notes.concat(note))
  }

  //Delete a Note
  const deleteNote = async(id) => {
    //API Call
    const response = await fetch(`${host}/api/note/deletenote/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
      }
    });

    const json = response.json();
    console.log(json)
    

  
    const newNotes = notes.filter((note) => { return note._id !== id })
    setNotes(newNotes)


  }

  // Edit a Note
  const editNote = async (id, title, description, tag) => {
    //API Call

    const response = await fetch(`${host}/api/note/updatenote/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "auth-token": localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, tag })
    });

    const json = await response.json();
    console.log(json)

    let newNotes = JSON.parse(JSON.stringify(notes))
    //Logic to edit client
    for (let index = 0; index < newNotes.length; index++) {
      const element = newNotes[index];
      if (element._id === id) {
        notes[index].title = title;
        notes[index].description = description;
        notes[index].tag = tag;
        break;
      }

      
    }
    setNotes(newNotes)
  }


  return (
    <noteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes }}>
      {props.children}
    </noteContext.Provider>
  )
}

export default NoteState;