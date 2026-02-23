// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
// import { motion } from 'framer-motion';
import { 
  Users, MessageSquare, Smile, ArrowRight, 
  Star, Sparkles, Heart, Clock, CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { auth, db } from '../lib/firebase';
import { signInUser, signUpUser, signOutUser, updateUserProfile } from '../lib/api';
// OR use the apiClient approach:
import apiClient from '../lib/api';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants (unused now)
  // const fadeInUp = { ... };
  // const staggerContainer = { ... };

  const testimonials = [
    {
      name: "Alex Johnson",
      avatar: "/avatars/alex.jpg",
      content: "Found my perfect roommate in just two weeks! The personality matching was spot on.",
      rating: 5,
      matchPercentage: 92
    },
    {
      name: "Jamie Smith",
      avatar: "/avatars/jamie.jpg",
      content: "The mood tracking feature helped us understand each other better and avoid conflicts.",
      rating: 4,
      matchPercentage: 87
    },
    {
      name: "Taylor Chen",
      avatar: "/avatars/taylor.jpg",
      content: "After three terrible roommate experiences, UniRooms finally helped me find someone compatible.",
      rating: 5,
      matchPercentage: 95
    }
  ];

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Smart Matching",
      description: "Our AI-powered algorithm matches you with roommates based on lifestyle, habits, and personality compatibility."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Safe Messaging",
      description: "Connect securely with potential roommates through our encrypted messaging platform."
    },
    {
      icon: <Smile className="h-6 w-6" />,
      title: "Mood Tracking",
      description: "Track and share mood patterns to improve communication and avoid conflicts."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Quick Process",
      description: "Find your ideal roommate in days, not weeks, with our streamlined matching system."
    }
  ];

  if (!mounted) return null;

  return (
    <Layout>
      <Head>
        <title>UniRooms - Find Your Perfect Roommate</title>
        <meta name="description" content="Find your ideal roommate based on personality matching and lifestyle compatibility" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="relative bg-black min-h-screen">
        {/* Dashed line background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.9),#000)]"></div>
          <div className="absolute top-0 left-0 right-0 h-full w-full bg-[radial-gradient(#ff49b037_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-full w-full bg-[linear-gradient(to_top,#f0118522,transparent_30%)]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-96 w-full bg-[linear-gradient(to_top,#9333ea22,transparent_100%)]"></div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-pink-600/20 to-purple-600/20 blur-3xl pointer-events-none"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div 
              className="flex flex-col items-center text-center max-w-3xl mx-auto"
            >
              <Badge className="mb-6 bg-pink-500 hover:bg-pink-600 text-white px-4 py-1.5 rounded-full">
                <Sparkles className="h-3.5 w-3.5 mr-2" /> New Feature: Mood Tracking
              </Badge>
              <h1 className="font-outfit text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-white">
                Find Your Perfect Roommate Match
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl font-light">
                Skip the roommate horror stories. Our advanced personality matching system finds you compatible roommates based on lifestyle, habits, and preferences.
              </p>
              <div 
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-pink-900/30 rounded-full">
                  <Link href="/auth/signup" className="flex items-center px-8 py-6 text-lg">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute top-20 left-20 hidden lg:block">
              <div 
                className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-pink-500/30 text-white text-sm flex items-center"
              >
                <CheckCircle2 className="h-4 w-4 text-pink-500 mr-2" /> 93% Match Rate
              </div>
            </div>
            <div className="absolute top-40 right-20 hidden lg:block">
              <div 
                className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/30 text-white text-sm flex items-center"
              >
                <Heart className="h-4 w-4 text-purple-500 mr-2" /> 10,000+ Happy Roommates
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-outfit">How UniRooms Works</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                Our scientifically-backed approach to roommate matching ensures greater compatibility and happier living situations.
              </p>
            </div>

            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <div key={index}>
                  <div className="bg-gradient-to-br from-black to-gray-900 p-1 rounded-3xl h-full">
                    <div className="bg-black rounded-3xl p-6 h-full border border-gray-800 hover:border-pink-500/30 transition-all duration-300 flex flex-col">
                      <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-2xl h-12 w-12 flex items-center justify-center mb-5">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2 font-outfit">{feature.title}</h3>
                      <p className="text-gray-400 flex-grow">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="relative py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-outfit">Simple 3-Step Process</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                Finding your perfect roommate has never been easier
              </p>
            </div>

            {/* Circles and connecting line */}
            <div className="relative w-full mx-auto max-w-4xl h-40 flex items-center justify-between">
              {/* Connection line between steps (desktop only) */}
              <div className="hidden md:block absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-pink-500 to-purple-600 z-0"></div>
              {/* Glowing dots at each step (desktop only) */}
              <div className="hidden md:block absolute top-1/2 left-[16.66%] -translate-y-1/2 z-10">
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/40 border-4 border-black"></div>
              </div>
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/40 border-4 border-black"></div>
              </div>
              <div className="hidden md:block absolute top-1/2 right-[16.66%] -translate-y-1/2 z-10">
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/40 border-4 border-black"></div>
              </div>
              {/* Step Circles */}
              <div className="flex-1 flex justify-center z-20">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse opacity-50 blur-md"></div>
                  <span>1</span>
                </div>
              </div>
              <div className="flex-1 flex justify-center z-20">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse opacity-50 blur-md"></div>
                  <span>2</span>
                </div>
              </div>
              <div className="flex-1 flex justify-center z-20">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse opacity-50 blur-md"></div>
                  <span>3</span>
                </div>
              </div>
            </div>
            {/* Step Titles and Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-4xl mx-auto">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-outfit">Take the Quiz</h3>
                <p className="text-gray-300">
                  Complete our personality quiz to help us understand your living preferences, habits, and personality traits.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-outfit">Browse Matches</h3>
                <p className="text-gray-300">
                  Review your personalized matches ranked by compatibility scores and detailed personality insights.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4 font-outfit">Connect Safely</h3>
                <p className="text-gray-300">
                  Message potential roommates through our platform and schedule meetings when you're ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-outfit">Happy Roommates</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                Join thousands who've found their perfect living match
              </p>
            </div>

            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <div key={index}>
                  <div className="group">
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 rounded-3xl">
                      <Card className="border-0 bg-black rounded-3xl overflow-hidden h-full">
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Avatar className="h-14 w-14 mr-4 ring-2 ring-pink-500/30 ring-offset-2 ring-offset-black">
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                              <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-xl text-white font-outfit">{testimonial.name}</CardTitle>
                              <div className="flex items-center mt-1 gap-2">
                                <div className="flex text-pink-500">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4" fill={i < testimonial.rating ? "currentColor" : "none"} />
                                  ))}
                                </div>
                                <div className="text-sm text-gray-400 flex items-center gap-1">
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-pink-500"></span>
                                  <span className="text-gray-300">{testimonial.matchPercentage}% Match</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="text-gray-300">{testimonial.content}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-600/20 via-purple-600/10 to-transparent pointer-events-none"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div 
              className="max-w-4xl mx-auto bg-gradient-to-br from-black to-gray-900 p-0.5 rounded-3xl overflow-hidden"
            >
              <div className="bg-black/70 backdrop-filter backdrop-blur-lg rounded-3xl p-12 border border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                <div className="absolute -top-24 -right-24 h-64 w-64 bg-pink-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit text-white">Ready to Find Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">Perfect Roommate</span>?</h2>
                  <p className="text-xl text-gray-300 mb-10 max-w-2xl">
                    Join UniRooms today and start your journey to better living.
                  </p>
                  <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-xl shadow-pink-900/20">
                    <Link href="/auth/signup" className="flex items-center px-8 py-6 text-lg">
                      Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}