// src/components/Badge.jsx
import React from 'react';

// Color mapping for Pokémon types
const typeColors = {
    fire: 'bg-red-500', water: 'bg-blue-500', grass: 'bg-green-500',
    electric: 'bg-yellow-400', psychic: 'bg-pink-500', ice: 'bg-cyan-300',
    dragon: 'bg-indigo-600', dark: 'bg-gray-800', fairy: 'bg-pink-300',
    normal: 'bg-gray-400', fighting: 'bg-orange-700', flying: 'bg-sky-400',
    poison: 'bg-purple-600', ground: 'bg-yellow-600', rock: 'bg-yellow-800',
    bug: 'bg-lime-500', ghost: 'bg-indigo-800', steel: 'bg-gray-500',
};

// Color mapping for special classifications from your project plan
const classificationColors = {
    Legendary: 'bg-yellow-500', // Gold
    Mythical: 'bg-purple-500', // Purple
    'Pseudo-Legendary': 'bg-blue-700', // Blue
};

const Badge = ({ type, classification }) => {
    // Determine color and text based on the props we pass to the component
    const color = type ? typeColors[type] : classificationColors[classification];
    const text = type || classification;

    return (
        <span className={`px-2 py-1 text-xs font-bold text-white rounded-full capitalize ${color}`}>
            {text}
        </span>
    );
};

export default Badge;