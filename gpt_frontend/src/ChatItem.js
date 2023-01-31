const ChatQuestion = () => {
  return <ChatItem text='222' question />
}

const ChatAnwser = () => {
  return <ChatItem text='111111111111' />
}

const ChatItem = ({ text, voice, question }) => {
  return <div className='w-full'>
  <div className={"mt-2 w-fit rounded-md border p-2 border-[#10a37f] text-left relative "+ (question ? 'bg-primary float-right': 'float-left')}>
    <span className='font-bold'>
      {question?'问题':'回答'}：
    </span>
    <span className='whitespace-pre-line'>{ text }</span>
      {voice ?
      <>
        <div 
          className="wifi-symbol"
          id=""
          onclick="play_or_pause_audio('{{ record.record_id }}')"
        >
          <div className="wifi-circle first"></div>
          <div className="wifi-circle second"></div>
          <div className="wifi-circle third"></div>
        </div>
        <audio
          className="answer-audio"
          id=""
          src=""
          onplay="on_audio_play('{{ record.record_id }}')"
          onpause="on_audio_pause('{{ record.record_id }}')"
          oncanplay="check_and_play('{{ record.record_id }}')"
          ></audio>
      </>:
      null
      }
    </div>
    </div>
}

export {ChatAnwser, ChatQuestion}