import Side from './Side'
import Body from './Body'
import { Context } from './Store';
import React from 'react';


function App() {
  const { store } = Context.useStore()
  window.store = store

  return (
    <div className="flex flex-row fixed w-full h-full">
      <Side />
      <Body />
    </div>
  );
}

export default App;
