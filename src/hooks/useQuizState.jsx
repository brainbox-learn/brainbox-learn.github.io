import { useState, useEffect } from 'react';
import { SETTINGS } from '../data/words';
import { generateQuestion as generateQuestionUtil } from '../utils/questionGenerator';

export const useQuizState = (selectedCategory, practiceMode, wordsByCategory) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [choices, setChoices] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [seenWordIds, setSeenWordIds] = useState([]);
    const [sessionComplete, setSessionComplete] = useState(false);

    const generateQuestion = (category = selectedCategory, wordPool = null) => {
        const result = generateQuestionUtil(
            category, 
            wordsByCategory, 
            SETTINGS, 
            wordPool, 
            seenWordIds
        );
        
        // Check if session is complete
        if (result.sessionComplete) {
            setSessionComplete(true);
            return;
        }
        
        setCurrentQuestion(result.word);
        setChoices(result.choices);
        setSelectedAnswer(null);
        setShowResult(false);
        setSessionComplete(false);
    };

    const selectAnswer = (answer) => {
        setSelectedAnswer(answer);
        setShowResult(true);
    };
    
    const nextQuestion = (category = selectedCategory, wordPool = null) => {
        // Mark current word as seen before generating next question
        if (currentQuestion) {
            const newSeenIds = [...seenWordIds, currentQuestion.id];
            setSeenWordIds(newSeenIds);
            
            // Generate next question with updated seen list
            const result = generateQuestionUtil(
                category, 
                wordsByCategory, 
                SETTINGS, 
                wordPool, 
                newSeenIds
            );
            
            if (result.sessionComplete) {
                setSessionComplete(true);
                return;
            }
            
            setCurrentQuestion(result.word);
            setChoices(result.choices);
            setSelectedAnswer(null);
            setShowResult(false);
            setSessionComplete(false);
        }
    };

    const resetSession = () => {
        setSeenWordIds([]);
        setSessionComplete(false);
    };
    
    const resetAndRestart = (category = selectedCategory, wordPool = null) => {
        // Clear seen words and immediately generate with empty list
        setSeenWordIds([]);
        setSessionComplete(false);
        
        const result = generateQuestionUtil(
            category, 
            wordsByCategory, 
            SETTINGS, 
            wordPool, 
            [] // Use empty array since we just reset
        );
        
        if (result.sessionComplete) {
            setSessionComplete(true);
            return;
        }
        
        setCurrentQuestion(result.word);
        setChoices(result.choices);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    const getQuestionText = () => {
        if (!currentQuestion) return '';
        return SETTINGS.quizDirection === 'french-to-english' 
            ? currentQuestion.french 
            : currentQuestion.english;
    };

    const getCorrectAnswer = () => {
        if (!currentQuestion) return '';
        return SETTINGS.quizDirection === 'french-to-english'
            ? currentQuestion.english
            : currentQuestion.french;
    };

    return {
        currentQuestion,
        choices,
        selectedAnswer,
        showResult,
        questionText: getQuestionText(),
        correctAnswer: getCorrectAnswer(),
        sessionComplete,
        generateQuestion,
        selectAnswer,
        nextQuestion,
        resetSession,
        resetAndRestart
    };
};