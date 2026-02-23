// components/layout/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Bell, MessageSquare, Search, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useChat } from '../../contexts/ChatContext';
import { useNotifications } from '../../contexts/NotificationContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [readMessageIds, setReadMessageIds] = useState(new Set());
  const [readNotificationIds, setReadNotificationIds] = useState(new Set());
  const { unreadCount, markAllMessagesAsRead } = useChat();
  const { unreadNotificationCount, markAllNotificationsAsRead, notifications: contextNotifications } = useNotifications();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNotificationsClick = async () => {
    setNotificationsOpen(v => !v);
    // Mark notifications as read when opened
    if (!notificationsOpen && notifications.length > 0) {
      const newReadIds = new Set([...readNotificationIds]);
      notifications.forEach(notif => {
        newReadIds.add(notif.id);
      });
      setReadNotificationIds(newReadIds);
      setNotifications([]);
    }
  };

  const handleMessagesClick = async () => {
    // Mark messages as read when clicked
    if (unreadMessages > 0) {
      const newReadIds = new Set([...readMessageIds]);
      notifications
        .filter(n => n.type === 'message')
        .forEach(msg => {
          newReadIds.add(msg.id);
        });
      setReadMessageIds(newReadIds);
      setUnreadMessages(0);
    }
  };

  // Load read status from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedReadMessages = localStorage.getItem(`readMessages_${user.uid}`);
      const savedReadNotifications = localStorage.getItem(`readNotifications_${user.uid}`);
      if (savedReadMessages) {
        setReadMessageIds(new Set(JSON.parse(savedReadMessages)));
      }
      if (savedReadNotifications) {
        setReadNotificationIds(new Set(JSON.parse(savedReadNotifications)));
      }
    }
  }, [user]);

  // Save read status to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`readMessages_${user.uid}`, JSON.stringify([...readMessageIds]));
      localStorage.setItem(`readNotifications_${user.uid}`, JSON.stringify([...readNotificationIds]));
    }
  }, [readMessageIds, readNotificationIds, user]);

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (!user) return;
    // Listen for match requests
    const requestsQuery = query(
      collection(db, 'roomie-users', user.uid, 'match-requests'),
      where('status', '==', 'pending')
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const reqs = snapshot.docs
        .map(doc => ({
          id: doc.id,
          type: 'match-request',
          ...doc.data()
        }))
        .filter(req => !readNotificationIds.has(req.id));
      setNotifications((prev) => [
        ...prev.filter(n => n.type !== 'match-request'),
        ...reqs
      ]);
    });
    // Listen for unread messages (per chat)
    const chatsQuery = query(collection(db, 'roomie-users', user.uid, 'chats'));
    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      let msgs = [];
      let totalUnread = 0;
      for (const chatDoc of snapshot.docs) {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find(id => id !== user.uid);
        if (!otherUserId) continue;
        const messagesQuery = query(
          collection(db, 'roomie-users', otherUserId, 'chats', chatDoc.id, 'messages'),
          where('receiverId', '==', user.uid),
          where('read', '==', false)
        );
        const unreadSnap = await getDocs(messagesQuery);
        const unreadMessages = unreadSnap.docs
          .map(doc => ({
            id: doc.id,
            type: 'message',
            ...doc.data(),
            chatId: chatDoc.id
          }))
          .filter(msg => !readMessageIds.has(msg.id));
        
        totalUnread += unreadMessages.length;
        msgs.push(...unreadMessages);
      }
      setUnreadMessages(totalUnread);
      setNotifications((prev) => [
        ...prev.filter(n => n.type !== 'message'),
        ...msgs
      ]);
    });
    return () => {
      unsubscribeRequests();
      unsubscribeChats();
    };
  }, [user, readMessageIds, readNotificationIds]);

  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    hover: { 
      scale: 1.05, 
      textShadow: "0 0 8px rgb(236, 72, 153, 0.8)",
      transition: { duration: 0.2, yoyo: Infinity, repeat: 1 }
    }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05, 
      transition: { duration: 0.2 },
      textShadow: "0 0 8px rgba(236, 72, 153, 0.8)" 
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)",
      transition: { duration: 0.2 } 
    },
    tap: { scale: 0.95 }
  };

  const mobileMenuVariants = {
    closed: { 
      opacity: 0, 
      height: 0, 
      transition: { 
        duration: 0.3, 
        ease: "easeInOut",
        when: "afterChildren" 
      } 
    },
    open: { 
      opacity: 1, 
      height: "auto", 
      transition: { 
        duration: 0.3, 
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.05 
      } 
    }
  };

  const mobileMenuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Find Roommates', path: '/roommates' },
    { title: 'About', path: '/about' },
  ];

  // Get background color based on scroll state
  const getNavbarBg = () => {
    if (isScrolled || isMobileMenuOpen) {
      return 'bg-black/95 backdrop-blur-md border-b border-pink-600/10';
    }
    return 'bg-transparent';
  };

  // Get text color based on scroll state
  const getTextColor = (isActive = false) => {
    return isActive ? 'text-pink-500' : 'text-gray-300 hover:text-pink-500';
  };

  // Mark a single notification as read
  const dismissNotification = async (notifId) => {
    if (!user) return;
    const notifRef = doc(db, 'roomie-users', user.uid, 'notifications', notifId);
    const notifSnap = await getDoc(notifRef);
    if (notifSnap.exists()) {
      await updateDoc(notifRef, { read: true });
    }
  };

  return (
    <motion.header 
      className={`fixed w-full z-50 transition-all duration-300 ${getNavbarBg()}`}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Gradient accent that rises from the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-pink-600/30 via-purple-600/30 to-pink-600/30"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div 
            variants={logoVariants} 
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300">
                UniRooms
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <motion.div key={link.path} variants={linkVariants} whileHover="hover">
                <Link 
                  href={link.path}
                  className={`relative text-sm font-medium transition-colors ${
                    router.pathname === link.path 
                      ? getTextColor(true)
                      : getTextColor()
                  }`}
                >
                  {link.title}
                  {router.pathname === link.path && (
                    <motion.span 
                      className="absolute -bottom-1 left-0 w-full h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                      layoutId="underline"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link href="/messages" onClick={markAllMessagesAsRead}>
                    <Button variant="ghost" size="icon" className="relative">
                      <MessageSquare className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-pink-500">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="relative">
                  <div className="relative inline-block">
                    <Button variant="ghost" size="icon" className="relative" onClick={() => { setNotificationsOpen(v => !v); if (!notificationsOpen) markAllNotificationsAsRead(); }}>
                      <Bell className="h-5 w-5" />
                      {unreadNotificationCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-pink-500">
                          {unreadNotificationCount}
                        </Badge>
                      )}
                    </Button>
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-pink-700/30 rounded-xl shadow-lg z-50">
                        <div className="p-4">
                          <h4 className="text-lg font-bold text-pink-400 mb-2">Notifications</h4>
                          {notifications.length === 0 ? (
                            <div className="text-gray-400 text-center py-4">No notifications.</div>
                          ) : (
                            notifications
                              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                              .map(n => (
                                <div key={n.id} className="border border-gray-800 rounded-lg p-3 mb-2 bg-gray-800/70 relative">
                                  <button
                                    className="absolute top-2 right-2 text-gray-400 hover:text-pink-400 text-lg font-bold"
                                    onClick={() => dismissNotification(n.id)}
                                    aria-label="Dismiss notification"
                                  >
                                    ×
                                  </button>
                                  <div className="font-medium text-gray-200">{n.senderName || 'Anonymous'}</div>
                                  <div className="text-sm text-gray-400">{n.message}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {n.createdAt?.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleString() : ''}
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-white/10 hover:bg-white/20">
                      <Avatar className="h-8 w-8 border-2 border-pink-500">
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-lg">
                          {user.displayName?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-900 text-white border border-pink-700/30" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Search className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="text-sm">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm">
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile menu button */}
            <motion.div 
              className="md:hidden"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-md border-t border-pink-600/10">
              {navLinks.map((link) => (
                <motion.div key={link.path} variants={mobileMenuItemVariants}>
                  <Link
                    href={link.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      router.pathname === link.path
                        ? 'text-pink-500'
                        : 'text-gray-300 hover:text-pink-500'
                    }`}
                  >
                    {link.title}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}