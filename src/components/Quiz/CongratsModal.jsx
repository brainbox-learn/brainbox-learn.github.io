import React from 'react';
import Modal from '../UI/Modal';

const CongratsModal = ({ 
    isOpen, 
    onClose, 
    onPracticeHardWords, 
    onTryAgain, 
    hasHardWords,
    isPracticeMode 
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
            <div className="text-center p-4">
                <div className="text-8xl mb-6 animate-bounce-slow">🎉</div>
                
                <h2 className="text-4xl font-bold bg-gradient-to-r from-grade1-600 to-grade3-600 bg-clip-text text-transparent mb-4">
                    {isPracticeMode ? 'Practice Complete!' : 'Amazing Work!'}
                </h2>
                
                <p className="text-gray-600 text-xl mb-8 font-medium">
                    {isPracticeMode 
                        ? "You've practiced all your challenging words!"
                        : "You've seen all the words in this category!"}
                </p>
                
                <div className="space-y-3">
                    {hasHardWords && !isPracticeMode && (
                        <button
                            onClick={onPracticeHardWords}
                            className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                        >
                            🔥 Practice Hard Words
                        </button>
                    )}
                    
                    <button
                        onClick={onTryAgain}
                        className="w-full bg-gradient-to-r from-grade1-500 to-grade1-600 hover:from-grade1-600 hover:to-grade1-700 text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                    >
                        🔄 Try Again
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-lg py-4 px-6 rounded-2xl transition-all transform hover:scale-105"
                    >
                        ← Back to Quiz
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CongratsModal;