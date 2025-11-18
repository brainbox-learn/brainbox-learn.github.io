import React, { useState } from 'react';
import { Hamburger, Exam, SpeakerHigh, SpeakerSimpleSlash, Cards, ChartBar, PlusSquare, PencilLine, PersonSimpleRun, X, Brain, BookOpen, Article, BookOpenText, Books, Users, Book, Leaf, Tree, TreePalm, ChatCircle, Waveform, Quotes } from '@phosphor-icons/react';
import { DOMAINS_CONFIG } from '../../data/words';
import { getAvatarIcon } from '../../utils/avatarIcons';

const ICON_MAP = {
    'Book': Book,
    'BookOpen': BookOpen,
    'BookOpenText': BookOpenText,
    'Leaf': Leaf,
    'Tree': Tree,
    'TreePalm': TreePalm,
    'ChatCircle': ChatCircle,
    'SpeakerHigh': SpeakerHigh,
    'Waveform': Waveform,
    'Quotes': Quotes,
    'Exam': Exam,
    'Article': Article,
};

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
    onShowProgress,
	onSelectDomain,
	onSelectSection,
	selectedDomain,
	selectedSection,
	onClose
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

    const handleDomainClick = (domainId) => {
		setShowMobileMenu(false);
        onSelectDomain(domainId);
        onClose();
    };

    const handleSectionClick = (domainId, sectionId) => {
		setShowMobileMenu(false);
        onSelectDomain(domainId);
        onSelectSection(sectionId);
        onClose();
    };

    const handleModeClick = (mode) => {
		setShowMobileMenu(false);
        if (mode === currentMode) return;
        onModeChange(mode);
        setShowMobileMenu(false);
    };

    // Get enabled domains from DOMAINS_CONFIG
    const enabledDomains = DOMAINS_CONFIG?.domains?.filter(d => d.enabled) || [];

    // Get icon component from icon name string
    const getIcon = (iconName) => {
        return ICON_MAP[iconName] || Book; // Fallback to Book icon
    };

	const AvatarIcon = getAvatarIcon(currentProfile?.avatar);

    return (
        <nav className="relative bg-gradient-to-r from-grade1-500 via-grade2-500 to-grade3-500 rounded-b-3xl shadow-2xl mb-2 sm:mb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex h-20 items-center justify-between">
                    
                    {/* Mobile menu button - LEFT SIDE */}
                    <div className="flex items-center">
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
                    <div className="absolute left-1/2 mr-2 sm:mr-3 transform -translate-x-1/2 sm:relative sm:left-0 sm:transform-none sm:flex sm:flex-1 sm:items-center sm:justify-between">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="bg-white/90 p-2 sm:p-2.5 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
								<Brain size={32} weight="duotone" className="text-grade2-600 sm:w-10 sm:h-10" />
							</div>
							<span className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">BrainBox</span>
						</div>

						{/* Desktop Mode Buttons */}
						<div className="hidden sm:flex sm:gap-3">
							<button 
								onClick={() => handleModeClick('quiz')}
								className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-semibold transition-all transform hover:scale-105 ${
									currentMode === 'quiz' 
										? 'bg-white text-grade1-600 shadow-lg' 
										: 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
								}`}
							>
								<Exam size={24} weight="duotone" />
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
                                <AvatarIcon size={24} weight="duotone" className="text-green-700" />
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
                                                <Users size={28} weight="duotone" />
                                                <span>Manage Profiles</span>
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
                <div className="absolute top-0 left-0 w-full border-t border-white/20 z-10 top-20 sm:w-80 bg-gradient-to-r from-grade1-500 via-grade2-500 to-grade3-500 rounded-3xl shadow-2xl backdrop-blur-sm">
                    <section className="sm:hidden space-y-2 px-4 py-4">
                        <h2 className="text-white text-2xl font-bold">Modes</h2>
                        <button 
                            onClick={() => handleModeClick('quiz')}
                            className={`sm:hidden flex items-center gap-3 w-full text-left rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
                                currentMode === 'quiz'
                                    ? 'bg-white text-grade1-600 shadow-lg'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            <Exam size={24} weight="duotone" />
                            <span>Quiz Mode</span>
                        </button>
                        
                        <button 
                            onClick={() => handleModeClick('flashcard')}
                            className={`sm:hidden flex items-center gap-3 w-full text-left rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
                                currentMode === 'flashcard'
                                    ? 'bg-white text-grade2-600 shadow-lg'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            <Cards size={24} weight="duotone" />
                            <span>Flash Cards</span>
                        </button>
                    </section>
                    
                    <section className="space-y-2 px-4 py-4">
                        <h2 className="text-white text-2xl font-bold">Learning Areas</h2>
                        
                        {enabledDomains.map(domain => {
                            const DomainIcon = getIcon(domain.icon);
                            
                            // Level-based domains (like Vocabulaire)
                            if (domain.organizationType === 'level-based') {
                                return (
                                    <button 
                                        key={domain.id}
                                        onClick={() => handleDomainClick(domain.id)}
                                        className={`flex items-center gap-3 w-full text-left rounded-2xl px-4 py-3 text-base font-semibold transition-all ${
                                            selectedDomain === domain.id
                                                ? 'bg-white text-grade2-600 shadow-lg'
                                                : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                    >
                                        <DomainIcon size={28} weight="duotone" />
                                        <span>{domain.name}</span>
                                    </button>
                                );
                            }
                            
                            // Topic-based domains (like Grammaire)
                            if (domain.organizationType === 'topic-based') {
                                return (
                                    <div key={domain.id}>
                                        <h2 className="text-white text-xl font-bold mt-2">{domain.name}</h2>
                                        {domain.sections
										?.filter(section => section.active !== false)
											.map(section => {
												const SectionIcon = getIcon(section.icon);
												return (
													<button 
														key={section.id}
														onClick={() => handleSectionClick(domain.id, section.id)}
														className={`flex items-center gap-3 w-full text-left rounded-2xl px-4 py-3 text-base font-semibold transition-all mb-2 ${
															selectedSection === section.id
																? 'bg-white text-grade2-600 shadow-lg'
																: 'bg-white/20 text-white hover:bg-white/30'
														}`}
													>
														<SectionIcon size={28} weight="duotone" />
														<span>{section.name}</span>
													</button>
												);
                                        })}
                                    </div>
                                );
                            }
                            
                            return null;
                        })}
                    </section>
                </div>
            )}
        </nav>
    );
};

export default QuizHeader;