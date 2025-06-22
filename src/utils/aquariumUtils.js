// src/utils/aquariumUtils.js
// Utility functions for the Aquarium map

/**
 * Adjusts base stats so monsters spawn with almost no attack power and
 * double the normal amount of health. This function reverses the formulas
 * in StatManager to calculate the minimal stat changes required.
 * @param {object} baseStats
 * @returns {object} adjusted copy of baseStats
 */
export function adjustMonsterStatsForAquarium(baseStats = {}) {
    const strength = baseStats.strength ?? 1;
    const endurance = baseStats.endurance ?? 1;
    const baseAP = baseStats.attackPower ?? 0;

    const adjusted = { ...baseStats };

    // StatManager derives attackPower as: baseAP + 1 + strength * 2
    // To end up with ~0 attack power we solve the formula for strength.
    adjusted.strength = (0 - baseAP - 1) / 2;

    // StatManager derives maxHp as: 10 + endurance * 5
    // Double the final value while keeping other bonuses intact.
    const originalHp = 10 + endurance * 5;
    const targetHp = originalHp * 2;

    adjusted.endurance = (targetHp - 10) / 5;

    // Restrict monster vision so they remain idle when far from the player
    const defaultVision = 192 * 2; // keep aquarium encounters manageable
    adjusted.visionRange = Math.min(baseStats.visionRange ?? 192 * 4, defaultVision);

    return adjusted;
}
