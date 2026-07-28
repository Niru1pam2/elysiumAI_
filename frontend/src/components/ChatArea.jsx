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
    const getMessage = async () => {
      if (selectedConversation) {
        if (selectedConversation.title == "New Chat") return;
        const messages = await getMessages(selectedConversation?._id);
        dispatch(setMessages(messages));
      }
    };

    getMessage();
  }, [dispatch, selectedConversation, selectedConversation?._id]);
  return (
    <div className="flex-1 flex flex-col">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}
