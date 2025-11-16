## 🚀 BrainBox Migration Plan: Grade-Based → Domain-Based Architecture

**Purpose:** Complete guide for migrating from hardcoded `grade1/2/3` structure to dynamic `domains.json` architecture with Vocabulaire and Grammaire support.

**Token Budget Used:** ~122k / 190k (64% used, 68k remaining)

---

# **Migration Overview**

## **What's Changing:**

### **Before (Current):**
```
Grade 1 → Categories → Words
Grade 2 → Categories → Words  
Grade 3 → Categories → Words
```

### **After (New):**
```
Domain Selection (Vocabulaire, Grammaire, Prononciation)
  ↓
Section Selection (Grammaire only: Verbes, Expressions, Devoirs)
  ↓
Level Selection (Niveau 1, 2, 3)
  ↓
Category Selection (existing accordion)
  ↓
Content (words, verbs, expressions)
```

---

# **Phase 1: Data Files ✅ COMPLETE**

All data files created and validated:

### **Vocabulaire:**
- `/public/data/vocabulaire/niveau1.json` (74 words)
- `/public/data/vocabulaire/niveau2.json` (187 words)
- `/public/data/vocabulaire/niveau3.json` (88 words)

### **Grammaire:**
- `/public/data/grammaire/verbes-niveau1.json` (4 verbs)
- `/public/data/grammaire/verbes-niveau2.json` (15 verbs)
- `/public/data/grammaire/verbes-niveau3.json` (14 verbs)
- `/public/data/grammaire/expressions-niveau1.json` (32 expressions)
- `/public/data/grammaire/expressions-niveau2.json` (28 expressions)
- `/public/data/grammaire/homework-sets.json` (homework mappings)

### **Architecture:**
- `/public/data/new-data/domains.json` (master config)

**Note:** Move `domains.json` from `/new-data/` to `/public/data/` when ready to activate.

---

# **Phase 2: Code Migration** 🔄

## **Step 1: Update Data Loader (`src/data/words.js`)**

### **Current State:**
```javascript
// Hardcoded grade loading
const grades = ['grade1', 'grade2', 'grade3'];
await fetch(`${basePath}data/grade1.json`)
```

### **New Approach:**
```javascript
// 1. Load domains.json first
// 2. Dynamically build data structure from domains config
// 3. Support both old and new formats during transition
```

### **Implementation Example:**

```javascript
// NEW: Load domains configuration
export const loadDomains = async () => {
    try {
        const response = await fetch(`${basePath}data/domains.json`);
        if (!response.ok) throw new Error('Failed to load domains');
        const domainsConfig = await response.json();
        return domainsConfig;
    } catch (error) {
        console.error('Error loading domains:', error);
        return null;
    }
};

// NEW: Load data based on domains.json structure
export const loadAllContent = async () => {
    const domains = await loadDomains();
    if (!domains) {
        // Fallback to old structure if domains.json doesn't exist
        return await loadAllWords(); // existing function
    }
    
    const contentByDomain = {};
    
    // Iterate through enabled domains
    for (const domain of domains.domains.filter(d => d.enabled)) {
        if (domain.organizationType === 'level-based') {
            // Vocabulaire: simple level structure
            contentByDomain[domain.id] = await loadLevelBasedDomain(domain);
        } else if (domain.organizationType === 'topic-based') {
            // Grammaire: sections → levels structure
            contentByDomain[domain.id] = await loadTopicBasedDomain(domain);
        }
    }
    
    return { domains, content: contentByDomain };
};

// Helper: Load level-based domain (Vocabulaire)
const loadLevelBasedDomain = async (domain) => {
    const levelData = {};
    
    for (const level of domain.levels) {
        try {
            const response = await fetch(`${basePath}data/${level.dataFile}`);
            if (!response.ok) throw new Error(`Failed to load ${level.dataFile}`);
            const data = await response.json();
            
            levelData[level.id] = {
                level: data.level,
                categories: data.categories,
                words: data.categories.flatMap(cat => cat.words),
                config: level // Store level config from domains.json
            };
        } catch (error) {
            console.error(`Error loading ${level.id}:`, error);
        }
    }
    
    return levelData;
};

// Helper: Load topic-based domain (Grammaire)
const loadTopicBasedDomain = async (domain) => {
    const sectionData = {};
    
    for (const section of domain.sections) {
        if (section.levels) {
            // Sections with levels (Verbes, Expressions)
            sectionData[section.id] = {};
            
            for (const level of section.levels) {
                try {
                    const response = await fetch(`${basePath}data/${level.dataFile}`);
                    if (!response.ok) throw new Error(`Failed to load ${level.dataFile}`);
                    const data = await response.json();
                    
                    sectionData[section.id][level.id] = {
                        level: data.level,
                        categories: data.categories,
                        items: data.categories.flatMap(cat => cat.items),
                        config: level
                    };
                } catch (error) {
                    console.error(`Error loading ${section.id}/${level.id}:`, error);
                }
            }
        } else {
            // Single file sections (Devoirs/Homework)
            try {
                const response = await fetch(`${basePath}data/${section.dataFile}`);
                if (!response.ok) throw new Error(`Failed to load ${section.dataFile}`);
                const data = await response.json();
                sectionData[section.id] = data;
            } catch (error) {
                console.error(`Error loading ${section.id}:`, error);
            }
        }
    }
    
    return sectionData;
};
```

---

## **Step 2: Update App.jsx State Management**

### **Current State:**
```javascript
const [selectedGrade, setSelectedGrade] = useState('grade1');
const [selectedCategory, setSelectedCategory] = useState(null);
```

### **New State Structure:**
```javascript
// Domain navigation state
const [domains, setDomains] = useState(null);
const [contentData, setContentData] = useState(null);
const [selectedDomain, setSelectedDomain] = useState(null); // 'vocabulaire' | 'grammaire'
const [selectedSection, setSelectedSection] = useState(null); // 'verbes' | 'expressions' | null
const [selectedLevel, setSelectedLevel] = useState(null); // 'niveau1' | 'niveau2' | 'niveau3'
const [selectedCategory, setSelectedCategory] = useState(null); // category ID

// Navigation mode tracking
const [navigationStep, setNavigationStep] = useState('domain'); // 'domain' | 'section' | 'level' | 'category' | 'practice'
```

### **Navigation Flow Example:**
```javascript
const handleDomainSelection = (domainId) => {
    setSelectedDomain(domainId);
    setSelectedSection(null);
    setSelectedLevel(null);
    setSelectedCategory(null);
    
    const domain = domains.domains.find(d => d.id === domainId);
    
    if (domain.organizationType === 'level-based') {
        // Vocabulaire: Skip section step, go to level
        setNavigationStep('level');
    } else if (domain.organizationType === 'topic-based') {
        // Grammaire: Show sections
        setNavigationStep('section');
    }
};

const handleSectionSelection = (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedLevel(null);
    setSelectedCategory(null);
    setNavigationStep('level');
};

const handleLevelSelection = (levelId) => {
    setSelectedLevel(levelId);
    setSelectedCategory(null);
    setNavigationStep('category');
};

const handleCategorySelection = (categoryId) => {
    setSelectedCategory(categoryId);
    setNavigationStep('practice');
    // Generate first question
};
```

---

## **Step 3: Create New Navigation Components**

### **Component Structure:**
```
src/components/
  ├─ Navigation/
  │   ├─ DomainSelection.jsx       [NEW]
  │   ├─ SectionSelection.jsx      [NEW]
  │   ├─ LevelSelection.jsx        [NEW]
  │   └─ CategorySelection.jsx     [REFACTOR from CategoryTabs.jsx]
```

### **DomainSelection.jsx Example:**
```javascript
import React from 'react';
import { BookOpen, Article, SpeakerHigh } from '@phosphor-icons/react';

const ICON_MAP = {
    'BookOpen': BookOpen,
    'Article': Article,
    'SpeakerHigh': SpeakerHigh
};

const DomainSelection = ({ domains, onSelectDomain }) => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                Choose Your Learning Path
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {domains.domains
                    .filter(domain => domain.enabled)
                    .map(domain => {
                        const Icon = ICON_MAP[domain.icon];
                        
                        return (
                            <button
                                key={domain.id}
                                onClick={() => onSelectDomain(domain.id)}
                                disabled={domain.comingSoon}
                                className={`group relative overflow-hidden rounded-3xl p-8 border-4 transition-all transform hover:scale-105 ${
                                    domain.comingSoon 
                                        ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300'
                                        : `bg-gradient-to-br ${domain.gradient} text-white border-transparent shadow-2xl`
                                }`}
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-white/20 rounded-2xl">
                                        <Icon size={64} weight="duotone" />
                                    </div>
                                    
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold mb-2">
                                            {domain.name}
                                        </h2>
                                        <p className="text-sm opacity-90">
                                            {domain.description}
                                        </p>
                                    </div>
                                    
                                    {domain.comingSoon && (
                                        <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                                            Coming Soon
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
            </div>
        </div>
    );
};

export default DomainSelection;
```

### **SectionSelection.jsx Example:**
```javascript
import React from 'react';
import { Lightning, ChatCircle, Exam, CaretLeft } from '@phosphor-icons/react';

const ICON_MAP = {
    'Lightning': Lightning,
    'ChatCircle': ChatCircle,
    'Exam': Exam
};

const SectionSelection = ({ domain, sections, onSelectSection, onBack }) => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
            >
                <CaretLeft size={24} weight="bold" />
                <span className="font-semibold">Back to Domains</span>
            </button>
            
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                {domain.name} - Choose a Topic
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map(section => {
                    const Icon = ICON_MAP[section.icon];
                    
                    return (
                        <button
                            key={section.id}
                            onClick={() => onSelectSection(section.id)}
                            className="group bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 rounded-2xl p-6 border-3 border-gray-200 hover:border-purple-400 transition-all transform hover:scale-105 shadow-lg"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <Icon size={32} weight="duotone" className="text-purple-600" />
                                </div>
                                
                                <div className="text-left flex-1">
                                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                                        {section.name}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {section.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SectionSelection;
```

### **LevelSelection.jsx Example:**
```javascript
import React from 'react';
import { Leaf, TreePalm, Tree, CaretLeft } from '@phosphor-icons/react';

const ICON_MAP = {
    'Leaf': Leaf,
    'TreePalm': TreePalm,
    'Tree': Tree
};

const LevelSelection = ({ domain, section, levels, onSelectLevel, onBack }) => {
    const title = section 
        ? `${domain.name} - ${section.name}`
        : domain.name;
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
            >
                <CaretLeft size={24} weight="bold" />
                <span className="font-semibold">Back</span>
            </button>
            
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                {title}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {levels.map(level => {
                    const Icon = ICON_MAP[level.icon];
                    
                    return (
                        <button
                            key={level.id}
                            onClick={() => onSelectLevel(level.id)}
                            className={`group relative overflow-hidden rounded-3xl p-8 border-4 transition-all transform hover:scale-105 bg-gradient-to-br ${level.gradient} text-white border-transparent shadow-2xl`}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-white/20 rounded-2xl">
                                    <Icon size={48} weight="duotone" />
                                </div>
                                
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-2">
                                        {level.displayName}
                                    </h2>
                                    <p className="text-sm opacity-90">
                                        {level.description}
                                    </p>
                                    
                                    <div className="mt-3 flex justify-center gap-1">
                                        {[...Array(level.stars)].map((_, i) => (
                                            <span key={i} className="text-yellow-300 text-lg">⭐</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelSelection;
```

---

## **Step 4: Update Progress Tracking**

### **Current Stats Structure:**
```javascript
stats = {
  "1": {
    attempts: 5,
    correct: 4,
    incorrect: 1,
    category: "grade1"  // ← NEEDS UPDATE
  }
}
```

### **New Stats Structure:**
```javascript
stats = {
  "1": {
    attempts: 5,
    correct: 4,
    incorrect: 1,
    domain: "vocabulaire",      // NEW
    level: "niveau1",           // NEW
    category: "essential-1"     // UPDATED: now means category within level
  },
  "700": {  // verb ID
    attempts: 3,
    correct: 2,
    incorrect: 1,
    domain: "grammaire",
    section: "verbes",          // NEW: for grammaire only
    level: "niveau1",
    category: "verbes-essentiels"
  }
}
```

### **Migration Function:**
```javascript
// Add to src/hooks/useProfiles.jsx

const LEGACY_CATEGORY_MAP = {
    'grade1': { domain: 'vocabulaire', level: 'niveau1' },
    'grade2': { domain: 'vocabulaire', level: 'niveau2' },
    'grade3': { domain: 'vocabulaire', level: 'niveau3' }
};

export const migrateStatsToNewFormat = (oldStats) => {
    const migratedStats = {};
    
    Object.keys(oldStats).forEach(wordId => {
        const stat = oldStats[wordId];
        
        // Check if already in new format
        if (stat.domain && stat.level) {
            migratedStats[wordId] = stat;
            return;
        }
        
        // Migrate from old format
        const legacyMapping = LEGACY_CATEGORY_MAP[stat.category];
        
        if (legacyMapping) {
            migratedStats[wordId] = {
                ...stat,
                domain: legacyMapping.domain,
                level: legacyMapping.level,
                category: stat.category // Keep original category ID for reference
            };
        } else {
            // Unknown category - keep as-is but add fallback
            migratedStats[wordId] = {
                ...stat,
                domain: 'vocabulaire',
                level: 'niveau1'
            };
        }
    });
    
    return migratedStats;
};

// Run migration on profile load
export const useProfiles = () => {
    const [profiles, setProfiles] = useLocalStorage('frenchQuizProfiles', {});
    const [currentProfileId, setCurrentProfileId] = useLocalStorage('frenchQuizCurrentProfileId', null);
    const [migrationComplete, setMigrationComplete] = useLocalStorage('statsMigrationComplete', false);
    
    // Auto-migrate on first load
    useEffect(() => {
        if (!migrationComplete && Object.keys(profiles).length > 0) {
            console.log('🔄 Migrating user stats to new format...');
            
            const migratedProfiles = {};
            Object.keys(profiles).forEach(profileId => {
                const profile = profiles[profileId];
                migratedProfiles[profileId] = {
                    ...profile,
                    stats: migrateStatsToNewFormat(profile.stats || {})
                };
            });
            
            setProfiles(migratedProfiles);
            setMigrationComplete(true);
            console.log('✅ Migration complete!');
        }
    }, [profiles, migrationComplete]);
    
    // ... rest of useProfiles hook
};
```

---

## **Step 5: Update Stats Calculator**

### **New Functions Needed:**

```javascript
// src/utils/statsCalculator.js

// NEW: Get progress for specific domain/level
export const getProgressDataForLevel = (domain, level, contentData, stats) => {
    // Get all items (words/verbs/expressions) for this level
    const levelData = contentData[domain]?.[level];
    if (!levelData) return { notAttempted: [], allCorrect: [], hasIncorrect: [], total: 0 };
    
    const allItems = levelData.items || levelData.words || [];
    
    const notAttempted = allItems.filter(item => !stats[item.id]);
    const attempted = allItems.filter(item => stats[item.id]);
    
    const allCorrect = attempted.filter(item => 
        stats[item.id].correct > stats[item.id].incorrect
    );
    
    const hasIncorrect = attempted.filter(item => 
        stats[item.id].incorrect >= stats[item.id].correct
    );
    
    return { 
        notAttempted, 
        allCorrect, 
        hasIncorrect, 
        total: allItems.length 
    };
};

// NEW: Get progress for entire domain
export const getProgressDataForDomain = (domain, contentData, stats) => {
    const domainData = contentData[domain];
    if (!domainData) return { totalItems: 0, masteredItems: 0, practiceItems: 0 };
    
    let totalItems = 0;
    let masteredItems = 0;
    let practiceItems = 0;
    
    // Iterate through all levels in this domain
    Object.keys(domainData).forEach(levelKey => {
        const levelData = domainData[levelKey];
        const allItems = levelData.items || levelData.words || [];
        
        totalItems += allItems.length;
        
        allItems.forEach(item => {
            const stat = stats[item.id];
            if (stat && stat.correct > stat.incorrect) {
                masteredItems++;
            } else if (stat && stat.incorrect >= stat.correct) {
                practiceItems++;
            }
        });
    });
    
    return { totalItems, masteredItems, practiceItems };
};

// UPDATE: Track stats with new metadata
export const updateItemStats = (stats, itemId, isCorrect, domain, level, section = null, category) => {
    return {
        ...stats,
        [itemId]: {
            ...stats[itemId],
            attempts: (stats[itemId]?.attempts || 0) + 1,
            correct: (stats[itemId]?.correct || 0) + (isCorrect ? 1 : 0),
            incorrect: (stats[itemId]?.incorrect || 0) + (isCorrect ? 0 : 1),
            domain,
            level,
            section, // null for vocabulaire, 'verbes'/'expressions' for grammaire
            category
        }
    };
};
```

---

## **Step 6: Update Quiz Components**

### **QuestionCard.jsx / FlashCard.jsx:**

**Changes Needed:** Minimal! These components just receive items and display them.

**Only update:** How answer is tracked

```javascript
// OLD
const handleAnswer = (answer) => {
    const isCorrect = checkAnswer(answer, correctAnswer);
    const newStats = updateWordStats(currentStats, wordId, isCorrect, selectedGrade);
    updateCurrentStats(newStats);
};

// NEW
const handleAnswer = (answer) => {
    const isCorrect = checkAnswer(answer, correctAnswer);
    const newStats = updateItemStats(
        currentStats, 
        currentItem.id, 
        isCorrect,
        selectedDomain,
        selectedLevel,
        selectedSection,
        selectedCategory
    );
    updateCurrentStats(newStats);
};
```

---

## **Step 7: Rebuild ProgressReport**

### **New Structure:**

```javascript
// ProgressReport.jsx - NEW STRUCTURE

const ProgressReport = ({ 
    domains,
    contentData,
    getCurrentStats, 
    onClose, 
    onStartPracticeMode 
}) => {
    const [expandedDomains, setExpandedDomains] = useState([]);
    const [expandedLevels, setExpandedLevels] = useState([]);
    
    const stats = getCurrentStats();
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8">
            {/* For each enabled domain */}
            {domains.domains
                .filter(d => d.enabled)
                .map(domain => (
                    <DomainProgressCard 
                        key={domain.id}
                        domain={domain}
                        contentData={contentData[domain.id]}
                        stats={stats}
                        isExpanded={expandedDomains.includes(domain.id)}
                        onToggle={() => toggleDomain(domain.id)}
                        onStartPracticeMode={onStartPracticeMode}
                    />
                ))
            }
        </div>
    );
};

const DomainProgressCard = ({ domain, contentData, stats, isExpanded, onToggle, onStartPracticeMode }) => {
    const domainStats = getProgressDataForDomain(domain.id, { [domain.id]: contentData }, stats);
    const percentComplete = Math.round((domainStats.masteredItems / domainStats.totalItems) * 100) || 0;
    
    return (
        <div className="mb-6 bg-white rounded-3xl shadow-2xl overflow-hidden">
            <button 
                onClick={onToggle}
                className="w-full p-6 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <DomainIcon icon={domain.icon} />
                    <div>
                        <h2 className="text-2xl font-bold">{domain.name}</h2>
                        <p className="text-sm text-gray-600">
                            {domainStats.masteredItems}/{domainStats.totalItems} mastered
                        </p>
                    </div>
                </div>
                
                <div className="text-3xl font-bold text-blue-600">
                    {percentComplete}%
                </div>
            </button>
            
            {isExpanded && (
                <div className="px-6 pb-6">
                    {/* Show levels for this domain */}
                    {Object.keys(contentData).map(levelKey => (
                        <LevelProgressCard 
                            key={levelKey}
                            domain={domain.id}
                            level={levelKey}
                            levelData={contentData[levelKey]}
                            stats={stats}
                            onStartPracticeMode={onStartPracticeMode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
```

---

# **Phase 3: Testing & Validation** ✅

## **Testing Checklist:**

### **1. Data Loading:**
- [ ] domains.json loads successfully
- [ ] All vocabulaire files load
- [ ] All grammaire files load
- [ ] Fallback to old structure works if domains.json missing
- [ ] Console shows no loading errors

### **2. Navigation:**
- [ ] Domain selection screen appears
- [ ] Clicking Vocabulaire shows levels
- [ ] Clicking Grammaire shows sections
- [ ] Section selection shows levels
- [ ] Level selection shows categories
- [ ] Category selection loads content
- [ ] Back buttons work correctly

### **3. Progress Tracking:**
- [ ] Stats migration runs automatically
- [ ] Old progress preserved after migration
- [ ] New practice sessions track with domain/level metadata
- [ ] Progress report shows correct percentages
- [ ] "Need Practice" words identified correctly

### **4. Profile System:**
- [ ] Profile creation works
- [ ] Profile switching works
- [ ] Profile deletion works
- [ ] Profile transfer codes work
- [ ] Smart merging preserves max values

### **5. Quiz Functionality:**
- [ ] Vocabulaire quiz works (words)
- [ ] Grammaire quiz works (verbs)
- [ ] Grammaire quiz works (expressions)
- [ ] Flashcard mode works
- [ ] Sound effects play
- [ ] Session completion modal appears

---

# **Phase 4: Deployment Strategy** 🚀

## **Gradual Rollout:**

### **Option A: Feature Flag (Recommended)**
```javascript
// Add to domains.json or environment
const USE_NEW_NAVIGATION = import.meta.env.VITE_USE_NEW_NAV === 'true';

// In App.jsx
if (USE_NEW_NAVIGATION && domains) {
    // Show new domain navigation
    return <DomainSelection ... />
} else {
    // Show old grade navigation (fallback)
    return <CategoryTabs ... />
}
```

**Benefits:**
- Test new UI without breaking production
- Easy rollback if issues found
- Can A/B test with users

### **Option B: Automatic Detection**
```javascript
// Auto-detect if domains.json exists
const [useLegacyNav, setUseLegacyNav] = useState(false);

useEffect(() => {
    loadDomains()
        .then(domains => {
            if (domains) {
                setUseLegacyNav(false); // Use new navigation
            } else {
                setUseLegacyNav(true); // Fallback to old
            }
        });
}, []);
```

### **Option C: Big Bang (Risky)**
- Deploy all changes at once
- Remove old grade1/2/3.json files
- Force all users to new structure

**Risk:** If bugs exist, all users affected

---

# **Phase 5: Data Cleanup** 🧹

## **After Migration Verified:**

### **1. Move domains.json:**
```bash
# From:
/public/data/new-data/domains.json

# To:
/public/data/domains.json
```

### **2. Archive old files:**
```bash
# Keep as backup but don't load
/public/data/archived/
  ├─ grade1.json
  ├─ grade2.json
  └─ grade3.json
```

### **3. Update .gitignore (optional):**
```
# Don't commit backup files
/public/data/archived/
```

---

# **Reference: File Locations Map**

## **Current Structure:**
```
/public/data/
  ├─ grade1.json (OLD - 74 words)
  ├─ grade2.json (OLD - 187 words)
  └─ grade3.json (OLD - 88 words)
```

## **New Structure:**
```
/public/data/
  ├─ domains.json (MASTER CONFIG)
  ├─ vocabulaire/
  │   ├─ niveau1.json (74 words, IDs 1-169)
  │   ├─ niveau2.json (187 words, IDs 200-375)
  │   └─ niveau3.json (88 words, IDs 400-521)
  └─ grammaire/
      ├─ verbes-niveau1.json (4 verbs, IDs 700-703)
      ├─ verbes-niveau2.json (15 verbs, IDs 710-734)
      ├─ verbes-niveau3.json (14 verbs, IDs 740-755)
      ├─ expressions-niveau1.json (32 expr, IDs 800-839)
      ├─ expressions-niveau2.json (28 expr, IDs 850-887)
      └─ homework-sets.json (homework mappings)
```

---

# **Reference: ID Ranges**

**Critical:** IDs are globally unique across all domains!

```
Vocabulaire:
  - Niveau 1: 1-169 (74 words)
  - Niveau 2: 200-375 (187 words)
  - Niveau 3: 400-521 (88 words)

Grammaire - Verbs:
  - Niveau 1: 700-703 (4 verbs)
  - Niveau 2: 710-734 (15 verbs)
  - Niveau 3: 740-755 (14 verbs)

Grammaire - Expressions:
  - Niveau 1: 800-839 (32 expressions)
  - Niveau 2: 850-887 (28 expressions)
```

**No conflicts detected!** ✅

---

# **Reference: Key Concepts**

## **Domain vs Section vs Level vs Category:**

```
Domain = Top-level learning area (Vocabulaire, Grammaire, Prononciation)
  │
  ├─ Section = Sub-topic (Grammaire only: Verbes, Expressions, Devoirs)
  │    │
  │    └─ Level = Difficulty (Niveau 1/2/3)
  │         │
  │         └─ Category = Thematic grouping (Colors, Animals, etc)
  │              │
  │              └─ Items = Individual content (words, verbs, expressions)
```

**Vocabulaire:** Domain → Level → Category → Words  
**Grammaire:** Domain → Section → Level → Category → Items

---

# **Reference: domains.json Structure**

## **Key Properties:**

```javascript
{
  "domains": [
    {
      "id": "vocabulaire",
      "name": "Vocabulaire",
      "enabled": true,
      "organizationType": "level-based", // or "topic-based"
      "levels": [...],  // For level-based
      "sections": [...], // For topic-based
      "supportedModes": ["multipleChoice", "flashcard"],
      "progressMetric": "wordsLearned"
    }
  ],
  "settings": {
    "unlockStrategy": {
      "type": "sequential-soft",
      "accuracyThreshold": 70
    }
  },
  "metadata": {
    "curriculumAlignment": {
      "bc": { "vocabulaireMapping": {...} }
    }
  }
}
```

---

# **Troubleshooting Guide**

## **Issue: Stats not migrating**
```javascript
// Check localStorage
console.log(localStorage.getItem('frenchQuizProfiles'));

// Manually trigger migration
const profiles = JSON.parse(localStorage.getItem('frenchQuizProfiles'));
const migrated = {};
Object.keys(profiles).forEach(id => {
  migrated[id] = {
    ...profiles[id],
    stats: migrateStatsToNewFormat(profiles[id].stats)
  };
});
localStorage.setItem('frenchQuizProfiles', JSON.stringify(migrated));
```

## **Issue: Files not loading**
```javascript
// Check network tab in DevTools
// Look for 404 errors on JSON files

// Verify paths
console.log('Base path:', import.meta.env.BASE_URL);
console.log('Trying to load:', `${basePath}data/vocabulaire/niveau1.json`);
```

## **Issue: Navigation stuck**
```javascript
// Reset navigation state
setNavigationStep('domain');
setSelectedDomain(null);
setSelectedSection(null);
setSelectedLevel(null);
setSelectedCategory(null);
```

## **Issue: Progress shows 0%**
```javascript
// Verify stats are in new format
const stats = getCurrentStats();
console.log('Stats:', stats);

// Check if domain/level fields exist
Object.values(stats).forEach(stat => {
  if (!stat.domain || !stat.level) {
    console.error('Old format detected:', stat);
  }
});
```

---

# **Summary: Next Steps**

## **To implement this migration:**

1. **Read this document fully** (you are here!)
2. **Start with Step 1:** Update `src/data/words.js` data loader
3. **Test data loading:** Verify all files load correctly
4. **Implement Step 2:** Update App.jsx state management
5. **Create navigation components** (Steps 3)
6. **Update progress tracking** (Steps 4-5)
7. **Test thoroughly** (Phase 3)
8. **Deploy gradually** (Phase 4)
9. **Clean up** (Phase 5)

---

**END OF MIGRATION PLAN**

**Total Document Size:** ~7,800 words  
**Token Usage:** This document + analysis = ~140k tokens  
**Remaining Budget:** ~50k tokens

This plan is comprehensive enough to hand off to another Claude instance or to implement yourself. All critical decisions, code examples, and file paths are documented.