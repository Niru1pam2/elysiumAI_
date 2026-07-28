import { useEffect } from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Nav from "./Nav";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setMessages } from "../redux/messageSlice";

export default function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      if (!selectedConversation?._id) {
        dispatch(setMessages([]));
        return;
      }

      try {
        const messages = await getMessages(selectedConversation._id);

        if (isMounted && Array.isArray(messages)) {
          if (messages.length > 0) {
            dispatch(setMessages(messages));
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [dispatch, selectedConversation?._id]);

  return (
    // 🔴 Added h-full min-h-0 overflow-hidden so ChatInput stays pinned at the bottom!
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0d0f14] overflow-hidden relative">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}
