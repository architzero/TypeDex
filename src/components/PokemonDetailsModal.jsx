// src/components/PokemonDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Badge from './Badge';

// --- NEW: A color system that maps each type to a set of theme colors ---
const typeThemeColors = {
    normal: { bg: 'bg-gray-200', accent: 'bg-gray-500', border: 'border-gray-500' },
    fire: { bg: 'bg-red-100', accent: 'bg-red-500', border: 'border-red-500' },
    water: { bg: 'bg-blue-100', accent: 'bg-blue-500', border: 'border-blue-500' },
    electric: { bg: 'bg-yellow-100', accent: 'bg-yellow-400', border: 'border-yellow-400' },
    grass: { bg: 'bg-green-100', accent: 'bg-green-500', border: 'border-green-500' },
    ice: { bg: 'bg-cyan-100', accent: 'bg-cyan-400', border: 'border-cyan-400' },
    fighting: { bg: 'bg-orange-100', accent: 'bg-orange-600', border: 'border-orange-600' },
    poison: { bg: 'bg-purple-100', accent: 'bg-purple-600', border: 'border-purple-600' },
    ground: { bg: 'bg-yellow-100', accent: 'bg-yellow-600', border: 'border-yellow-600' },
    flying: { bg: 'bg-sky-100', accent: 'bg-sky-400', border: 'border-sky-400' },
    psychic: { bg: 'bg-pink-100', accent: 'bg-pink-500', border: 'border-pink-500' },
    bug: { bg: 'bg-lime-100', accent: 'bg-lime-500', border: 'border-lime-500' },
    rock: { bg: 'bg-stone-200', accent: 'bg-stone-500', border: 'border-stone-500' },
    ghost: { bg: 'bg-indigo-100', accent: 'bg-indigo-700', border: 'border-indigo-700' },
    dragon: { bg: 'bg-indigo-100', accent: 'bg-indigo-500', border: 'border-indigo-500' },
    dark: { bg: 'bg-gray-300', accent: 'bg-gray-700', border: 'border-gray-700' },
    steel: { bg: 'bg-slate-200', accent: 'bg-slate-500', border: 'border-slate-500' },
    fairy: { bg: 'bg-rose-100', accent: 'bg-rose-400', border: 'border-rose-400' },
};

const MiniCard = ({ pokemonName, onPokemonSelect }) => {
    // This component remains the same
    const [sprite, setSprite] = useState(null);
    useEffect(() => {
        axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`).then(res => setSprite(res.data.sprites.front_default)).catch(err => setSprite(null));
    }, [pokemonName]);
    const displayName = pokemonName.replace(/-/g, ' ');
    return (
        <div title={displayName} className="w-20 h-20 flex items-center justify-center p-1 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 border-2 border-gray-300 transition-colors" onClick={() => onPokemonSelect(pokemonName)}>
            {sprite ? <img src={sprite} alt={displayName} className="w-full h-full" /> : <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center"><span className="text-xl text-gray-500">?</span></div>}
        </div>
    );
};

const PokemonDetailsModal = ({ isOpen, onClose, pokemon, onPokemonSelect }) => {
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [alternateForms, setAlternateForms] = useState([]);
  const [activeTab, setActiveTab] = useState('stats'); // NEW: State for active tab

  useEffect(() => {
    if (!pokemon) return;
    setActiveTab('stats'); // Reset to stats tab for new pokemon
    setEvolutionChain([]);
    setAlternateForms([]);
    const fetchExtraData = async () => {
        try {
            const speciesResponse = await axios.get(pokemon.fullDetails.species.url);
            if (speciesResponse.data.evolution_chain?.url) {
                const evolutionResponse = await axios.get(speciesResponse.data.evolution_chain.url);
                const chain = [];
                let current = evolutionResponse.data.chain;
                do {
                    chain.push(current.species.name);
                    current = current.evolves_to[0];
                } while (!!current);
                setEvolutionChain(chain);
            }
            const forms = speciesResponse.data.varieties.map(v => v.pokemon.name).filter(name => name !== pokemon.name);
            setAlternateForms(forms);
        } catch (error) { console.error("Failed to fetch extra details", error); }
    };
    fetchExtraData();
  }, [pokemon]);

  if (!isOpen || !pokemon) return null;

  const formatStatName = (statName) => {
    const names = { 'special-attack': 'Sp. Atk', 'special-defense': 'Sp. Def', 'hp': 'HP' };
    return names[statName] || statName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  };

  const primaryType = pokemon.types[0];
  const theme = typeThemeColors[primaryType] || typeThemeColors.normal;

  const tabStyle = "px-4 py-2 font-semibold rounded-t-lg transition-colors";
  const activeTabStyle = `text-white ${theme.accent}`;
  const inactiveTabStyle = "text-gray-500 hover:bg-gray-200";

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-800 text-4xl font-bold z-20">&times;</button>
        
        {/* --- DYNAMICALLY COLORED HEADER --- */}
        <div className={`p-6 rounded-t-2xl ${theme.bg}`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 relative">
                  <div className={`absolute -inset-2 rounded-full ${theme.accent} opacity-20`}></div>
                  <img src={pokemon.fullDetails.sprites.other['official-artwork'].front_default || pokemon.sprite} alt={pokemon.name} className="w-40 h-40 relative z-10"/>
              </div>
              <div className="flex-grow text-center md:text-left">
                  <p className="text-xl font-bold text-gray-500">#{String(pokemon.fullDetails.id).padStart(3, '0')}</p>
                  <h2 className="text-5xl font-bold capitalize text-gray-800">{pokemon.name}</h2>
                  <div className="flex justify-center md:justify-start gap-2 mt-2">
                    {pokemon.types.map(type => (<Badge key={type} type={type} />))}
                  </div>
              </div>
            </div>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
            {/* --- TAB NAVIGATION --- */}
            <div className="border-b-2 ${theme.border}">
                <nav className="-mb-0.5 flex space-x-2">
                    <button onClick={() => setActiveTab('stats')} className={`${tabStyle} ${activeTab === 'stats' ? activeTabStyle : inactiveTabStyle}`}>Stats</button>
                    <button onClick={() => setActiveTab('moves')} className={`${tabStyle} ${activeTab === 'moves' ? activeTabStyle : inactiveTabStyle}`}>Moves</button>
                    {(evolutionChain.length > 1 || alternateForms.length > 0) && (
                        <button onClick={() => setActiveTab('evolutions')} className={`${tabStyle} ${activeTab === 'evolutions' ? activeTabStyle : inactiveTabStyle}`}>Evolutions</button>
                    )}
                </nav>
            </div>

            {/* --- TAB CONTENT --- */}
            <div className="mt-4">
                {activeTab === 'stats' && (
                  <div className="space-y-3 animate-fade-in">
                      {pokemon.fullDetails.stats.map((statInfo) => (
                        <div key={statInfo.stat.name} className="flex items-center">
                          <span className="w-1/4 text-sm font-semibold text-gray-500">{formatStatName(statInfo.stat.name)}</span>
                          <span className="w-12 text-md font-bold text-gray-800 text-right mr-3">{statInfo.base_stat}</span>
                          <div className="w-full bg-gray-200 rounded-full h-5"><div className={`${theme.accent} h-5 rounded-full`} style={{ width: `${Math.min((statInfo.base_stat / 200) * 100, 100)}%` }}></div></div>
                        </div>
                      ))}
                  </div>
                )}
                {activeTab === 'moves' && (
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 bg-gray-100 rounded-lg animate-fade-in">
                    {pokemon.fullDetails.moves.map((moveInfo) => (
                      <span key={moveInfo.move.name} className="bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded-md capitalize">{moveInfo.move.name.replace(/-/g, ' ')}</span>
                    ))}
                  </div>
                )}
                {activeTab === 'evolutions' && (
                  <div className="animate-fade-in">
                      {evolutionChain.length > 1 && (
                          <div>
                              <h4 className="text-lg font-semibold mb-2 text-gray-700">Evolution Chain</h4>
                              <div className="flex justify-center flex-wrap gap-3 p-2">
                                  {evolutionChain.map(name => <MiniCard key={name} pokemonName={name} onPokemonSelect={onPokemonSelect} />)}
                              </div>
                          </div>
                      )}
                      {alternateForms.length > 0 && (
                          <div className="mt-4">
                              <h4 className="text-lg font-semibold mb-2 text-gray-700">Alternate Forms</h4>
                              <div className="flex justify-center flex-wrap gap-3 p-2">
                                  {alternateForms.map(name => <MiniCard key={name} pokemonName={name} onPokemonSelect={onPokemonSelect} />)}
                              </div>
                          </div>
                      )}
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetailsModal;