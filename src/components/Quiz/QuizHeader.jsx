import React, { useState } from 'react';
import { Hamburger, ClipboardText, SpeakerHigh, SpeakerSimpleSlash, Cards, ChartBar, PlusSquare, PencilLine, PersonSimpleRun, X, Brain } from '@phosphor-icons/react';

const QuizHeader = ({ 
    currentProfile, 
    profiles, 
    currentProfileId,
    currentMode,
    onModeChange,
    onSwitchProfile,
    onAddNewProfile,
    soundEnabled, 
    onToggleSound, 
    onShowProgress 
}) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showManageProfiles, setShowManageProfiles] = useState(false);

    const getInitials = (name) => {
        if (!name) return 'NA';
        return name.substring(0, 2).toUpperCase();
    };

    const handleManageProfilesClick = () => {
        setShowManageProfiles(!showManageProfiles);
        setShowProfileDropdown(false);
    };

    const handleModeClick = (mode) => {
        if (mode === currentMode) return;
        onModeChange(mode);
        setShowMobileMenu(false);
    };

    return (
        <nav className="relative bg-gradient-to-r from-grade1-500 via-grade2-500 to-grade3-500 rounded-b-3xl shadow-2xl mb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-20 items-center justify-between">
                    
                    {/* Mobile menu button - LEFT SIDE */}
                    <div className="flex items-center sm:hidden">
                        <button 
                            type="button" 
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="relative inline-flex items-center justify-center rounded-2xl p-3 text-white hover:bg-white/20 backdrop-blur-sm transition-all"
                            aria-expanded={showMobileMenu}
                        >
                            <span className="sr-only">Open main menu</span>
                            {showMobileMenu ? (
                                <X size={24} weight="bold" />
                            ) : (
                                <Hamburger size={24} weight="bold" />
                            )}
                        </button>
                    </div>

                    {/* Logo Section - CENTER on mobile, LEFT on desktop */}
                    <div className="flex flex-1 items-center justify-center sm:justify-start">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-white/90 p-2 sm:p-2.5 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                                <Brain size={32} weight="duotone" className="text-grade2-600 sm:w-10 sm:h-10" />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">BrainBox</span>
                        </div>

                        {/* Desktop Mode Buttons */}
                        <div className="hidden sm:ml-8 sm:flex sm:gap-3">
                            <button 
                                onClick={() => handleModeClick('quiz')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-semibold transition-all transform hover:scale-105 ${
                                    currentMode === 'quiz' 
                                        ? 'bg-white text-grade1-600 shadow-lg' 
                                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                                }`}
                            >
                                <ClipboardText size={24} weight="duotone" />
                                <span>Quiz</span>
                            </button>
                            
                            <button 
                                onClick={() => handleModeClick('flashcard')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-semibold transition-all transform hover:scale-105 ${
                                    currentMode === 'flashcard' 
                                        ? 'bg-white text-grade2-600 shadow-lg' 
                                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                                }`}
                            >
                                <Cards size={24} weight="duotone" />
                                <span>Flash Cards</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Section - Sound & Profile */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        
                        {/* Sound Toggle */}
                        <button 
                            type="button" 
                            onClick={onToggleSound}
                            className="p-2.5 sm:p-3 rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-all transform hover:scale-110 backdrop-blur-sm"
                        >
                            <span className="sr-only">Toggle sound</span>
                            {soundEnabled ? (
                                <SpeakerHigh size={24} weight="duotone" />
                            ) : (
                                <SpeakerSimpleSlash size={24} weight="duotone" />
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setShowProfileDropdown(!showProfileDropdown);
                                    setShowManageProfiles(false);
                                }}
                                className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white text-grade1-600 font-bold text-base sm:text-lg hover:scale-110 transition-all shadow-lg"
                            >
                                <span className="sr-only">Open user menu</span>
                                {getInitials(currentProfile?.name)}
                            </button>

                            {/* Profile Dropdown Menu */}
                            {showProfileDropdown && (
                                <div className="absolute right-0 z-10 mt-3 w-56 origin-top-right rounded-2xl bg-white py-2 shadow-2xl border-4 border-purple-200">
                                    <button
                                        onClick={() => {
                                            onShowProgress();
                                            setShowProfileDropdown(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-5 py-3 text-left text-base font-semibold text-gray-700 hover:bg-purple-50 transition-all"
                                    >
                                        <ChartBar size={24} weight="duotone" className="text-purple-600" />
                                        <span>View Progress</span>
                                    </button>
                                    <button
                                        onClick={handleManageProfilesClick}
                                        className="flex items-center gap-3 w-full px-5 py-3 text-left text-base font-semibold text-gray-700 hover:bg-purple-50 transition-all"
                                    >
                                        <PersonSimpleRun size={24} weight="duotone" className="text-purple-600" />
                                        <span>Switch Profile</span>
                                    </button>
                                </div>
                            )}

                            {/* Manage Profiles Submenu */}
                            {showManageProfiles && (
                                <div className="absolute right-0 z-20 mt-3 w-64 origin-top-right rounded-2xl bg-white shadow-2xl border-4 border-grade3-200 p-3">
                                    <div className="space-y-2">
                                        {Object.values(profiles).map(profile => (
                                            <button 
                                                key={profile.id} 
                                                onClick={() => {
                                                    onSwitchProfile(profile.id);
                                                    setShowManageProfiles(false);
                                                    setShowProfileDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                                                    profile.id === currentProfileId 
                                                        ? 'bg-gradient-to-r from-grade3-400 to-grade3-500 text-white shadow-lg' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-grade3-100'
                                                }`}
                                            >
                                                {profile.name} {profile.id === currentProfileId && '✓'}
                                            </button>
                                        ))}
                                        
                                        {Object.keys(profiles).length < 3 ? (
                                            <button 
                                                onClick={() => {
                                                    onAddNewProfile();
                                                    setShowManageProfiles(false);
                                                    setShowProfileDropdown(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-100 transition-all font-semibold text-lg text-green-700 border-t-2 border-gray-200 mt-2"
                                            >
                                                <PlusSquare size={28} weight="duotone" />
                                                <span>Add New Profile</span>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    onAddNewProfile();
                                                    setShowManageProfiles(false);
                                                    setShowProfileDropdown(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-100 transition-all font-semibold text-lg text-red-700 border-t-2 border-gray-200 mt-2"
                                            >
                                                <PencilLine size={28} weight="duotone" />
                                                <span>Edit Profiles</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="sm:hidden border-t border-white/20">
                    <div className="space-y-2 px-4 py-4">
                        <button 
                            onClick={() => handleModeClick('quiz')}
                            className={`flex items-center gap-3 w-full text-left rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
                                currentMode === 'quiz'
                                    ? 'bg-white text-grade1-600 shadow-lg'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            <ClipboardText size={24} weight="duotone" />
                            <span>Quiz Mode</span>
                        </button>
                        
                        <button 
                            onClick={() => handleModeClick('flashcard')}
                            className={`flex items-center gap-3 w-full text-left rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
                                currentMode === 'flashcard'
                                    ? 'bg-white text-grade2-600 shadow-lg'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            <Cards size={24} weight="duotone" />
                            <span>Flash Cards</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default QuizHeader;