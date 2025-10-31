import React from 'react';

const AnimalFooter = () => {
    return (
		<div className="text-center mt-12 mb-8">
		<div className="inline-flex gap-6 text-8xl animate-pulse">
			<span className="transform hover:scale-125 transition-transform cursor-pointer">🦌</span>
			<span className="transform hover:scale-125 transition-transform cursor-pointer">🐿️</span>
			<span className="transform hover:scale-125 transition-transform cursor-pointer">🦊</span>
			<span className="transform hover:scale-125 transition-transform cursor-pointer">🐻</span>
			<span className="transform hover:scale-125 transition-transform cursor-pointer">🦉</span>
		</div>
		<p className="text-grade1-600 font-semibold text-lg mt-4">Great job learning! Keep going! 🌟</p>
		</div>
    );
};

export default AnimalFooter;