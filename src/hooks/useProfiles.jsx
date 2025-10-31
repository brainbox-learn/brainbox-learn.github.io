import { useLocalStorage } from './useLocalStorage';

export const useProfiles = () => {
    const [profiles, setProfiles] = useLocalStorage('frenchQuizProfiles', {});
    const [currentProfileId, setCurrentProfileId] = useLocalStorage('frenchQuizCurrentProfileId', null);

    const getCurrentProfile = () => {
        if (!currentProfileId || !profiles[currentProfileId]) return null;
        return profiles[currentProfileId];
    };

    const getCurrentStats = () => {
        const profile = getCurrentProfile();
        return profile?.stats || {};
    };

    const updateCurrentStats = (newStats) => {
        if (!currentProfileId) return;
        setProfiles(prev => ({
            ...prev,
            [currentProfileId]: {
                ...prev[currentProfileId],
                stats: newStats,
                lastModified: Date.now() // Track when stats were last updated
            }
        }));
    };

    const createProfile = (name) => {
        const profileId = `profile-${Date.now()}`;
        const newProfile = {
            id: profileId,
            name,
            stats: {},
            createdAt: Date.now(),
            lastModified: Date.now()
        };
        setProfiles(prev => ({
            ...prev,
            [profileId]: newProfile
        }));
        setCurrentProfileId(profileId);
        return profileId;
    };

    const deleteProfile = (profileId) => {
        if (!window.confirm('Are you sure you want to delete this profile? This cannot be undone.')) {
            return false;
        }
        
        setProfiles(prev => {
            const newProfiles = { ...prev };
            delete newProfiles[profileId];
            return newProfiles;
        });
        
        // If deleting current profile, switch to another
        if (currentProfileId === profileId) {
            const remainingProfiles = Object.keys(profiles).filter(id => id !== profileId);
            setCurrentProfileId(remainingProfiles[0] || null);
        }
        
        return true;
    };

    const switchProfile = (profileId) => {
        setCurrentProfileId(profileId);
    };

    // NEW: Import profile with smart merge logic
    const importProfile = (importedProfile) => {
        // Check if profile already exists locally
        const existingProfile = profiles[importedProfile.id];
        
        if (existingProfile) {
            // Profile exists - merge stats (take max values)
            const mergedStats = mergeStats(existingProfile.stats, importedProfile.stats);
            
            const updatedProfile = {
                ...importedProfile,
                stats: mergedStats,
                lastModified: Math.max(
                    existingProfile.lastModified || 0,
                    importedProfile.lastModified || 0
                )
            };
            
            setProfiles(prev => ({
                ...prev,
                [importedProfile.id]: updatedProfile
            }));
            
            return importedProfile.id;
        } else {
            // New profile - just add it
            setProfiles(prev => ({
                ...prev,
                [importedProfile.id]: {
                    ...importedProfile,
                    lastModified: importedProfile.lastModified || Date.now()
                }
            }));
            
            return importedProfile.id;
        }
    };

    // Helper: Merge stats by taking max values for each word
    const mergeStats = (localStats, importedStats) => {
        const merged = { ...localStats };
        
        Object.keys(importedStats).forEach(wordId => {
            const localStat = localStats[wordId];
            const importedStat = importedStats[wordId];
            
            if (!localStat) {
                // Word only exists in imported data
                merged[wordId] = importedStat;
            } else {
                // Word exists in both - take max values
                merged[wordId] = {
                    attempts: Math.max(localStat.attempts, importedStat.attempts),
                    correct: Math.max(localStat.correct, importedStat.correct),
                    incorrect: Math.max(localStat.incorrect, importedStat.incorrect),
                    category: importedStat.category || localStat.category
                };
            }
        });
        
        return merged;
    };

    return {
        profiles,
        currentProfileId,
        currentProfile: getCurrentProfile(),
        getCurrentStats,
        updateCurrentStats,
        createProfile,
        deleteProfile,
        switchProfile,
        setCurrentProfileId,
        importProfile // NEW: Export import function
    };
};