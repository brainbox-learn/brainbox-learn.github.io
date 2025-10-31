# Migration Guide - Your Specific Codebase

## Current Implementation Analysis

Your `wordData.js` file currently:
- ✅ Dynamically loads JSON files from `/public/data/`
- ✅ Uses categories: `grade1`, `grade2`, `grade3`
- ✅ Caches loaded data in `WORDS_BY_CATEGORY`
- ✅ Has category config with labels and icons

## Migration Strategy - TWO OPTIONS

---

## OPTION 1: Minimal Changes (Recommended for Quick Migration)

Keep your current structure but enhance the JSON files with category information.

### Step 1: Create Enhanced JSON Files

Instead of replacing with `vocabulary.json`, create new enhanced versions:

**public/data/grade1.json**
```json
{
  "grade": 1,
  "categories": [
    {
      "id": "essential-1",
      "name": "Mots Essentiels",
      "nameEnglish": "Essential Words",
      "icon": "BookOpen",
      "unlocked": true,
      "words": [
        { "id": 1, "french": "un", "english": "one" },
        { "id": 2, "french": "une", "english": "one" }
        // ... rest of your current 32 words
      ]
    },
    {
      "id": "colors-1",
      "name": "Les Couleurs",
      "nameEnglish": "Colors",
      "icon": "Palette",
      "unlocked": true,
      "words": [
        { "id": 100, "french": "rouge", "english": "red" },
        { "id": 101, "french": "bleu", "english": "blue" }
        // ... 12 color words
      ]
    }
    // ... other categories
  ]
}
```

### Step 2: Update wordData.js

```javascript
import { Leaf, Tree, TreePalm } from '@phosphor-icons/react';

const basePath = import.meta.env.BASE_URL;

// Category configuration - Easy to add new categories!
const CATEGORY_CONFIG = {
    grade1: { label: "Grade 1", icon: Leaf },
    grade2: { label: "Grade 2", icon: TreePalm },
    grade3: { label: "Grade 3", icon: Tree },
};

// NEW: Cache for both flat words and category structure
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
```

### Step 3: Update Components Gradually

**BACKWARD COMPATIBLE:** Your existing code still works!

```javascript
// OLD CODE - STILL WORKS
const words = WORDS_BY_CATEGORY['grade1']; // Returns flat array

// NEW CODE - Enhanced functionality
const categories = getCategoriesForGrade('grade1');
const colorWords = getWordsForCategory('grade1', 'colors-1');
```

---

## OPTION 2: Full Migration to Master File

Use the single `vocabulary.json` master file.

### Step 1: Place vocabulary.json

Put the master `vocabulary.json` in `public/data/vocabulary.json`

### Step 2: Complete Rewrite of wordData.js

```javascript
import { Leaf, Tree, TreePalm, BookOpen, Palette, Hash, Dog, Apple } from '@phosphor-icons/react';

const basePath = import.meta.env.BASE_URL;

// Icon mapping
const ICON_MAP = {
    'Leaf': Leaf,
    'Tree': Tree,
    'TreePalm': TreePalm,
    'BookOpen': BookOpen,
    'Palette': Palette,
    'Hash': Hash,
    'Dog': Dog,
    'Apple': Apple,
    // Add more as needed
};

// Grade configuration
const GRADE_CONFIG = {
    1: { label: "Grade 1", icon: Leaf },
    2: { label: "Grade 2", icon: TreePalm },
    3: { label: "Grade 3", icon: Tree },
};

let VOCABULARY_DATA = null;
let isLoading = false;
let loadPromise = null;

// Load master vocabulary file
export const loadAllWords = async () => {
    if (VOCABULARY_DATA) {
        return VOCABULARY_DATA;
    }
    
    if (isLoading && loadPromise) {
        return loadPromise;
    }
    
    isLoading = true;
    
    loadPromise = (async () => {
        try {
            const response = await fetch(`${basePath}data/vocabulary.json`, {
                cache: 'force-cache'
            });
            
            if (!response.ok) {
                throw new Error('Failed to load vocabulary');
            }
            
            VOCABULARY_DATA = await response.json();
            isLoading = false;
            return VOCABULARY_DATA;
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            isLoading = false;
            throw error;
        }
    })();
    
    return loadPromise;
};

// Get all grades
export const getAllGrades = () => {
    if (!VOCABULARY_DATA) return [];
    return Object.values(VOCABULARY_DATA.grades);
};

// Get specific grade
export const getGrade = (gradeId) => {
    if (!VOCABULARY_DATA) return null;
    return VOCABULARY_DATA.grades[gradeId.toString()];
};

// Get categories for grade
export const getCategoriesForGrade = (gradeId) => {
    const grade = getGrade(gradeId);
    return grade ? grade.categories : [];
};

// Get specific category
export const getCategory = (gradeId, categoryId) => {
    const categories = getCategoriesForGrade(gradeId);
    return categories.find(cat => cat.id === categoryId);
};

// Get words for category
export const getWordsForCategory = (gradeId, categoryId) => {
    const category = getCategory(gradeId, categoryId);
    return category ? category.words : [];
};

// Get all words for a grade (flat array for backward compatibility)
export const getWordsForGrade = (gradeId) => {
    const categories = getCategoriesForGrade(gradeId);
    return categories.flatMap(cat => cat.words);
};

// BACKWARD COMPATIBILITY: Mimic old structure
export const WORDS_BY_CATEGORY = {
    get grade1() { return getWordsForGrade(1); },
    get grade2() { return getWordsForGrade(2); },
    get grade3() { return getWordsForGrade(3); },
};

// Get unlocked categories
export const getUnlockedCategories = (gradeId, userStats = {}) => {
    const categories = getCategoriesForGrade(gradeId);
    return categories.filter(cat => {
        if (cat.unlocked) return true;
        if (!cat.unlockRequirement) return false;
        
        // Check unlock requirement
        // TODO: Implement with your stats system
        return false;
    });
};

// Check if category should unlock
export const shouldUnlockCategory = (category, userStats) => {
    if (category.unlocked) return true;
    if (!category.unlockRequirement) return false;
    
    const req = category.unlockRequirement;
    
    // Category unlock (based on accuracy)
    if (req.categoryId) {
        // TODO: Calculate accuracy from userStats
        const requiredCategory = getCategory(/* need grade */, req.categoryId);
        // const accuracy = calculateAccuracy(requiredCategory, userStats);
        // return accuracy >= req.accuracy;
        return false; // Placeholder
    }
    
    // Grade unlock (based on overall accuracy)
    if (req.gradeId) {
        // TODO: Calculate overall grade accuracy
        // const overallAccuracy = calculateGradeAccuracy(req.gradeId, userStats);
        // return overallAccuracy >= req.overallAccuracy;
        return false; // Placeholder
    }
    
    return false;
};

// Get icon component from string
export const getIconComponent = (iconName) => {
    return ICON_MAP[iconName] || BookOpen;
};

// Settings
const SETTINGS = {
    multipleChoiceCount: 2,
    quizDirection: 'french-to-english',
};

export { GRADE_CONFIG, SETTINGS };
```

---

## Recommended Approach: OPTION 1 (Hybrid)

**Why?**
- ✅ Minimal code changes
- ✅ Backward compatible
- ✅ Easy to test incrementally
- ✅ Can rollback quickly if issues
- ✅ Keep existing file structure

**Migration Steps:**

### Week 1: Preparation
1. ✅ Keep your current `grade1.json`, `grade2.json`, `grade3.json`
2. ✅ Add the enhanced structure to them (categories array)
3. ✅ Update `wordData.js` to handle both formats
4. ✅ Test that existing app still works

### Week 2: Category UI
1. Add category selection screen
2. Use `getCategoriesForGrade()` to list categories
3. Show lock/unlock status
4. Filter words by category in Quiz/Flashcard

### Week 3: Unlock Logic
1. Implement stats tracking per category
2. Add unlock checks
3. Show unlock celebrations

---

## File Changes Checklist

### Files to Update
- [ ] `public/data/grade1.json` - Add category structure
- [ ] `public/data/grade2.json` - Add category structure
- [ ] `public/data/grade3.json` - Add category structure
- [ ] `src/wordData.js` - Add category support (backward compatible)
- [ ] `src/components/CategorySelection.jsx` - NEW component
- [ ] `src/components/Quiz.jsx` - Add categoryId prop
- [ ] `src/components/Flashcards.jsx` - Add categoryId prop
- [ ] `src/hooks/useProfiles.js` - Track stats per category

### Files to Create
- [ ] `src/utils/unlockLogic.js` - Unlock calculation functions
- [ ] `src/components/CategoryCard.jsx` - Display category with progress
- [ ] `src/components/UnlockModal.jsx` - Celebration when unlocking

---

## Example: Enhanced grade1.json (Backward Compatible)

```json
{
  "grade": 1,
  "categories": [
    {
      "id": "essential-1",
      "name": "Mots Essentiels",
      "nameEnglish": "Essential Words",
      "icon": "BookOpen",
      "unlocked": true,
      "unlockRequirement": null,
      "words": [
        { "id": 1, "french": "un", "english": "one" },
        { "id": 2, "french": "une", "english": "one" },
        { "id": 3, "french": "elle", "english": "she" }
        // ... your existing 32 words with IDs renumbered from 1-32
      ]
    },
    {
      "id": "colors-1",
      "name": "Les Couleurs",
      "nameEnglish": "Colors",
      "icon": "Palette",
      "unlocked": true,
      "unlockRequirement": null,
      "words": [
        { "id": 100, "french": "rouge", "english": "red" },
        { "id": 101, "french": "bleu", "english": "blue" },
        { "id": 102, "french": "jaune", "english": "yellow" },
        { "id": 103, "french": "vert", "english": "green" },
        { "id": 104, "french": "orange", "english": "orange" },
        { "id": 105, "french": "rose", "english": "pink" },
        { "id": 106, "french": "blanc", "english": "white" },
        { "id": 107, "french": "noir", "english": "black" },
        { "id": 108, "french": "gris", "english": "gray" },
        { "id": 109, "french": "brun", "english": "brown" },
        { "id": 110, "french": "violet", "english": "purple" },
        { "id": 111, "french": "beige", "english": "beige" }
      ]
    },
    {
      "id": "numbers-1",
      "name": "Les Nombres 1-10",
      "nameEnglish": "Numbers 1-10",
      "icon": "Hash",
      "unlocked": false,
      "unlockRequirement": {
        "categoryId": "colors-1",
        "accuracy": 70
      },
      "words": [
        { "id": 120, "french": "un", "english": "one" },
        { "id": 121, "french": "deux", "english": "two" },
        { "id": 122, "french": "trois", "english": "three" },
        { "id": 123, "french": "quatre", "english": "four" },
        { "id": 124, "french": "cinq", "english": "five" },
        { "id": 125, "french": "six", "english": "six" },
        { "id": 126, "french": "sept", "english": "seven" },
        { "id": 127, "french": "huit", "english": "eight" },
        { "id": 128, "french": "neuf", "english": "nine" },
        { "id": 129, "french": "dix", "english": "ten" }
      ]
    }
  ]
}
```

---

## Testing Your Migration

### Test 1: Backward Compatibility
```javascript
// This should still work
await loadAllWords();
const grade1Words = WORDS_BY_CATEGORY['grade1'];
console.log('Grade 1 words:', grade1Words.length); // Should be 54 (32 + 12 + 10)
```

### Test 2: New Category Features
```javascript
await loadAllWords();
const categories = getCategoriesForGrade('grade1');
console.log('Categories:', categories); // Should show 3-5 categories

const colorWords = getWordsForCategory('grade1', 'colors-1');
console.log('Color words:', colorWords.length); // Should be 12
```

### Test 3: Unlock Logic
```javascript
const categories = getCategoriesForGrade('grade1');
const numbersCategory = categories.find(c => c.id === 'numbers-1');
console.log('Numbers locked?', !numbersCategory.unlocked); // Should be true
console.log('Unlock requirement:', numbersCategory.unlockRequirement);
```

---

## Next Steps After Migration

1. **Create Category Selection UI**
   ```jsx
   // CategorySelection.jsx
   const categories = getCategoriesForGrade(currentGrade);
   
   return (
     <div className="categories">
       {categories.map(category => (
         <CategoryCard 
           key={category.id}
           category={category}
           onClick={() => selectCategory(category.id)}
         />
       ))}
     </div>
   );
   ```

2. **Update Quiz Component**
   ```jsx
   // Quiz.jsx - Add categoryId prop
   const Quiz = ({ gradeKey, categoryId }) => {
     const words = categoryId 
       ? getWordsForCategory(gradeKey, categoryId)
       : WORDS_BY_CATEGORY[gradeKey];
     
     // Rest of quiz logic
   };
   ```

3. **Track Stats Per Category**
   ```javascript
   // In useProfiles or stats system
   const stats = {
     grade1: {
       'essential-1': { correct: 25, incorrect: 7 },
       'colors-1': { correct: 11, incorrect: 1 },
       // ...
     }
   };
   ```

---

## Rollback Plan (If Things Break)

1. **Revert wordData.js** to original
2. **Restore old JSON files** from backup
3. **Remove new components** (CategorySelection, etc.)
4. **Clear localStorage** to reset state

Keep backups of:
- ✅ Original `wordData.js`
- ✅ Original `grade1/2/3.json` files
- ✅ Git commit before changes

---

## Summary

**Recommended:** Option 1 (Hybrid approach)
- Minimal risk
- Backward compatible
- Incremental testing
- Easy rollback

**Start with:** Just update the JSON files structure, leave your code as-is. Test that existing app still works. Then gradually add category features.

**Timeline:**
- Day 1: Update JSON files with categories structure
- Day 2: Update wordData.js with new helper functions
- Day 3: Test backward compatibility
- Day 4-5: Add category selection UI
- Week 2: Add unlock logic
- Week 3: Add gamification visuals

You've got a solid foundation already. This migration will enhance it without breaking what works!
