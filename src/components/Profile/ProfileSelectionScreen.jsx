import React from 'react';
import { Trash } from '../UI/Icons';
import { calculateOverallProgress } from '../../utils/statsCalculator';
// import { WORDS_BY_CATEGORY } from '../../data/words';

const ProfileSelectionScreen = ({ 
    profiles, 
    onSelectProfile, 
    onCreateProfile, 
    onDeleteProfile,
	wordsByCategory
}) => {
    const profileCount = Object.keys(profiles).length;
    const canCreateProfile = profileCount < 3;

    const handleCreateProfile = () => {
        const name = prompt("Enter profile name:");
        if (name && name.trim()) {
            onCreateProfile(name.trim());
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
                            <div key={profile.id} className="bg-white rounded-3xl shadow-xl p-6 border-4 border-green-200 flex justify-between items-center hover:scale-105 transition-transform">
                                <button onClick={() => onSelectProfile(profile.id)} className="flex-1 text-left">
                                    <h2 className="text-3xl font-bold text-green-800 mb-2">{profile.name}</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                                            <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                                        </div>
                                        <span className="text-lg font-semibold text-green-700">{progressPercent}%</span>
                                    </div>
                                </button>
                                <button onClick={() => onDeleteProfile(profile.id)} className="ml-4 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all" title="Delete Profile">
                                    <Trash />
                                </button>
                            </div>
                        );
                    })}
                    {canCreateProfile && (
                        <button onClick={handleCreateProfile} className="bg-green-100 border-4 border-dashed border-green-400 rounded-3xl p-8 hover:bg-green-200 transition-all text-center">
                            <div className="text-6xl mb-4">➕</div>
                            <div className="text-2xl font-bold text-green-800">Create New Profile</div>
                            <div className="text-sm text-green-600 mt-2">{3 - profileCount} slot{3 - profileCount !== 1 ? 's' : ''} available</div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSelectionScreen;