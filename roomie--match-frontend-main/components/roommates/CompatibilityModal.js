//CompatibilityModal.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CompatibilityChart from '../dashboard/CompatibilityChart';

const CompatibilityModal = ({ roommate, currentUser, onClose }) => {
  const [compatibility, setCompatibility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCompatibility = async () => {
      try {
        setIsLoading(true);
        // Get compatibility data from Firestore through backend API
        const token = await currentUser.getIdToken();
        const response = await fetch(`/api/roommates/compatibility`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: currentUser.uid,
            roommateId: roommate.id
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setCompatibility(data);
        } else {
          console.error('Failed to fetch compatibility data');
        }
      } catch (error) {
        console.error('Error fetching compatibility data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompatibility();
  }, [roommate.id, currentUser]);

  const handleStartChat = () => {
    router.push(`/chat?recipient=${roommate.id}`);
    onClose();
  };

  // Calculate overall compatibility percentage
  const overallScore = compatibility ? 
    Math.round((
      compatibility.lifestyle + 
      compatibility.cleanliness + 
      compatibility.schedule + 
      compatibility.social + 
      compatibility.values
    ) / 5) : 0;

  // Generate compatibility text based on score
  const getCompatibilityText = (score) => {
    if (score >= 85) return "Excellent Match";
    if (score >= 70) return "Good Match";
    if (score >= 50) return "Average Match";
    if (score >= 30) return "Below Average Match";
    return "Poor Match";
  };

  // Get text color based on score
  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    if (score >= 30) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold">Compatibility with {roommate.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing compatibility...</p>
            </div>
          ) : compatibility ? (
            <div className="space-y-6">
              {/* Overall compatibility score */}
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2 transition-colors duration-300 ease-in-out">
                  <span className={getScoreColor(overallScore)}>{overallScore}%</span>
                </div>
                <p className="text-xl font-medium">
                  {getCompatibilityText(overallScore)}
                </p>
              </div>
              
              {/* Visual representation */}
              <div className="h-64">
                <CompatibilityChart compatibility={compatibility} />
              </div>
              
              {/* Compatibility breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Lifestyle</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${compatibility.lifestyle}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">{compatibility.lifestyle}%</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cleanliness</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${compatibility.cleanliness}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">{compatibility.cleanliness}%</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Schedule</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${compatibility.schedule}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">{compatibility.schedule}%</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Social</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${compatibility.social}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">{compatibility.social}%</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Values</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${compatibility.values}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">{compatibility.values}%</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium">Compatible Housing Preferences</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {compatibility.housingMatches ? 
                      `${compatibility.housingMatches} matching preferences` : 
                      'No data available'}
                  </p>
                </div>
              </div>
              
              {/* Compatibility notes */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Compatibility Highlights</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  {compatibility.highlights && compatibility.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                  {(!compatibility.highlights || compatibility.highlights.length === 0) && (
                    <li>Compatibility analysis based on your profile preferences</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Could not load compatibility data. Please try again later.</p>
            </div>
          )}
        </div>
        
        {/* Modal footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex flex-wrap gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={() => router.push(`/profile/${roommate.id}`)}
            className="px-4 py-2 border border-blue-500 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
          >
            View Full Profile
          </button>
          
          <button
            onClick={handleStartChat}
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityModal;