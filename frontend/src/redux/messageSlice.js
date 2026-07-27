import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
  },
  reducers: {
    setMessages: (state, action) => {
      // Safely ensure payload is always stored as an array
      if (Array.isArray(action.payload)) {
        state.messages = action.payload;
      } else if (
        action.payload?.messages &&
        Array.isArray(action.payload.messages)
      ) {
        state.messages = action.payload.messages;
      } else {
        state.messages = [];
      }
    },
    // Useful helper for appending new chat messages in real-time
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const { setMessages, addMessage } = messageSlice.actions;

export default messageSlice.reducer;
