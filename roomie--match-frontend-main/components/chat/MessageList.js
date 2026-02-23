import { useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function MessageList({ messages }) {
  const { user } = useAuth();
  const endOfMessagesRef = useRef(null);

  // Scroll to bottom of messages on new message
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === user?.uid;
        
        return (
          <div 
            key={message.id} 
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                isOwnMessage 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none shadow-lg shadow-pink-500/20' 
                  : 'bg-gray-800 text-gray-200 rounded-bl-none shadow-md border border-gray-700'
              }`}
            >
              {!isOwnMessage && (
                <div className="font-medium text-xs mb-1 text-pink-400">
                  {message.senderName}
                </div>
              )}
              <div>{message.text}</div>
              <div 
                className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-pink-200' : 'text-gray-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
