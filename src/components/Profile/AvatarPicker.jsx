import React from 'react';
import { AVATAR_ICONS } from '../../utils/avatarIcons';

const AvatarPicker = ({ selectedAvatar, onSelectAvatar }) => {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-white mb-3">
                Choose Your Avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
                {AVATAR_ICONS.map(({ id, Icon, label }) => {
                    const isSelected = selectedAvatar === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onSelectAvatar(id)}
                            className={`
                                p-4 rounded-2xl transition-all
                                ${isSelected 
                                    ? 'bg-white/40 ring-4 ring-white scale-105' 
                                    : 'bg-white/20 hover:bg-white/30 hover:scale-105'
                                }
                            `}
                            title={label}
                        >
                            <Icon 
                                size={40} 
                                weight="duotone" 
                                className="text-white mx-auto" 
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AvatarPicker;