import { AVATAR_ICONS } from './avatarIcons';

export const generateQuizBackgroundIcons = () => {
    // Pick 3 random animal icons
    const shuffled = [...AVATAR_ICONS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

	const gradients = [
        ['#10b981', '#3b82f6'], // green to blue
        ['#f59e0b', '#ec4899'], // orange to pink
        ['#8b5cf6', '#06b6d4'], // purple to cyan
    ];
    
    return [
        {
            Icon: selected[0].Icon,
            position: 'top-left',
			gradientId: 'iconGradient1',
            gradientColors: gradients[0],
            style: {
                position: 'absolute',
                top: '-5%',
                left: '-2%',
                opacity: 0.1 + Math.random() * 0.05, // 20-40%
                transform: `rotate(${-20 + Math.random() * 10}deg)`, // -20 to -10 degrees
                pointerEvents: 'none',
                zIndex: 0
            },
            size: 120 + Math.random() * 60 // 80-120px
        },
        {
            Icon: selected[1].Icon,
            position: 'top-right',
            style: {
                position: 'absolute',
                top: '-6%',
                right: '-3%',
                opacity: 0.4 + Math.random() * 0.3, // 50-100%
                transform: `rotate(${10 + Math.random() * 10}deg)`, // 10 to 20 degrees
                pointerEvents: 'none',
                zIndex: 0
            },
            size: 80 + Math.random() * 40
        },
        {
            Icon: selected[2].Icon,
            position: 'bottom-right',
            style: {
                position: 'absolute',
                bottom: '-5%',
                right: '-3%',
                opacity: 0.3 + Math.random() * 0.3, // 20-40%
                transform: `rotate(${-10 + Math.random() * 10}deg)`, // -10 to 0 degrees
                pointerEvents: 'none',
                zIndex: 0
            },
            size: 100 + Math.random() * 50
        }
    ];
};