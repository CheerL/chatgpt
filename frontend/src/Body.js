import React from 'react';
import { ChatAnswer, ChatQuestion } from "./ChatItem"
import { Context } from "./Store"
import TextareaAutoSize from 'react-textarea-autosize'
import ReactLoading from 'react-loading'

const BingIcon = () => <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
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
</svg>

const ChatGPTIcon = () => <svg width="46" height="46" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="2">
  <path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z" fill="currentColor">
  </path>
</svg>

const Body = () => {
  const { store } = Context.useStore()
  return Context.useConsumer(() => <div className='body bg-white flex-grow h-full flex flex-col items-center w-auto relative'>
    <div className='w-8 h-8 flex-grow-0 mt-2'>
      {
        store.bot_type === 'bing' ?
          <BingIcon /> :
          <ChatGPTIcon />
      }
    </div>
    <h3 className='text-2xl font-extrabold'>
      {store.bot_type === 'bing' ? 'New Bing' : 'ChatGPT'}
    </h3>
    <History />
    <AskBox />
  </div>)
}

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
                  '对话已经关闭，请新建对话或切换对话')
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
