export const getProgressDataForCategory = (category, wordsByCategory, stats) => {
    const wordsForCategory = wordsByCategory[category];
    const notAttempted = wordsForCategory.filter(w => !stats[w.id]);
    const attempted = wordsForCategory.filter(w => stats[w.id]);
    
    // FIXED: Mastered = more correct than incorrect (allows recovery from mistakes)
    const allCorrect = attempted.filter(w => stats[w.id].correct > stats[w.id].incorrect);
    
    // FIXED: Needs practice = incorrect >= correct (includes ties at 1/1)
    const hasIncorrect = attempted.filter(w => stats[w.id].incorrect >= stats[w.id].correct);
    
    return { 
        notAttempted, 
        allCorrect, 
        hasIncorrect, 
        total: wordsForCategory.length 
    };
};

export const calculatePercentComplete = (allCorrect, total) => {
    return Math.round((allCorrect.length / total) * 100);
};

export const calculateOverallProgress = (wordsByCategory, stats) => {
    const totalWords = Object.values(wordsByCategory).flat().length;
    
    // FIXED: Mastered = more correct than incorrect
    const masteredWords = Object.values(stats).filter(s => 
        s.attempts > 0 && s.correct > s.incorrect
    ).length;
    
    return Math.round((masteredWords / totalWords) * 100);
};

export const updateWordStats = (stats, wordId, isCorrect, category) => {
    return {
        ...stats,
        [wordId]: {
            ...stats[wordId],
            attempts: (stats[wordId]?.attempts || 0) + 1,
            correct: (stats[wordId]?.correct || 0) + (isCorrect ? 1 : 0),
            incorrect: (stats[wordId]?.incorrect || 0) + (isCorrect ? 0 : 1),
            category: category,
        }
    };
};