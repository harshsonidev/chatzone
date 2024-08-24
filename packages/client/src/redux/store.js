import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import thunk from "redux-thunk";

const appReducer = combineReducers({
  userReducer
});

export const store = configureStore({
  reducer: appReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: [thunk]
});

export const persistedStore = store;
