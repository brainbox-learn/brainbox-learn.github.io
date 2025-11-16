import React, { useState } from 'react';
import { 
    DOMAINS_CONFIG,
    CONTENT_BY_DOMAIN,
    getContentForLevel,
    getContentForSection,
    getCategoriesForLevel
} from '../../data/words';
import { 
    BookOpen, 
    Palette, 
    Hash, 
    Dog, 
    Horse, 
    PawPrint, 
    Cookie,
    ForkKnife, 
    ChefHat, 
    User, 
    Backpack,
    CaretDown,
    CaretRight,
    Ghost,
    X,
    Lightning,
	Leaf,
	TreePalm,
	Tree
} from '@phosphor-icons/react';

// Icon mapping for categories
const ICON_MAP = {
    'BookOpen': BookOpen,
    'Palette': Palette,
    'Hash': Hash,
    'Dog': Dog,
    'Horse': Horse,
    'PawPrint': PawPrint,
    'Apple': Cookie,
    'ForkKnife': ForkKnife,
    'ChefHat': ChefHat,
    'User': User,
    'Backpack': Backpack,
    'Ghost': Ghost,
    'Lightning': Lightning,
};

const CategoryTabs = ({ 
    selectedDomain,
    selectedSection,
    selectedLevel, 
    onSelectLevel, 
    selectedCategory, 
    onSelectCategory,
    onClearCategory,
    practiceMode 
}) => {
    const [expandedLevel, setExpandedLevel] = useState(null);
    
    if (practiceMode) return null;
    if (!selectedDomain || !DOMAINS_CONFIG) return null;

    // Get domain config
    const domainConfig = DOMAINS_CONFIG.domains.find(d => d.id === selectedDomain);
    if (!domainConfig) return null;

    // Get levels based on domain/section
    let levels = [];
    if (selectedDomain === 'vocabulaire') {
        levels = domainConfig.levels;
    } else if (selectedDomain === 'grammaire' && selectedSection) {
        const sectionConfig = domainConfig.sections.find(s => s.id === selectedSection);
        levels = sectionConfig?.levels || [];
    }

    if (levels.length === 0) return null;

    const handleLevelClick = (levelId) => {
        onSelectLevel(levelId);
        onSelectCategory(null);
    };

    const handleArrowClick = (levelId, e) => {
        e.stopPropagation();
        if (selectedLevel !== levelId) return;
        
        if (expandedLevel === levelId) {
            setExpandedLevel(null);
        } else {
            setExpandedLevel(levelId);
        }
    };

    const handleCategoryClick = (categoryId) => {
        onSelectCategory(categoryId);
    };

    const handleClearFilter = (e) => {
        e.stopPropagation();
        setExpandedLevel(null);
        onClearCategory();
    };

    // Get categories for a level
    const getCategoriesForCurrentLevel = (levelId) => {
        if (selectedDomain === 'vocabulaire') {
            const levelData = CONTENT_BY_DOMAIN.vocabulaire?.[levelId];
            return levelData?.categories || [];
        } else if (selectedDomain === 'grammaire' && selectedSection) {
            const levelData = CONTENT_BY_DOMAIN.grammaire?.[selectedSection]?.[levelId];
            return levelData?.categories || [];
        }
        return [];
    };

    // Get level colors (reuse grade colors)
    const getLevelColors = (levelId, isSelected) => {
        const colorMap = {
            'niveau1': {
                active: 'bg-gradient-to-br from-grade1-400 to-grade1-600 text-white border-grade1-700 shadow-xl',
                inactive: 'bg-white text-grade1-700 border-grade1-300 hover:bg-gradient-to-br hover:from-grade1-50 hover:to-grade1-100 hover:border-grade1-400'
            },
            'niveau2': {
                active: 'bg-gradient-to-br from-grade2-400 to-grade2-600 text-white border-grade2-700 shadow-xl',
                inactive: 'bg-white text-grade2-700 border-grade2-300 hover:bg-gradient-to-br hover:from-grade2-50 hover:to-grade2-100 hover:border-grade2-400'
            },
            'niveau3': {
                active: 'bg-gradient-to-br from-grade3-400 to-grade3-600 text-white border-grade3-700 shadow-xl',
                inactive: 'bg-white text-grade3-700 border-grade3-300 hover:bg-gradient-to-br hover:from-grade3-50 hover:to-grade3-100 hover:border-grade3-400'
            }
        };
        return colorMap[levelId]?.[isSelected ? 'active' : 'inactive'] || colorMap.niveau1.inactive;
    };

    const getIconBgColor = (levelId, isSelected) => {
        if (isSelected) return 'bg-white/20 group-hover:bg-white/30';
        
        const bgMap = {
            'niveau1': 'bg-grade1-100 group-hover:bg-grade1-200',
            'niveau2': 'bg-grade2-100 group-hover:bg-grade2-200',
            'niveau3': 'bg-grade3-100 group-hover:bg-grade3-200'
        };
        return bgMap[levelId] || bgMap.niveau1;
    };

    const getSelectedCategoryName = () => {
        if (!selectedCategory || !selectedLevel) return null;
        const categories = getCategoriesForCurrentLevel(selectedLevel);
        const category = categories.find(cat => cat.id === selectedCategory);
        return category?.name || null;
    };

    // Map level icons
    const LEVEL_ICON_MAP = {
        'Leaf': Leaf,
        'TreePalm': TreePalm,
        'Tree': Tree
    };

    return (
        <div className="mx-auto px-4 mb-6 w-full space-y-4">
            {/* Clear Filter Button */}
            {selectedCategory && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                    <button
                        onClick={handleClearFilter}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                        <X size={20} weight="bold" />
                        <span>Show All Words 
                            <small className="text-xs text-white/80 block">Currently: {getSelectedCategoryName()}</small>
                        </span>
                    </button>
                </div>
            )}

            {/* Level Tabs - Desktop */}
            <div className="hidden sm:grid grid-cols-1 gap-3 w-full">
                {levels.map(level => {
                    const LevelIcon = LEVEL_ICON_MAP[level.icon] || LEVEL_ICON_MAP['Leaf'];
                    const isSelected = selectedLevel === level.id;
                    const isExpanded = expandedLevel === level.id;
                    const categories = getCategoriesForCurrentLevel(level.id);
                    
                    return (
                        <div key={level.id} className="space-y-2">
                            <button 
                                onClick={() => handleLevelClick(level.id)} 
                                className={`group w-full relative overflow-hidden rounded-2xl py-4 px-4 border-4 font-bold transition-all transform hover:scale-105 ${
                                    isSelected ? 'hover:-rotate-1' : ''
                                } ${getLevelColors(level.id, isSelected)}`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className={"p-2 rounded-xl backdrop-blur-sm transition-all " + getIconBgColor(level.id, isSelected)}>
                                            <LevelIcon size={32} weight="duotone" />
                                        </div>
										<div className="flex flex-col items-start">
											<span className="text-xl">{level.displayName}</span>
											<span className="text-xs text-gray-500 hidden sm:block">{level.displayNameEnglish}</span>
										</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {isSelected && (
                                            <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
                                        )}
                                        <div
                                            onClick={(e) => handleArrowClick(level.id, e)}
                                            className={`p-1 rounded transition-colors ${
                                                selectedLevel === level.id 
                                                    ? 'hover:bg-white/20 cursor-pointer' 
                                                    : 'opacity-50 cursor-not-allowed'
                                            }`}
                                        >
                                            <div className="transition-transform duration-200">
                                                {isExpanded ? (
                                                    <CaretDown size={20} weight="bold" />
                                                ) : (
                                                    <CaretRight size={20} weight="bold" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                            
                            {/* Categories for this level */}
                            {isExpanded && categories.length > 0 && (
                                <div className="ml-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-2">
                                        Categories
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {categories.map(category => {
                                            const IconComponent = ICON_MAP[category.icon] || BookOpen;
                                            const isCategorySelected = selectedCategory === category.id;
                                            const itemCount = category.words?.length || category.items?.length || 0;
                                            
                                            return (
                                                <button
                                                    key={category.id}
                                                    onClick={() => handleCategoryClick(category.id)}
                                                    className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all transform hover:scale-102 ${
                                                        isCategorySelected 
                                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-700 shadow-lg'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-lg transition-all ${
                                                        isCategorySelected 
                                                            ? 'bg-white/20' 
                                                            : 'bg-gray-100 group-hover:bg-blue-100'
                                                    }`}>
                                                        <IconComponent 
                                                            size={24} 
                                                            weight="duotone"
                                                            className={isCategorySelected ? 'text-white' : 'text-gray-600'}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex-1 text-left">
                                                        <div className={`font-semibold ${isCategorySelected ? 'text-white' : 'text-gray-900'}`}>
                                                            {category.name}
                                                        </div>
                                                        <div className={`text-sm ${isCategorySelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                            {itemCount} {selectedDomain === 'vocabulaire' ? 'words' : 'items'}
                                                        </div>
                                                    </div>
                                                    
                                                    {isCategorySelected && (
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Level Tabs - Mobile */}
            <div className="sm:hidden space-y-3">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <div className="flex gap-3 min-w-min">
                        {levels.map(level => {
                            const LevelIcon = LEVEL_ICON_MAP[level.icon] || LEVEL_ICON_MAP['Leaf'];
                            const isSelected = selectedLevel === level.id;
                            const isExpanded = expandedLevel === level.id;
                            
                            return (
                                <button 
                                    key={level.id} 
                                    onClick={() => handleLevelClick(level.id)} 
                                    className={`group relative flex-shrink-0 rounded-2xl py-3 px-5 border-3 font-bold transition-all transform active:scale-95 ${
                                        getLevelColors(level.id, isSelected)
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className={"p-2 rounded-xl backdrop-blur-sm transition-all " + getIconBgColor(level.id, isSelected)}>
                                                <LevelIcon size={24} weight="duotone" />
                                            </div>
                                            <span className="text-base whitespace-nowrap">{level.displayName}</span>
											<span className="text-xs text-gray-500 hidden sm:block">{level.displayNameEnglish}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            {isSelected && (
                                                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-lg"></div>
                                            )}
                                            <div
                                                onClick={(e) => handleArrowClick(level.id, e)}
                                                className={`p-1 rounded transition-colors ${
                                                    selectedLevel === level.id 
                                                        ? 'hover:bg-white/20 cursor-pointer' 
                                                        : 'opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                <div className="transition-transform duration-200">
                                                    {isExpanded ? (
                                                        <CaretDown size={16} weight="bold" />
                                                    ) : (
                                                        <CaretRight size={16} weight="bold" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Category List - Mobile */}
                {expandedLevel && getCategoriesForCurrentLevel(expandedLevel).length > 0 && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-2">
                            Categories
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {getCategoriesForCurrentLevel(expandedLevel).map(category => {
                                const IconComponent = ICON_MAP[category.icon] || BookOpen;
                                const isSelected = selectedCategory === category.id;
                                const itemCount = category.words?.length || category.items?.length || 0;
                                
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category.id)}
                                        className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all transform hover:scale-102 ${
                                            isSelected 
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-700 shadow-lg'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg transition-all ${
                                            isSelected 
                                                ? 'bg-white/20' 
                                                : 'bg-gray-100 group-hover:bg-blue-100'
                                        }`}>
                                            <IconComponent 
                                                size={24} 
                                                weight="duotone"
                                                className={isSelected ? 'text-white' : 'text-gray-600'}
                                            />
                                        </div>
                                        
                                        <div className="flex-1 text-left">
                                            <div className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                {category.name}
                                            </div>
                                            <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                {itemCount} {selectedDomain === 'vocabulaire' ? 'words' : 'items'}
                                            </div>
                                        </div>
                                        
                                        {isSelected && (
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryTabs;