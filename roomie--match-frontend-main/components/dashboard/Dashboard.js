import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useChat } from '../../contexts/ChatContext';

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { chats } = useChat();

  const handleChatClick = () => {
    // If there are existing chats, navigate to the most recent one
    if (chats && chats.length > 0) {
      router.push(`/messages?chatId=${chats[0].id}`);
    } else {
      // If no chats exist, just go to the messages page
      router.push('/messages');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 text-white text-2xl">
                  {user?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{user?.name || 'Anonymous'}</p>
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            className="mt-2 px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700 transition"
            onClick={() => router.push('/profile')}
          >
            Update Profile
          </button>
        </div>

        {/* My Listings Card */}
        <Link href="/my-listings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">My Listings</h2>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-medium">View Listings</p>
              <p className="text-gray-600 text-sm">Manage your property listings</p>
            </div>
          </div>
        </Link>

        {/* Saved Listings Card */}
        <Link href="/saved-listings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Saved Listings</h2>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">View Saved</p>
              <p className="text-gray-600 text-sm">Check your saved properties</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; 