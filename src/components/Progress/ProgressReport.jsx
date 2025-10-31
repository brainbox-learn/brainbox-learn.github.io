import React, { useState } from 'react';
import { CATEGORY_CONFIG, getCategoriesForGrade } from '../../data/words';
import { calculatePercentComplete, getProgressDataForCategory } from '../../utils/statsCalculator';
import { 
    ChartBar, 
    CaretCircleLeft, 
    Trophy, 
    Fire, 
    Target, 
    CaretDown, 
    CaretRight,
    BookOpen,
    Palette,
    Hash,
    Dog,
    Cookie,
    Cat,
    House,
    Tree,
    Star,
    Heart,
    Book,
    Pencil,
} from '@phosphor-icons/react';

const ICON_MAP = {
    BookOpen,
    Palette,
    Hash,
    Dog,
    'Apple': Cookie,
    'Cat': Cat,
    'House': House,
    'Tree': Tree,
    'Star': Star,
    'Heart': Heart,
    'Book': Book,
    'Pencil': Pencil,
};

// Theme styles
const THEME_STYLES = {
    grade1: {
        bg: 'from-grade1-50 to-grade1-100',
        border: 'border-grade1-300',
        text: 'text-grade1-700',
        progress: 'bg-grade1-500',
    },
    grade2: {
        bg: 'from-grade2-50 to-grade2-100',
        border: 'border-grade2-300',
        text: 'text-grade2-700',
        progress: 'bg-grade2-500',
    },
    grade3: {
        bg: 'from-grade3-50 to-grade3-100',
        border: 'border-grade3-300',
        text: 'text-grade3-700',
        progress: 'bg-grade3-500',
    }
};

const ProgressReport = ({ 
    getCurrentStats, 
    onClose, 
    onStartPracticeMode, 
    wordsByCategory,
    selectedGrade
}) => {
    const [expandedGrades, setExpandedGrades] = useState([selectedGrade]);
    
    const toggleGrade = (gradeKey) => {
        setExpandedGrades(prev => 
            prev.includes(gradeKey) 
                ? prev.filter(g => g !== gradeKey)
                : [...prev, gradeKey]
        );
    };
    
    const stats = getCurrentStats();
    
    const getGradeStats = (gradeKey) => {
        const categories = getCategoriesForGrade(gradeKey);
        let totalWords = 0;
        let masteredWords = 0;
        let practiceWords = 0;
        
        categories.forEach(category => {
            const categoryWords = category.words;
            const { allCorrect, hasIncorrect } = getProgressDataForCategory(
                gradeKey, 
                { [gradeKey]: categoryWords }, 
                stats
            );
            
            totalWords += categoryWords.length;
            masteredWords += allCorrect.length;
            practiceWords += hasIncorrect.length;
        });
        
        return {
            totalWords,
            masteredWords,
            practiceWords,
            percentComplete: Math.round((masteredWords / totalWords) * 100) || 0
        };
    };
    
    const getGradePracticeWords = (gradeKey) => {
        const categories = getCategoriesForGrade(gradeKey);
        const practiceWords = [];
        
        categories.forEach(category => {
            const categoryWords = category.words;
            const { hasIncorrect } = getProgressDataForCategory(
                gradeKey,
                { [gradeKey]: categoryWords },
                stats
            );
            practiceWords.push(...hasIncorrect);
        });
        
        return practiceWords;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-grade1-700 flex items-center gap-3">
                        <ChartBar size={48} weight="duotone" className="text-grade2-600" /> 
                        <span>Progress Report</span>
                    </h1>
                    <button 
                        onClick={onClose} 
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-grade1-500 to-grade1-600 hover:from-grade1-600 hover:to-grade1-700 text-white rounded-2xl transition-all transform hover:scale-105 font-bold shadow-lg"
                    >
                        <CaretCircleLeft size={28} weight="duotone" /> 
                        <span>Back to Quiz</span>
                    </button>
                </div>

                {/* Grade Accordions */}
                {Object.keys(wordsByCategory).map(gradeKey => {
                    const config = CATEGORY_CONFIG[gradeKey];
                    const theme = config.theme || gradeKey;
                    const themeStyles = THEME_STYLES[theme] || THEME_STYLES.grade1;
                    const Icon = config.icon;
                    const isExpanded = expandedGrades.includes(gradeKey);
                    const gradeStats = getGradeStats(gradeKey);
                    const gradePracticeWords = getGradePracticeWords(gradeKey);
                    const categories = getCategoriesForGrade(gradeKey);
                    
                    return (
                        <div 
                            key={gradeKey} 
                            className={`mb-6 bg-gradient-to-br ${themeStyles.bg} rounded-3xl shadow-2xl border-4 ${themeStyles.border} overflow-hidden`}
                        >
                            {/* Grade Header - FIXED: Split into clickable and non-clickable sections */}
                            <div className="p-6">
                                <div className="flex flex-row sm:flex-row justify-between items-start sm:items-center gap-4">
                                    {/* Left side - Clickable accordion toggle */}
                                    <button
                                        onClick={() => toggleGrade(gradeKey)}
                                        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                                    >
                                        {isExpanded ? (
                                            <CaretDown size={32} weight="bold" className={themeStyles.text} />
                                        ) : (
                                            <CaretRight size={32} weight="bold" className={themeStyles.text} />
                                        )}
                                        <div className="p-2 bg-white/60 rounded-xl">
                                            <Icon size={24} weight="duotone" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className={`text-1xl sm:text-3xl font-bold ${themeStyles.text}`}>
                                                {config.label} <span className="text-sm text-gray-600 font-semibold">({gradeStats.percentComplete}%)</span>
                                            </h2>
                                            <p className="text-sm text-gray-600 font-semibold">
                                                {gradeStats.masteredWords}/{gradeStats.totalWords} mastered
                                            </p>
                                        </div>
                                    </button>
                                    
                                    {/* Right side - Action buttons (NOT nested in accordion button) */}
                                    <div className="flex items-center gap-3">
                                        {/* Grade-level Practice Button */}
                                        {gradePracticeWords.length > 0 && (
											<button
											onClick={() => onStartPracticeMode(gradeKey, gradePracticeWords)}
											className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-celebration-500 to-celebration-600 hover:from-celebration-600 hover:to-celebration-700 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-xs sm:text-sm shadow-lg whitespace-nowrap"
										>
											<Fire size={16} className="sm:hidden" weight="duotone" />
											<Fire size={20} className="hidden sm:block" weight="duotone" />
											<span className="hidden sm:inline">Practice All ({gradePracticeWords.length})</span>
											<span className="sm:hidden">Practice ({gradePracticeWords.length})</span>
										</button>
                                        )}
                                        
                                        {/* Progress Badge */}
                                        {/* <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
                                            <div className="text-3xl font-bold text-grade1-700">
                                                {gradeStats.percentComplete}%
                                            </div>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="w-full bg-white/50 rounded-full h-6 shadow-inner overflow-hidden">
                                        <div 
                                            className={`${themeStyles.progress} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-lg`}
                                            style={{ width: `${gradeStats.percentComplete}%` }}
                                        >
                                            {gradeStats.percentComplete > 15 && (
                                                <span className="text-white font-bold text-sm">
                                                    {gradeStats.percentComplete}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Breakdown - Expandable */}
                            {isExpanded && (
                                <div className="px-6 pb-6 space-y-4 transition-all duration-300">
                                    {categories.map(category => {
                                        const categoryWords = category.words;
                                        const { notAttempted, allCorrect, hasIncorrect, total } = getProgressDataForCategory(
                                            gradeKey,
                                            { [gradeKey]: categoryWords },
                                            stats
                                        );
                                        const percentComplete = calculatePercentComplete(allCorrect, total);
                                        
                                        // FIXED: Use icon mapping with fallback
                                        const CategoryIcon = ICON_MAP[category.icon] || BookOpen;
                                        
                                        return (
                                            <div 
                                                key={category.id}
                                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-2 border-white/50"
                                            >
                                                {/* Category Header */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                                                            <CategoryIcon size={28} weight="duotone" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-800">
                                                                {category.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {category.nameEnglish}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        {/* Category Practice Button */}
                                                        {hasIncorrect.length > 0 && (
                                                            <button 
                                                                onClick={() => onStartPracticeMode(gradeKey, hasIncorrect)} 
                                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-celebration-500 to-celebration-600 hover:from-celebration-600 hover:to-celebration-700 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-sm shadow-lg whitespace-nowrap"
                                                            >
                                                                <Fire size={18} weight="duotone" />
                                                                <span>Practice ({hasIncorrect.length})</span>
                                                            </button>
                                                        )}
                                                        
                                                        <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl px-4 py-2 shadow">
                                                            <div className="text-2xl font-bold text-grade1-700">
                                                                {percentComplete}%
                                                            </div>
                                                            <div className="text-xs font-semibold text-gray-600">
                                                                {allCorrect.length}/{total}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Category Progress Bar */}
                                                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 shadow-inner overflow-hidden">
                                                    <div 
                                                        className={`${themeStyles.progress} h-4 rounded-full transition-all duration-500`}
                                                        style={{ width: `${percentComplete}%` }}
                                                    />
                                                </div>

                                                {/* Category Stats Sections */}
                                                <div className="space-y-3">
                                                    {/* Not Attempted */}
                                                    {notAttempted.length > 0 && (
                                                        <div className="bg-grade2-50 p-4 rounded-xl border-2 border-grade2-200">
                                                            <h4 className="text-sm font-bold text-grade2-700 mb-2 flex items-center gap-2">
                                                                <Target size={18} weight="duotone" />
                                                                <span>Not Tried Yet ({notAttempted.length})</span>
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {notAttempted.map(w => (
                                                                    <span 
                                                                        key={w.id} 
                                                                        className="px-3 py-1 bg-grade2-100 rounded-lg text-xs font-bold text-grade2-700"
                                                                    >
                                                                        {w.french}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Mastered */}
                                                    {allCorrect.length > 0 && (
                                                        <div className="bg-success-50 p-4 rounded-xl border-2 border-success-200">
                                                            <h4 className="text-sm font-bold text-success-700 mb-2 flex items-center gap-2">
                                                                <Trophy size={18} weight="duotone" />
                                                                <span>Mastered! ⭐ ({allCorrect.length})</span>
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {allCorrect.map(w => (
                                                                    <span 
                                                                        key={w.id} 
                                                                        className="px-3 py-1 bg-success-100 rounded-lg text-xs font-bold text-success-700"
                                                                    >
                                                                        {w.french} ({stats[w.id].correct}/{stats[w.id].attempts})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Need Practice */}
                                                    {hasIncorrect.length > 0 && (
                                                        <div className="bg-celebration-50 p-4 rounded-xl border-2 border-celebration-200">
                                                            <h4 className="text-sm font-bold text-celebration-700 mb-2 flex items-center gap-2">
                                                                <Fire size={18} weight="duotone" />
                                                                <span>Need Practice 💪 ({hasIncorrect.length})</span>
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {hasIncorrect.map(w => (
                                                                    <span 
                                                                        key={w.id} 
                                                                        className="px-3 py-1 bg-celebration-100 rounded-lg text-xs font-bold text-celebration-700"
                                                                    >
                                                                        {w.french} ({stats[w.id].correct}/{stats[w.id].attempts})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressReport;