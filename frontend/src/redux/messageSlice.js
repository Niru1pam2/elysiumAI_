import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    artifacts: [],
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
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setArtifacts: (state, action) => {
      state.artifacts = Array.isArray(action.payload) ? action.payload : [];
    },
    addArtifact: (state, action) => {
      state.artifacts.push(action.payload);
    },
  },
});

export const { setMessages, addMessage, setArtifacts } = messageSlice.actions;

export default messageSlice.reducer;
