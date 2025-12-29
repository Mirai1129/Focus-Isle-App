export type PlantRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PlantConfig {
    id: string;
    name: string;
    emoji: string;
    growthTime: number; // in minutes
    rarity: PlantRarity;
}

export const plants: PlantConfig[] = [
    {id: '1', name: 'Cherry Blossom', emoji: '🌸', growthTime: 25, rarity: 'common'},
    {id: '2', name: 'Sunflower', emoji: '🌻', growthTime: 30, rarity: 'common'},
    {id: '3', name: 'Rose', emoji: '🌹', growthTime: 45, rarity: 'rare'},
    {id: '4', name: 'Lotus', emoji: '🪷', growthTime: 60, rarity: 'rare'},
    {id: '5', name: 'Palm Tree', emoji: '🌴', growthTime: 90, rarity: 'epic'},
    {id: '6', name: 'Cactus', emoji: '🌵', growthTime: 120, rarity: 'epic'},
    {id: '7', name: 'Sakura Tree', emoji: '🌸', growthTime: 180, rarity: 'legendary'},
    {id: '8', name: 'Bamboo', emoji: '🎋', growthTime: 150, rarity: 'legendary'},
];

export const defaultUnlockedPlantIds = ['1', '2'];

export const defaultWhitelist = ['Messages', 'Phone', 'Music'];

export const rarityColors: Record<PlantRarity, string> = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
};
