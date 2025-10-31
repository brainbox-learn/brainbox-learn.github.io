import { Leaf, Tree, TreePalm } from '@phosphor-icons/react';

const basePath = import.meta.env.BASE_URL;
console.log('basePath', basePath);

// Category configuration - Easy to add new categories!
const CATEGORY_CONFIG = {
    grade1: { label: "Grade 1", icon: Leaf },
    grade2: { label: "Grade 2", icon: TreePalm },
    grade3: { label: "Grade 3", icon: Tree },
};

// This will be populated by loadAllWords()
let WORDS_BY_CATEGORY = {};
let CATEGORIES_BY_GRADE = {}; // NEW
let isLoading = false;
let loadPromise = null;

// Load all category data from JSON files
export const loadAllWords = async () => {
    if (Object.keys(WORDS_BY_CATEGORY).length > 0) {
        return { words: WORDS_BY_CATEGORY, categories: CATEGORIES_BY_GRADE };
    }
    
    if (isLoading && loadPromise) {
        return loadPromise;
    }
    
    isLoading = true;
    
    loadPromise = (async () => {
        const grades = Object.keys(CATEGORY_CONFIG);
        const wordData = {};
        const categoryData = {};
        
        for (const gradeKey of grades) {
            try {
                const response = await fetch(`${basePath}data/${gradeKey}.json`, {
                    cache: 'force-cache'
                });
                if (!response.ok) {
                    throw new Error(`Failed to load ${gradeKey}`);
                }
                
                const data = await response.json();
                
                // NEW: Check if it's the new structure (with categories)
                if (data.categories && Array.isArray(data.categories)) {
                    // Store categories
                    categoryData[gradeKey] = data.categories;
                    
                    // Flatten words for backward compatibility
                    wordData[gradeKey] = data.categories.flatMap(cat => cat.words);
                } else {
                    // OLD: Fallback for old structure (flat array)
                    wordData[gradeKey] = data;
                    categoryData[gradeKey] = [{
                        id: `essential-${data.grade || gradeKey}`,
                        name: "Mots Essentiels",
                        nameEnglish: "Essential Words",
                        icon: "BookOpen",
                        unlocked: true,
                        words: data
                    }];
                }
            } catch (error) {
                console.error(`Error loading ${gradeKey}:`, error);
                wordData[gradeKey] = [];
                categoryData[gradeKey] = [];
            }
        }
        
        WORDS_BY_CATEGORY = wordData;
        CATEGORIES_BY_GRADE = categoryData;
        isLoading = false;
        
        return { words: wordData, categories: categoryData };
    })();
    
    return loadPromise;
};

// NEW: Get categories for a specific grade
export const getCategoriesForGrade = (gradeKey) => {
    return CATEGORIES_BY_GRADE[gradeKey] || [];
};

// NEW: Get words for a specific category
export const getWordsForCategory = (gradeKey, categoryId) => {
    const categories = CATEGORIES_BY_GRADE[gradeKey] || [];
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.words : [];
};

// NEW: Get all unlocked categories for a grade
export const getUnlockedCategories = (gradeKey) => {
    const categories = CATEGORIES_BY_GRADE[gradeKey] || [];
    return categories.filter(cat => cat.unlocked);
};

// Settings
const SETTINGS = {
    multipleChoiceCount: 2,
    quizDirection: 'french-to-english',
};

export { CATEGORY_CONFIG, WORDS_BY_CATEGORY, CATEGORIES_BY_GRADE, SETTINGS };