import { Context } from "./Store"

const Side = () => {
  const { store } = Context.useStore()
  return Context.useConsumer(() => <div
    className='side bg-zinc-800 flex-grow-0 w-40 h-screen flex flex-col text-base'
  >
    <div className='text-white font-bold align-middle mx-4 my-4'>
      对话列表
    </div>
    {
      store.conversations_list.map(id => <BaseConversationButton title={id} key={id} />)
    }
    <NewConversationButton />
  </div>)
}

const BaseConversationButton = ({ title }) => {
  return <div className='bg-white text-black mx-2 mb-2 py-2 rounded-md'>
    {title}
  </div>
}

const NewConversationButton = () => {
  return <BaseConversationButton title='新建对话' />
}

export default Side;