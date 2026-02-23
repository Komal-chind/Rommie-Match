// components/dashboard/ResultsCard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { getPotentialMatches } from '../../lib/firestore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, MapPin } from 'lucide-react';

export default function ResultsCard({ hasTakenQuiz, onTakeQuiz, onRetakeQuiz, onPlayThisOrThat }) {
  const { user } = useAuth();
  const [potentialRoommates, setPotentialRoommates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMatches = async () => {
      try {
        const matches = await getPotentialMatches(user.uid);
        setPotentialRoommates(matches);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (potentialRoommates.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-white mb-6">No Matches Yet</h3>
          <div className="flex flex-col gap-4 items-center justify-center">
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-base font-semibold px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
              onClick={onTakeQuiz}
            >
              Take Quiz
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-base font-semibold px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
              onClick={onPlayThisOrThat}
            >
              Play This or That
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-white mb-4">Potential Roommates</h2>
      <div className="space-y-4">
        {potentialRoommates.map((roommate) => (
          <motion.div
            key={roommate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 rounded-xl p-4 border border-gray-800 hover:border-pink-500/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={roommate.photoURL} alt={roommate.name} />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                  {roommate.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{roommate.name}</h3>
                  <Badge className="bg-pink-500/20 text-pink-500 hover:bg-pink-500/30">
                    {roommate.compatibility}% Match
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{roommate.university}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{roommate.rating || 'New'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={() => {/* Handle view profile */}}
                  >
                    View Profile
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-pink-500/30 text-pink-500 hover:bg-pink-500/10"
                    onClick={() => {/* Handle message */}}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}