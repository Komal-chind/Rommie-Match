import Head from 'next/head';
import Layout from '../components/layout/Layout';
import { Users, MessageSquare, Smile, Clock, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About Us - UniRooms</title>
        <meta name="description" content="Learn more about UniRooms, our mission, and our team." />
      </Head>
      <div className="relative bg-black min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-outfit">About UniRooms</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
            UniRooms is dedicated to helping university students find their perfect roommate match. Our platform uses smart matching, mood tracking, and secure messaging to make your search stress-free and successful.
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-left">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-white">Our Mission</h2>
            </div>
            <p className="text-gray-300">
              We believe everyone deserves a comfortable and happy living environment. Our mission is to connect students with compatible roommates, reduce conflicts, and foster lifelong friendships.
            </p>
          </Card>
          <Card className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-left">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-white">What We Offer</h2>
            </div>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Smart roommate matching based on lifestyle and preferences</li>
              <li>Secure, private messaging between users</li>
              <li>Mood tracking to improve communication</li>
              <li>Quick and easy onboarding process</li>
            </ul>
          </Card>
          <Card className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-left">
            <div className="flex items-center mb-4">
              <Smile className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-white">Why Choose Us?</h2>
            </div>
            <p className="text-gray-300">
              Our advanced algorithms and user-friendly design make finding a roommate simple and enjoyable. We prioritize your safety, privacy, and satisfaction every step of the way.
            </p>
          </Card>
          <Card className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 text-left">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold text-white">Fun Fact</h2>
            </div>
            <p className="text-gray-300">
              Did you know? Over 10,000 students have found their ideal roommate through UniRooms! Join our growing community and make your university life unforgettable.
            </p>
          </Card>
        </div>
        <div className="max-w-2xl mx-auto text-center mt-12">
          <h2 className="text-2xl font-bold text-white mb-2 font-outfit">Contact Us</h2>
          <p className="text-gray-300 mb-2">Have questions or feedback? Reach out to our team at <span className="text-pink-400">support@unirooms.com</span> or call <span className="text-pink-400">+1 (555) 123-4567</span>.</p>
        </div>
      </div>
    </Layout>
  );
} 