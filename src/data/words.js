import { Leaf, Tree, TreePalm } from '@phosphor-icons/react';

const basePath = import.meta.env.BASE_URL;

let CATEGORY_CONFIG = {};

let WORDS_BY_CATEGORY = {};
let CATEGORIES_BY_GRADE = {};
let DOMAINS_CONFIG = null;
let CONTENT_BY_DOMAIN = {};
let isLoading = false;
let loadPromise = null;

export const loadDomains = async () => {
    try {
        const response = await fetch(`${basePath}data/domains.json`, { cache: 'force-cache' });
        if (!response.ok) return null;
        const resp = await response.json();
		console.log('resp', resp)
		return resp;
    } catch (error) {
        console.error('Error loading domains:', error);
        return null;
    }
};

const loadLevelBasedDomain = async (domain) => {
    console.log(`📚 Loading ${domain.name}...`);
    const levelData = {};
    for (const level of domain.levels) {
        try {
            const response = await fetch(`${basePath}data/${level.dataFile}`, { cache: 'force-cache' });
            if (!response.ok) throw new Error(`Failed to load ${level.dataFile}`);
            const data = await response.json();
            levelData[level.id] = {
                level: data.level,
                categories: data.categories,
                words: data.categories.flatMap(cat => cat.words || []),
                config: level
            };
        } catch (error) {
            console.error(`  ❌ Error loading ${level.id}:`, error);
        }
    }
    return levelData;
};

const loadTopicBasedDomain = async (domain) => {
    console.log(`📖 Loading ${domain.name}...`);
    const sectionData = {};
    for (const section of domain.sections) {
        if (section.levels) {
            console.log(`  ├─ ${section.name}`);
            sectionData[section.id] = {};
            for (const level of section.levels) {
                try {
                    const response = await fetch(`${basePath}data/${level.dataFile}`, { cache: 'force-cache' });
                    if (!response.ok) throw new Error(`Failed to load ${level.dataFile}`);
                    const data = await response.json();
                    sectionData[section.id][level.id] = {
                        level: data.level,
                        categories: data.categories,
                        items: data.categories.flatMap(cat => cat.items || []),
                        config: level
                    };
                    console.log(`  │  ✅ ${level.displayName}: ${sectionData[section.id][level.id].items.length} items`);
                } catch (error) {
                    console.error(`  │  ❌ Error loading ${section.id}/${level.id}:`, error);
                }
            }
        }
    }
    return sectionData;
};

const buildLegacyCompatibility = (contentByDomain) => {
    console.log('🔄 Building legacy compatibility...');
    const vocab = contentByDomain.vocabulaire || {};
    WORDS_BY_CATEGORY = {
        grade1: vocab.niveau1?.words || [],
        grade2: vocab.niveau2?.words || [],
        grade3: vocab.niveau3?.words || []
    };
    CATEGORIES_BY_GRADE = {
        grade1: vocab.niveau1?.categories || [],
        grade2: vocab.niveau2?.categories || [],
        grade3: vocab.niveau3?.categories || []
    };

	CATEGORY_CONFIG = {
		grade1: { label: vocab.niveau1?.level?.difficulty, englishLabel: vocab.niveau1?.level?.difficultyEnglish, icon: Leaf },
		grade2: { label: vocab.niveau2?.level?.difficulty, englishLabel: vocab.niveau2?.level?.difficultyEnglish, icon: TreePalm },
		grade3: { label: vocab.niveau3?.level?.difficulty, englishLabel: vocab.niveau3?.level?.difficultyEnglish, icon: Tree },
	};

    console.log(`  ✅ grade1: ${WORDS_BY_CATEGORY.grade1.length} words`);
    console.log(`  ✅ grade2: ${WORDS_BY_CATEGORY.grade2.length} words`);
    console.log(`  ✅ grade3: ${WORDS_BY_CATEGORY.grade3.length} words`);
};

export const loadAllContent = async () => {
    if (DOMAINS_CONFIG && Object.keys(CONTENT_BY_DOMAIN).length > 0) {
        return { domains: DOMAINS_CONFIG, content: CONTENT_BY_DOMAIN };
    }
    if (isLoading && loadPromise) return loadPromise;
    
    isLoading = true;
    loadPromise = (async () => {
        const domains = await loadDomains();
        if (!domains) {
            const result = await loadLegacyStructure();
            isLoading = false;
            return result;
        }
        
        DOMAINS_CONFIG = domains;
        const contentByDomain = {};
        
        for (const domain of domains.domains.filter(d => d.enabled)) {
            if (domain.organizationType === 'level-based') {
                contentByDomain[domain.id] = await loadLevelBasedDomain(domain);
            } else if (domain.organizationType === 'topic-based') {
                contentByDomain[domain.id] = await loadTopicBasedDomain(domain);
            }
        }
        
        CONTENT_BY_DOMAIN = contentByDomain;
        buildLegacyCompatibility(contentByDomain);
        isLoading = false;
        return { domains: DOMAINS_CONFIG, content: CONTENT_BY_DOMAIN };
    })();
    
    return loadPromise;
};

const loadLegacyStructure = async () => {
    const wordData = {};
    const categoryData = {};
    for (const gradeKey of Object.keys(CATEGORY_CONFIG)) {
        try {
            const response = await fetch(`${basePath}data/${gradeKey}.json`, { cache: 'force-cache' });
            if (!response.ok) throw new Error(`Failed to load ${gradeKey}`);
            const data = await response.json();
            if (data.categories) {
                categoryData[gradeKey] = data.categories;
                wordData[gradeKey] = data.categories.flatMap(cat => cat.words);
            } else {
                wordData[gradeKey] = data;
                categoryData[gradeKey] = [{ id: `essential-${gradeKey}`, name: "Mots Essentiels", icon: "BookOpen", unlocked: true, words: data }];
            }
        } catch (error) {
            console.error(`Error loading ${gradeKey}:`, error);
            wordData[gradeKey] = [];
            categoryData[gradeKey] = [];
        }
    }
    WORDS_BY_CATEGORY = wordData;
    CATEGORIES_BY_GRADE = categoryData;
    return { words: wordData, categories: categoryData };
};

export const loadAllWords = async () => {
    await loadAllContent();
    return { words: WORDS_BY_CATEGORY, categories: CATEGORIES_BY_GRADE };
};

export const getCategoriesForGrade = (gradeKey) => CATEGORIES_BY_GRADE[gradeKey] || [];
export const getWordsForCategory = (gradeKey, categoryId) => {
    const cat = getCategoriesForGrade(gradeKey).find(c => c.id === categoryId);
    return cat ? cat.words : [];
};
export const getUnlockedCategories = (gradeKey) => getCategoriesForGrade(gradeKey).filter(c => c.unlocked);

export const getDomainConfig = (domainId) => DOMAINS_CONFIG?.domains.find(d => d.id === domainId) || null;

export const getContentForLevel = (domainId, levelId) => CONTENT_BY_DOMAIN[domainId]?.[levelId] || null;

export const getContentForSection = (domainId, sectionId, levelId) => {
    return CONTENT_BY_DOMAIN[domainId]?.[sectionId]?.[levelId] || null;
};

export const getCategoriesForLevel = (domainId, levelId, sectionId = null) => {
    if (sectionId) {
        // Grammaire with section
        const levelData = getContentForSection(domainId, sectionId, levelId);
        return levelData?.categories || [];
    } else {
        // Vocabulaire without section
        const levelData = getContentForLevel(domainId, levelId);
        return levelData?.categories || [];
    }
};

const SETTINGS = {
    multipleChoiceCount: 2,
    quizDirection: 'french-to-english',
};

export { CATEGORY_CONFIG, WORDS_BY_CATEGORY, CATEGORIES_BY_GRADE, SETTINGS, DOMAINS_CONFIG, CONTENT_BY_DOMAIN };