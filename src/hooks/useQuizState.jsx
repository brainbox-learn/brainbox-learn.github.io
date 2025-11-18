import { useState, useEffect, useRef } from 'react';
import { SETTINGS } from '../data/words';
import { generateQuestion as generateQuestionUtil } from '../utils/questionGenerator';

export const useQuizState = (selectedCategory, practiceMode, wordsByCategory, recordAttempt) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [choices, setChoices] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [seenWordIds, setSeenWordIds] = useState([]);
    const [sessionComplete, setSessionComplete] = useState(false);
    
    // NEW: Session tracking
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessionStats, setSessionStats] = useState({
        itemsAttempted: 0,
        itemsCorrect: 0
    });
    const sessionStartTime = useRef(null);

    // NEW: Current mode (multipleChoice, flashcard, etc.)
    const [currentMode, setCurrentMode] = useState('multipleChoice');

    // NEW: Initialize session when category/mode changes
    useEffect(() => {
        // Start new session
        const sessionId = `session-${Date.now()}`;
        setCurrentSessionId(sessionId);
        sessionStartTime.current = Date.now();
        setSessionStats({ itemsAttempted: 0, itemsCorrect: 0 });
        
        return () => {
            // Cleanup: end session when unmounting
            if (currentSessionId && typeof recordAttempt?.endSession === 'function') {
                // Note: You'd need to pass endSession from useProfiles
                // recordAttempt.endSession(currentSessionId, sessionStats.itemsAttempted, sessionStats.itemsCorrect);
            }
        };
    }, [selectedCategory, practiceMode]);

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

    // ENHANCED: Record answer with full tracking
    const selectAnswer = (answer) => {
        setSelectedAnswer(answer);
        setShowResult(true);
        
        // Determine if answer is correct
        const correctAnswer = getCorrectAnswer();
        const isCorrect = answer === correctAnswer;
        
        // Update session stats
        setSessionStats(prev => ({
            itemsAttempted: prev.itemsAttempted + 1,
            itemsCorrect: prev.itemsCorrect + (isCorrect ? 1 : 0)
        }));
        
        // NEW: Record attempt with timestamp and mode
        if (currentQuestion && recordAttempt) {
            recordAttempt(
                currentQuestion.id,
                isCorrect,
                currentMode,
                selectedCategory,
                currentSessionId
            );
        }
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
        
        // NEW: Reset session stats
        const sessionId = `session-${Date.now()}`;
        setCurrentSessionId(sessionId);
        sessionStartTime.current = Date.now();
        setSessionStats({ itemsAttempted: 0, itemsCorrect: 0 });
    };
    
    const resetAndRestart = (category = selectedCategory, wordPool = null) => {
        // Clear seen words and immediately generate with empty list
        setSeenWordIds([]);
        setSessionComplete(false);
        
        // NEW: Start fresh session
        const sessionId = `session-${Date.now()}`;
        setCurrentSessionId(sessionId);
        sessionStartTime.current = Date.now();
        setSessionStats({ itemsAttempted: 0, itemsCorrect: 0 });
        
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

    // NEW: Get current session accuracy
    const getSessionAccuracy = () => {
        if (sessionStats.itemsAttempted === 0) return 0;
        return Math.round((sessionStats.itemsCorrect / sessionStats.itemsAttempted) * 100);
    };

    // NEW: Get session duration
    const getSessionDuration = () => {
        if (!sessionStartTime.current) return 0;
        return Date.now() - sessionStartTime.current;
    };

    // NEW: Set mode (for when switching between quiz/flashcard/etc)
    const setMode = (mode) => {
        setCurrentMode(mode);
    };

    return {
        currentQuestion,
        choices,
        selectedAnswer,
        showResult,
        questionText: getQuestionText(),
        correctAnswer: getCorrectAnswer(),
        sessionComplete,
        
        // NEW: Session tracking exports
        currentSessionId,
        sessionStats,
        currentMode,
        
        // Existing methods
        generateQuestion,
        selectAnswer,
        nextQuestion,
        resetSession,
        resetAndRestart,
        
        // NEW: Session methods
        getSessionAccuracy,
        getSessionDuration,
        setMode
    };
};