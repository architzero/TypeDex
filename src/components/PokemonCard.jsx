// src/components/PokemonCard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { pseudoLegendaryPokemon } from '../data/pseudoLegendaries';
import Badge from './Badge';

const classificationColors = {
  'Normal': 'bg-white',
  'Legendary': 'bg-yellow-300',
  'Mythical': 'bg-purple-300',
  'Pseudo-Legendary': 'bg-blue-300',
};

const PokemonCard = ({ pokemon, onCardClick }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const pokemonRes = await axios.get(pokemon.url);
        
        // We only need the species data if the main pokemon data doesn't have it
        // but for classification, we always need it.
        const speciesRes = await axios.get(pokemonRes.data.species.url);
        
        let classification = 'Normal';
        if (speciesRes.data.is_legendary) {
          classification = 'Legendary';
        } else if (speciesRes.data.is_mythical) {
          classification = 'Mythical';
        } else if (pseudoLegendaryPokemon.includes(pokemon.name)) {
          classification = 'Pseudo-Legendary';
        }

        setDetails({
          name: pokemon.name,
          sprite: pokemonRes.data.sprites.front_default,
          types: pokemonRes.data.types.map(t => t.type.name),
          classification: classification,
          // We'll pass the full details object on click
          fullDetails: pokemonRes.data 
        });
      } catch (error) {
        console.error(`Failed to fetch details for ${pokemon.name}`, error);
      }
    };
    fetchDetails();
  }, [pokemon]);

  if (!details) {
    return <div className="bg-gray-200 rounded-lg shadow-md animate-pulse h-48"></div>;
  }

  const cardBgColor = classificationColors[details.classification];

  return (
    <div 
      className={`rounded-lg shadow-md p-4 text-center transition-transform transform hover:scale-105 cursor-pointer ${cardBgColor}`}
      onClick={() => onCardClick(details)}
    >
      <img src={details.sprite} alt={details.name} className="mx-auto h-24 w-24 bg-black bg-opacity-10 rounded-full" />
      <h3 className="text-lg font-bold capitalize mt-2 text-gray-800">{details.name}</h3>
      
      <div className="flex justify-center gap-2 mt-2">
        {details.types.map(type => (
          <Badge key={type} type={type} />
        ))}
      </div>
      
      {details.classification !== 'Normal' && (
        <div className="mt-3">
            <Badge classification={details.classification} />
        </div>
      )}
    </div>
  );
};

export default PokemonCard;