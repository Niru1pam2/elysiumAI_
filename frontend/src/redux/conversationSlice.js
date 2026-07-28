import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    conversations: [],
    selectedConversation: null,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      // unshift puts the new conversation at the very top of the list
      state.conversations.unshift(action.payload);
    },

    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },

    setConversationTitle: (state, action) => {
      const { title, conversationId } = action.payload;

      const conv = state.conversations.find((c) => c._id === conversationId);
      if (conv) {
        conv.title = title;
      }

      if (state.selectedConversation?._id === conversationId) {
        state.selectedConversation.title = title;
      }
    },
  },
});

export const {
  setConversations,
  addConversation,
  setSelectedConversation,
  setConversationTitle,
} = conversationSlice.actions;

// Standard Practice: Export the reducer as default
export default conversationSlice.reducer;
