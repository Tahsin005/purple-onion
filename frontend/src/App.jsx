import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Github, Linkedin } from 'lucide-react';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import './styles/global.css';

// Blog List Page Component
const BlogListPage = () => {
  const navigate = useNavigate();

  const handlePostClick = (slug) => {
    navigate(`/post/${slug}`);
  };

  return <BlogList onPostClick={handlePostClick} />;
};

// Blog Post Page Component
const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleBackToList = () => {
    navigate('/');
  };

  return <BlogPost slug={slug} onBack={handleBackToList} />;
};

// Main App Component
const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const SocialLinks = () => (
    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
      <a
        href="https://github.com/Tahsin005"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
        className="social-link"
      >
        <Github size={24} />
      </a>
      <a
        href="https://www.linkedin.com/in/md-tahsin-ferdous/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
        className="social-link"
      >
        <Linkedin size={24} />
      </a>
    </div>
  );

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {!isOnline && (
          <div className="offline-banner">
            <span className="offline-icon">📡</span>
            <span>You're offline. Please connect to the internet.</span>
          </div>
        )}

        <header className="blog-header">
          <div className="header-content">
            <div className="header-left">
              <h1
                className="site-title"
                onClick={() => window.location.href = '/'}
                style={{ cursor: 'pointer' }}
              >
                PurpleOnion.sh
              </h1>
              <p className="site-tagline">[root@engine]:/var/log/development$ _</p>
            </div>
            {!isInstalled && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="btn btn-primary install-btn"
              >
                <span>&gt; ./install.sh</span>
              </button>
            )}
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<BlogListPage />} />
            <Route path="/post/:slug" element={<BlogPostPage />} />
          </Routes>
        </main>

        <footer className="blog-footer">
          <SocialLinks />
          <p>SYSTEM STATUS: ONLINE | BUILD: 2026.1.19 | © {new Date().getFullYear()} The Onion Stack</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;