import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useChat } from '../contexts/ChatContext';
import Chat from '../components/chat/Chat';

const MessagesPage = () => {
  const router = useRouter();
  const { chatId } = router.query;
  const { chats, setActiveChat } = useChat();

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setActiveChat(chat);
      }
    }
  }, [chatId, chats, setActiveChat]);

  return (
    <div className="min-h-screen bg-gray-900 container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pink-400">Messages</h1>
        <p className="text-gray-300">Chat with your potential roommates</p>
      </div>
      <Chat />
    </div>
  );
};

export default MessagesPage; 