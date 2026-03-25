// src/utils/countryFlags.js
import { getCountryFlag as getFlag, getCountryInfo as getInfo } from './countries';

/**
 * Get the flag emoji for a given country
 * @param {string} country - Country name
 * @returns {string} Flag emoji
 */
export const getCountryFlag = (country) => {
    return getFlag(country);
};

/**
 * Get country info including flag and name
 * @param {string} country - Country name
 * @returns {object} Country info with flag and name
 */
export const getCountryInfo = (country) => {
    return getInfo(country);
};
