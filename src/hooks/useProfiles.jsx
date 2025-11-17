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
                lastModified: Date.now()
            }
        }));
    };

    // Helper: Generate unique name by appending number if duplicate exists
    const getUniqueName = (desiredName, excludeProfileId = null) => {
        const existingNames = Object.values(profiles)
            .filter(p => p.id !== excludeProfileId)
            .map(p => p.name.toLowerCase());
        
        let uniqueName = desiredName;
        let counter = 2;
        
        while (existingNames.includes(uniqueName.toLowerCase())) {
            uniqueName = `${desiredName} ${counter}`;
            counter++;
        }
        
        return uniqueName;
    };

    const createProfile = (name) => {
        const uniqueName = getUniqueName(name);
        const profileId = `profile-${Date.now()}`;
        const newProfile = {
            id: profileId,
            name: uniqueName,
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

    const updateProfileName = (profileId, newName) => {
        if (!profiles[profileId]) return false;
        
        const uniqueName = getUniqueName(newName, profileId);
        
        setProfiles(prev => ({
            ...prev,
            [profileId]: {
                ...prev[profileId],
                name: uniqueName,
                lastModified: Date.now()
            }
        }));
        
        return true;
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
        
        if (currentProfileId === profileId) {
            const remainingProfiles = Object.keys(profiles).filter(id => id !== profileId);
            setCurrentProfileId(remainingProfiles[0] || null);
        }
        
        return true;
    };

    const switchProfile = (profileId) => {
        setCurrentProfileId(profileId);
    };

    const importProfile = (importedProfile) => {
        const existingProfile = profiles[importedProfile.id];
        
        if (existingProfile) {
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

    const mergeStats = (localStats, importedStats) => {
        const merged = { ...localStats };
        
        Object.keys(importedStats).forEach(wordId => {
            const localStat = localStats[wordId];
            const importedStat = importedStats[wordId];
            
            if (!localStat) {
                merged[wordId] = importedStat;
            } else {
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
        updateProfileName, // NEW
        deleteProfile,
        switchProfile,
        setCurrentProfileId,
        importProfile
    };
};