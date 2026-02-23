import { useChat } from '../../contexts/ChatContext';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

const ChatList = () => {
  const { chats, activeChat, setActiveChat, loading } = useChat();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="w-16 h-16 mb-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">No Conversations Yet</h3>
        <p className="text-gray-400">Start chatting with potential roommates!</p>
      </div>
    );
  }

  // Deduplicate chats by otherUser.id, keeping only the most recent chat per user
  const uniqueChatsMap = new Map();
  chats.forEach(chat => {
    const userId = chat.otherUser.id;
    if (!uniqueChatsMap.has(userId)) {
      uniqueChatsMap.set(userId, chat);
    } else {
      // If already exists, keep the one with the latest lastMessageTime
      const existing = uniqueChatsMap.get(userId);
      const existingTime = existing.lastMessageTime ? existing.lastMessageTime.toMillis?.() || existing.lastMessageTime.getTime?.() || 0 : 0;
      const newTime = chat.lastMessageTime ? chat.lastMessageTime.toMillis?.() || chat.lastMessageTime.getTime?.() || 0 : 0;
      if (newTime > existingTime) {
        uniqueChatsMap.set(userId, chat);
      }
    }
  });
  const uniqueChats = Array.from(uniqueChatsMap.values());

  return (
    <div className="h-full overflow-y-auto">
      {uniqueChats.map((chat) => (
        <div
          key={chat.id}
          className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${
            activeChat?.id === chat.id ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/30' : ''
          }`}
          onClick={() => setActiveChat(chat)}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                {chat.otherUser.photoURL ? (
                  <Image
                    src={chat.otherUser.photoURL}
                    alt={chat.otherUser.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 text-white">
                    {chat.otherUser.name.charAt(0)}
                  </div>
                )}
              </div>
              {chat.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {chat.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-200 truncate">
                  {chat.otherUser.name}
                </h3>
                {chat.lastMessageTime && (
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(chat.lastMessageTime.toDate(), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 truncate">
                {chat.lastMessage || 'Start a conversation'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList; 