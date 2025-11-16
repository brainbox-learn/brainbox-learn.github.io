import React from 'react';
import { Leaf, TreePalm, Tree, CaretLeft } from '@phosphor-icons/react';

const ICON_MAP = {
    'Leaf': Leaf,
    'TreePalm': TreePalm,
    'Tree': Tree
};

const LevelSelection = ({ domain, section, levels, onSelectLevel, onBack }) => {
    if (!domain || !levels) return null;
    
    const title = section 
        ? `${domain.name} - ${section.name}`
        : domain.name;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <CaretLeft size={24} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back</span>
                </button>
                
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose your level
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {levels.map(level => {
                        const Icon = ICON_MAP[level.icon] || Leaf;
                        
                        return (
                            <button
                                key={level.id}
                                onClick={() => onSelectLevel(level.id)}
                                className={`group relative overflow-hidden rounded-3xl p-8 transition-all transform hover:scale-105 bg-gradient-to-br ${level.gradient} text-white shadow-2xl hover:shadow-3xl border-4 border-transparent`}
                            >
                                <div className="flex flex-col items-center gap-6">
                                    <div className="p-5 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 transition-colors">
                                        <Icon size={48} weight="duotone" />
                                    </div>
                                    
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold mb-2">
                                            {level.displayName}
                                        </h2>
                                        <p className="text-sm opacity-90 mb-3">
                                            {level.description}
                                        </p>
                                        
                                        <div className="flex justify-center gap-1">
                                            {[...Array(level.stars)].map((_, i) => (
                                                <span key={i} className="text-yellow-300 text-lg">⭐</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LevelSelection;
