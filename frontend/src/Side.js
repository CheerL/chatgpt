import React from 'react';
import { Context } from "./Store"
import './burger.css'

const Side = () => {
  const { store } = Context.useStore()
  React.useEffect(() => {
    store.load_conversation_list()
  }, [])

  return Context.useConsumer(() => <>
    <BurgerMenu />
    <div className='hidden md-block-important flex-grow-0' id='sidebar'>
    <div
      className='bg-zinc-800 w-36 h-screen flex flex-col'
    >
      <div className='text-white font-bold mx-4 my-4 h-6'>
        对话列表
      </div>
      {
        store.conversation_list.map(conversation => <ConversationButton
          conversation={conversation} key={conversation.conversation_id}
          activated={conversation.conversation_id === store.activated_conversation_id}
        />)
      }
      <NewConversationButton />
    </div>
    </div>
  </>)
}

const BurgerMenu = () => {
  const on_hide_click = () => {
    const sidebar = document.getElementById('sidebar')
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none'
  }
  return <div
    className='absolute md:hidden w-9 h-9 top-[10px] bg-zinc-800 z-10 cursor-pointer' 
    onClick={on_hide_click}
  >
    <div className='menu-icon top-[10px] left-[7px] relative'>
    <span />
    <span />
    <span />
  </div>
  </div>
}

const BaseConversationButton = ({ title, activated, onClick }) => {
  // console.log(title)
  return <div
    className={
      `${activated ? "bg-gray-400" : "bg-white"}
     text-black mx-2 mb-2 py-2 rounded-md cursor-pointer`
    }
    onClick={onClick}
  >
    {title}
  </div>
}

const ConversationButton = ({ conversation, activated }) => {
  const { store } = Context.useStore()
  const on_click = () => {
    store.change_activated_conversation(conversation.conversation_id)
    store.load_records(conversation.conversation_id)
  }
  return <BaseConversationButton
    title={conversation.name}
    activated={activated}
    onClick={on_click} 
  />
}

const NewConversationButton = () => {
  const { store } = Context.useStore()
  const new_id = '$$new$$'
  const on_click = () => {
    store.change_activated_conversation(new_id)
  }
  return Context.useConsumer(() => <BaseConversationButton
    title={'新建对话'} onClick={on_click}
    activated={store.activated_conversation_id===new_id}
  />)
}

export default Side;
