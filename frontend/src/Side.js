import React from 'react';
import { Context } from "./Store"
import './burger.css'
import { EditIcon, DeleteIcon, CancelIcon, ConfirmIcon } from './Icon';


const BurgerMenu = () => {
  const on_hide_click = () => {
    const sidebar = document.getElementById('sidebar')
    sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block'
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

const Side = () => {
  const { store } = Context.useStore()
  React.useEffect(() => {
    store.load_conversation_list()
  }, [])

  return Context.useConsumer(() => <>
    <BurgerMenu />
    <div className='hidden md-block-important flex-grow-0' id='sidebar'>
      <div
        className='bg-zinc-800 w-40 h-screen flex flex-col'
      >
        <div className='text-white font-bold mx-4 my-4 h-6'>
          对话列表
        </div>
        <SwitchBotButton bot_type={store.bot_type} />
        {
          store.conversation_list
            .map(conversation => {
              if (conversation.bot_type !== store.bot_type) return null

              if (conversation.conversation_id === store.activated_conversation_id) {
                return <EditableConversationButton
                  conversation={conversation} key={conversation.conversation_id}
                />
              } else {
                return <ConversationButton
                  conversation={conversation} key={conversation.conversation_id}
                />
              }
            })
        }
        <NewConversationButton />
      </div>
    </div>
  </>)
}

const BaseConversationButton = ({ activated, onClick, children }) => {
  return <div
    className={
      `${activated ? "bg-gray-400" : "bg-white"}
     text-black mx-2 mb-2 py-2 px-2 rounded-md cursor-pointer relative flex`
    }
    onClick={onClick}
  >
    {children}
  </div>
}

const EditableConversationButton = ({ conversation }) => {
  const [originalText, setOriginalText] = React.useState('')
  const [editing, setEditing] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const { store } = Context.useStore()

  const on_click_edit = () => {
    setOriginalText(conversation.name)
    setEditing(true)
  }
  const on_click_edit_confirm = () => {
    if (conversation.name !== originalText) {
      store.rename_conversation(conversation.conversation_id, conversation.name, conversation.bot_type)
    }
    setOriginalText('')
    setEditing(false)
  }
  const on_click_edit_cancel = () => {
    store.update_conversation(conversation.conversation_id, { name: originalText })
    setOriginalText('')
    setEditing(false)
  }

  const on_click_delete = () => {
    setDeleting(true)
  }
  const on_click_delete_confirm = () => {
    store.delete_conversation(conversation.conversation_id, conversation.bot_type)
    setDeleting(false)
  }
  const on_click_delete_cancel = () => {
    setDeleting(false)
  }

  const on_text_change = (e) => {
    store.update_conversation(conversation.conversation_id, { name: e.target.value })
  }

  return <BaseConversationButton
    activated
  >
    <div className="flex-1 text-ellipsis max-w-[92px] max-h-[24px] overflow-hidden break-all relative text-left">
      {
        editing ?
          <input
            className="w-full h-full bg-gray-300"
            value={conversation.name}
            onChange={on_text_change}
            autoFocus
          /> :
          <>
            <div>{conversation.name}</div>
            <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-400" />
          </>
      }
    </div>

    <div className="absolute flex right-1 z-10 text-gray-800 visible">
      {
        editing ? <>
          <ConfirmIcon onClick={on_click_edit_confirm} />
          <CancelIcon onClick={on_click_edit_cancel} />
        </> : (deleting ? <>
          <ConfirmIcon onClick={on_click_delete_confirm} />
          <CancelIcon onClick={on_click_delete_cancel} />
        </> : <>
          <EditIcon onClick={on_click_edit} />
          <DeleteIcon onClick={on_click_delete} />
        </>)
      }
    </div>
  </BaseConversationButton>
}

const ConversationButton = ({ conversation }) => {
  const { store } = Context.useStore()
  const on_click = () => {
    store.change_activated_conversation(conversation.conversation_id)
    store.load_records(conversation.conversation_id)
  }
  return <BaseConversationButton
    onClick={on_click}
  >
    {conversation.name}
  </BaseConversationButton>
}

const NewConversationButton = () => {
  const { store } = Context.useStore()
  const new_id = '$$new$$'
  const on_click = () => {
    store.change_activated_conversation(new_id)
  }
  return Context.useConsumer(() => <BaseConversationButton
    onClick={on_click}
  >
    新建对话
  </BaseConversationButton>
  )
}

const SwitchBotButton = ({ bot_type }) => {
  const { store } = Context.useStore()
  const on_click = () => {
    store.switch_bot_type(bot_type === 'bing' ? 'openai' : 'bing')
  }
  return Context.useConsumer(() => <BaseConversationButton
    onClick={on_click}
  >
    {bot_type === 'bing' ? '切换到ChatGPT' : '切换到NewBing'}
  </BaseConversationButton>)
}

export default Side;
