export const generateQuestion = (category, wordsByCategory, settings, wordPool = null, seenWordIds = []) => {
    const wordsForCategory = wordPool || wordsByCategory[category];
    
    // Check if wordsForCategory is valid
    if (!wordsForCategory || !Array.isArray(wordsForCategory)) {
        console.error('Invalid wordsForCategory:', wordsForCategory, 'for category:', category);
        return { sessionComplete: true };
    }
    
    // Filter out words already seen this session
    const unseenWords = wordsForCategory.filter(word => !seenWordIds.includes(word.id));
    
    // If all words have been seen, return session complete flag
    if (unseenWords.length === 0) {
        return { sessionComplete: true };
    }
    
    // Pick a random unseen word
    const word = unseenWords[Math.floor(Math.random() * unseenWords.length)];
    const correctAnswer = settings.quizDirection === 'french-to-english' ? word.english : word.french;
    
    // Shuffle and pick sequentially to avoid infinite loops
    const fullCategoryWords = wordsByCategory[category];
    const shuffledWords = [...fullCategoryWords].sort(() => Math.random() - 0.5);
    const wrongAnswers = [];
    
    for (let i = 0; i < shuffledWords.length && wrongAnswers.length < settings.multipleChoiceCount - 1; i++) {
        const wrongAnswer = settings.quizDirection === 'french-to-english' 
            ? shuffledWords[i].english 
            : shuffledWords[i].french;
        
        if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
            wrongAnswers.push(wrongAnswer);
        }
    }
    
    const allChoices = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
    
    return {
        word,
        choices: allChoices,
        correctAnswer,
        sessionComplete: false
    };
};

export const checkAnswer = (answer, correctAnswer) => {
    return answer === correctAnswer;
};