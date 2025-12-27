'use client';

import { useEffect, useState } from 'react';

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error);
        });
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setIsInstalled(true);
      console.log('✅ App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Don't show install button if already installed or not available
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-4 max-w-sm">
        <p className="text-sm font-medium text-[var(--foreground)] mb-3">
          📱 Install Shivay Admin as an App
        </p>
        <p className="text-xs text-[var(--muted)] mb-4">
          Add this admin panel to your home screen for quick access
        </p>
        <button
          onClick={handleInstallClick}
          className="w-full px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[#5a1922] transition-colors text-sm"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
