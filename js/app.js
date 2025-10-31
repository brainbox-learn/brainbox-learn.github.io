const { useState, useEffect } = React;

// Icons
const Volume2 = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>);
const BarChart3 = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>);
const RotateCcw = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>);
const Home = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>);
const User = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const ChevronDown = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>);
const Trash = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);

const FrenchQuiz = () => {
    const firstCategory = Object.keys(WORDS_BY_CATEGORY)[0];
    const [selectedCategory, setSelectedCategory] = useState(firstCategory);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [choices, setChoices] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [profiles, setProfiles] = useState({});
    const [currentProfileId, setCurrentProfileId] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [practiceMode, setPracticeMode] = useState(null);

    useEffect(() => {
        const savedProfiles = localStorage.getItem('frenchQuizProfiles');
        const savedCurrentProfileId = localStorage.getItem('frenchQuizCurrentProfileId');
        if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
        if (savedCurrentProfileId) setCurrentProfileId(savedCurrentProfileId);
    }, []);

    useEffect(() => {
        if (Object.keys(profiles).length > 0) {
            localStorage.setItem('frenchQuizProfiles', JSON.stringify(profiles));
        }
    }, [profiles]);

    useEffect(() => {
        if (currentProfileId) {
            localStorage.setItem('frenchQuizCurrentProfileId', currentProfileId);
        }
    }, [currentProfileId]);

    const getCurrentStats = () => {
        if (!currentProfileId || !profiles[currentProfileId]) return {};
        return profiles[currentProfileId].stats || {};
    };

    const updateCurrentStats = (newStats) => {
        if (!currentProfileId) return;
        setProfiles(prev => ({
            ...prev,
            [currentProfileId]: {
                ...prev[currentProfileId],
                stats: newStats
            }
        }));
    };

    const createProfile = (name) => {
        const profileId = `profile-${Date.now()}`;
        setProfiles(prev => ({
            ...prev,
            [profileId]: { id: profileId, name, stats: {}, createdAt: Date.now() }
        }));
        setCurrentProfileId(profileId);
        setShowProfileDropdown(false);
    };

    const deleteProfile = (profileId) => {
        if (!window.confirm('Are you sure you want to delete this profile? This cannot be undone.')) return;
        setProfiles(prev => {
            const newProfiles = { ...prev };
            delete newProfiles[profileId];
            return newProfiles;
        });
        if (currentProfileId === profileId) {
            const remainingProfiles = Object.keys(profiles).filter(id => id !== profileId);
            setCurrentProfileId(remainingProfiles[0] || null);
        }
    };

    const switchProfile = (profileId) => {
        setCurrentProfileId(profileId);
        setShowProfileDropdown(false);
    };

    const playSound = (type) => {
        if (!soundEnabled) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        if (type === 'correct') {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } else {
            oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    };

    const generateQuestion = (category = selectedCategory, wordPool = null) => {
        const wordsForCategory = wordPool || WORDS_BY_CATEGORY[category];
        const word = wordsForCategory[Math.floor(Math.random() * wordsForCategory.length)];
        const correctAnswer = SETTINGS.quizDirection === 'french-to-english' ? word.english : word.french;
        
        // FIX: Shuffle and pick sequentially to avoid infinite loops
        const fullCategoryWords = WORDS_BY_CATEGORY[category];
        const shuffledWords = [...fullCategoryWords].sort(() => Math.random() - 0.5);
        const wrongAnswers = [];
        
        for (let i = 0; i < shuffledWords.length && wrongAnswers.length < SETTINGS.multipleChoiceCount - 1; i++) {
            const wrongAnswer = SETTINGS.quizDirection === 'french-to-english' ? shuffledWords[i].english : shuffledWords[i].french;
            if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
        }
        
        const allChoices = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
        setCurrentQuestion(word);
        setChoices(allChoices);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    const handleAnswer = (answer) => {
        const correctAnswer = SETTINGS.quizDirection === 'french-to-english' ? currentQuestion.english : currentQuestion.french;
        const isCorrect = answer === correctAnswer;
        setSelectedAnswer(answer);
        setShowResult(true);
        
        const wordId = currentQuestion.id;
        const currentStats = getCurrentStats();
        const newStats = {
            ...currentStats,
            [wordId]: {
                ...currentStats[wordId],
                attempts: (currentStats[wordId]?.attempts || 0) + 1,
                correct: (currentStats[wordId]?.correct || 0) + (isCorrect ? 1 : 0),
                incorrect: (currentStats[wordId]?.incorrect || 0) + (isCorrect ? 0 : 1),
                category: practiceMode ? practiceMode.category : selectedCategory,
            }
        };
        updateCurrentStats(newStats);
        playSound(isCorrect ? 'correct' : 'wrong');
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        generateQuestion(category);
    };

    const getProgressDataForCategory = (category) => {
        const stats = getCurrentStats();
        const wordsForCategory = WORDS_BY_CATEGORY[category];
        const notAttempted = wordsForCategory.filter(w => !stats[w.id]);
        const attempted = wordsForCategory.filter(w => stats[w.id]);
        const allCorrect = attempted.filter(w => stats[w.id].incorrect === 0);
        const hasIncorrect = attempted.filter(w => stats[w.id].incorrect > 0);
        return { notAttempted, allCorrect, hasIncorrect, total: wordsForCategory.length };
    };

    const startPracticeMode = (category, words) => {
        setPracticeMode({ category, words });
        setShowProgress(false);
        generateQuestion(category, words);
    };

    const exitPracticeMode = () => {
        setPracticeMode(null);
        generateQuestion(selectedCategory);
    };

    useEffect(() => {
        if (currentProfileId) generateQuestion();
    }, [currentProfileId]);

    // Profile selection screen
    if (!currentProfileId) {
        const profileCount = Object.keys(profiles).length;
        const canCreateProfile = profileCount < 3;
        
        return (
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-100 p-8 flex items-center justify-center">
                <div className="max-w-2xl w-full">
                    <h1 className="text-5xl font-bold text-green-800 text-center mb-12">🦊 Choose Your Profile</h1>
                    <div className="grid gap-6">
                        {Object.values(profiles).map(profile => {
                            const stats = profile.stats || {};
                            const totalWords = Object.values(WORDS_BY_CATEGORY).flat().length;
                            const masteredWords = Object.values(stats).filter(s => s.incorrect === 0 && s.attempts > 0).length;
                            const progressPercent = Math.round((masteredWords / totalWords) * 100);
                            
                            return (
                                <div key={profile.id} className="bg-white rounded-3xl shadow-xl p-6 border-4 border-green-200 flex justify-between items-center hover:scale-105 transition-transform">
                                    <button onClick={() => switchProfile(profile.id)} className="flex-1 text-left">
                                        <h2 className="text-3xl font-bold text-green-800 mb-2">{profile.name}</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                                                <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                                            </div>
                                            <span className="text-lg font-semibold text-green-700">{progressPercent}%</span>
                                        </div>
                                    </button>
                                    <button onClick={() => deleteProfile(profile.id)} className="ml-4 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all" title="Delete Profile">
                                        <Trash />
                                    </button>
                                </div>
                            );
                        })}
                        {canCreateProfile && (
                            <button onClick={() => {
                                const name = prompt("Enter profile name:");
                                if (name && name.trim()) createProfile(name.trim());
                            }} className="bg-green-100 border-4 border-dashed border-green-400 rounded-3xl p-8 hover:bg-green-200 transition-all text-center">
                                <div className="text-6xl mb-4">➕</div>
                                <div className="text-2xl font-bold text-green-800">Create New Profile</div>
                                <div className="text-sm text-green-600 mt-2">{3 - profileCount} slot{3 - profileCount !== 1 ? 's' : ''} available</div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Progress screen
    if (showProgress) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-100 p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold text-green-800">Progress Report 📊</h1>
                        <button onClick={() => setShowProgress(false)} className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all transform hover:scale-105 font-bold">
                            Back to Quiz
                        </button>
                    </div>
                    {Object.keys(WORDS_BY_CATEGORY).map(categoryKey => {
                        const config = CATEGORY_CONFIG[categoryKey];
                        const { notAttempted, allCorrect, hasIncorrect, total } = getProgressDataForCategory(categoryKey);
                        const percentComplete = Math.round((allCorrect.length / total) * 100);
                        const stats = getCurrentStats();
                        
                        return (
                            <div key={categoryKey} className="mb-8 bg-white rounded-3xl shadow-xl p-6 border-4 border-amber-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-3xl font-bold text-green-800">{config.icon} {config.label}</h2>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-700">{percentComplete}%</div>
                                        <div className="text-sm text-gray-600">{allCorrect.length}/{total} mastered</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-6 mb-6">
                                    <div className="bg-green-500 h-6 rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }} />
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                                        <h3 className="text-lg font-bold text-blue-800 mb-2">Not Tried Yet ({notAttempted.length})</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {notAttempted.length > 0 ? notAttempted.map(w => (
                                                <span key={w.id} className="px-2 py-1 bg-blue-200 rounded-full text-xs font-semibold">{w.french}</span>
                                            )) : <span className="text-blue-600 text-sm">All words attempted! 🎉</span>}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                                        <h3 className="text-lg font-bold text-green-800 mb-2">All Correct! 🌟 ({allCorrect.length})</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {allCorrect.length > 0 ? allCorrect.map(w => (
                                                <span key={w.id} className="px-2 py-1 bg-green-200 rounded-full text-xs font-semibold">{w.french} ({stats[w.id].correct}/{stats[w.id].attempts})</span>
                                            )) : <span className="text-green-600 text-sm">Keep practicing! 💪</span>}
                                        </div>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-lg font-bold text-orange-800">Need Practice 💪 ({hasIncorrect.length})</h3>
                                            {hasIncorrect.length > 0 && (
                                                <button onClick={() => startPracticeMode(categoryKey, hasIncorrect)} className="px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all transform hover:scale-105 font-bold text-sm">
                                                    Practice These Words
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {hasIncorrect.length > 0 ? hasIncorrect.map(w => (
                                                <span key={w.id} className="px-2 py-1 bg-orange-200 rounded-full text-xs font-semibold">{w.french} ({stats[w.id].correct}/{stats[w.id].attempts})</span>
                                            )) : <span className="text-orange-600 text-sm">No mistakes yet! ✨</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    const questionText = SETTINGS.quizDirection === 'french-to-english' ? currentQuestion.french : currentQuestion.english;
    const correctAnswer = SETTINGS.quizDirection === 'french-to-english' ? currentQuestion.english : currentQuestion.french;
    const currentProfile = profiles[currentProfileId];

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-100 p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-green-800 flex items-center gap-3">🦊 French Quiz</h1>
                    <div className="flex gap-3 items-center">
                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all font-bold flex items-center gap-2">
                                <User /> {currentProfile?.name} <ChevronDown />
                            </button>
							{showProfileDropdown && (
								<div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-4 border-purple-200 z-50">
									<div className="p-2">
										{Object.values(profiles).map(profile => (
											<button key={profile.id} onClick={() => switchProfile(profile.id)} className={`w-full text-left px-4 py-3 rounded-xl hover:bg-purple-100 transition-all font-semibold ${profile.id === currentProfileId ? 'bg-purple-200' : ''}`}>
												{profile.name} {profile.id === currentProfileId && '✓'}
											</button>
										))}
										{Object.keys(profiles).length < 3 && (
											<button onClick={() => { setCurrentProfileId(null); setShowProfileDropdown(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-green-100 transition-all font-semibold text-green-700 border-t-2 border-gray-200 mt-2">
												➕ Add New Profile
											</button>
										)}
									</div>
								</div>
							)}
                        </div>
                        <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-3 rounded-full ${soundEnabled ? 'bg-green-600' : 'bg-gray-400'} text-white hover:scale-110 transition-transform`} title={soundEnabled ? 'Sound On' : 'Sound Off'}>
                            <Volume2 />
                        </button>
                        <button onClick={() => setShowProgress(true)} className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 font-bold flex items-center gap-2">
                            <BarChart3 /> Progress
                        </button>
                    </div>
                </div>

                {practiceMode && (
                    <div className="mb-6 bg-orange-100 border-4 border-orange-400 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-orange-900">Practicing {CATEGORY_CONFIG[practiceMode.category].icon} {CATEGORY_CONFIG[practiceMode.category].label} Mistakes</h2>
                            <p className="text-orange-700">{practiceMode.words.length} words to practice</p>
                        </div>
                        <button onClick={exitPracticeMode} className="px-6 py-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all transform hover:scale-105 font-bold flex items-center gap-2">
                            <Home /> Exit Practice
                        </button>
                    </div>
                )}

                {!practiceMode && (
                    <div className="flex gap-3 mb-6">
                        {Object.keys(WORDS_BY_CATEGORY).map(categoryKey => {
                            const config = CATEGORY_CONFIG[categoryKey];
                            return (
                                <button key={categoryKey} onClick={() => handleCategoryChange(categoryKey)} className={`flex-1 py-4 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 border-4 ${selectedCategory === categoryKey ? 'bg-green-600 text-white border-green-700 shadow-lg' : 'bg-white text-green-800 border-green-300 hover:bg-green-50'}`}>
                                    {config.icon} {config.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8 border-8 border-green-200">
                    <div className="text-center mb-8">
                        <p className="text-gray-600 text-lg mb-3">What does this mean?</p>
                        <h2 className="text-5xl font-bold text-green-800 mb-6">{questionText}</h2>
                        {currentQuestion && getCurrentStats()[currentQuestion.id] && (
                            <p className="text-sm text-gray-500">Attempted: {getCurrentStats()[currentQuestion.id].attempts} times</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {choices.map((choice, index) => {
                            const isSelected = selectedAnswer === choice;
                            const isCorrect = choice === correctAnswer;
                            const showCorrect = showResult && isCorrect;
                            const showWrong = showResult && isSelected && !isCorrect;
                            
                            return (
                                <button key={index} onClick={() => !showResult && handleAnswer(choice)} disabled={showResult} className={`w-full p-6 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 border-4
                                    ${showCorrect ? 'bg-green-500 text-white border-green-600 scale-105' : ''}
                                    ${showWrong ? 'bg-red-400 text-white border-red-500' : ''}
                                    ${!showResult ? 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-green-800' : ''}
                                    ${showResult && !isSelected && !isCorrect ? 'bg-gray-200 border-gray-300 text-gray-500' : ''}`}>
                                    {showCorrect && '🌟 '}
                                    {choice}
                                    {showWrong && ' ❌'}
                                </button>
                            );
                        })}
                    </div>

                    {showResult && (
                        <div className="mt-8 text-center">
                            <button onClick={() => generateQuestion(practiceMode ? practiceMode.category : selectedCategory, practiceMode ? practiceMode.words : null)} className="px-10 py-4 bg-green-600 text-white rounded-full text-2xl font-bold hover:bg-green-700 transition-all transform hover:scale-110 shadow-lg flex items-center gap-3 mx-auto">
                                Next Question <RotateCcw />
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center text-6xl space-x-4 animate-pulse">
                    🦌 🐿️ 🦊 🐻 🦉
                </div>
            </div>
        </div>
    );
};

ReactDOM.render(<FrenchQuiz />, document.getElementById('root'));