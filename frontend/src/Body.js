import React from 'react';
import { ChatAnswer, ChatQuestion } from "./ChatItem"
import { Context } from "./Store"
import TextareaAutoSize from 'react-textarea-autosize'
import ReactLoading from 'react-loading'

const Body = () => <div className='body bg-white flex-grow h-full flex flex-col items-center w-auto relative'>
  <img
    src={process.env.PUBLIC_URL + '/dog.png'} alt=''
    className='w-8 h-8 mt-4'
  />
  <h3 className='text-2xl font-extrabold mt-1 mb-2'>你要问啥?</h3>
  <History />
  <AskBox />
</div>

const AskBox = () => {
  const { store } = Context.useStore()
  const [question, setQuestion] = React.useState('')
  const on_click = () => {
    if (store.loading) return

    store.ask(question, store.activated_conversation_id)
    // store.switch_loading()
    setQuestion('')
  }
  const on_change = (e) => {
    setQuestion(e.target.value)
  }
  const on_key = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) on_click()
  }
  return Context.useConsumer(() => <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0  md:border-transparent md:bg-vert-light-gradient bg-white md:!bg-transparent">
    <form className="stretch px-2 flex flex-row pt-2 last:mb-2 md:last:mb-6 lg:mx-auto lg:max-w-3xl lg:pt-6">
      <div className="relative flex h-full flex-1 md:flex-col">
        <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white  shadow-[0_0_10px_rgba(0,0,0,0.10)] rounded-md">
          <TextareaAutoSize
            disabled={store.loading || !store.activated_conversation.live}
            minRows={1} maxRows={5}
            value={
              store.loading || !store.activated_conversation.live ?
                '' : question
            }
            placeholder={
              store.loading ? '请耐心等待回答' :
                (store.activated_conversation.live ?
                  '输入问题后点击按钮或按Ctrl+回车' :
                  '请新建对话或切换对话')
            }
            onChange={on_change}
            onKeyDown={on_key}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 focus:ring-0 focus-visible:ring-0 md:pl-0 outline-none"
          />
          <div
            onClick={on_click}
            className={
              `${store.loading ? 'text-gray-500' :
                (store.activated_conversation.live ?
                  "cursor-pointer  text-[#10a37f] hover:bg-gray-100" :
                  'text-gray-500'
                )
              } 
                  p-1 rounded-md absolute bottom-1.5 right-1
                  md:bottom-2.5 md:right-2`
            }
          >
            {store.loading ?
              <ReactLoading
                type='spin' color='#10a37f'
                height={25} width={30}
                className='mr-[-4px]'
              /> :
              <svg
                stroke="currentColor" fill="none" strokeWidth="2"
                viewBox="0 0 24 24" strokeLinecap="round"
                strokeLinejoin="round" className="h-4 w-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>}
          </div>
        </div>
      </div>
    </form>
  </div>)
}

const History = () => {
  const { store } = Context.useStore()
  return Context.useConsumer(() =>
    <div className='flex flex-col w-full px-2 lg:mx-auto lg:max-w-3xl overflow-y-auto mb-16 md:mb-24 lg:mb-24'>
      {
        store.activated_conversation.records
          .map(record => <ChatPair record={record} key={record.record_id} />)
      }
    </div>)
}

const ChatPair = ({ record }) => {
  const answer_text = record.answer
  const answer_sources = record.sources.join('\n')
  const answer = answer_sources === '' ?
    answer_text :
    `${answer_text}\n\nCite:\n${answer_sources}`
  return <>
    <ChatQuestion text={record.question} />
    <ChatAnswer text={answer} />
  </>
}

export default Body
