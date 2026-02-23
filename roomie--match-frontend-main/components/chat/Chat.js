import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChatProvider } from '../../contexts/ChatContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

const Chat = () => {
  const router = useRouter();
  const { chatId } = router.query;

  return (
    <ChatProvider>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-gray-200">Messages</h2>
          </div>
          <ChatList />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Chat; 