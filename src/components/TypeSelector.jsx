// src/components/TypeSelector.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// We get the full list of type colors from our Badge component
const typeColors = {
    normal: 'bg-gray-400', fire: 'bg-red-500', water: 'bg-blue-500',
    electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-cyan-300',
    fighting: 'bg-orange-700', poison: 'bg-purple-600', ground: 'bg-yellow-600',
    flying: 'bg-sky-400', psychic: 'bg-pink-500', bug: 'bg-lime-500',
    rock: 'bg-yellow-800', ghost: 'bg-indigo-800', dragon: 'bg-indigo-600',
    dark: 'bg-gray-800', steel: 'bg-gray-500', fairy: 'bg-pink-300',
};

const TypeSelector = ({ selectedTypes, onTypeChange }) => {
  const [allTypes, setAllTypes] = useState([]);

  useEffect(() => {
    axios.get('https://pokeapi.co/api/v2/type')
      .then(response => {
        // Filter out irrelevant types
        const relevantTypes = response.data.results.filter(type => type.name !== 'unknown' && type.name !== 'shadow');
        setAllTypes(relevantTypes);
      });
  }, []);

  const handleTypeClick = (typeName) => {
    // Logic to add/remove a type from the selection, max of 2
    const newSelectedTypes = selectedTypes.includes(typeName)
      ? selectedTypes.filter(t => t !== typeName)
      : selectedTypes.length < 2 ? [...selectedTypes, typeName] : selectedTypes; 
    onTypeChange(newSelectedTypes);
  };
  
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {allTypes.map(type => {
        const isSelected = selectedTypes.includes(type.name);
        // Use a default color if a type is somehow not in our color list
        const bgColor = typeColors[type.name] || 'bg-gray-500';

        return (
          <button
            key={type.name}
            onClick={() => handleTypeClick(type.name)}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-full capitalize transition-all duration-200 
            ${isSelected ? 'ring-4 ring-offset-2 ring-blue-500 scale-110' : 'opacity-60 hover:opacity-100'} ${bgColor}`}
          >
            {type.name}
          </button>
        );
      })}
    </div>
  );
};

export default TypeSelector;