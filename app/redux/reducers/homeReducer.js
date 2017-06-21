import {SET_TASKS,SET_HEADER, SET_PROPOSED, SET_TOKEN} from "../actions/actions";

let reducer = {};

reducer.proposed = function(state = [], action) {
  switch (action.type) {
    case SET_PROPOSED:
      return action.data;
    default:
      return state;
  }
}

reducer.tasks = function(state = [], action) {
  switch (action.type) {
    case SET_TASKS:
      return action.data
    default:
      return state;
  }
}

reducer.token = function(state = '', action) {
  switch (action.type) {
    case SET_TOKEN:
      return action.data
    default:
      return state
  }
}

reducer.header = function(state = "", action) {
  switch (action.type) {
    case SET_HEADER:
      return action.header;
    default:
      return state;
  }
}

export default reducer;