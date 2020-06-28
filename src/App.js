import React, { useState } from 'react'
import Field from './Field';
import './App.css';

export default function App() {
  const [infoText, setInfoText] = useState("White's turn");
  return (
    <div id="App">
      <div id="upper">
        <Field setInfoText={setInfoText}></Field>
      </div>
      <div id="lower">
        {infoText}
      </div>
    </div>
  );


}
