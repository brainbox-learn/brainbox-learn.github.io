import React, { useState, useMemo } from 'react';
import SpeakerIcon from '../UI/SpeakerIcon';
import { generateQuizBackgroundIcons } from '../../utils/backgroundIcons';

const FlashCard = ({ 
    questionText, 
    answerText, 
    currentQuestion,
    onNextCard 
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Generate icons once per session
    const backgroundIcons = useMemo(() => generateQuizBackgroundIcons(), []);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            onNextCard();
        }, 200);
    };

    return (
        <div className="max-w-2xl mx-auto px-4">
            <div className="perspective-1000">
                <div 
                    className={`relative w-full h-96 transition-transform duration-500 transform-style-3d cursor-pointer`}
                    onClick={handleFlip}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Front of card - Question */}
                    <div 
                        className="absolute w-full h-full bg-gradient-to-br from-white via-grade1-50 to-grade1-100 rounded-3xl shadow-2xl border-4 border-grade1-200 p-8 flex flex-col items-center justify-center backface-hidden overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        {/* Background Icons - FRONT */}
                        {backgroundIcons.map(({ Icon, position, style, size }, index) => (
                            <Icon 
                                key={`front-icon-${position}-${index}`}
                                size={size}
                                weight="duotone"
                                style={style}
                                className="text-grade1-400"
                            />
                        ))}

                        {/* Front Content */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-5xl font-bold text-grade1-700">
                                    {questionText}
                                </div>
                                <div className="transform hover:scale-110 transition-transform">
                                    <SpeakerIcon text={questionText} />
                                </div>
                            </div>
                            
                            <div className="mt-8 flex items-center gap-3 text-grade1-600 text-lg font-medium animate-bounce-slow">
                                <span className="text-2xl">👆</span>
                                <span>Tap to reveal answer!</span>
                            </div>
                        </div>
                    </div>

                    {/* Back of card - Answer */}
                    <div 
                        className="absolute w-full h-full bg-gradient-to-br from-success-400 via-success-500 to-success-600 rounded-3xl shadow-2xl border-4 border-success-600 p-8 flex flex-col items-center justify-center backface-hidden overflow-hidden"
                        style={{ 
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        {/* Background Icons - BACK (same icons, different color) */}
                        {backgroundIcons.map(({ Icon, position, style, size }, index) => (
                            <Icon 
                                key={`back-icon-${position}-${index}`}
                                size={size}
                                weight="duotone"
                                style={style}
                                className="text-white" // White on green background
                            />
                        ))}

                        {/* Back Content */}
                        <div className="relative z-10">
                            <div className="text-white text-3xl mb-4 opacity-90 font-medium">
                                {questionText}
                            </div>
                            <div className="text-5xl font-bold text-white drop-shadow-lg">
                                {answerText}
                            </div>
                            <div className="mt-8 flex items-center gap-3 text-white text-lg font-medium opacity-90 animate-bounce-slow">
                                <span className="text-2xl">👆</span>
                                <span>Tap to flip back</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Next button */}
            {isFlipped && (
                <div className="mt-6 flex justify-center animate-pop">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        className="bg-gradient-to-r from-grade1-500 to-grade1-600 hover:from-grade1-600 hover:to-grade1-700 text-white font-bold text-xl py-4 px-10 rounded-2xl transition-all shadow-lg transform hover:scale-110"
                    >
                        Next Card →
                    </button>
                </div>
            )}
        </div>
    );
};

export default FlashCard;