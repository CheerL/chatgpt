import React from "react"
import { useLocalStore, useObserver } from "mobx-react-lite";


const store = {
  conversations_list: ['111', '222'],
  conversation_detail: {
    conversation_id: '111',
    records: [
      {
        "answer": "\u4f60\u597d\uff0c\u6709\u4ec0\u4e48\u6211\u53ef\u4ee5\u5e2e\u52a9\u4f60\u7684\uff1f",
        "answer_voice": "",
        "question": "\u4f60\u597d",
        "question_voice": "",
        "record_id": "a567276a-97d2-4b7b-ae42-e1e00e5e56b1",
        "ts": 1675058384.22402
      }
    ]
  }
}

const ContextCreater = stores => {
  const Context = React.createContext();
  const Provider = ({ children }) => {
    const value = useLocalStore(() => stores);
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };  

  const useConsumer = fn => useObserver(fn)
  const useStore = () => {
    if (!Context) {
      throw new Error("No Context defined");
    }   

    const store = React.useContext(Context);
    if (!store) {
      throw new Error("No Provider defined");
    }   

    return store;
  };  

  return {
    Provider,
    useConsumer,
    useStore
  };  
};

const Context = ContextCreater({
  store
})

export { store, Context }