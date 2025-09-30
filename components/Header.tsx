
import React from 'react';
import { AppState } from '../types';
import { KeyIcon, CameraIcon, ClipboardListIcon, PencilIcon } from './icons/Icons';

interface HeaderProps {
    appState: AppState;
    navigateTo: (state: AppState) => void;
    hasKey: boolean;
    onEditKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ appState, navigateTo, hasKey, onEditKey }) => {
    
    const NavButton: React.FC<{
        state: AppState;
        icon: React.ReactNode;
        label: string;
        disabled?: boolean;
    }> = ({ state, icon, label, disabled }) => (
        <button
            onClick={() => navigateTo(state)}
            disabled={disabled}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-medium
            ${appState === state ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 hover:bg-teal-50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                     <div className="bg-teal-600 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">AI Sheet Scanner</h1>
                </div>
                <nav className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
                    <NavButton state="KEY_INPUT" icon={<KeyIcon />} label="Answer Key" disabled={!hasKey} />
                    <NavButton state="SCANNING" icon={<CameraIcon />} label="Scan" disabled={!hasKey} />
                    <NavButton state="HISTORY" icon={<ClipboardListIcon />} label="History" />
                     {hasKey && appState !== 'KEY_INPUT' && (
                        <button
                            onClick={onEditKey}
                            className="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-medium bg-white text-slate-600 hover:bg-yellow-50"
                            title="Edit Answer Key"
                        >
                            <PencilIcon />
                            <span>Edit Key</span>
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
