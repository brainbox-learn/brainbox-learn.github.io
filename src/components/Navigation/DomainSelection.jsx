import React from 'react';
import { BookOpen, Article, SpeakerHigh } from '@phosphor-icons/react';

const ICON_MAP = {
    'BookOpen': BookOpen,
    'Article': Article,
    'SpeakerHigh': SpeakerHigh
};

const DomainSelection = ({ domains, onSelectDomain }) => {
    if (!domains) return null;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        BrainBox
                    </h1>
                    <p className="text-xl text-gray-600">
                        Choose your learning path
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {domains.domains
                        .filter(domain => domain.enabled)
                        .map(domain => {
                            const Icon = ICON_MAP[domain.icon] || BookOpen;
                            
                            return (
                                <button
                                    key={domain.id}
                                    onClick={() => onSelectDomain(domain.id)}
                                    disabled={domain.comingSoon}
                                    className={`group relative overflow-hidden rounded-3xl p-8 transition-all transform hover:scale-105 ${
                                        domain.comingSoon 
                                            ? 'opacity-50 cursor-not-allowed bg-gray-100 border-4 border-gray-300'
                                            : `bg-gradient-to-br ${domain.gradient} text-white shadow-2xl hover:shadow-3xl border-4 border-transparent`
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-6">
                                        <div className={`p-6 rounded-2xl ${
                                            domain.comingSoon 
                                                ? 'bg-gray-200' 
                                                : 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30'
                                        }`}>
                                            <Icon 
                                                size={64} 
                                                weight="duotone"
                                                className={domain.comingSoon ? 'text-gray-400' : 'text-white'}
                                            />
                                        </div>
                                        
                                        <div className="text-center">
                                            <h2 className="text-3xl font-bold mb-2">
                                                {domain.name}
                                            </h2>
                                            <p className={`text-base ${
                                                domain.comingSoon ? 'text-gray-500' : 'opacity-90'
                                            }`}>
                                                {domain.description}
                                            </p>
                                        </div>
                                        
                                        {domain.comingSoon && (
                                            <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                                                Bientôt
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default DomainSelection;
