
import { ChatAnwser, ChatQuestion } from "./ChatItem" 

const Body = () => <div className='body bg-white flex-grow h-screen flex flex-col items-center w-auto relative'>
  <img
    src={process.env.PUBLIC_URL + '/dog.png'} alt=''
    className='w-8 h-8 mt-16'
  />
  <h3 className='text-3xl font-extrabold mt-1 mb-4'>你要问啥?</h3>
  <AskBox />
  <History />
</div>

const AskBox = () => {
  return <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0  md:border-transparent md:bg-vert-light-gradient bg-white md:!bg-transparent">
    <form className="stretch px-2 flex flex-row pt-2 last:mb-2 md:last:mb-6 lg:mx-auto lg:max-w-3xl lg:pt-6">
      <div className="relative flex h-full flex-1 md:flex-col">
        <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white  shadow-[0_0_10px_rgba(0,0,0,0.10)] rounded-md">
          <textarea tabindex="0" rows="1" placeholder="" className="m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 focus:ring-0 focus-visible:ring-0 md:pl-0 outline-none" />
          <button className="absolute p-1 rounded-md text-[#10a37f] bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 disabled:hover:bg-transparent ">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  </div>
}

const History = () => {
  return <div className='flex flex-col w-full px-2 lg:mx-auto lg:max-w-3xl '>
    <ChatPair />
  </div>
}

const ChatPair = () => {
  return <>
    <ChatQuestion />
    <ChatAnwser />
  </>
}

export default Body