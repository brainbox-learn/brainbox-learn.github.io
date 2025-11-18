/**
 * Migration Utility
 * 
 * Upgrades old profile structure to new structure with timestamps and metadata
 */

export const MIGRATION_VERSION = 2;

/**
 * Check if a profile needs migration
 */
export const needsMigration = (profile) => {
    if (!profile) return false;
    
    // Check for version field
    if (profile.version >= MIGRATION_VERSION) return false;
    
    // Check for new structure indicators
    if (!profile.metadata || !profile.metadata.createdAt) return true;
    if (!profile.sessions) return true;
    
    // Check if any stat lacks new fields
    const stats = profile.stats || {};
    const firstStat = Object.values(stats)[0];
    if (firstStat && !firstStat.recentHistory) return true;
    
    return false;
};

/**
 * Migrate a single profile to v2 structure
 */
export const migrateProfile = (oldProfile) => {
    if (!oldProfile) return null;
    
    // Already migrated
    if (!needsMigration(oldProfile)) {
        return { ...oldProfile, version: MIGRATION_VERSION };
    }
    
    const now = Date.now();
    const profileCreatedAt = oldProfile.createdAt || now;
    const profileModifiedAt = oldProfile.lastModified || now;
    
    // Migrate metadata
    const metadata = {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        totalSessions: 0,
        totalPracticeTime: 0,
        createdAt: profileCreatedAt,
        lastModified: profileModifiedAt,
        ...(oldProfile.metadata || {})
    };
    
    // Estimate last practice date from lastModified
    if (!metadata.lastPracticeDate && profileModifiedAt) {
        const date = new Date(profileModifiedAt);
        metadata.lastPracticeDate = date.toISOString().split('T')[0];
        metadata.currentStreak = 1; // Assume at least 1 day
    }
    
    // Migrate stats
    const oldStats = oldProfile.stats || {};
    const newStats = {};
    
    Object.entries(oldStats).forEach(([wordId, stat]) => {
        // If stat already has new structure, keep it
        if (stat.recentHistory && stat.firstAttempt) {
            newStats[wordId] = stat;
            return;
        }
        
        // Migrate old structure
        newStats[wordId] = {
            attempts: stat.attempts || 0,
            correct: stat.correct || 0,
            incorrect: stat.incorrect || 0,
            category: stat.category || 'unknown',
            
            // NEW: Add timestamp fields
            firstAttempt: profileCreatedAt, // Best guess
            lastPracticed: profileModifiedAt, // Best guess
            recentHistory: [] // No history available for old data
        };
        
        // Try to create synthetic history if we have attempts data
        // This is approximate but gives some data to work with
        if (stat.attempts > 0) {
            const syntheticHistory = [];
            const interval = stat.attempts > 1 
                ? (profileModifiedAt - profileCreatedAt) / stat.attempts 
                : 0;
            
            // Create up to 5 synthetic attempts
            const numSynthetic = Math.min(stat.attempts, 5);
            const correctRatio = stat.correct / stat.attempts;
            
            for (let i = 0; i < numSynthetic; i++) {
                const timestamp = profileModifiedAt - (interval * i);
                const correct = Math.random() < correctRatio;
                
                syntheticHistory.push({
                    timestamp: Math.floor(timestamp),
                    correct: correct,
                    mode: 'multipleChoice', // Default assumption
                    sessionId: null
                });
            }
            
            newStats[wordId].recentHistory = syntheticHistory;
        }
    });
    
    // Create migrated profile
    const migratedProfile = {
        id: oldProfile.id,
        name: oldProfile.name,
        stats: newStats,
        metadata: metadata,
        sessions: oldProfile.sessions || {},
        createdAt: profileCreatedAt,
        lastModified: profileModifiedAt,
        version: MIGRATION_VERSION
    };
    
    return migratedProfile;
};

/**
 * Migrate all profiles in localStorage
 */
export const migrateAllProfiles = () => {
    try {
        const profilesKey = 'frenchQuizProfiles';
        const profilesData = localStorage.getItem(profilesKey);
        
        if (!profilesData) {
            console.log('No profiles found to migrate');
            return { success: true, migrated: 0 };
        }
        
        const profiles = JSON.parse(profilesData);
        let migratedCount = 0;
        const migratedProfiles = {};
        
        Object.entries(profiles).forEach(([profileId, profile]) => {
            if (needsMigration(profile)) {
                migratedProfiles[profileId] = migrateProfile(profile);
                migratedCount++;
                console.log(`Migrated profile: ${profile.name} (${profileId})`);
            } else {
                migratedProfiles[profileId] = { ...profile, version: MIGRATION_VERSION };
            }
        });
        
        // Save migrated profiles
        localStorage.setItem(profilesKey, JSON.stringify(migratedProfiles));
        
        console.log(`Migration complete: ${migratedCount} profile(s) migrated`);
        return { success: true, migrated: migratedCount };
        
    } catch (error) {
        console.error('Migration failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Backup profiles before migration
 */
export const backupProfiles = () => {
    try {
        const profilesKey = 'frenchQuizProfiles';
        const profilesData = localStorage.getItem(profilesKey);
        
        if (!profilesData) {
            return { success: false, error: 'No profiles to backup' };
        }
        
        const backupKey = `${profilesKey}_backup_${Date.now()}`;
        localStorage.setItem(backupKey, profilesData);
        
        console.log(`Backup created: ${backupKey}`);
        return { success: true, backupKey };
        
    } catch (error) {
        console.error('Backup failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Restore from backup
 */
export const restoreFromBackup = (backupKey) => {
    try {
        const backupData = localStorage.getItem(backupKey);
        
        if (!backupData) {
            return { success: false, error: 'Backup not found' };
        }
        
        const profilesKey = 'frenchQuizProfiles';
        localStorage.setItem(profilesKey, backupData);
        
        console.log(`Restored from backup: ${backupKey}`);
        return { success: true };
        
    } catch (error) {
        console.error('Restore failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all available backups
 */
export const getAvailableBackups = () => {
    const backups = [];
    const prefix = 'frenchQuizProfiles_backup_';
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            const timestamp = parseInt(key.replace(prefix, ''));
            backups.push({
                key: key,
                timestamp: timestamp,
                date: new Date(timestamp).toLocaleString()
            });
        }
    }
    
    return backups.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Run safe migration (with automatic backup)
 */
export const safeMigration = () => {
	if (!needsMigration()) {
		return { success: true };
	}
    
    // Step 1: Create backup
    const backup = backupProfiles();
    if (!backup.success) {
        console.error('Cannot proceed without backup');
        return { success: false, error: 'Backup failed: ' + backup.error };
    }
    
    console.log('Backup created successfully');
    
    // Step 2: Migrate
    const migration = migrateAllProfiles();
    
    if (migration.success) {
        console.log('Migration successful!');
        return {
            success: true,
            migrated: migration.migrated,
            backupKey: backup.backupKey
        };
    } else {
        // Step 3: Rollback on failure
        console.error('Migration failed, rolling back...');
        restoreFromBackup(backup.backupKey);
        return {
            success: false,
            error: migration.error,
            restoredFromBackup: true
        };
    }
};

/**
 * React hook for migration UI
 */
export const useMigration = () => {
    const checkNeedsMigration = () => {
        try {
            const profilesData = localStorage.getItem('frenchQuizProfiles');
            if (!profilesData) return false;
            
            const profiles = JSON.parse(profilesData);
            return Object.values(profiles).some(needsMigration);
        } catch (error) {
            console.error('Error checking migration status:', error);
            return false;
        }
    };
    
    return {
        needsMigration: checkNeedsMigration(),
        runMigration: safeMigration,
        getBackups: getAvailableBackups,
        restoreBackup: restoreFromBackup
    };
};

// Export migration banner component (optional)
export const MigrationBanner = ({ onMigrate, onDismiss }) => {
    return (
        <div style={{
            background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                🎉 New Features Available!
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                We've added streaks, achievements, and better progress tracking! 
                Click below to upgrade your profile data.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={onMigrate}
                    style={{
                        background: 'white',
                        color: '#3B82F6',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Upgrade Now
                </button>
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'transparent',
                        color: 'white',
                        border: '1px solid white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Maybe Later
                </button>
            </div>
        </div>
    );
};