import React from "react"
import { Observer, useLocalObservable } from "mobx-react-lite";
import axios from 'axios'
import config from "./config"
import { fetchEventSource } from "@microsoft/fetch-event-source";

/**
 * @typedef {Object} Record
 * @property {string} conversation_id - 会话ID
 * @property {string} record_id - 记录ID
 * @property {string} answer - 回答内容
 * @property {string} answer_voice - 回答语音
 * @property {number} answer_ts - 回答时间戳
 * @property {string} question - 问题内容
 * @property {string} question_voice - 问题语音
 * @property {number} question_ts - 问题时间戳
 */

/**
 * @typedef {Object} Conversation
 * @property {string} conversation_id - 会话ID
 * @property {string} name - 会话名称
 * @property {boolean} live
 * @property {string} bot_type
 */

/**
 * @typedef {Object} ConversationWithRecord
 * @property {string} conversation_id
 * @property {string} name - 会话名称
 * @property {boolean} live
 * @property {Record[]} records
 */

/**
 * @typedef {Object} Store
 * @property {Conversation[]} conversation_list
 * @property {string} activated_conversation_id
 * @property {Record[]} records
 * @property {boolean} loading
 * @property {string} bot_type
 * @property {string} API_URL
 * 
 * @property {function(string): ConversationWithRecord} get_conversation_by_id
 * @property {function(string): null} change_activated_conversation
 * @property {function(Record[]): null} add_records
 * @property {function(string, Conversation): null} update_conversation
 * @property {function(): ConversationWithRecord} activated_conversation
 * @property {function(string): null} load_conversation_list
 * @property {function(string): null} load_records
 * @property {function(string, string): null} ask
 * @property {function(string, string, string): null} rename_conversation
 * @property {function(string, string): null} delete_conversation
 */

const api_url = config[process.env.NODE_ENV].API_URL

const store = {
  conversation_list: [],
  activated_conversation_id: '',
  records: [],
  loading: false,
  bot_type: 'bing',
  API_URL: api_url,

  get_conversation_by_id(conversation_id) {
    if (conversation_id === undefined) {
      conversation_id = this.activated_conversation_id
    }
    const conversation = this.conversation_list.find(
      conversation => conversation.conversation_id === conversation_id
    )
    const records = this.records
      .filter(record => record.conversation_id === conversation_id)

    records.sort((a, b) => a.answer_ts - b.answer_ts)
    return {
      ...conversation,
      records
    }
  },
  change_activated_conversation(conversation_id) {
    if (conversation_id !== this.activated_conversation_id) {
      this.activated_conversation_id = conversation_id
    }
  },
  add_records(records) {
    const record_id_list = this.records.map(record => record.record_id)
    records.forEach(record => {
      if (!record_id_list.includes(record.record_id)) {
        this.records.push(record)
      }
    })
  },
  update_record(record_id, new_record) {
    const index = this.records.findIndex(
      record => record.record_id === record_id
    )
    if (index >= 0) {
      this.records[index] = {
        ...this.records[index], ...new_record
      }
    } else {
      this.records.push({ record_id, ...new_record })
    }
  },
  update_conversation(conversation_id, new_conversation) {
    const index = this.conversation_list.findIndex(
      conversation => conversation.conversation_id === conversation_id
    )
    if (index >= 0) {
      this.conversation_list[index] = {
        ...this.conversation_list[index], ...new_conversation
      }
    } else {
      this.conversation_list.push({ conversation_id, ...new_conversation })
    }
  },
  get activated_conversation() {
    if (
      this.activated_conversation_id === '' |
      this.activated_conversation_id === '$$new$$'
    ) {
      return {
        conversation_id: this.activated_conversation_id,
        name: '',
        live: true,
        records: []
      }
    }
    return this.get_conversation_by_id(this.activated_conversation_id)
  },

  load_conversation_list(bot_type = '') {
    const url = `${api_url}/conversation_list`
    axios.get(url, { params: { bot_type } }).then(result => {
      this.conversation_list = result.data
    }).catch(e => {
      console.error(e)
    })
  },
  load_records(conversation_id) {
    if (conversation_id === undefined) {
      conversation_id = this.activated_conversation_id
    }

    const url = `${api_url}/conversation`
    axios.get(url, { params: { conversation_id, bot_type: this.bot_type } })
      .then(result => {
        const { records, conversation_id, name, live } = result.data
        this.update_conversation(conversation_id, { name, live })
        this.add_records(records)
      }).catch(e => {
        console.error(e)
      })
  },
  ask(question, conversation_id) {
    const url = `${api_url}/question`
    this.loading = true
    axios.postForm(url, {
      question,
      conversation_id
    }, {
      params: {
        bot_type: this.bot_type
      }
    }).then(result => {
      const { records, conversation_id, name, live, bot_type } = result.data
      this.update_conversation(conversation_id, { name, live, bot_type })
      this.add_records(records)
      this.change_activated_conversation(conversation_id)
    }).catch(e => {
      console.error(e)
    }).finally(() => {
      this.loading = false
    })
  },
  ask_stream(question, conversation_id) {
    this.loading = true
    const url = `${api_url}/question_stream?bot_type=${this.bot_type}`

    const index = this.conversation_list.findIndex(
      conversation => conversation.conversation_id === conversation_id
    )
    let init_conversation_id
    if (index < 0) {
      init_conversation_id = 'tmp_conversation_id' + Math.random().toString(36).substr(2, 9)
      this.update_conversation(init_conversation_id, { name: '加载中', live: true, bot_type: this.bot_type })
    } else {
      init_conversation_id = conversation_id
    }

    const init_record_id = 'tmp_record_id' + Math.random().toString(36).substr(2, 9)
    this.add_records([{
      conversation_id: init_conversation_id,
      record_id: init_record_id,
      question,
      answer: '思考中...',
      answer_ts: Date.now() / 1000,
      question_ts: Date.now() / 1000
    }])
    this.change_activated_conversation(init_conversation_id)

    // const es = new EventSource(url, {
    fetchEventSource(url, {
      method: 'POST',
      headers: {
        Accept: "text/event-stream",
        ContentType: 'application/json'
      },
      body: JSON.stringify({
        question,
        conversation_id
      }),
      retry: 0,
      onmessage: (result) => {
        if (result.event === 'all_message') {
          const { record, records, conversation_id, name, live, bot_type } = JSON.parse(result.data)

          this.update_record(init_record_id, record)
          this.update_conversation(init_conversation_id, { conversation_id, name, live, bot_type })
          this.add_records(records)
          this.change_activated_conversation(conversation_id)
          this.loading = false
        } else if (result.event === 'partial_message') {
          const answer = result.data
          if (answer !== undefined && answer !== null && answer !== '') {
            this.update_record(init_record_id, { answer })
          }
        }
      }
    })
  },
  switch_bot_type(bot_type) {
    if (bot_type === this.bot_type) {
      return
    }

    this.bot_type = bot_type
    this.load_conversation_list()
    this.activated_conversation_id = ''
  },
  rename_conversation(conversation_id, name, bot_type) {
    const url = `${api_url}/conversation`
    axios.post(url, {
      conversation_id,
      name,
      bot_type
    }).then(result => {
      console.log(result)
      this.update_conversation(conversation_id, { name })
    }).catch(e => {
      console.error(e)
    })
  },
  delete_conversation(conversation_id, bot_type) {
    const url = `${api_url}/conversation`
    axios.delete(url, {
      params: {
        conversation_id,
        bot_type
      }
    }).then(result => {
      // console.log(result)
      const index = this.conversation_list.findIndex(
        conversation => conversation.conversation_id === conversation_id
      )
      if (index >= 0) {
        this.conversation_list.splice(index, 1)
      }
      this.activated_conversation_id = ''
    }).catch(e => {
      console.error(e)
    })
  }
}

const ContextCreater = stores => {
  const Context = React.createContext();
  const Provider = ({ children }) => {
    const value = useLocalObservable(() => stores);
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  const useConsumer = fn => <Observer>{fn}</Observer>
  /**
   * @method
   * @returns {{store: Store}}
   */
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

export { Context }
