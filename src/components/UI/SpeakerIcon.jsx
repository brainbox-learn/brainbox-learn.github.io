import React, { useState, useEffect } from 'react';
import { UserSound } from '@phosphor-icons/react'; // Assuming you're using Phosphor icons

const SpeakerIcon = ({ text, className = "" }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [voice, setVoice] = useState(null);

    useEffect(() => {
        // Voices load asynchronously
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
            
            // Prefer local voices (better quality)
            const preferredVoice = frenchVoices.find(v => v.localService) || frenchVoices[0];
            setVoice(preferredVoice);
        };

        loadVoices();
        speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
    }, []);

    const speak = (e) => {
        e.stopPropagation(); // Prevent card flip
        
        if (isPlaying) return; // Prevent spam clicking

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
		utterance.rate = .35;
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        speechSynthesis.speak(utterance);
    };

    return (
        <button
            onClick={speak}
            disabled={isPlaying}
            className={`inline-flex items-center justify-center transition-all ${
                isPlaying ? 'text-blue-600 scale-110' : 'text-gray-500 hover:text-blue-500'
            } ${className}`}
            aria-label="Play pronunciation"
        >
            <UserSound 
                size={32} 
                weight={isPlaying ? "fill" : "regular"}
            />
        </button>
    );
};

export default SpeakerIcon;