import React, { useState } from 'react'
import Field from './Field';
import './App.css';

export default function App() {
  const [infoText, setInfoText] = useState("White's turn");
  const [socket, setSocket] = useState(null)
  return (
    <div id="App">
      <Field setInfoText={setInfoText} sock={socket}></Field>
      <div id="lower">
        {infoText}
      </div>
    </div>
  );


}
