import React from 'react';
import { Lightning, ChatCircle, Exam, CaretLeft } from '@phosphor-icons/react';

const ICON_MAP = {
    'Lightning': Lightning,
    'ChatCircle': ChatCircle,
    'Exam': Exam
};

const SectionSelection = ({ domain, sections, onSelectSection, onBack }) => {
    if (!domain || !sections) return null;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <CaretLeft size={24} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Domains</span>
                </button>
                
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        {domain.name}
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose a topic
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map(section => {
                        const Icon = ICON_MAP[section.icon] || Lightning;
                        
                        return (
                            <button
                                key={section.id}
                                onClick={() => onSelectSection(section.id)}
                                className="group bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 rounded-2xl p-6 border-3 border-gray-200 hover:border-purple-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-100 group-hover:bg-purple-200 rounded-xl transition-colors">
                                        <Icon size={32} weight="duotone" className="text-purple-600" />
                                    </div>
                                    
                                    <div className="text-left flex-1">
                                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                                            {section.name}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {section.description}
                                        </p>
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

export default SectionSelection;
