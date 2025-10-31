import React from 'react';
import { Home } from '../UI/Icons';
import { CATEGORY_CONFIG } from '../../data/words';

const PracticeModeBanner = ({ practiceMode, onExit }) => {
    if (!practiceMode) return null;

    const config = CATEGORY_CONFIG[practiceMode.category];
    const Icon = config.icon;
    
    return (
        <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="bg-gradient-to-r from-success-100 to-success-200 border-4 border-success-400 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-success-900 flex items-center gap-3 justify-center sm:justify-start">
                        <Icon size={36} weight="duotone" /> 
                        <span>Practicing {config.label} Mistakes</span>
                    </h2>
                    <p className="text-success-700 text-lg font-medium mt-1">
                        {practiceMode.words.length} words to practice 💪
                    </p>
                </div>
                
                <button 
                    onClick={onExit} 
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white rounded-2xl transition-all transform hover:scale-105 font-bold text-lg shadow-lg"
                >
                    <Home size={24} />
                    <span>Exit Practice</span>
                </button>
            </div>
        </div>
    );
};

export default PracticeModeBanner;