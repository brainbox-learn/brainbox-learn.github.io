import { loadAllWords, loadAllContent, WORDS_BY_CATEGORY, DOMAINS_CONFIG, CONTENT_BY_DOMAIN, getWordsForCategory } from './data/words';
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import CongratsModal from './components/Quiz/CongratsModal';

// Hooks
import { useProfiles } from './hooks/useProfiles';
import { useQuizState } from './hooks/useQuizState';

// utils
import { safeMigration } from './utils/profileMigration';

const FrenchQuiz = () => {

	const sessionStartTime = useRef(Date.now());
	const accumulatedTime = useRef(0);

	const [wordsLoaded, setWordsLoaded] = useState(false);
	
	// NEW: Domain-based state
	const [domains, setDomains] = useState(null);
	const [contentData, setContentData] = useState(null);
	const [selectedDomain, setSelectedDomain] = useState(null); // 'vocabulaire' | 'grammaire' | null
	const [selectedSection, setSelectedSection] = useState(null); // 'verbes' | 'expressions' | null (grammaire only)
	const [selectedLevel, setSelectedLevel] = useState(null); // 'niveau1' | 'niveau2' | 'niveau3' | null
	
	
	// LEGACY: Grade-based state (kept for backward compatibility)
	const firstCategory = Object.keys(WORDS_BY_CATEGORY)[0] || 'grade1';
	const [selectedGrade, setSelectedGrade] = useState(firstCategory); // "grade1", "grade2", "grade3"
	const [selectedCategory, setSelectedCategory] = useState(null);    // null or category ID like "essential-1"
	
	// Common state
	const [practiceMode, setPracticeMode] = useState(null);
	const [showProgress, setShowProgress] = useState(false);
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [currentMode, setCurrentMode] = useState('quiz'); // 'quiz' or 'flashcard'
	
	useEffect(() => {
		const result = safeMigration();
		if (!result.success) {
		  console.error('Migration failed, but data restored');
		}
	  }, []);
	
	// Load all content on mount
	useEffect(() => {
		const initializeContent = async () => {
			const result = await loadAllContent();
			
			if (result.domains) {
				// New domain-based structure loaded
				setDomains(result.domains);
				setContentData(result.content);
				
				// Auto-select vocabulaire > niveau1 as default
				setSelectedDomain('vocabulaire');
				setSelectedLevel('niveau1');
			}
			
			setWordsLoaded(true);
		};
		initializeContent();
	}, []);

	// Get current word pool based on category filter
// Get current word pool based on domain/section/level/category
const getCurrentWords = () => {
	if (!selectedDomain || !selectedLevel) return [];
	
	if (selectedCategory) {
		// Get words/items for specific category
		if (selectedDomain === 'vocabulaire') {
			const levelData = CONTENT_BY_DOMAIN.vocabulaire?.[selectedLevel];
			const category = levelData?.categories.find(cat => cat.id === selectedCategory);
			return category?.words || [];
		} else if (selectedDomain === 'grammaire' && selectedSection) {
			const levelData = CONTENT_BY_DOMAIN.grammaire?.[selectedSection]?.[selectedLevel];
			const category = levelData?.categories.find(cat => cat.id === selectedCategory);
			return category?.items || [];
		}
	}
	
	// No category selected - return all for this level
	if (selectedDomain === 'vocabulaire') {
		return CONTENT_BY_DOMAIN.vocabulaire?.[selectedLevel]?.words || [];
	} else if (selectedDomain === 'grammaire' && selectedSection) {
		return CONTENT_BY_DOMAIN.grammaire?.[selectedSection]?.[selectedLevel]?.items || [];
	}
	
	return [];
};

		// Build wordsByCategory object for useQuizState - memoized so it updates reactively
		const wordsByCategory = useMemo(() => {
			if (!wordsLoaded || !selectedDomain || !selectedLevel) {
				return { [selectedGrade]: [] }; // Return empty array, not empty object
			}
			
			// SAFETY: If grammaire but no section yet, return empty array (still loading)
			if (selectedDomain === 'grammaire' && !selectedSection) {
				return { [selectedGrade]: [] }; // Return empty array, not empty object
			}
			
			const currentWords = getCurrentWords();
			if (!currentWords || currentWords.length === 0) {
				console.warn('No words found for:', { selectedDomain, selectedSection, selectedLevel, selectedCategory });
				return { [selectedGrade]: [] }; // Return empty array, not empty object
			}
			
			return { [selectedGrade]: currentWords };
		}, [selectedDomain, selectedSection, selectedLevel, selectedCategory, selectedGrade, wordsLoaded]);

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
		updateProfileName, // ADD THIS
		deleteProfile,
		switchProfile,
		setCurrentProfileId,
		importProfile,
		recordAttempt,
		updateDailySessionTime,
		updateProfileAvatar
	} = useProfiles();

	useEffect(() => {
		// Reset timer when component mounts
		sessionStartTime.current = Date.now();
		accumulatedTime.current = 0;
		
		// Save time when component unmounts (user leaves page)
		return () => {
		  const sessionDuration = Date.now() - sessionStartTime.current;
		  updateDailySessionTime(sessionDuration);
		};
	  }, []);

	const handleAnswer = (answer) => {
		const isCorrect = checkAnswer(answer, correctAnswer);
		selectAnswer(answer);
		
		const wordId = currentQuestion.id;
		const category = practiceMode ? practiceMode.category : selectedGrade;

	    const attemptTime = Date.now() - sessionStartTime.current;
    	accumulatedTime.current += attemptTime;
		
		// NEW: Use recordAttempt instead of updateCurrentStats
		recordAttempt(
		  wordId,
		  isCorrect,
		  'multipleChoice',  // or 'flashcard' depending on mode
		  category,
		  null  // sessionId - can add later
		);

		sessionStartTime.current = Date.now();
		
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
		// setSessionComplete(false);
		
		// NOW start the quiz with this category
		const levelToGradeMap = {
			'niveau1': 'grade1',
			'niveau2': 'grade2',
			'niveau3': 'grade3'
		};
		const gradeKey = levelToGradeMap[selectedLevel] || 'grade1';
		resetAndRestart(gradeKey);
	};

	// NEW: Clear category filter and return to all words
	const handleClearCategoryFilter = () => {
		setSelectedCategory(null);
		resetAndRestart(selectedGrade);
	};

	// NEW: Domain navigation handlers
	const handleDomainSelection = (domainId) => {

		if (domainId === selectedDomain) {
			return;
		}

		setSelectedDomain(domainId);
		setSelectedSection(null);
		setSelectedCategory(null); // No filter
		// setSessionComplete(false);
		
		if (domainId === 'vocabulaire') {
			setSelectedLevel('niveau1');
			setSelectedGrade('grade1');
			// resetAndRestart('grade1');
		}
	};

	const handleSectionSelection = (sectionId) => {
		setSelectedDomain('grammaire');
		setSelectedSection(sectionId);
		setSelectedCategory(null); // No filter
		// setSessionComplete(false);
		
		setSelectedLevel('niveau1');
		setSelectedGrade('grade1');
		// resetAndRestart('grade1'); // Start quiz with ALL niveau1 items
	};

	const handleLevelSelection = (levelId) => {
		setSelectedLevel(levelId);
		setSelectedCategory(null); // Clear filter
		// setSessionComplete(false);
		
		const levelToGradeMap = {
			'niveau1': 'grade1',
			'niveau2': 'grade2',
			'niveau3': 'grade3'
		};
		if (levelToGradeMap[levelId]) {
			setSelectedGrade(levelToGradeMap[levelId]);
			// resetAndRestart(levelToGradeMap[levelId]); // Start quiz with ALL words from this level
		}
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

	useEffect(() => {
		if (wordsLoaded) {
			const navigationState = {
				selectedDomain,
				selectedSection,
				selectedLevel,
				selectedCategory
			};
			localStorage.setItem('brainbox-navigation', JSON.stringify(navigationState));
		}
	}, [selectedDomain, selectedSection, selectedLevel, selectedCategory, wordsLoaded]);

// Restart quiz when domain/section/level changes AND words are available
useEffect(() => {
	if (currentProfileId && wordsLoaded && selectedDomain && selectedLevel) {
		// For grammaire, wait until section is set
		if (selectedDomain === 'grammaire' && !selectedSection) {
			return;
		}
		// Check if we actually have words
		const words = getCurrentWords();
		if (words && words.length > 0) {
			resetAndRestart(selectedGrade);
		}
	}
}, [selectedDomain, selectedSection, selectedLevel, wordsLoaded, currentProfileId]);
	
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
		return (
			<ProfileSelectionScreen
				profiles={profiles}
				onSelectProfile={switchProfile}
				onCreateProfile={createProfile}
				onUpdateProfileName={updateProfileName}
				onDeleteProfile={deleteProfile}
				onImportProfile={importProfile}
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
					onSelectDomain={handleDomainSelection}
					onSelectSection={handleSectionSelection}
					selectedDomain={selectedDomain}
					selectedSection={selectedSection}
					onClose={() => {}} // Menu closes itself
				/>

				<PracticeModeBanner 
					practiceMode={practiceMode} 
					onExit={exitPracticeMode} 
				/>
				
				<div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-[minmax(150px,350px)_minmax(450px,1fr)] gap-3">
				<CategoryTabs
					selectedDomain={selectedDomain}
					selectedSection={selectedSection}
					selectedLevel={selectedLevel}
					onSelectLevel={handleLevelSelection}
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