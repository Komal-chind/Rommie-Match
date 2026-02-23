import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow = () => {
  const { activeChat, messages, sendMessage, markMessagesAsRead } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when chat is active
  useEffect(() => {
    if (activeChat) {
      markMessagesAsRead();
    }
  }, [activeChat, markMessagesAsRead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage.trim());
    setNewMessage('');
  };

  if (!activeChat) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-4"
      >
        <div className="w-16 h-16 mb-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Select a Conversation</h3>
        <p className="text-gray-400">Choose a chat from the list to start messaging</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-gray-800 bg-gray-900">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 mr-3">
          {activeChat.otherUser.photoURL ? (
            <Image
              src={activeChat.otherUser.photoURL}
              alt={activeChat.otherUser.name}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 text-white">
              {activeChat.otherUser.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-gray-200">{activeChat.otherUser.name}</h2>
          <p className="text-sm text-gray-400">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        <AnimatePresence>
          {messages.map((message) => {
            const isOwnMessage = message.senderId === user.uid;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
              >
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img
                      src={activeChat.otherUser.photoURL || '/default-avatar.png'}
                      alt={activeChat.otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`max-w-[70%] ${isOwnMessage ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-gray-800 text-gray-200'} rounded-lg p-3`}>
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {message.timestamp?.toDate ? format(message.timestamp.toDate(), 'h:mm a') : 'Sending...'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="p-4 border-t border-gray-800 bg-gray-900"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-700 bg-gray-800 text-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default ChatWindow; 