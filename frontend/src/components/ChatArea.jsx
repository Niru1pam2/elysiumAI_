import { useEffect } from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Nav from "./Nav";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setArtifacts, setMessages } from "../redux/messageSlice";

export default function ChatArea({ onOpenMobileSidebar }) {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      dispatch(setMessages([]));
      dispatch(setArtifacts([]));
      if (!selectedConversation?._id) {
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
        return;
      }

      try {
        const messages = await getMessages(selectedConversation._id);

        if (isMounted && Array.isArray(messages)) {
          if (messages.length > 0) {
            dispatch(setMessages(messages));
            const latestArtifactMessage = [...messages]
              .reverse()
              .find((msg) => msg.artifacts && msg.artifacts.length > 0);

            dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
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
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0d0f14] overflow-hidden relative">
      {/* Forward prop to Nav */}
      <Nav onOpenMobileSidebar={onOpenMobileSidebar} />
      <MessageList />
      <ChatInput />
    </div>
  );
}
