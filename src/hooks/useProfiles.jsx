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
                stats: newStats
            }
        }));
    };

    const createProfile = (name) => {
        const profileId = `profile-${Date.now()}`;
        const newProfile = {
            id: profileId,
            name,
            stats: {},
            createdAt: Date.now()
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

    return {
        profiles,
        currentProfileId,
        currentProfile: getCurrentProfile(),
        getCurrentStats,
        updateCurrentStats,
        createProfile,
        deleteProfile,
        switchProfile,
        setCurrentProfileId
    };
};