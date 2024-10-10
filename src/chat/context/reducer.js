export default function reducer(state, action = {}) {
  const { type, payload = {}, isConfig } = action;
  switch (type) {
    case "CHANGE_MESSAGE":
      return {
        ...state,
        ...payload,
      };
    case "IS_CONFIG":
      return {
        ...state,
        isConfig,
      };
    case "SET_STATE":
      console.log(state)
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
