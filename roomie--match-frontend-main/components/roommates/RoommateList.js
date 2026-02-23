import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import RoommateCard from './RoommateCard';

const RoommateList = ({ currentUser, filters }) => {
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoommates = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch accepted matches
        const matchesSnapshot = await getDocs(collection(db, 'roomie-users', currentUser.uid, 'matches'));
        const acceptedIds = matchesSnapshot.docs.map(doc => doc.id);
        // Build the query based on filters
        let roommatesQuery = query(
          collection(db, 'roomie-users')
        );
        const querySnapshot = await getDocs(roommatesQuery);
        // Filter out the current user and accepted matches
        const roommatesList = querySnapshot.docs
          .filter(doc => doc.id !== currentUser.uid && !acceptedIds.includes(doc.id))
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        setRoommates(roommatesList);
      } catch (err) {
        setError("Failed to fetch roommates");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchRoommates();
    }
  }, [currentUser, filters]);

  if (loading) {
    return (
      <div className="py-10 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
          <p className="text-gray-600">Finding potential roommates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white rounded-lg p-8 text-center my-8">
        <p className="text-pink-400 font-bold text-xl mb-4">{error}</p>
        <p className="text-gray-300 mb-6">We couldn't retrieve the roommate listings at this time.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (roommates.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center my-8 border border-gray-200">
        <img 
          src="/images/no-results.svg" 
          alt="No roommates found" 
          className="w-48 h-48 mx-auto mb-6"
          onError={(e) => e.target.style.display = 'none'}
        />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Roommates Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We couldn't find any roommates matching your criteria. Try adjusting your filters or check back later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md"
        >
          Refresh Results
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Potential Roommates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roommates.map((roommate) => (
          <RoommateCard key={roommate.id} roommate={roommate} />
        ))}
      </div>
    </div>
  );
};

export default RoommateList;