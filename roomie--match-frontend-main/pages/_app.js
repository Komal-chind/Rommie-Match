import { useEffect } from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { ChatProvider } from '../contexts/ChatContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Remove the server-side injected CSS when running in browser
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <Component {...pageProps} />
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp;