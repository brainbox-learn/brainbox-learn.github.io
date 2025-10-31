# Vocabulary.json Structure Documentation

## Overview

This is the master vocabulary file for the French learning app. It contains all vocabulary organized by grade level and thematic categories, with built-in unlock progression logic.

**Version:** 1.0.0  
**Total Words:** ~280 words across 3 grades  
**Categories:** 15 total (5 per grade)

---

## File Structure

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-26",
  "grades": {
    "1": {
      "id": 1,
      "name": "Grade 1",
      "unlocked": true,
      "categories": [
        {
          "id": "essential-1",
          "name": "Mots Essentiels",
          "nameEnglish": "Essential Words",
          "icon": "BookOpen",
          "unlocked": true,
          "unlockRequirement": null,
          "words": [
            { "id": 1, "french": "un", "english": "one" }
          ]
        }
      ]
    }
  }
}
```

---

## Category Breakdown

### Grade 1 (5 categories, 64 words)
1. **Mots Essentiels** (32 words) - Teacher-provided sight words - Always unlocked
2. **Les Couleurs** (12 words) - Basic colors - Always unlocked
3. **Les Nombres 1-10** (10 words) - Numbers 1-10 - Unlocks at 70% Colors accuracy
4. **Les Animaux Domestiques** (10 words) - Pets - Unlocks at 70% Numbers accuracy
5. **La Nourriture Simple** (10 words) - Basic food - Unlocks at 70% Animals accuracy

### Grade 2 (5 categories, 62 words)
Unlocks when Grade 1 reaches 70% overall accuracy
1. **Mots Essentiels** (31 words) - Always unlocked when grade unlocks
2. **Les Couleurs Avancées** (8 words) - Advanced colors
3. **Les Nombres 11-20** (10 words) - Numbers 11-20
4. **Les Animaux de la Ferme** (10 words) - Farm animals
5. **La Nourriture et les Repas** (12 words) - Food & meals

### Grade 3 (5 categories, 70 words)
Unlocks when Grade 2 reaches 70% overall accuracy
1. **Mots Essentiels** (34 words) - Always unlocked when grade unlocks
2. **Les Animaux Sauvages** (12 words) - Wild animals
3. **Le Corps** (12 words) - Body parts
4. **La Nourriture et la Cuisine** (12 words) - Food & cooking
5. **L'École** (12 words) - School vocabulary

---

## Unlock Logic

### Category Unlock
```javascript
// Example: Numbers unlock when Colors reaches 70% accuracy
{
  "unlockRequirement": {
    "categoryId": "colors-1",
    "accuracy": 70
  }
}
```

### Grade Unlock
```javascript
// Example: Grade 2 unlocks when Grade 1 reaches 70% overall
{
  "unlockRequirement": {
    "gradeId": 1,
    "overallAccuracy": 70
  }
}
```

### Always Unlocked
```javascript
{
  "unlocked": true,
  "unlockRequirement": null
}
```

---

## ID System

IDs are organized in ranges to avoid conflicts:

| Range | Usage |
|-------|-------|
| 1-99 | Grade 1 Essential |
| 100-199 | Grade 1 Thematic Categories |
| 200-299 | Grade 2 Essential |
| 250-349 | Grade 2 Thematic Categories |
| 400-449 | Grade 3 Essential |
| 450-549 | Grade 3 Thematic Categories |

---

## Icon Names (Phosphor Icons)

Current icons used:
- `BookOpen` - Essential/Grammar words
- `Palette` - Colors
- `Hash` - Numbers
- `Dog` - Pets (Grade 1)
- `Horse` - Farm Animals (Grade 2)
- `PawPrint` - Wild Animals (Grade 3)
- `Apple` - Basic Food (Grade 1)
- `ForkKnife` - Food & Meals (Grade 2)
- `ChefHat` - Food & Cooking (Grade 3)
- `User` - Body Parts
- `Backpack` - School

---

## Usage Examples

### Loading a Grade
```javascript
import vocabularyData from './vocabulary.json';

const grade1 = vocabularyData.grades["1"];
console.log(grade1.categories); // Array of 5 categories
```

### Filtering for Quiz/Flashcard Mode
```javascript
// Get specific category
const colorsCategory = grade1.categories.find(c => c.id === "colors-1");
const colorWords = colorsCategory.words;

// Get all unlocked categories
const unlockedCategories = grade1.categories.filter(c => c.unlocked);

// Get all words from a grade (for "All Categories" mode)
const allGrade1Words = grade1.categories.flatMap(c => c.words);

// Get practice words (you'll need user stats)
const practiceWords = getAllWordsNeedingPractice(grade1, userStats);
```

### Checking Unlock Status
```javascript
function shouldUnlockCategory(category, userStats) {
  if (category.unlocked) return true;
  if (!category.unlockRequirement) return false;
  
  const requirement = category.unlockRequirement;
  const requiredCategory = findCategoryById(requirement.categoryId);
  const accuracy = calculateAccuracy(requiredCategory, userStats);
  
  return accuracy >= requirement.accuracy;
}
```

---

## Migration from Old Structure

### Old Files (Flat arrays)
```json
// grade1.json
[
  { "id": 67, "french": "un", "english": "one" },
  { "id": 68, "french": "une", "english": "one" }
]
```

### New Structure (Nested categories)
```json
{
  "grades": {
    "1": {
      "categories": [
        {
          "id": "essential-1",
          "words": [
            { "id": 1, "french": "un", "english": "one" }
          ]
        }
      ]
    }
  }
}
```

### Migration Steps for Your React App

1. **Update data loading:**
```javascript
// OLD
import grade1Data from './grade1.json';
const words = grade1Data;

// NEW
import vocabularyData from './vocabulary.json';
const grade1 = vocabularyData.grades["1"];
const essentialWords = grade1.categories.find(c => c.id === "essential-1").words;
```

2. **Update category selection UI:**
- Add category dropdown/buttons
- Show locked/unlocked states
- Display unlock requirements

3. **Update progress tracking:**
- Track stats per category, not just per grade
- Calculate unlock conditions
- Show progress bars per category

4. **Update Quiz/Flashcard components:**
- Accept `categoryId` prop
- Filter words by category before starting session
- Add "All Categories" option that combines all unlocked categories

---

## Key Changes from Original Files

### Fixed Encoding Issues
- `derriÃ¨re` → `derrière`
- `jusqu'Ã ` → `jusqu'à`
- `Ã©taient` → `ils étaient`
- `l'Å"il` → `l'œil`
- All other accented characters corrected

### Simplified Gendered Words
Teacher's lists kept as-is (e.g., `heureux/heureuse`, `long/longue`), but new thematic vocabulary uses masculine form only for simplicity.

### Added Articles to Thematic Vocabulary
All nouns in thematic categories include articles to teach gender:
- `le chat` (not just `chat`)
- `la pomme` (not just `pomme`)

### ID Renumbering
Original IDs preserved for Essential categories, new IDs assigned to thematic categories in organized ranges.

---

## Filtering Strategies for UI

### Option 1: Hidden Filtering (Recommended for Young Learners)
```
User Flow:
Profile → Grade → Category → Mode (Quiz/Flashcard)
```
- Simple, linear flow
- Category selection is visible but not complicated
- Mode selection happens last

### Option 2: Dropdown Filtering
```
User Flow:
Profile → Grade → Mode → [Category Dropdown Inside Mode]
```
- Category filter dropdown inside Quiz/Flashcard
- Options: "All Unlocked", "Colors", "Numbers", "Practice Mode"
- More flexible but requires understanding of filtering concept

### Option 3: Smart Defaults with Override
```
User Flow:
Profile → Grade → Mode (with smart default)
```
- Quiz/Flashcard defaults to "Practice Mode" words if any exist
- Otherwise defaults to most recently unlocked category
- Advanced users can click "Change Category" to override

---

## Future Expansion

To add new categories:

1. **Choose appropriate ID range** (next available in grade range)
2. **Add category object** with required fields
3. **Set unlock requirement** (or set unlocked: true)
4. **Add 10-15 words** with sequential IDs
5. **Update this README** with new totals

Example:
```json
{
  "id": "weather-2",
  "name": "La Météo",
  "nameEnglish": "Weather",
  "icon": "Cloud",
  "unlocked": false,
  "unlockRequirement": {
    "categoryId": "food-2",
    "accuracy": 70
  },
  "words": [...]
}
```

---

## Notes

- **Version Control**: Update `version` and `lastUpdated` when making changes
- **Consistency**: All French words should include proper accents and articles where appropriate
- **Testing**: Test unlock logic thoroughly - categories should unlock progressively
- **Backups**: Keep backups of old grade1/2/3.json files until migration is complete

---

## Questions or Issues?

If you encounter issues with:
- Unlock logic not working
- Missing vocabulary
- Incorrect translations
- UI breaking changes

Check:
1. Is the category filtering code updated?
2. Are user stats being tracked per category?
3. Is the unlock calculation correct?
4. Are the old grade files still being imported anywhere?
