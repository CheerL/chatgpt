import Side from './Side'
import Body from './Body'
import { Context } from './Store';
import React from 'react';


function App() {
  const { store } = Context.useStore()
  window.store = store

  return (
    
    <div className="App flex flex-row">
      <Side />
      <Body />
    </div>
  );
}

export default App;
