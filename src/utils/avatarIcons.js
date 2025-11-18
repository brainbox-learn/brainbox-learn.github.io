import { 
    Alien, 
    FlyingSaucer, 
    Rabbit, 
    Barn, 
    Bird, 
    Butterfly, 
    Cat, 
    Cow, 
    Dog, 
    Fish, 
    PawPrint,
	Rocket,
} from '@phosphor-icons/react';

export const AVATAR_ICONS = [
    { id: 'cat', Icon: Cat, label: 'Cat' },
    { id: 'dog', Icon: Dog, label: 'Dog' },
    { id: 'rabbit', Icon: Rabbit, label: 'Rabbit' },
    { id: 'bird', Icon: Bird, label: 'Bird' },
    { id: 'butterfly', Icon: Butterfly, label: 'Butterfly' },
    { id: 'fish', Icon: Fish, label: 'Fish' },
    { id: 'cow', Icon: Cow, label: 'Cow' },
    { id: 'alien', Icon: Alien, label: 'Alien' },
    { id: 'flyingsaucer', Icon: FlyingSaucer, label: 'UFO' },
    { id: 'barn', Icon: Barn, label: 'Barn' },
    { id: 'pawprint', Icon: PawPrint, label: 'Paw' },
    { id: 'rocket', Icon: Rocket, label: 'Rocket' }
];

export const getRandomAvatar = () => {
    return AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)].id;
};

export const getAvatarIcon = (avatarId) => {
    const avatar = AVATAR_ICONS.find(a => a.id === avatarId);
    return avatar ? avatar.Icon : Cat; // Fallback to Cat
};