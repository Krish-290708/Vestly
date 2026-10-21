'use client';

import React, { useState, useEffect } from 'react';
import { GrantProvider } from '@/contexts/GrantContext';
import AppSidebar from '@/components/layout/AppSidebar';
import AppTopBar from '@/components/layout/AppTopBar';
import MobileNav from '@/components/layout/MobileNav';
import FirstVisitNotice from '@/components/layout/FirstVisitNotice';
import CommandPalette from '@/components/layout/CommandPalette';
import Footer from '@/components/layout/Footer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Restore sidebar state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vestly_sidebar_collapsed');
      if (stored === 'true') {
        setCollapsed(true);
      }
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('vestly_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  return (
    <GrantProvider>
      <div className="min-h-screen flex bg-paper text-ink font-sans antialiased">
        {/* Desktop Collapsible Sidebar */}
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar with Breadcrumbs, Search, Theme, User */}
          <AppTopBar
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Dismissible educational disclaimer banner */}
          <FirstVisitNotice />

          {/* Page Content Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Mobile Navigation Drawer & Bottom Bar */}
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpen={() => setIsMobileMenuOpen(true)}
        />

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </GrantProvider>
  );
}

