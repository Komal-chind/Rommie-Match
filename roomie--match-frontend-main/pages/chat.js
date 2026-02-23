import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ChatInterface from '../components/chat/ChatInterface';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Chat() {
  const router = useRouter();
  const { chatId } = router.query;
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  // Set selected chat from URL query parameter
  useEffect(() => {
    if (chatId) {
      setSelectedChatId(chatId);
    }
  }, [chatId]);

  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get chats where the current user is a participant
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('participants', 'array-contains', user.uid),
          orderBy('lastMessageTimestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        // Prepare chat data with other participant information
        const chatData = [];
        
        for (const docSnapshot of querySnapshot.docs) {
          const chat = docSnapshot.data();
          
          // Get the other participant's ID
          const otherParticipantId = chat.participants.find(id => id !== user.uid);
          
          if (otherParticipantId) {
            // Fetch the other participant's data
            try {
              const userDocRef = doc(db, 'users', otherParticipantId);
              const userSnapshot = await getDoc(userDocRef);
              
              if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                
                chatData.push({
                  id: docSnapshot.id,
                  lastMessage: chat.lastMessage || "No messages yet",
                  lastMessageTime: chat.lastMessageTimestamp?.toDate() || null,
                  otherUser: {
                    id: otherParticipantId,
                    name: userData.name || userData.displayName || 'User',
                    university: userData.university || ''
                  }
                });
                
                // If this is the selected chat, store the other user data
                if (docSnapshot.id === selectedChatId) {
                  setOtherUser({
                    id: otherParticipantId,
                    name: userData.name || userData.displayName || 'User',
                    university: userData.university || ''
                  });
                }
              }
            } catch (error) {
              console.error(`Error fetching user data for ID ${otherParticipantId}:`, error);
            }
          }
        }
        
        setChats(chatData);
        
        // If no chat is selected and we have at least one chat, select the first one
        if (!selectedChatId && chatData.length > 0 && !chatId) {
          setSelectedChatId(chatData[0].id);
          
          // Set other user data for the selected chat
          if (chatData[0].otherUser) {
            setOtherUser(chatData[0].otherUser);
          }
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, selectedChatId, chatId]);

  // Format date to show either time or date depending on when the message was sent
  const formatMessageTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date);
    
    // If message is from today, show time
    if (messageDate >= today) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message is from this week, show day of week
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (messageDate >= weekAgo) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-black text-gray-200 relative">
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-purple-900/20 via-pink-800/10 to-transparent pointer-events-none"></div>
        
        {/* Main content */}
        <Navbar />
        <div className="flex-grow flex mt-24 mb-20">  
          {/* Chat list sidebar */}
          <div className="w-80 bg-gray-900/60 backdrop-blur-sm border-r border-gray-800 flex flex-col rounded-tl-xl mx-4 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800">
              <h2 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Conversations</h2>
            </div>
            
            {loading ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-gray-400 p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-pink-400 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-center">No conversations yet.</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md shadow-lg shadow-pink-600/20 hover:shadow-pink-600/40 transition-all duration-300 transform hover:scale-105"
                >
                  Find Roommates
                </button>
              </div>
            ) : (
              <div className="flex-grow overflow-auto">
                <ul className="divide-y divide-gray-800/50">
                  {chats.map((chat) => (
                    <li 
                      key={chat.id}
                      className={`hover:bg-gray-800/60 cursor-pointer transition-colors duration-200 ${
                        selectedChatId === chat.id 
                          ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-l-4 border-pink-500' 
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedChatId(chat.id);
                        setOtherUser(chat.otherUser);
                        router.push(`/chat?chatId=${chat.id}`, undefined, { shallow: true });
                      }}
                    >
                      <div className="px-5 py-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-200">{chat.otherUser.name}</h3>
                          {chat.lastMessageTime && (
                            <span className="text-xs text-gray-400">
                              {formatMessageTime(chat.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate">{chat.lastMessage}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Chat interface */}
          <div className="flex-grow bg-gray-900/40 rounded-tr-xl mx-4 shadow-xl overflow-hidden">
            {selectedChatId ? (
              <ChatInterface 
                chatId={selectedChatId} 
                otherUser={otherUser}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-pink-500 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 16v-4" />
                </svg>
                <p className="text-lg">Select a conversation to start chatting</p>
                <p className="text-sm mt-2 text-gray-500">Or find new roommates to connect with</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}