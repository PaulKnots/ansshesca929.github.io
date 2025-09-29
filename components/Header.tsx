
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, navigateTo }) => {
  const NavButton: React.FC<{ page: Page; label: string }> = ({ page, label }) => (
    <button
      onClick={() => navigateTo(page)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        currentPage === page
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9zm2 12a1 1 0 10-2 0v-2a1 1 0 102 0v2zM9 7a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H6zm-1-3a1 1 0 011-1h.01a1 1 0 110 2H6a1 1 0 01-1-1zm12-1a1 1 0 100 2h.01a1 1 0 100-2h-.01zM12 7a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1zm-1 4a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800 ml-3">Answer Sheet Scanner</h1>
          </div>
          <nav className="flex items-center space-x-2">
            <NavButton page={Page.KEY_ENTRY} label="Answer Key" />
            <NavButton page={Page.SCANNING} label="Scan" />
            <NavButton page={Page.SAVED_LIST} label="Saved Results" />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
