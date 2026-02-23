// components/layout/Footer.js
import Link from 'next/link';
import { Heart, Users, MessageSquare, Smile, Clock, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-black text-gray-300 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8),#000)]"></div>
        <div className="absolute top-0 left-0 right-0 h-full w-full bg-[radial-gradient(#ff49b017_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-full w-full bg-[linear-gradient(to_bottom,#f0118512,transparent_70%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-full w-full bg-[linear-gradient(to_bottom,#9333ea12,transparent_100%)]"></div>
      </div>
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-white inline-block font-outfit">
              UniRooms
            </Link>
            <p className="text-gray-400 max-w-md text-lg">
              Finding the perfect roommate shouldn't be stressful. UniRooms uses personality quizzes and mood matching to help you find your ideal living partner.
            </p>
            <div className="flex items-center text-gray-400 mt-4">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1.5 text-pink-500" />
              <span>for better living</span>
            </div>

            {/* Feature Icons */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center text-gray-400 gap-2">
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-1.5 rounded-lg">
                  <Users className="h-4 w-4 text-pink-500" />
                </div>
                <span>Smart Matching</span>
              </div>
              <div className="flex items-center text-gray-400 gap-2">
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-1.5 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-pink-500" />
                </div>
                <span>Safe Messaging</span>
              </div>
              <div className="flex items-center text-gray-400 gap-2">
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-1.5 rounded-lg">
                  <Smile className="h-4 w-4 text-pink-500" />
                </div>
                <span>Mood Tracking</span>
              </div>
              <div className="flex items-center text-gray-400 gap-2">
                <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-1.5 rounded-lg">
                  <Clock className="h-4 w-4 text-pink-500" />
                </div>
                <span>Quick Process</span>
              </div>
            </div>
          </div>
          
          {/* About & Contact */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 pb-2 border-b border-gray-800">About & Contact</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center">
                  <span className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 h-1.5 w-1.5 rounded-full mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center">
                  <span className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Contact Us
                </Link>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2 text-pink-500" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 pb-2 border-b border-gray-800">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center">
                  <span className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center">
                  <span className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center">
                  <span className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 h-1.5 w-1.5 rounded-full mr-2"></span>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© {currentYear} UniRooms. All rights reserved.</p>
          
          {/* Social Icons */}
          <div className="mt-6 md:mt-0 flex space-x-4">
            <a href="#" className="group">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-0.5 rounded-full">
                <div className="bg-black rounded-full p-2 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-purple-600 transition-all duration-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </div>
              </div>
            </a>
            
            <a href="#" className="group">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-0.5 rounded-full">
                <div className="bg-black rounded-full p-2 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-purple-600 transition-all duration-300">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </a>
            
            <a href="#" className="group">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-0.5 rounded-full">
                <div className="bg-black rounded-full p-2 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-purple-600 transition-all duration-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </a>
            
            <a href="#" className="group">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-0.5 rounded-full">
                <div className="bg-black rounded-full p-2 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-purple-600 transition-all duration-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
      
      {/* Accent border */}
      <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
    </footer>
  );
}