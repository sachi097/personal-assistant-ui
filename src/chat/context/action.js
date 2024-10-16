import { fetchStream } from "../service";

export default function action(state, dispatch) {
  const setState = (payload = {}) =>
    dispatch({
      type: "SET_STATE",
      payload: { ...payload },
    });
  return {
    setState,
    clearTypeing() {
      console.log("clear");
      const { typeingMessage, options, chat, is, currentChat } = state;
      setState({ is: { ...state.is, typeing: false }, typeingMessage: {}, inputTextKey: new Date().getTime() });
    },
    async sendMessage() {
      const { typeingMessage, options, chat, is, currentChat } = state;
      if (typeingMessage?.content) {
        const newMessage = {
          ...typeingMessage,
          timestamp: Date.now(),
        };
        const messages = [...chat[currentChat].messages, newMessage];
        let newChat = [...chat];
        newChat.splice(currentChat, 1, { ...chat[currentChat], messages });
        setState({
          is: { ...is, thinking: true },
          typeingMessage: {},
          inputTextKey: new Date().getTime(),
          chat: newChat,
        });
        const controller = new AbortController();
        try {
          const res = await fetchStream({
            messages: messages,
            options: {...options.openai, baseUrl: "http://localhost:8081/api/chat/getChatResponse"},
            signal: controller.signal,
            onMessage(content) {
              newChat.splice(currentChat, 1, {
                ...chat[currentChat],
                messages: [
                  ...messages,
                  {
                    content,
                    latex: false,
                    role: "assistant",
                    timestamp: Date.now(),
                    userId: "sachinTestId1",
                  },
                ],
              });
              console.log(newChat)
              setState({
                is: { ...is, thinking: content.length },
                chat: newChat,
              });
            },
            onStar() {},
            onEnd() {
              setState({
                is: { ...is, thinking: false },
              });
            },
            onError(res) {
              console.log(res);
              const { error } = res || {};
              if (error) {
                newChat.splice(currentChat, 1, {
                  ...chat[currentChat],
                  error,
                });
                setState({
                  chat: newChat,
                  is: { ...is, thinking: false },
                });
              }
            },
          });
        } catch (error) {
          console.log(error);
        }
      }
    },

    newChat() {
      const { chat } = state;
      const chatList = [
        ...chat,
        {
          title: "This is a New Conversations",
          id: Date.now(),
          messages: [],
          ct: Date.now(),
          icon: [2, "files"],
        },
      ];
      setState({ chat: chatList, currentChat: chatList.length - 1 });
    },

    modifyChat(arg, index) {
      const chat = [...state.chat];
      chat.splice(index, 1, { ...chat[index], ...arg });
      setState({ chat, currentEditor: null });
    },

    editChat(index, title) {
      const chat = [...state.chat];
      chat.splice(index, 1, [...chat[index], title]);
      setState({
        chat,
      });
    },
    removeChat(index) {
      const chat = [...state.chat];
      chat.splice(index, 1);
      const payload =
        state.currentChat === index
          ? { chat, currentChat: index - 1 }
          : { chat };
      setState({
        ...payload,
      });
    },

    setMessage(content) {
      const typeingMessage =
        content === ""
          ? {}
          : {
              role: "user",
              content,
              latex: false,
              userId: "sachinTestId1",
              timestamp: Date.now()
            };
      setState({ is: { ...state.is, typeing: true }, typeingMessage });
    },

    clearMessage() {
      const chat = [...state.chat];
      chat[state.currentChat].messages = [];
      setState({
        chat,
      });
    },

    removeMessage(index) {
      const messages = state.chat[state.currentChat].messages;
      const chat = [...state.chat];
      messages.splice(index, 1);
      chat[state.currentChat].messages = messages;
      setState({
        chat,
      });
    },

    openOverLeaf(content){
      var URL = "https://www.overleaf.com/docs?encoded_snip=" + encodeURIComponent(content);
      window.open(URL, '_blank');
    },

    setOptions({ type, data = {} }) {
      console.log(type, data);
      let options = { ...state.options };
      options[type] = { ...options[type], ...data };
      setState({ options });
    },

    setIs(arg) {
      const { is } = state;
      setState({ is: { ...is, ...arg } });
    },

    currentList() {
      return state.chat[state.currentChat];
    },

    stopResonse() {
      setState({
        is: { ...state.is, thinking: false },
      });
    },
  };
}

export const datas = {
  id: "chatcmpl-7AEK9Dlw96m5TejBKIKUgjyUHVTCa",
  object: "chat.completion",
  created: 1682672697,
  model: "gpt-3.5-turbo-0301",
  usage: {
    prompt_tokens: 34,
    completion_tokens: 303,
    total_tokens: 337,
  },
  choices: [
    {
      message: {
        role: "assistant",
        content:
          '好的，以下是一个简单的useKeyboard hooks。\n\n```jsx\nimport { useState, useEffect } from "react"; \n\nexport default function useKeyboard(targetKey) { \n  const [keyPressed, setKeyPressed] = useState(false); \n  \n  const downHandler = ({ key }) => {\n    if (key === targetKey) {\n      setKeyPressed(true); \n    } \n  }; \n  \n  const upHandler = ({ key }) => { \n    if (key === targetKey) { \n      setKeyPressed(false); \n    } \n  }; \n\n  useEffect(() => { \n    window.addEventListener("keydown", downHandler); \n    window.addEventListener("keyup", upHandler); \n    \n    return () => { \n      window.removeEventListener("keydown", downHandler); \n      window.removeEventListener("keyup", upHandler); \n    }; \n  }, []); \n\n  return keyPressed; \n}\n```\n\n这个hook将传递给它的按键(targetKey)与键盘按下事件进行比较。如果按键与传递进来的按键相同，那么hook的返回值(keyPressed)将被设置为true。否则，返回值为false。这个hook使用了React的useState和useEffect钩子函数。在useEffect中，我们添加按键按下和松开事件的监听器。当组件卸载时，我们移除这些监听器。',
      },
      finish_reason: "stop",
      index: 0,
    },
  ],
};
