// questionGenerator.js - COMPLETE FILE

import { SETTINGS } from '../data/words';

// Generate question text and correct answer based on item type
export const generateQuestionFromItem = (item, direction = 'french-to-english') => {
    if (!item) return { question: '', answer: '' };
    
    // Handle vocabulary words
    if (item.french && item.english) {
        if (direction === 'french-to-english') {
            return {
                question: item.french,
                answer: item.english,
                type: 'vocabulary'
            };
        } else {
            return {
                question: item.english,
                answer: item.french,
                type: 'vocabulary'
            };
        }
    }
    
    // Handle verbs
    if (item.type === 'verb' && item.infinitive && item.english) {
        if (direction === 'french-to-english') {
            return {
                question: item.infinitive,
                answer: item.english,
                type: 'verb'
            };
        } else {
            return {
                question: item.english,
                answer: item.infinitive,
                type: 'verb'
            };
        }
    }
    
    // Handle expressions or other items with infinitive/english structure
    if (item.infinitive && item.english) {
        if (direction === 'french-to-english') {
            return {
                question: item.infinitive,
                answer: item.english,
                type: 'expression'
            };
        } else {
            return {
                question: item.english,
                answer: item.infinitive,
                type: 'expression'
            };
        }
    }
    
    // Fallback
    return { question: '', answer: '', type: 'unknown' };
};

// Helper to get answer from any item type
const getItemAnswer = (item, direction = 'french-to-english') => {
    if (item.french && item.english) {
        return direction === 'french-to-english' ? item.english : item.french;
    }
    if (item.infinitive && item.english) {
        return direction === 'french-to-english' ? item.english : item.infinitive;
    }
    return '';
};

// Generate wrong answers for multiple choice
export const generateWrongAnswers = (correctAnswer, allItems, count = 2) => {
    const wrongAnswers = [];
    const availableItems = allItems.filter(item => {
        const itemAnswer = getItemAnswer(item);
        return itemAnswer && itemAnswer !== correctAnswer;
    });
    
    // Shuffle and pick random wrong answers
    const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
        wrongAnswers.push(getItemAnswer(shuffled[i]));
    }
    
    return wrongAnswers;
};

// Main function used by useQuizState
export const generateQuestion = (selectedCategory, wordsByCategory, settings, wordPool = null, seenWordIds = []) => {
    const categoryWords = wordsByCategory[selectedCategory] || [];
    const wordsToUse = wordPool || categoryWords;
    
    if (wordsToUse.length === 0) {
        return { sessionComplete: true };
    }
    
    // Filter out seen words
    const unseenWords = wordsToUse.filter(word => !seenWordIds.includes(word.id));
    
    // If all words have been seen, session is complete
    if (unseenWords.length === 0) {
        return { sessionComplete: true };
    }
    
    // Pick random word from unseen
    const randomWord = unseenWords[Math.floor(Math.random() * unseenWords.length)];
    
    // Get question and answer using new helper
    const { question, answer } = generateQuestionFromItem(randomWord, settings.quizDirection);
    
    // Generate wrong answers
    const wrongAnswers = generateWrongAnswers(answer, wordsToUse, settings.multipleChoiceCount);
    
    // Combine and shuffle choices
    const allChoices = [answer, ...wrongAnswers];
    const shuffledChoices = shuffleArray(allChoices);
    
    return {
        word: {
            ...randomWord,
            french: question,  // Map to expected format for backward compat
            english: answer
        },
        choices: shuffledChoices,
        sessionComplete: false
    };
};

// Check if answer is correct (case-insensitive, trimmed)
export const checkAnswer = (userAnswer, correctAnswer) => {
    if (!userAnswer || !correctAnswer) return false;
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
};

// Shuffle array
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};