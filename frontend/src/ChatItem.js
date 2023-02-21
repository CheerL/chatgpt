import React from 'react';
import moment from 'moment'

const ChatQuestion = ({ text, ts }) => {
  return <ChatItem text={text} ts={ts} question />
}

const ChatAnswer = ({ text, ts }) => {
  return <ChatItem text={text} ts={ts} />
}

const ChatItem = ({ text, ts, voice, question }) => {
  const time = moment(ts*1000).utcOffset(8).format('YYYY-MM-DD HH:mm:ss')
  return <div className='w-full'>
    <div className={`${question ? 'text-right' : 'text-left'} w-full text-gray-600 text-sm`}>
      {time}
    </div>
    <div className={"w-fit rounded-md border p-2 border-[#10a37f] text-left relative " + (question ? 'bg-primary float-right' : 'float-left')}>
      <span className='font-bold'>
        {question ? '问题: ' : '回答: '}
      </span>
      <span className='whitespace-pre-line'>{text}</span>
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
        </> :
        null
      }
    </div>
  </div>
}

export { ChatAnswer, ChatQuestion }