import Side from './Side'
import Body from './Body'
import { Context } from './Store';


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
