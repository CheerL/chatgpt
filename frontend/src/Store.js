import React from "react"
import { Observer, useLocalObservable } from "mobx-react-lite";
import axios from 'axios'
import config from "./config"

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
 * 
 * @property {function(string): ConversationWithRecord} get_conversation_by_id
 * @property {function(string): null} change_activated_conversation
 * @property {function(Record[]): null} add_records
 * @property {function(string, Conversation): null} update_conversation
 * @property {function(): ConversationWithRecord} activated_conversation
 * @property {function(): null} load_conversation_list
 * @property {function(string): null} load_records
 * @property {function(string, string): null} ask
 */

const api_url = config[process.env.NODE_ENV].API_URL

const store = {
  conversation_list: [],
  activated_conversation_id: '',
  records: [],
  loading: false,

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
  update_conversation(conversation_id, new_conversation) {
    const index = this.conversation_list.findIndex(
      conversation => conversation.conversation_id === conversation_id
    )
    if (index >= 0) {
      this.conversation_list[index] = { 
        ...this.conversation_list[index], ...new_conversation 
      }
    } else {
      this.conversation_list.push({conversation_id, ...new_conversation})
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

  load_conversation_list() {
    const url = `${api_url}/conversation_list`
    axios.get(url).then(result => {
      this.conversation_list = result.data
      // .map((id, idx) => ({
      //   id: id,
      //   name: `对话${idx + 1}`
      // }))
    }).catch(e => {
      console.error(e)
    })
  },
  load_records(conversation_id) {
    if (conversation_id === undefined) {
      conversation_id = this.activated_conversation_id
    }

    const url = `${api_url}/conversation`
    axios.get(url, { params: { conversation_id } })
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
    }).then(result => {
      const { records, conversation_id, name, live } = result.data
      this.update_conversation(conversation_id, { name, live })
      this.add_records(records)
      this.change_activated_conversation(conversation_id)
    }).catch(e => {
      console.error(e)
    }).finally(() => {
      this.loading = false
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