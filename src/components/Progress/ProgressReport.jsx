import React, { useState } from 'react';
import { DOMAINS_CONFIG, CONTENT_BY_DOMAIN } from '../../data/words';
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
    Leaf,
    TreePalm,
    Lightning,
    ChatCircle
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
    'Lightning': Lightning,
    'ChatCircle': ChatCircle,
};

const LEVEL_ICON_MAP = {
    Leaf,
    TreePalm,
    Tree
};

const THEME_STYLES = {
    vocabulaire: {
        bg: 'from-grade1-50 to-grade1-100',
        border: 'border-grade1-300',
        text: 'text-grade1-700',
        progress: 'bg-grade1-500',
    },
    verbes: {
        bg: 'from-grade2-50 to-grade2-100',
        border: 'border-grade2-300',
        text: 'text-grade2-700',
        progress: 'bg-grade2-500',
    },
    expressions: {
        bg: 'from-grade3-50 to-grade3-100',
        border: 'border-grade3-300',
        text: 'text-grade3-700',
        progress: 'bg-grade3-500',
    }
};

const ProgressReport = ({ 
    getCurrentStats, 
    onClose, 
    onStartPracticeMode
}) => {
    const [selectedTab, setSelectedTab] = useState('vocabulaire');
    const [expandedLevels, setExpandedLevels] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState([]);
    
    const stats = getCurrentStats();
    
    const toggleLevel = (levelId) => {
        setExpandedLevels(prev => 
            prev.includes(levelId) 
                ? prev.filter(l => l !== levelId)
                : [...prev, levelId]
        );
    };
    
    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };
    
    // Get level stats using the SAME utility function as before
    const getLevelStats = (items) => {
        const { allCorrect } = getProgressDataForCategory(
            'grade1', 
            { 'grade1': items }, 
            stats
        );
        
        return {
            totalItems: items.length,
            masteredItems: allCorrect.length,
            percentComplete: Math.round((allCorrect.length / items.length) * 100) || 0
        };
    };
    
    const getLevelPracticeItems = (items) => {
        const { hasIncorrect } = getProgressDataForCategory(
            'grade1',
            { 'grade1': items },
            stats
        );
        return hasIncorrect;
    };

    const getCurrentData = () => {
        if (selectedTab === 'vocabulaire') {
            return CONTENT_BY_DOMAIN.vocabulaire;
        } else if (selectedTab === 'verbes') {
            return CONTENT_BY_DOMAIN.grammaire?.verbes;
        } else if (selectedTab === 'expressions') {
            return CONTENT_BY_DOMAIN.grammaire?.expressions;
        }
        return null;
    };

    const currentData = getCurrentData();
    const themeStyles = THEME_STYLES[selectedTab] || THEME_STYLES.vocabulaire;

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

                {/* Tab Navigation */}
                <header className="mb-6 flex flex-row justify-between items-center gap-4">
                    <button
                        onClick={() => setSelectedTab('vocabulaire')}
                        className={`group w-full relative overflow-hidden rounded-2xl py-4 px-4 border-4 font-bold transition-all transform hover:scale-105 ${
                            selectedTab === 'vocabulaire'
                                ? 'bg-gradient-to-br from-grade1-400 to-grade1-600 text-white border-grade1-700 shadow-xl'
                                : 'bg-white text-grade1-700 border-grade1-300 hover:bg-gradient-to-br hover:from-grade1-50 hover:to-grade1-100 hover:border-grade1-400'
                        }`}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <BookOpen size={28} weight="duotone" />
                            <span className="block text-sm sm:text-xl">Vocabulaire</span>
                        </h2>
                        {/* <p className={`text-sm font-semibold block ${selectedTab === 'vocabulaire' ? 'text-white/80' : 'text-gray-600'}`}>
                            Vocabulary
                        </p> */}
                    </button>
                    
                    <button
                        onClick={() => setSelectedTab('verbes')}
                        className={`group w-full relative overflow-hidden rounded-2xl py-4 px-4 border-4 font-bold transition-all transform hover:scale-105 ${
                            selectedTab === 'verbes'
                                ? 'bg-gradient-to-br from-grade2-400 to-grade2-600 text-white border-grade2-700 shadow-xl'
                                : 'bg-white text-grade2-700 border-grade2-300 hover:bg-gradient-to-br hover:from-grade2-50 hover:to-grade2-100 hover:border-grade2-400'
                        }`}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Lightning size={28} weight="duotone" />
                            <span className="block text-sm sm:text-xl">Verbes</span>
                        </h2>
							{/* <p className={`text-sm font-semibold block ${selectedTab === 'verbes' ? 'text-white/80' : 'text-gray-600'}`}>
								Verbs
							</p> */}
                    </button>
                    
                    <button
                        onClick={() => setSelectedTab('expressions')}
                        className={`group w-full relative overflow-hidden rounded-2xl py-4 px-4 border-4 font-bold transition-all transform hover:scale-105 ${
                            selectedTab === 'expressions'
                                ? 'bg-gradient-to-br from-grade3-400 to-grade3-600 text-white border-grade3-700 shadow-xl'
                                : 'bg-white text-grade3-700 border-grade3-300 hover:bg-gradient-to-br hover:from-grade3-50 hover:to-grade3-100 hover:border-grade3-400'
                        }`}
                    >
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <ChatCircle size={28} weight="duotone" />
                            <span className="block text-sm sm:text-xl">Expressions</span>
                        </h2>
                        {/* <p className={`text-sm font-semibold block ${selectedTab === 'expressions' ? 'text-white/80' : 'text-gray-600'}`}>
                            Expressions
                        </p> */}
                    </button>
                </header>

                {/* Level Accordions */}
                {currentData && Object.entries(currentData).map(([levelId, levelData]) => {
                    const items = levelData.words || levelData.items || [];
                    const levelStats = getLevelStats(items);
                    const levelPracticeItems = getLevelPracticeItems(items);
                    const LevelIcon = LEVEL_ICON_MAP[levelData.config.icon] || Leaf;
                    const isLevelExpanded = expandedLevels.includes(levelId);
                    
                    return (
                        <div 
                            key={levelId}
                            className={`mb-6 bg-gradient-to-br ${themeStyles.bg} rounded-3xl shadow-2xl border-4 ${themeStyles.border} overflow-hidden`}
                        >
                            {/* Level Header */}
                            <div className="p-6">
                                <div className="flex flex-row justify-between items-center gap-4">
                                    <button
                                        onClick={() => toggleLevel(levelId)}
                                        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                                    >
                                        {isLevelExpanded ? (
                                            <CaretDown size={32} weight="bold" className={themeStyles.text} />
                                        ) : (
                                            <CaretRight size={32} weight="bold" className={themeStyles.text} />
                                        )}
                                        <div className="p-2 bg-white/60 rounded-xl">
                                            <LevelIcon size={28} weight="duotone" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className={`text-2xl sm:text-3xl font-bold ${themeStyles.text}`}>
                                                {levelData.level.difficulty} <span className="text-sm text-gray-600 font-semibold">({levelStats.percentComplete}%)</span>
                                            </h2>
                                            <p className="text-sm text-gray-600 font-semibold">
                                                {levelData.level.difficultyEnglish} • {levelStats.masteredItems}/{levelStats.totalItems} mastered
                                            </p>
                                        </div>
                                    </button>
                                    
                                    {levelPracticeItems.length > 0 && (
                                        <button
                                            onClick={() => onStartPracticeMode('grade1', levelPracticeItems)}
                                            className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-celebration-500 to-celebration-600 hover:from-celebration-600 hover:to-celebration-700 text-white rounded-xl transition-all transform hover:scale-105 font-bold text-xs sm:text-sm shadow-lg whitespace-nowrap"
                                        >
                                            <Fire size={20} weight="duotone" />
                                            <span className="hidden sm:inline">Practice All ({levelPracticeItems.length})</span>
                                            <span className="sm:hidden">Practice ({levelPracticeItems.length})</span>
                                        </button>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="w-full bg-white/50 rounded-full h-6 shadow-inner overflow-hidden">
                                        <div 
                                            className={`${themeStyles.progress} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-lg`}
                                            style={{ width: `${levelStats.percentComplete}%` }}
                                        >
                                            {levelStats.percentComplete > 15 && (
                                                <span className="text-white font-bold text-sm">
                                                    {levelStats.percentComplete}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            {isLevelExpanded && (
                                <div className="px-6 pb-6 space-y-4">
                                    {levelData.categories.map(category => {
                                        const categoryItems = category.words || category.items || [];
                                        
                                        // USE THE SAME UTILITY FUNCTION AS BEFORE
                                        const { notAttempted, allCorrect, hasIncorrect, total } = getProgressDataForCategory(
                                            'grade1',
                                            { 'grade1': categoryItems },
                                            stats
                                        );
                                        
                                        const percentComplete = calculatePercentComplete(allCorrect, total);
                                        const CategoryIcon = ICON_MAP[category.icon] || BookOpen;
                                        const isCategoryExpanded = expandedCategories.includes(category.id);
                                        
                                        return (
                                            <div 
                                                key={category.id}
                                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-2 border-white/50"
                                            >
                                                {/* Category Header */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                                    <button
                                                        onClick={() => toggleCategory(category.id)}
                                                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                                    >
                                                        {isCategoryExpanded ? (
                                                            <CaretDown size={24} weight="bold" className="text-gray-600" />
                                                        ) : (
                                                            <CaretRight size={24} weight="bold" className="text-gray-600" />
                                                        )}
                                                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                                                            <CategoryIcon size={28} weight="duotone" />
                                                        </div>
                                                        <div className="text-left">
                                                            <h3 className="text-xl font-bold text-gray-800">
                                                                {category.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {category.nameEnglish}
                                                            </p>
                                                        </div>
                                                    </button>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        {hasIncorrect.length > 0 && (
                                                            <button 
                                                                onClick={() => onStartPracticeMode('grade1', hasIncorrect)} 
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

                                                {/* Progress Bar */}
                                                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 shadow-inner overflow-hidden">
                                                    <div 
                                                        className={`${themeStyles.progress} h-4 rounded-full transition-all duration-500`}
                                                        style={{ width: `${percentComplete}%` }}
                                                    />
                                                </div>

                                                {/* Expandable Details */}
                                                {isCategoryExpanded && (
                                                    <div className="space-y-3">
                                                        {/* Not Attempted */}
                                                        {notAttempted.length > 0 && (
                                                            <div className="bg-grade2-50 p-4 rounded-xl border-2 border-grade2-200">
                                                                <h4 className="text-sm font-bold text-grade2-700 mb-2 flex items-center gap-2">
                                                                    <Target size={18} weight="duotone" />
                                                                    <span>Not Tried Yet ({notAttempted.length})</span>
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {notAttempted.map(item => (
                                                                        <span 
                                                                            key={item.id} 
                                                                            className="px-3 py-1 bg-grade2-100 rounded-lg text-xs font-bold text-grade2-700"
                                                                        >
                                                                            {item.french || item.infinitive}
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
                                                                    {allCorrect.map(item => (
                                                                        <span 
                                                                            key={item.id} 
                                                                            className="px-3 py-1 bg-success-100 rounded-lg text-xs font-bold text-success-700"
                                                                        >
                                                                            {item.french || item.infinitive} ({stats[item.id].correct}/{stats[item.id].attempts})
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
                                                                    {hasIncorrect.map(item => (
                                                                        <span 
                                                                            key={item.id} 
                                                                            className="px-3 py-1 bg-celebration-100 rounded-lg text-xs font-bold text-celebration-700"
                                                                        >
                                                                            {item.french || item.infinitive} ({stats[item.id].correct}/{stats[item.id].attempts})
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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