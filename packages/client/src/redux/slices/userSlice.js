import { createSlice } from "@reduxjs/toolkit";

const defaultState = {
  users: [],
  friendRequests: [],
  user: {},
  selectedUser: {}
};
export const userSlice = createSlice({
  name: "user",
  initialState: defaultState,
  reducers: {
    setAllUsers: (state, action) => ({
      ...state,
      users: action.payload
    }),
    setUser: (state, action) => ({
      ...state,
      user: action.payload
    }),
    setSelectedUser: (state, action) => ({
      ...state,
      selectedUser: action.payload
    }),
    setFriendRequests: (state, action) => ({
      ...state,
      friendRequests: action.payload
    })
  }
});

export const { setAllUsers, setUser, setSelectedUser, setFriendRequests } =
  userSlice.actions;

export default userSlice.reducer;
