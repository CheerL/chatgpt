import React from 'react';
import { ChatAnswer, ChatQuestion } from "./ChatItem"
import { Context } from "./Store"
import TextareaAutoSize from 'react-textarea-autosize'
import ReactLoading from 'react-loading'

const Body = () => <div className='body bg-white flex-grow h-full flex flex-col items-center w-auto relative'>
  <div className='w-8 h-8 flex-grow-0 mt-2'>
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_36_2239)">
        <path d="M46.9982 35.9868C46.9982 36.5323 46.9689 37.0747 46.9103 37.6092C46.5619 40.8696 45.1683 43.8178 43.0701 46.098C43.3344 45.8007 43.5726 45.4815 43.7815 45.1397C43.9426 44.8799 44.086 44.6091 44.207 44.3266C44.251 44.2337 44.291 44.137 44.3242 44.041C44.3643 43.9481 44.3974 43.8514 44.4267 43.7554C44.4599 43.6664 44.4892 43.5736 44.5146 43.4807C44.54 43.3839 44.5662 43.2879 44.5878 43.1912C44.5917 43.1803 44.5955 43.1685 44.5986 43.1576C44.621 43.0609 44.6387 42.9649 44.6572 42.8681C44.6757 42.7682 44.6942 42.6675 44.7088 42.5677C44.7088 42.5638 44.7088 42.5638 44.7088 42.5606C44.7235 42.4678 44.7343 42.3749 44.742 42.2781C44.7643 42.0589 44.7751 41.8404 44.7751 41.6172C44.7751 40.3624 44.4336 39.1848 43.8363 38.1828C43.7006 37.9487 43.5503 37.7263 43.3853 37.5148C43.1911 37.262 42.9822 37.0247 42.7548 36.8054C42.1898 36.2522 41.5299 35.7988 40.8 35.4796C40.4847 35.3384 40.1548 35.2236 39.8172 35.1378C39.8133 35.1378 39.8064 35.1339 39.8025 35.1339L39.6853 35.0933L37.9764 34.4995V34.4956L33.5056 32.9395C33.491 32.9356 33.4725 32.9356 33.4617 32.9325L33.1826 32.8287C32.2838 32.4721 31.5392 31.8041 31.0736 30.9535L29.4418 26.7387L27.571 21.9114L27.2118 20.9796L27.1201 20.79C27.0175 20.5372 26.962 20.2625 26.962 19.9769C26.962 19.9027 26.962 19.8286 26.9697 19.7615C27.0761 18.6994 27.9672 17.8676 29.0456 17.8676C29.3316 17.8676 29.6068 17.9269 29.8565 18.0346L38.1876 22.3593L39.831 23.2099C40.7005 23.7336 41.5107 24.35 42.2514 25.0446C44.9362 27.5402 46.6968 31.0378 46.9612 34.9482C46.9836 35.2931 46.9982 35.638 46.9982 35.9868Z" fill="url(#paint0_linear_36_2239)"></path>
        <path d="M44.7717 41.6165C44.7717 42.0472 44.7316 42.4631 44.6576 42.8682C44.6353 42.9758 44.6137 43.0835 44.5883 43.1912C44.5405 43.384 44.4896 43.5697 44.4272 43.7554C44.394 43.8522 44.3609 43.9482 44.3246 44.041C44.2876 44.1378 44.2475 44.2307 44.2075 44.3267C44.0864 44.6092 43.9431 44.8799 43.782 45.1398C43.5731 45.4816 43.3341 45.8008 43.0705 46.0981C41.8564 47.4575 37.7333 49.8813 36.214 50.8661L32.8408 52.9528C30.3695 54.4948 28.0324 55.5858 25.087 55.6599C24.9475 55.6638 24.8119 55.6677 24.6762 55.6677C24.4858 55.6677 24.2985 55.6638 24.1112 55.6568C19.1231 55.464 14.7726 52.753 12.2643 48.7466C11.1165 46.9159 10.3573 44.8144 10.1006 42.5568C10.6394 45.6424 13.2957 47.9819 16.4977 47.9819C17.62 47.9819 18.673 47.6963 19.5933 47.1906C19.6003 47.1867 19.608 47.1828 19.6157 47.1797L19.9456 46.9791L21.2884 46.1769L22.9973 45.1523V45.1039L23.2178 44.9705L38.5095 35.7988L39.6866 35.0934L39.8037 35.134C39.8076 35.134 39.8145 35.1379 39.8184 35.1379C40.156 35.2229 40.4859 35.3384 40.8012 35.4797C41.5311 35.7988 42.191 36.2522 42.756 36.8055C42.9834 37.0248 43.1923 37.262 43.3865 37.5149C43.5515 37.7263 43.7018 37.9495 43.8375 38.1828C44.4302 39.1841 44.7717 40.3616 44.7717 41.6165Z" fill="url(#paint1_linear_36_2239)"></path>
        <path d="M23.0013 11.0082L22.9959 45.1507L21.287 46.1761L19.9434 46.9775L19.6127 47.1804C19.6073 47.1804 19.5973 47.1859 19.5927 47.1906C18.6708 47.6931 17.6178 47.9826 16.4947 47.9826C13.2919 47.9826 10.6403 45.6431 10.0984 42.5575C10.0729 42.4155 10.0537 42.268 10.0383 42.126C10.0182 41.8568 10.0036 41.593 9.99817 41.3238V2.8986C9.99817 1.68591 10.971 0.696411 12.1734 0.696411C12.6244 0.696411 13.0453 0.838438 13.3914 1.07177L20.0428 5.47146C20.0783 5.5019 20.1176 5.52765 20.1585 5.55262C21.8782 6.74034 23.0013 8.73963 23.0013 11.0082Z" fill="url(#paint2_linear_36_2239)"></path>
        <path opacity="0.15" d="M44.7717 41.6165C44.7717 42.0472 44.7316 42.4631 44.6576 42.8682C44.6353 42.9758 44.6137 43.0835 44.5883 43.1912C44.5405 43.384 44.4896 43.5697 44.4272 43.7554C44.394 43.8522 44.3609 43.9482 44.3246 44.041C44.2876 44.1378 44.2475 44.2307 44.2075 44.3267C44.0864 44.6092 43.9431 44.8799 43.782 45.1398C43.5731 45.4816 43.3349 45.8008 43.0705 46.0981C41.8564 47.4575 37.7333 49.8813 36.214 50.8661L32.8408 52.9528C30.3695 54.4948 28.0324 55.5858 25.087 55.6599C24.9475 55.6638 24.8119 55.6677 24.6762 55.6677C24.4858 55.6677 24.2985 55.6638 24.1112 55.6568C19.1231 55.464 14.7726 52.753 12.2643 48.7466C11.1165 46.9159 10.3573 44.8144 10.1006 42.5568C10.6394 45.6424 13.2957 47.9819 16.4977 47.9819C17.62 47.9819 18.673 47.6963 19.5933 47.1906C19.6003 47.1867 19.608 47.1828 19.6157 47.1797L19.9456 46.9791L21.2884 46.1769L22.9973 45.1523V45.1039L23.2178 44.9705L38.5095 35.7988L39.6866 35.0934L39.8037 35.134C39.8076 35.134 39.8145 35.1379 39.8184 35.1379C40.156 35.2229 40.4859 35.3384 40.8012 35.4797C41.5311 35.7988 42.191 36.2522 42.756 36.8055C42.9834 37.0248 43.1923 37.262 43.3865 37.5149C43.5515 37.7263 43.7018 37.9495 43.8375 38.1828C44.4302 39.1841 44.7717 40.3616 44.7717 41.6165Z" fill="url(#paint3_linear_36_2239)"></path>
        <path opacity="0.1" d="M23.0013 11.0082L22.9959 45.1507L21.287 46.1761L19.9434 46.9775L19.6127 47.1804C19.6073 47.1804 19.5973 47.1859 19.5927 47.1906C18.6708 47.6931 17.6178 47.9826 16.4947 47.9826C13.2919 47.9826 10.6403 45.6431 10.0984 42.5575C10.0729 42.4155 10.0537 42.268 10.0383 42.126C10.0182 41.8568 10.0036 41.593 9.99817 41.3238V2.8986C9.99817 1.68591 10.971 0.696411 12.1734 0.696411C12.6244 0.696411 13.0453 0.838438 13.3914 1.07177L20.0428 5.47146C20.0783 5.5019 20.1176 5.52765 20.1585 5.55262C21.8782 6.74034 23.0013 8.73963 23.0013 11.0082Z" fill="url(#paint4_linear_36_2239)"></path>
      </g>
      <defs>
        <linearGradient id="paint0_linear_36_2239" x1="24.061" y1="24.49" x2="48.0304" y2="38.1597" gradientUnits="userSpaceOnUse">
          <stop stopColor="#37BDFF"></stop>
          <stop offset="0.1832" stopColor="#33BFFD"></stop>
          <stop offset="0.3576" stopColor="#28C5F5"></stop>
          <stop offset="0.528" stopColor="#15D0E9"></stop>
          <stop offset="0.5468" stopColor="#12D1E7"></stop>
          <stop offset="0.5903" stopColor="#1CD2E5"></stop>
          <stop offset="0.7679" stopColor="#42D8DC"></stop>
          <stop offset="0.9107" stopColor="#59DBD6"></stop>
          <stop offset="1" stopColor="#62DCD4"></stop>
        </linearGradient>
        <linearGradient id="paint1_linear_36_2239" x1="10.099" y1="45.3798" x2="44.7715" y2="45.3798" gradientUnits="userSpaceOnUse">
          <stop stopColor="#39D2FF"></stop>
          <stop offset="0.1501" stopColor="#38CEFE"></stop>
          <stop offset="0.2931" stopColor="#35C3FA"></stop>
          <stop offset="0.4327" stopColor="#2FB0F3"></stop>
          <stop offset="0.5468" stopColor="#299AEB"></stop>
          <stop offset="0.5827" stopColor="#2692EC"></stop>
          <stop offset="0.7635" stopColor="#1A6CF1"></stop>
          <stop offset="0.909" stopColor="#1355F4"></stop>
          <stop offset="1" stopColor="#104CF5"></stop>
        </linearGradient>
        <linearGradient id="paint2_linear_36_2239" x1="16.4996" y1="48.4653" x2="16.4996" y2="1.52914" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1B48EF"></stop>
          <stop offset="0.1221" stopColor="#1C51F0"></stop>
          <stop offset="0.3212" stopColor="#1E69F5"></stop>
          <stop offset="0.5676" stopColor="#2190FB"></stop>
          <stop offset="1" stopColor="#26B8F4"></stop>
        </linearGradient>
        <linearGradient id="paint3_linear_36_2239" x1="16.9908" y1="54.0427" x2="38.6508" y2="32.6475" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"></stop>
          <stop offset="0.3726" stopColor="#FDFDFD"></stop>
          <stop offset="0.5069" stopColor="#F6F6F6"></stop>
          <stop offset="0.6026" stopColor="#EBEBEB"></stop>
          <stop offset="0.68" stopColor="#DADADA"></stop>
          <stop offset="0.7463" stopColor="#C4C4C4"></stop>
          <stop offset="0.805" stopColor="#A8A8A8"></stop>
          <stop offset="0.8581" stopColor="#888888"></stop>
          <stop offset="0.9069" stopColor="#626262"></stop>
          <stop offset="0.9523" stopColor="#373737"></stop>
          <stop offset="0.9926" stopColor="#090909"></stop>
          <stop offset="1"></stop>
        </linearGradient>
        <linearGradient id="paint4_linear_36_2239" x1="16.4996" y1="0.696411" x2="16.4996" y2="47.9822" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"></stop>
          <stop offset="0.3726" stopColor="#FDFDFD"></stop>
          <stop offset="0.5069" stopColor="#F6F6F6"></stop>
          <stop offset="0.6026" stopColor="#EBEBEB"></stop>
          <stop offset="0.68" stopColor="#DADADA"></stop>
          <stop offset="0.7463" stopColor="#C4C4C4"></stop>
          <stop offset="0.805" stopColor="#A8A8A8"></stop>
          <stop offset="0.8581" stopColor="#888888"></stop>
          <stop offset="0.9069" stopColor="#626262"></stop>
          <stop offset="0.9523" stopColor="#373737"></stop>
          <stop offset="0.9926" stopColor="#090909"></stop>
          <stop offset="1"></stop>
        </linearGradient>
        <clipPath id="clip0_36_2239">
          <rect width="37" height="56" fill="white" transform="translate(10)"></rect>
        </clipPath>
      </defs>
    </svg></div>
  <h3 className='text-2xl font-extrabold'>Bing GPT</h3>
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
  const regex = /\[\^(\d+)\^\]/g;
  const answer_text = record.answer.replace(regex, '[$1]')
  // const answer_sources = record.sources.join('\n')
  let answer = ''
  if (record.sources.length > 0) {
    const source_links = record.sources.map(source => {
      const regex = /\[(\d+)\]:\s+(.+)\s+\"(.+)\"/g;
      const [, num, link, title] = regex.exec(source)
      return <div key={num}>
        <a href={link} className='text-gray-600 text-sm hover:text-blue-600'>
          [{num}] {title}
        </a>
      </div>
    })
    answer = <>
      {answer_text}
      <br /><br />
      <span className='text-gray-600 text-sm'>
        参考资料:
      </span>
      <br />
      {source_links}
    </>
  } else {
    answer = answer_text
  }
  return <>
    <ChatQuestion text={record.question} ts={record.question_ts} />
    <ChatAnswer text={answer} ts={record.answer_ts} />
  </>
}

export default Body
