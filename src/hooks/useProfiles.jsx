import { useLocalStorage } from './useLocalStorage';
import { useState, useEffect } from 'react';
import { getLocalDateString, getYesterdayDateString } from '../utils/dateHelpers';
import { getRandomAvatar } from '../utils/avatarIcons';

export const useProfiles = () => {
    const [profiles, setProfiles] = useLocalStorage('frenchQuizProfiles', {});
    const [currentProfileId, setCurrentProfileId] = useLocalStorage('frenchQuizCurrentProfileId', null);

	useEffect(() => {
        const profileIds = Object.keys(profiles);
        if (profileIds.length === 0) return;

        let needsUpdate = false;
        const updatedProfiles = { ...profiles };

        profileIds.forEach(id => {
            if (!updatedProfiles[id].avatar) {
                updatedProfiles[id].avatar = getRandomAvatar();
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            setProfiles(updatedProfiles);
        }
    }, []);

    const getCurrentProfile = () => {
        if (!currentProfileId || !profiles[currentProfileId]) return null;
        return profiles[currentProfileId];
    };

    const getCurrentStats = () => {
        const profile = getCurrentProfile();
        return profile?.stats || {};
    };

    // NEW: Get profile metadata
    const getMetadata = () => {
        const profile = getCurrentProfile();
        return profile?.metadata || getDefaultMetadata();
    };

    // NEW: Default metadata structure
    const getDefaultMetadata = () => ({
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        totalSessions: 0,
        totalPracticeTime: 0,
        createdAt: Date.now(),
        lastModified: Date.now()
    });

    // ENHANCED: Update stats with timestamp tracking
    const updateCurrentStats = (newStats) => {
        if (!currentProfileId) return;
        
        const now = Date.now();
		const today = getLocalDateString();
        
        setProfiles(prev => {
            const currentProfile = prev[currentProfileId];
            const currentMetadata = currentProfile?.metadata || getDefaultMetadata();
            
            // Update streak logic
            const lastPracticeDate = currentMetadata.lastPracticeDate;
            const yesterday = getYesterdayDateString();
            
            let newStreak = currentMetadata.currentStreak;
            
            if (lastPracticeDate === today) {
                // Same day, streak unchanged
                newStreak = currentMetadata.currentStreak;
            } else if (lastPracticeDate === yesterday) {
                // Consecutive day, increment streak
                newStreak = currentMetadata.currentStreak + 1;
            } else {
                // Streak broken, reset to 1
                newStreak = 1;
            }
            
            // Update longest streak if needed
            const longestStreak = Math.max(currentMetadata.longestStreak, newStreak);
            
            return {
                ...prev,
                [currentProfileId]: {
                    ...currentProfile,
                    stats: newStats,
                    metadata: {
                        ...currentMetadata,
                        currentStreak: newStreak,
                        longestStreak: longestStreak,
                        lastPracticeDate: today,
                        lastModified: now
                    }
                }
            };
        });
    };

    // NEW: Record a single attempt with full tracking + daily stats
const recordAttempt = (wordId, isCorrect, mode, category, sessionId = null, sessionTime = 0) => {
    if (!currentProfileId) return;

	console.log('recordAttempt', wordId, isCorrect, mode, category, sessionId);
    
    const now = Date.now();
    const today = getLocalDateString();
    
    setProfiles(prev => {
        const currentProfile = prev[currentProfileId];
        const currentStats = currentProfile?.stats || {};
        const currentMetadata = currentProfile?.metadata || getDefaultMetadata();
        
        // ===== UPDATE WORD STATS =====
        const wordStat = currentStats[wordId] || {
            attempts: 0,
            correct: 0,
            incorrect: 0,
            category: category,
            firstAttempt: now,
            lastPracticed: now,
            recentHistory: []
        };
        
        // Create new attempt record
        const attemptRecord = {
            timestamp: now,
            correct: isCorrect,
            mode: mode,
            sessionId: sessionId
        };
        
        // Keep only last 10 attempts (storage efficient)
        const newHistory = [attemptRecord, ...wordStat.recentHistory].slice(0, 10);
        
        // Update word stats
        const updatedWordStat = {
            ...wordStat,
            attempts: wordStat.attempts + 1,
            correct: wordStat.correct + (isCorrect ? 1 : 0),
            incorrect: wordStat.incorrect + (isCorrect ? 0 : 1),
            lastPracticed: now,
            recentHistory: newHistory
        };
        
        const updatedStats = {
            ...currentStats,
            [wordId]: updatedWordStat
        };
        
        // ===== UPDATE STREAK =====
        const lastPracticeDate = currentMetadata.lastPracticeDate;
		const yesterday = getYesterdayDateString();
        
        let newStreak = currentMetadata.currentStreak;
        
        if (lastPracticeDate === today) {
            newStreak = currentMetadata.currentStreak;
        } else if (lastPracticeDate === yesterday) {
            newStreak = currentMetadata.currentStreak + 1;
        } else {
            newStreak = 1;
        }
        
        const longestStreak = Math.max(currentMetadata.longestStreak, newStreak);
        
        // ===== UPDATE DAILY STATS =====
        const dailyStats = currentMetadata.dailyStats || {};
        
        if (!dailyStats[today]) {
            dailyStats[today] = {
                attempts: 0,
                correct: 0,
                incorrect: 0,
                timeSpent: 0,
                wordsAttempted: [],
                sessionsCompleted: 0,
                startTime: now
            };
        }
        
        // Update today's stats
        dailyStats[today].attempts++;
        dailyStats[today].correct += isCorrect ? 1 : 0;
        dailyStats[today].incorrect += isCorrect ? 0 : 1;
        
        // Track unique words (convert to Set to check, then back to array)
        const wordsSet = new Set(dailyStats[today].wordsAttempted);
        wordsSet.add(wordId);
        dailyStats[today].wordsAttempted = Array.from(wordsSet);
        
        // Calculate time spent (time since first attempt today)
        // dailyStats[today].timeSpent = now - dailyStats[today].startTime;
        
        // Clean up old daily stats (keep last 90 days)
		const ninetyDaysAgo = (() => {
			const date = new Date();
			date.setDate(date.getDate() - 90);
			return getLocalDateString(date);
		})();
        
        Object.keys(dailyStats).forEach(date => {
            if (date < ninetyDaysAgo) {
                delete dailyStats[date];
            }
        });
        
        // ===== RETURN UPDATED PROFILE =====
        return {
            ...prev,
            [currentProfileId]: {
                ...currentProfile,
                stats: updatedStats,
                metadata: {
                    ...currentMetadata,
                    currentStreak: newStreak,
                    longestStreak: longestStreak,
                    lastPracticeDate: today,
                    lastModified: now,
                    dailyStats: dailyStats
                }
            }
        };
    });
};

    // NEW: Start a session
    const startSession = (mode, category) => {
        const sessionId = `session-${Date.now()}`;
        const now = Date.now();
        
        setProfiles(prev => {
            const currentProfile = prev[currentProfileId];
            const sessions = currentProfile?.sessions || {};
            
            return {
                ...prev,
                [currentProfileId]: {
                    ...currentProfile,
                    sessions: {
                        ...sessions,
                        [sessionId]: {
                            startTime: now,
                            endTime: null,
                            duration: null,
                            itemsAttempted: 0,
                            itemsCorrect: 0,
                            accuracy: 0,
                            mode: mode,
                            category: category
                        }
                    }
                }
            };
        });
        
        return sessionId;
    };

    // NEW: End a session
    const endSession = (sessionId, itemsAttempted, itemsCorrect) => {
        if (!currentProfileId || !sessionId) return;
        
        const now = Date.now();
        
        setProfiles(prev => {
            const currentProfile = prev[currentProfileId];
            const sessions = currentProfile?.sessions || {};
            const session = sessions[sessionId];
            
            if (!session) return prev;
            
            const duration = now - session.startTime;
            const accuracy = itemsAttempted > 0 ? (itemsCorrect / itemsAttempted) * 100 : 0;
            
            // Update metadata
            const currentMetadata = currentProfile?.metadata || getDefaultMetadata();
            
            return {
                ...prev,
                [currentProfileId]: {
                    ...currentProfile,
                    sessions: {
                        ...sessions,
                        [sessionId]: {
                            ...session,
                            endTime: now,
                            duration: duration,
                            itemsAttempted: itemsAttempted,
                            itemsCorrect: itemsCorrect,
                            accuracy: accuracy
                        }
                    },
                    metadata: {
                        ...currentMetadata,
                        totalSessions: currentMetadata.totalSessions + 1,
                        totalPracticeTime: currentMetadata.totalPracticeTime + duration
                    }
                }
            };
        });
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

    // const createProfile = (name) => {
    //     const uniqueName = getUniqueName(name);
    //     const profileId = `profile-${Date.now()}`;
    //     const newProfile = {
    //         id: profileId,
    //         name: uniqueName,
    //         stats: {},
    //         metadata: getDefaultMetadata(),
    //         sessions: {},
    //         createdAt: Date.now(),
    //         lastModified: Date.now()
    //     };
    //     setProfiles(prev => ({
    //         ...prev,
    //         [profileId]: newProfile
    //     }));
    //     setCurrentProfileId(profileId);
    //     return profileId;
    // };

    const updateProfileName = (profileId, newName, avatar = null) => {
        if (!profiles[profileId]) return false;
        
        const uniqueName = getUniqueName(newName, profileId);
        
        setProfiles(prev => ({
            ...prev,
            [profileId]: {
                ...prev[profileId],
                name: uniqueName,
				avatar: avatar || profiles[profileId].avatar,
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

    // ENHANCED: Import with metadata migration
    const importProfile = (importedProfile) => {
        const existingProfile = profiles[importedProfile.id];
        
        if (existingProfile) {
            const mergedStats = mergeStats(existingProfile.stats, importedProfile.stats);
            const mergedMetadata = mergeMetadata(existingProfile.metadata, importedProfile.metadata);
            
            const updatedProfile = {
                ...importedProfile,
                stats: mergedStats,
                metadata: mergedMetadata,
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
            // Ensure imported profile has metadata
            const profileWithMetadata = {
                ...importedProfile,
                metadata: importedProfile.metadata || getDefaultMetadata(),
                sessions: importedProfile.sessions || {},
                lastModified: importedProfile.lastModified || Date.now()
            };
            
            setProfiles(prev => ({
                ...prev,
                [importedProfile.id]: profileWithMetadata
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
                // Merge attempt history
                const localHistory = localStat.recentHistory || [];
                const importedHistory = importedStat.recentHistory || [];
                const combinedHistory = [...localHistory, ...importedHistory]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 10); // Keep latest 10
                
                merged[wordId] = {
                    attempts: Math.max(localStat.attempts, importedStat.attempts),
                    correct: Math.max(localStat.correct, importedStat.correct),
                    incorrect: Math.max(localStat.incorrect, importedStat.incorrect),
                    category: importedStat.category || localStat.category,
                    firstAttempt: Math.min(
                        localStat.firstAttempt || Date.now(),
                        importedStat.firstAttempt || Date.now()
                    ),
                    lastPracticed: Math.max(
                        localStat.lastPracticed || 0,
                        importedStat.lastPracticed || 0
                    ),
                    recentHistory: combinedHistory
                };
            }
        });
        
        return merged;
    };

    // NEW: Merge metadata intelligently
    const mergeMetadata = (localMeta, importedMeta) => {
        const local = localMeta || getDefaultMetadata();
        const imported = importedMeta || getDefaultMetadata();
        
        return {
            currentStreak: Math.max(local.currentStreak, imported.currentStreak),
            longestStreak: Math.max(local.longestStreak, imported.longestStreak),
            lastPracticeDate: local.lastPracticeDate > imported.lastPracticeDate 
                ? local.lastPracticeDate 
                : imported.lastPracticeDate,
            totalSessions: local.totalSessions + imported.totalSessions,
            totalPracticeTime: local.totalPracticeTime + imported.totalPracticeTime,
            createdAt: Math.min(local.createdAt, imported.createdAt),
            lastModified: Math.max(local.lastModified, imported.lastModified)
        };
    };

    // NEW: Migrate old profiles to new structure
    const migrateProfile = (profileId) => {
        const profile = profiles[profileId];
        if (!profile) return;
        
        // Check if already migrated
        if (profile.metadata && profile.metadata.createdAt) return;
        
        const now = Date.now();
        const migratedProfile = {
            ...profile,
            metadata: profile.metadata || {
                ...getDefaultMetadata(),
                createdAt: profile.createdAt || now,
                lastModified: profile.lastModified || now
            },
            sessions: profile.sessions || {},
            stats: migrateStatsStructure(profile.stats || {}, profile.createdAt || now)
        };
        
        setProfiles(prev => ({
            ...prev,
            [profileId]: migratedProfile
        }));
    };

    // Helper: Migrate old stats to new structure
    const migrateStatsStructure = (oldStats, profileCreatedAt) => {
        const migratedStats = {};
        
        Object.entries(oldStats).forEach(([wordId, stat]) => {
            // If stat already has new structure, keep it
            if (stat.recentHistory) {
                migratedStats[wordId] = stat;
                return;
            }
            
            // Migrate old structure
            migratedStats[wordId] = {
                attempts: stat.attempts || 0,
                correct: stat.correct || 0,
                incorrect: stat.incorrect || 0,
                category: stat.category,
                firstAttempt: profileCreatedAt,
                lastPracticed: profileCreatedAt,
                recentHistory: [] // No history available for old data
            };
        });
        
        return migratedStats;
    };

	const updateDailySessionTime = (sessionDuration) => {
		if (!currentProfileId) return;
		
		const today = getLocalDateString();
		
		setProfiles(prev => {
		  const currentProfile = prev[currentProfileId];
		  const dailyStats = currentProfile?.metadata?.dailyStats || {};
		  
		  if (dailyStats[today]) {
			dailyStats[today].timeSpent = (dailyStats[today].timeSpent || 0) + sessionDuration;
		  }
		  
		  return {
			...prev,
			[currentProfileId]: {
			  ...currentProfile,
			  metadata: {
				...currentProfile.metadata,
				dailyStats: dailyStats
			  }
			}
		  };
		});
	  };

	  const createProfile = (name, avatar = null) => {
		const newProfile = {
			id: Date.now().toString(),
			name,
			avatar: avatar || getRandomAvatar(), // ← Add this
			stats: {},
			createdAt: new Date().toISOString()
		};
		
		const updatedProfiles = {
			...profiles,
			[newProfile.id]: newProfile
		};
		
		setProfiles(updatedProfiles);
		setCurrentProfileId(newProfile.id);
	};

	const updateProfileAvatar = (profileId, avatar) => {
		if (!profiles[profileId]) return;
		
		const updatedProfiles = {
			...profiles,
			[profileId]: {
				...profiles[profileId],
				avatar
			}
		};
		
		setProfiles(updatedProfiles);
	};

    return {
        profiles,
        currentProfileId,
        currentProfile: getCurrentProfile(),
        getCurrentStats,
        getMetadata, // NEW
        updateCurrentStats,
        recordAttempt, // NEW
        startSession, // NEW
        endSession, // NEW
        createProfile,
        updateProfileName,
        deleteProfile,
        switchProfile,
        setCurrentProfileId,
        importProfile,
        migrateProfile,
		updateDailySessionTime,
		updateProfileAvatar
    };
};