import { useMemo } from 'react';

/**
 * useAnalytics Hook
 * 
 * Provides analytics, insights, and achievement checking based on profile data
 * 
 * @param {Object} profile - Current profile object with stats and metadata
 * @returns {Object} Analytics data and helper functions
 */
export const useAnalytics = (profile) => {
    if (!profile) {
        return {
            overallStats: null,
            streakInfo: null,
            needsPractice: [],
            mastered: [],
            recentActivity: [],
            categoryProgress: {},
            achievements: []
        };
    }

    // Calculate overall statistics
    const overallStats = useMemo(() => {
        const stats = profile.stats || {};
        const entries = Object.values(stats);
        
        if (entries.length === 0) {
            return {
                totalItems: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                totalIncorrect: 0,
                accuracy: 0
            };
        }
        
        const totalAttempts = entries.reduce((sum, s) => sum + (s.attempts || 0), 0);
        const totalCorrect = entries.reduce((sum, s) => sum + (s.correct || 0), 0);
        const totalIncorrect = entries.reduce((sum, s) => sum + (s.incorrect || 0), 0);
        
        return {
            totalItems: entries.length,
            totalAttempts,
            totalCorrect,
            totalIncorrect,
            accuracy: totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0
        };
    }, [profile.stats]);

    // Get streak information
    const streakInfo = useMemo(() => {
        const metadata = profile.metadata || {};
        return {
            current: metadata.currentStreak || 0,
            longest: metadata.longestStreak || 0,
            lastPractice: metadata.lastPracticeDate || null,
            isActiveToday: metadata.lastPracticeDate === new Date().toISOString().split('T')[0]
        };
    }, [profile.metadata]);

    // Find items that need practice (accuracy < 60%)
    const needsPractice = useMemo(() => {
        const stats = profile.stats || {};
        return Object.entries(stats)
            .filter(([_, stat]) => {
                const accuracy = stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 0;
                return accuracy < 60 && stat.attempts >= 2;
            })
            .map(([id, stat]) => ({
                id: parseInt(id),
                ...stat,
                accuracy: stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 0
            }))
            .sort((a, b) => a.accuracy - b.accuracy);
    }, [profile.stats]);

    // Find mastered items (accuracy >= 90%, attempts >= 3)
    const mastered = useMemo(() => {
        const stats = profile.stats || {};
        return Object.entries(stats)
            .filter(([_, stat]) => {
                const accuracy = stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 0;
                return accuracy >= 90 && stat.attempts >= 3;
            })
            .map(([id, stat]) => ({
                id: parseInt(id),
                ...stat,
                accuracy: stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 0
            }));
    }, [profile.stats]);

    // Get recent activity (last 20 attempts across all words)
    const recentActivity = useMemo(() => {
        const stats = profile.stats || {};
        const allAttempts = [];
        
        Object.entries(stats).forEach(([id, stat]) => {
            if (stat.recentHistory) {
                stat.recentHistory.forEach(attempt => {
                    allAttempts.push({
                        wordId: parseInt(id),
                        ...attempt
                    });
                });
            }
        });
        
        return allAttempts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20);
    }, [profile.stats]);

    // Calculate category progress
    const categoryProgress = useMemo(() => {
        const stats = profile.stats || {};
        const progress = {};
        
        // Group by category
        Object.entries(stats).forEach(([id, stat]) => {
            const category = stat.category || 'unknown';
            
            if (!progress[category]) {
                progress[category] = {
                    totalItems: 0,
                    attempted: 0,
                    mastered: 0,
                    totalAttempts: 0,
                    totalCorrect: 0,
                    accuracy: 0
                };
            }
            
            progress[category].totalItems++;
            progress[category].attempted++;
            progress[category].totalAttempts += stat.attempts || 0;
            progress[category].totalCorrect += stat.correct || 0;
            
            const itemAccuracy = stat.attempts > 0 ? (stat.correct / stat.attempts) * 100 : 0;
            if (itemAccuracy >= 90 && stat.attempts >= 3) {
                progress[category].mastered++;
            }
        });
        
        // Calculate category accuracies
        Object.keys(progress).forEach(cat => {
            const p = progress[cat];
            p.accuracy = p.totalAttempts > 0 ? (p.totalCorrect / p.totalAttempts) * 100 : 0;
        });
        
        return progress;
    }, [profile.stats]);

    // Check for achievements (basic implementation)
    const achievements = useMemo(() => {
        const unlocked = [];
        
        // First Word achievement
        if (overallStats.totalItems >= 1) {
            unlocked.push({
                id: 'first-word',
                name: 'First Word! 🌱',
                tier: 'bronze',
                unlockedAt: profile.createdAt
            });
        }
        
        // Word milestones
        if (overallStats.totalItems >= 25) {
            unlocked.push({ id: 'vocab-explorer', name: 'Vocabulary Explorer 🗺️', tier: 'silver' });
        }
        if (overallStats.totalItems >= 50) {
            unlocked.push({ id: 'word-collector', name: 'Word Collector 📚', tier: 'gold' });
        }
        if (overallStats.totalItems >= 100) {
            unlocked.push({ id: 'vocabulary-master', name: 'Vocabulary Master 🎓', tier: 'platinum' });
        }
        
        // Streak achievements
        if (streakInfo.current >= 3) {
            unlocked.push({ id: 'daily-learner', name: 'Daily Learner 📅', tier: 'bronze' });
        }
        if (streakInfo.current >= 7) {
            unlocked.push({ id: 'week-warrior', name: 'Week Warrior 🔥', tier: 'silver' });
        }
        if (streakInfo.current >= 30) {
            unlocked.push({ id: 'unstoppable', name: 'Unstoppable Force 🚀', tier: 'platinum' });
        }
        
        // Accuracy achievements
        if (overallStats.accuracy >= 95 && overallStats.totalAttempts >= 50) {
            unlocked.push({ id: 'ace-student', name: 'Ace Student 💯', tier: 'gold' });
        }
        
        // Mastery achievements
        if (mastered.length >= 10) {
            unlocked.push({ id: 'mastery-begins', name: 'Mastery Begins ⭐', tier: 'silver' });
        }
        
        return unlocked;
    }, [overallStats, streakInfo, mastered]);

    // Helper: Check if specific achievement is unlocked
    const hasAchievement = (achievementId) => {
        return achievements.some(a => a.id === achievementId);
    };

    // Helper: Get items not practiced recently (>7 days)
    const getNeglectedItems = (days = 7) => {
        const stats = profile.stats || {};
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        return Object.entries(stats)
            .filter(([_, stat]) => {
                return stat.lastPracticed && stat.lastPracticed < cutoffTime;
            })
            .map(([id, stat]) => ({
                id: parseInt(id),
                ...stat,
                daysSinceLastPractice: Math.floor((Date.now() - stat.lastPracticed) / (24 * 60 * 60 * 1000))
            }))
            .sort((a, b) => a.lastPracticed - b.lastPracticed);
    };

    // Helper: Get practice recommendation
    const getPracticeRecommendation = () => {
        // Priority: struggling words > neglected > new content
        if (needsPractice.length > 0) {
            return {
                type: 'struggling',
                message: `Practice ${needsPractice.length} words that need improvement`,
                items: needsPractice.slice(0, 5)
            };
        }
        
        const neglected = getNeglectedItems(7);
        if (neglected.length > 0) {
            return {
                type: 'neglected',
                message: `Review ${neglected.length} words you haven't practiced recently`,
                items: neglected.slice(0, 5)
            };
        }
        
        return {
            type: 'explore',
            message: 'Great job! Ready to explore new words?',
            items: []
        };
    };

    // Helper: Get insights for progress report
    const getInsights = () => {
        const insights = [];
        
        // Streak insights
        if (streakInfo.current >= 7) {
            insights.push({
                type: 'positive',
                category: 'consistency',
                message: `Amazing! ${streakInfo.current} day streak! Keep it going! 🔥`
            });
        } else if (streakInfo.current >= 3) {
            insights.push({
                type: 'positive',
                category: 'consistency',
                message: `Great consistency! ${streakInfo.current} days in a row!`
            });
        }
        
        // Accuracy insights
        if (overallStats.accuracy >= 90) {
            insights.push({
                type: 'positive',
                category: 'accuracy',
                message: `Excellent accuracy! ${overallStats.accuracy.toFixed(0)}% correct! ⭐`
            });
        } else if (overallStats.accuracy < 70 && overallStats.totalAttempts >= 20) {
            insights.push({
                type: 'improvement',
                category: 'accuracy',
                message: `Focus on practicing words from the "Needs Practice" section`
            });
        }
        
        // Mastery insights
        if (mastered.length >= 20) {
            insights.push({
                type: 'positive',
                category: 'mastery',
                message: `You've mastered ${mastered.length} words! Impressive! 🎓`
            });
        }
        
        // Struggling words insight
        if (needsPractice.length > 5) {
            insights.push({
                type: 'improvement',
                category: 'practice',
                message: `${needsPractice.length} words need more practice. You've got this! 💪`
            });
        }
        
        return insights;
    };

    // Helper: Calculate session stats
    const getSessionStats = (sessionId) => {
        const sessions = profile.sessions || {};
        return sessions[sessionId] || null;
    };

    // Helper: Get all sessions for a date range
    const getSessionsInRange = (startDate, endDate) => {
        const sessions = profile.sessions || {};
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        
        return Object.values(sessions)
            .filter(s => s.startTime >= start && s.startTime <= end)
            .sort((a, b) => b.startTime - a.startTime);
    };

    // Helper: Get practice days in last N days
    const getPracticeDaysInRange = (days = 30) => {
        const sessions = profile.sessions || {};
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        const practiceDates = new Set();
        Object.values(sessions).forEach(session => {
            if (session.startTime >= cutoff) {
                const dateStr = new Date(session.startTime).toISOString().split('T')[0];
                practiceDates.add(dateStr);
            }
        });
        
        return practiceDates.size;
    };

    return {
        // Core stats
        overallStats,
        streakInfo,
        needsPractice,
        mastered,
        recentActivity,
        categoryProgress,
        achievements,
        
        // Helper functions
        hasAchievement,
        getNeglectedItems,
        getPracticeRecommendation,
        getInsights,
        getSessionStats,
        getSessionsInRange,
        getPracticeDaysInRange
    };
};