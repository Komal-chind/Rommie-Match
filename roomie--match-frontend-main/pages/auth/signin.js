// pages/auth/signin.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, signin } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signin(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Animated gradient particles background effect
  const FloatingParticles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 blur-xl"
            style={{ 
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
            }}
            animate={{
              x: [Math.random() * 100, Math.random() * 100 - 50],
              y: [Math.random() * 100, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Sign In - UniRooms</title>
      </Head>

      <motion.div
        className="min-h-screen flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-black bg-gradient-to-t from-purple-900/20 to-black"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <FloatingParticles />
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <motion.div
              className="flex justify-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-white mb-2">Welcome back to UniRooms</h1>
            </motion.div>
            
            <motion.h2 
              className="mt-6 text-3xl font-extrabold text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Sign in to your account
            </motion.h2>
            <motion.p 
              className="mt-2 text-sm text-gray-300"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Continue your roommate search journey
            </motion.p>
          </div>

          <motion.div 
            className="card bg-gray-900/90 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-gray-800"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  className="bg-red-900/30 border-l-4 border-red-500 p-4 text-red-100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>{error}</p>
                </motion.div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 transition-all duration-300"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 transition-all duration-300"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-gray-700 rounded bg-gray-800"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-pink-400 hover:text-pink-300 transition-all duration-300 group">
                    Forgot your password?
                    <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600"></span>
                  </Link>
                </div>
              </div>

              <div>
                <motion.button
                  type="submit"
                  className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300"
                  disabled={loading}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex justify-center items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            className="mt-6 text-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-pink-400 hover:text-pink-300 transition-all duration-300 group">
                Sign up now
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600"></span>
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}