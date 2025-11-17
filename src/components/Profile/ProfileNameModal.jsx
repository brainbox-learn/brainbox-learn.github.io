import React, { useState, useEffect } from 'react';
import { User, X } from '@phosphor-icons/react';

const ProfileNameModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialName = '',
    mode = 'create' // 'create' or 'edit'
}) => {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
        }
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        
        if (trimmedName.length < 3) {
            return; // Don't submit if too short
        }
        
        // Truncate to 20 chars if needed
        const finalName = trimmedName.slice(0, 20);
        onSubmit(finalName);
        setName('');
    };

    const handleInputChange = (e) => {
        // Auto-truncate at 20 characters
        const value = e.target.value;
        if (value.length <= 20) {
            setName(value);
        }
    };

    const isValid = name.trim().length >= 3;
    const charCount = name.length;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-gradient-to-r from-grade1-500 via-grade2-500 to-grade3-500 rounded-3xl shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-1 space-y-2 px-4 py-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <User size={32} weight="duotone" className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {mode === 'create' ? 'Create Profile' : 'Edit Profile Name'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/30 rounded-full transition-all"
                    >
                        <X size={24} weight="bold" className="text-white" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 px-4 py-6">
                        <label htmlFor="profileName" className="block text-sm font-semibold text-white mb-2">
                            Profile Name
                        </label>
                        <input
                            id="profileName"
                            type="text"
                            value={name}
                            onChange={handleInputChange}
                            placeholder="Enter name (3-20 characters)"
                            autoFocus
                            className="w-full px-4 py-3 rounded-2xl bg-white/40 border-2 border-white/30 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-lg font-semibold"
                        />
                        <div className="flex justify-between items-center mt-2 px-2">
                            <span className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-500'}`}>
                                {!isValid && charCount > 0 ? 'Too short (min 3 chars)' : ' '}
                            </span>
                            <span className="text-sm font-medium text-white">
                                {charCount}/20
                            </span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 px-4 py-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-2xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid}
                            className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition-all ${
                                isValid
                                    ? 'bg-white/20 text-white hover:bg-white/30'
                                    : 'bg-white/10 text-purple-400 cursor-not-allowed'
                            }`}
                        >
                            {mode === 'create' ? 'Create' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileNameModal;