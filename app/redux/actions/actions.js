import * as ac from "./actionCreator";
export const SET_HEADER = "SET_HEADER";
export const SET_TOKEN = "SET_TOKEN";

import {getTasks, setTasks, updateTask, addTask, deleteTask, changePositions, SET_TASKS, CHANGE_POSITIONS} from "./taskActions";
export {getTasks, setTasks, updateTask, addTask, deleteTask, changePositions, SET_TASKS, CHANGE_POSITIONS};
import helpers from "../../helperFunctions/helpers";

let setCookie = helpers.setCookie;

export const initApp = ac.Action(SET_HEADER);
export const setToken = ac.Action(SET_TOKEN);


export const tryLogin = function(data) {
  const setT = (dispatch,data) => {
    if(data.length > 10) {
      setCookie("token", data);
      dispatch(setToken({data: data}));
    }
  }
  return ac.FetchPostAsync("/api/login", data, setT);
}