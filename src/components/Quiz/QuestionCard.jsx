import React, { useMemo } from 'react';
import { RotateCcw } from '../UI/Icons';
import SpeakerIcon from '../UI/SpeakerIcon';
import { Sparkle, SmileySad } from '@phosphor-icons/react';
import { generateQuizBackgroundIcons } from '../../utils/backgroundIcons';

const QuestionCard = ({ 
    questionText,
    currentQuestion,
    getCurrentStats,
    choices,
    selectedAnswer,
    correctAnswer,
    showResult,
    onAnswer,
    onNextQuestion
}) => {
    // Generate icons ONCE per component mount (session), not per render
    const backgroundIcons = useMemo(() => generateQuizBackgroundIcons(), []);

    return (
        <div className="relative mx-auto bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8 border-4 border-grade1-300 overflow-hidden">
            {/* Background Icons */}
            {backgroundIcons.map(({ Icon, position, style, size }, index) => (
                <Icon 
                    key={`bg-icon-${position}-${index}`}
                    size={size}
                    weight="duotone"
                    style={style}
                    className="text-grade1-400"
                />
            ))}

            {/* Existing content - wrap in relative container to stack above icons */}
            <div className="relative z-10">
                <div className="text-center mb-8">
                    <p className="text-gray-600 text-xl mb-2 font-medium">What does this mean?</p>
                    
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <h2 className="text-3xl sm:text-6xl font-bold text-grade1-700">{questionText}</h2>
                        <div className="transform hover:scale-110 transition-transform">
                            <SpeakerIcon text={questionText} />
                        </div>
                    </div>
                    
                    {currentQuestion && getCurrentStats()[currentQuestion.id] && (
                        <div className="inline-block bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
                            <p className="text-sm font-semibold text-gray-600">
                                Attempted: {getCurrentStats()[currentQuestion.id].attempts} times
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {choices.map((choice, index) => {
                        const isSelected = selectedAnswer === choice;
                        const isCorrect = choice === correctAnswer;
                        const showCorrect = showResult && isCorrect;
                        const showWrong = showResult && isSelected && !isCorrect;
                        
                        return (
                            <button 
                                key={index} 
                                onClick={() => !showResult && onAnswer(choice)} 
                                disabled={showResult} 
                                className={`w-full p-3 sm:p-6 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 border-4 shadow-lg
                                    ${showCorrect ? 'bg-gradient-to-r from-success-500 to-success-600 text-white border-success-700 scale-105 animate-wiggle' : ''}
                                    ${showWrong ? 'bg-gradient-to-r from-error-400 to-error-500 text-white border-error-600 animate-wiggle' : ''}
                                    ${!showResult ? 'bg-white border-grade1-200 hover:bg-grade1-50 hover:border-grade1-400 text-grade1-800' : ''}
                                    ${showResult && !isSelected && !isCorrect ? 'bg-gray-100 border-gray-300 text-gray-400 opacity-50' : ''}`}
                            >
                                {showCorrect && <span className="mr-2"><Sparkle size={36} color="#fff705" weight="fill" className="animate-pulse inline" /></span>}
                                {choice}
                                {showWrong && <span className="ml-2"><SmileySad size={36} color="#ffffff" weight="fill" className="inline" /></span>}
                            </button>
                        );
                    })}
                </div>

                {showResult && (
                    <div className="mt-8 text-center animate-pop">
                        <button 
                            onClick={onNextQuestion} 
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-grade1-500 to-grade1-600 hover:from-grade1-600 hover:to-grade1-700 text-white rounded-2xl text-2xl font-bold transition-all transform hover:scale-110 shadow-xl"
                        >
                            <span>Next Question</span>
                            <RotateCcw size={28} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;