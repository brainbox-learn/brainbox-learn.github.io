import React, { useState } from 'react';
import { Trash, ArrowsClockwise } from '@phosphor-icons/react';
import { calculateOverallProgress } from '../../utils/statsCalculator';
import TransferModal from '../Transfer/TransferModal';

// Icons
import { DownloadSimple } from '@phosphor-icons/react';

const ProfileSelectionScreen = ({ 
    profiles, 
    onSelectProfile, 
    onCreateProfile, 
    onDeleteProfile,
    onImportProfile,
    wordsByCategory
}) => {
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedProfileForTransfer, setSelectedProfileForTransfer] = useState(null);
    
    const profileCount = Object.keys(profiles).length;
    const canCreateProfile = profileCount < 3;

    const handleCreateProfile = () => {
        const name = prompt("Enter profile name:");
        if (name && name.trim()) {
            onCreateProfile(name.trim());
        }
    };

    const handleOpenTransferForProfile = (profile, e) => {
        e.stopPropagation(); // Prevent profile selection
        setSelectedProfileForTransfer(profile);
        setShowTransferModal(true);
    };

    const handleOpenImportOnly = () => {
        setSelectedProfileForTransfer(null); // No profile = import-only mode
        setShowTransferModal(true);
    };

    const handleCloseTransfer = () => {
        setShowTransferModal(false);
        setSelectedProfileForTransfer(null);
    };

    const handleProfileImported = (importedProfile) => {
        const profileCount = Object.keys(profiles).length;
        const isExistingProfile = profiles[importedProfile.id] !== undefined;
        
        // Check if we're at the limit AND importing a NEW profile (not a merge)
        if (profileCount >= 3 && !isExistingProfile) {
            alert(
                '❌ Profile Limit Reached\n\n' +
                'You already have 3 profiles (the maximum allowed).\n\n' +
                'Please delete one profile before importing a new one.\n\n' +
                '💡 Tip: You can still update existing profiles by importing their transfer codes.'
            );
            handleCloseTransfer();
            return;
        }
        
        // Either we're under the limit, OR we're merging an existing profile
        onImportProfile(importedProfile);
        handleCloseTransfer();
        
        // Show success message
        if (isExistingProfile) {
            // Optional: Show merge success message
            setTimeout(() => {
                alert(`✅ Profile "${importedProfile.name}" has been updated with the latest progress!`);
            }, 100);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-100 p-8 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <h1 className="text-5xl font-bold text-green-800 text-center mb-12">🦊 Choose Your Profile</h1>
                <div className="grid gap-6">
                    {Object.values(profiles).map(profile => {
                        const stats = profile.stats || {};
                        const progressPercent = calculateOverallProgress(wordsByCategory, stats);
                        
                        return (
                            <div 
                                key={profile.id} 
                                className="bg-white rounded-3xl shadow-xl p-6 border-4 border-green-200 hover:scale-105 transition-transform"
                            >
                                <div className="flex justify-between items-center gap-4">
                                    <button 
                                        onClick={() => onSelectProfile(profile.id)} 
                                        className="flex-1 text-left"
                                    >
                                        <h2 className="text-3xl font-bold text-green-800 mb-2">{profile.name}</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                                                <div 
                                                    className="bg-green-500 h-4 rounded-full transition-all" 
                                                    style={{ width: `${progressPercent}%` }} 
                                                />
                                            </div>
                                            <span className="text-lg font-semibold text-green-700">{progressPercent}%</span>
                                        </div>
                                    </button>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => handleOpenTransferForProfile(profile, e)} 
                                            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
                                            title="Transfer Profile"
                                        >
                                            <ArrowsClockwise size={24} weight="bold" />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteProfile(profile.id)} 
                                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all" 
                                            title="Delete Profile"
                                        >
                                            <Trash size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {canCreateProfile && (
                        <button 
                            onClick={handleCreateProfile} 
                            className="bg-green-100 border-4 border-dashed border-green-400 rounded-3xl p-8 hover:bg-green-200 transition-all text-center"
                        >
                            <div className="text-6xl mb-4">➕</div>
                            <div className="text-2xl font-bold text-green-800">Create New Profile</div>
                            <div className="text-sm text-green-600 mt-2">
                                {3 - profileCount} slot{3 - profileCount !== 1 ? 's' : ''} available
                            </div>
                        </button>
                    )}

                    {/* Import Profile Button - Always visible */}
                    <button 
                        onClick={handleOpenImportOnly} 
                        className="bg-blue-100 border-4 border-blue-400 rounded-3xl p-8 hover:bg-blue-200 transition-all text-center"
                    >
						{/* margin center */}
                        <div className="text-6xl mb-4 flex justify-center items-center"><DownloadSimple size={56} weight="duotone" /></div>
                        <div className="text-2xl font-bold text-blue-800">Import Profile from Code</div>
                        <div className="text-sm text-blue-600 mt-2">
                            {profileCount >= 3 
                                ? 'Update existing profiles or delete one to add new'
                                : 'Transfer your progress from another device'
                            }
                        </div>
                    </button>
                </div>
            </div>

            <TransferModal
                isOpen={showTransferModal}
                onClose={handleCloseTransfer}
                profile={selectedProfileForTransfer}
                onProfileImported={handleProfileImported}
            />
        </div>
    );
};

export default ProfileSelectionScreen;