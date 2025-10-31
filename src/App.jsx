import { loadAllWords, WORDS_BY_CATEGORY, getWordsForCategory } from './data/words';
import React, { useState, useEffect, useMemo } from 'react';
import { playSound } from './utils/sounds';
import { checkAnswer } from './utils/questionGenerator';
import { getProgressDataForCategory as getProgressDataForCategoryUtil, updateWordStats as updateWordStatsUtil } from './utils/statsCalculator';

// Components
import ProfileSelectionScreen from './components/Profile/ProfileSelectionScreen';
import ProgressReport from './components/Progress/ProgressReport';
import QuizHeader from './components/Quiz/QuizHeader';
import PracticeModeBanner from './components/Quiz/PracticeModeBanner';
import CategoryTabs from './components/Quiz/CategoryTabs';
import QuestionCard from './components/Quiz/QuestionCard';
import FlashCard from './components/Quiz/FlashCard';
import AnimalFooter from './components/UI/AnimalFooter';
import CongratsModal from './components/Quiz/CongratsModal';

// Hooks
import { useProfiles } from './hooks/useProfiles';
import { useQuizState } from './hooks/useQuizState';

const FrenchQuiz = () => {
	const [wordsLoaded, setWordsLoaded] = useState(false);
	const firstCategory = Object.keys(WORDS_BY_CATEGORY)[0] || 'grade1';
	const [selectedGrade, setSelectedGrade] = useState(firstCategory); // "grade1", "grade2", "grade3"
	const [selectedCategory, setSelectedCategory] = useState(null);    // null or category ID like "essential-1"
	const [practiceMode, setPracticeMode] = useState(null);
	const [showProgress, setShowProgress] = useState(false);
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [currentMode, setCurrentMode] = useState('quiz'); // 'quiz' or 'flashcard'
	
	// Load words on mount
	useEffect(() => {
		const initializeWords = async () => {
			await loadAllWords();
			setWordsLoaded(true);
		};
		initializeWords();
	}, []);

	// Get current word pool based on category filter
	const getCurrentWords = () => {
		if (selectedCategory) {
			return getWordsForCategory(selectedGrade, selectedCategory);
		}
		return WORDS_BY_CATEGORY[selectedGrade] || [];
	};

	// Build wordsByCategory object for useQuizState - memoized so it updates reactively
	const wordsByCategory = useMemo(() => {
		// Don't compute until words are loaded
		if (!wordsLoaded || Object.keys(WORDS_BY_CATEGORY).length === 0) {
			return {};
		}
		
		if (selectedCategory) {
			// When filtering by category, pass only those words
			const filteredWords = getCurrentWords();
			if (!filteredWords || filteredWords.length === 0) {
				console.warn('No words found for category:', selectedCategory);
				return WORDS_BY_CATEGORY; // Fallback to all words
			}
			return { [selectedGrade]: filteredWords };
		}
		// When no category filter, pass all words
		return WORDS_BY_CATEGORY;
	}, [selectedCategory, selectedGrade, wordsLoaded]);

	const {
		currentQuestion,
		choices,
		selectedAnswer,
		showResult,
		questionText,
		correctAnswer,
		sessionComplete,
		generateQuestion,
		selectAnswer,
		nextQuestion,
		resetSession,
		resetAndRestart
	} = useQuizState(selectedGrade, practiceMode, wordsByCategory);

	const {
		profiles,
		currentProfileId,
		currentProfile,
		getCurrentStats,
		updateCurrentStats,
		createProfile,
		deleteProfile,
		switchProfile,
		setCurrentProfileId
	} = useProfiles();

	const handleAnswer = (answer) => {
		const isCorrect = checkAnswer(answer, correctAnswer);
		selectAnswer(answer);
		
		const wordId = currentQuestion.id;
		const currentStats = getCurrentStats();
		const category = practiceMode ? practiceMode.category : selectedGrade;
		const newStats = updateWordStatsUtil(currentStats, wordId, isCorrect, category);
		updateCurrentStats(newStats);
		playSound(isCorrect ? 'correct' : 'wrong', soundEnabled);
	};

	const handleGradeChange = (grade) => {
		if (grade === selectedGrade) {
			return;
		}
		setSelectedGrade(grade);
		setSelectedCategory(null); // Reset category when grade changes
		resetAndRestart(grade);
	};

	const handleCategoryChange = (categoryId) => {
		if (categoryId === selectedCategory) {
			return;
		}
		setSelectedCategory(categoryId);
	};

	// NEW: Clear category filter and return to all words
	const handleClearCategoryFilter = () => {
		setSelectedCategory(null);
		resetAndRestart(selectedGrade);
	};
    
	const handleModeChange = (mode) => {
		setCurrentMode(mode);
		resetAndRestart(selectedGrade, practiceMode ? practiceMode.words : null);
	};

	const getProgressData = () => {
		if (!wordsLoaded || Object.keys(WORDS_BY_CATEGORY).length === 0) {
			return { notAttempted: [], allCorrect: [], hasIncorrect: [], total: 0 };
		}
		const stats = getCurrentStats();
		const gradeToUse = practiceMode ? practiceMode.category : selectedGrade;
		return getProgressDataForCategoryUtil(gradeToUse, WORDS_BY_CATEGORY, stats);
	};

	const startPracticeMode = (category, words) => {
		setPracticeMode({ category, words });
		setShowProgress(false);
		resetAndRestart(category, words);
	};

	const exitPracticeMode = () => {
		setPracticeMode(null);
		resetAndRestart(selectedGrade);
	};

	const handleTryAgain = () => {
		const category = practiceMode ? practiceMode.category : selectedGrade;
		const wordPool = practiceMode ? practiceMode.words : null;
		resetAndRestart(category, wordPool);
	};
    
	const handleCloseModal = () => {
		resetSession();
	};

	const handlePracticeHardWords = () => {
		const progressData = getProgressData();
		if (progressData.hasIncorrect.length > 0) {
			startPracticeMode(selectedGrade, progressData.hasIncorrect);
		}
	};

	useEffect(() => {
		if (currentProfileId && wordsLoaded) {
			generateQuestion();
		}
	}, [currentProfileId, wordsLoaded]);

	// Reset quiz when category filter changes (but not when entering/exiting practice mode)
	useEffect(() => {
		if (currentProfileId && wordsLoaded && !practiceMode) {
			resetAndRestart(selectedGrade);
		}
	}, [selectedCategory]);

	// Add loading screen BEFORE profile selection
	if (!wordsLoaded) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-100 flex items-center justify-center">
				<div className="text-center">
					<div className="text-4xl mb-4">🌱</div>
					<div className="text-xl font-semibold text-green-800">Loading words...</div>
				</div>
			</div>
		);
	}

	// Profile selection screen
	if (!currentProfileId) {
		console.log('👤 Showing profile selection screen');
		return (
			<ProfileSelectionScreen
				profiles={profiles}
				onSelectProfile={switchProfile}
				onCreateProfile={createProfile}
				onDeleteProfile={deleteProfile}
				wordsByCategory={WORDS_BY_CATEGORY}
			/>
		);
	}

	// Progress screen
	if (showProgress) {
		return (
			<ProgressReport
				getCurrentStats={getCurrentStats}
				onClose={() => setShowProgress(false)}
				onStartPracticeMode={startPracticeMode}
				wordsByCategory={WORDS_BY_CATEGORY}
				selectedGrade={selectedGrade} // ADD THIS LINE
			/>
		);
	}

	if (!currentQuestion && !sessionComplete) return null;

	const progressData = getProgressData();
	const hasHardWords = progressData.hasIncorrect.length > 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
			<div className="mx-auto">
				<QuizHeader
					currentProfile={currentProfile}
					profiles={profiles}
					currentProfileId={currentProfileId}
					currentMode={currentMode}
					onModeChange={handleModeChange}
					showProfileDropdown={showProfileDropdown}
					setShowProfileDropdown={setShowProfileDropdown}
					onSwitchProfile={switchProfile}
					onAddNewProfile={() => { setCurrentProfileId(null); setShowProfileDropdown(false); }}
					soundEnabled={soundEnabled}
					onToggleSound={() => setSoundEnabled(!soundEnabled)}
					onShowProgress={() => setShowProgress(true)}
				/>

				<PracticeModeBanner 
					practiceMode={practiceMode} 
					onExit={exitPracticeMode} 
				/>
				
				<div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-[minmax(150px,350px)_minmax(450px,1fr)] gap-3">
					<CategoryTabs
						selectedGrade={selectedGrade}
						onSelectGrade={handleGradeChange}
						selectedCategory={selectedCategory}
						onSelectCategory={handleCategoryChange}
						onClearCategory={handleClearCategoryFilter}
						practiceMode={practiceMode}
					/>

					<div className="px-4">
						{currentQuestion && currentMode === 'quiz' && (
							<QuestionCard
								questionText={questionText}
								currentQuestion={currentQuestion}
								getCurrentStats={getCurrentStats}
								choices={choices}
								selectedAnswer={selectedAnswer}
								correctAnswer={correctAnswer}
								showResult={showResult}
								onAnswer={handleAnswer}
								onNextQuestion={() => nextQuestion(
									selectedGrade,
									practiceMode ? practiceMode.words : null
								)}
							/>
						)}

						{currentQuestion && currentMode === 'flashcard' && (
							<FlashCard
								questionText={questionText}
								answerText={correctAnswer}
								currentQuestion={currentQuestion}
								onNextCard={() => nextQuestion(
									selectedGrade,
									practiceMode ? practiceMode.words : null
								)}
							/>
						)}

						<CongratsModal
							isOpen={sessionComplete}
							onClose={handleCloseModal}
							onPracticeHardWords={handlePracticeHardWords}
							onTryAgain={handleTryAgain}
							hasHardWords={hasHardWords}
							isPracticeMode={!!practiceMode}
						/>
					</div>
				</div>

				{/* <AnimalFooter /> */}
			</div>
		</div>
	);
};

export default FrenchQuiz;