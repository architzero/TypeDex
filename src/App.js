// src/App.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';
import PokemonCard from './components/PokemonCard';
import TypeSelector from './components/TypeSelector';
import PokemonDetailsModal from './components/PokemonDetailsModal';
import { pseudoLegendaryPokemon } from './data/pseudoLegendaries';

const ITEMS_PER_PAGE = 24;

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Preparing Pokémon Database...');
  const [masterPokemonList, setMasterPokemonList] = useState([]);
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestion, setSuggestion] = useState('');

  const fuseRef = useRef(null);

  useEffect(() => {
    const fetchMasterListAndForms = async () => {
      try {
        setLoadingMessage('Fetching species list (1/3)');
        const speciesListRes = await axios.get('https://pokeapi.co/api/v2/pokemon-species?limit=905');
        const speciesUrls = speciesListRes.data.results.map(s => s.url);
        
        setLoadingMessage('Fetching all varieties (2/3)');
        const allVarietyUrls = new Set();
        const speciesPromises = speciesUrls.map(url => axios.get(url));
        const speciesResults = await Promise.all(speciesPromises);
        
        speciesResults.forEach(res => {
          res.data.varieties.forEach(v => allVarietyUrls.add(v.pokemon.url));
        });

        setLoadingMessage(`Fetching details for ${allVarietyUrls.size} Pokémon forms (3/3)`);
        const pokemonPromises = Array.from(allVarietyUrls).map(url => axios.get(url));
        const pokemonResults = await Promise.all(pokemonPromises);
        
        const finalMasterList = pokemonResults.map(res => ({
          name: res.data.name,
          url: `https://pokeapi.co/api/v2/pokemon/${res.data.id}/`,
          types: res.data.types.map(t => t.type.name),
        }));

        setMasterPokemonList(finalMasterList);
        fuseRef.current = new Fuse(finalMasterList, { keys: ['name'], threshold: 0.4 });
      } catch (error) {
        console.error("A critical error occurred while building the Pokémon database:", error);
        setLoadingMessage('Failed to load Pokémon database. Please try refreshing the page.');
      }
      setIsAppLoading(false);
    };
    fetchMasterListAndForms();
  }, []);

  const fetchPokemonByType = useCallback((types) => {
    if (types.length === 0) {
      setPokemonList([]);
      return;
    }
    setLoading(true);
    setCurrentPage(1);
    const filteredList = masterPokemonList.filter(pokemon => types.every(type => pokemon.types.includes(type)));
    setPokemonList(filteredList);
    setLoading(false);
  }, [masterPokemonList]);

  const handleCardClick = async (pokemon) => {
    try {
      const fullDetails = await axios.get(pokemon.url);
      const speciesRes = await axios.get(fullDetails.data.species.url);
      let classification = 'Normal';
      if (speciesRes.data.is_legendary) classification = 'Legendary';
      else if (speciesRes.data.is_mythical) classification = 'Mythical';
      else if (pseudoLegendaryPokemon.includes(fullDetails.data.name)) classification = 'Pseudo-Legendary';
      setSelectedPokemon({ ...pokemon, fullDetails: fullDetails.data, classification: classification });
      setIsModalOpen(true);
    } catch (error) { console.error("Error fetching full Pokémon details:", error); }
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedPokemon(null); };
  
  const handleSelectNewPokemon = async (pokemonName) => {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      const pokemonStub = { name: res.data.name, url: `https://pokeapi.co/api/v2/pokemon/${res.data.id}/`, types: res.data.types.map(t => t.type.name) };
      await handleCardClick(pokemonStub);
    } catch(error) { console.error("Failed to select new pokemon", error); closeModal(); }
  };

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleTypeChange = (types) => { setSelectedTypes(types); fetchPokemonByType(types); };

  const getFilteredResults = () => {
    const listToFilter = selectedTypes.length > 0 ? pokemonList : masterPokemonList;
    if (!searchTerm) return listToFilter;
    return listToFilter.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filteredPokemon = getFilteredResults();
  const totalPages = Math.ceil(filteredPokemon.length / ITEMS_PER_PAGE);
  const paginatedPokemon = filteredPokemon.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (searchTerm && filteredPokemon.length === 0 && fuseRef.current) {
      const results = fuseRef.current.search(searchTerm);
      if (results.length > 0) {
        setSuggestion(results[0].item.name);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  }, [searchTerm, filteredPokemon]);

  if (isAppLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">{loadingMessage}</h2>
          <p className="text-gray-500 mt-2">This is a one-time setup for a super-fast experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-red-600 text-white p-4 shadow-md text-center sticky top-0 z-10">
        <h1 className="text-3xl font-bold">Pokémon Type Explorer</h1>
        <p className="text-md mt-1">Select types or search by name (All Forms Included)</p>
      </header>
      <main className="p-4 md:p-8">
        <TypeSelector selectedTypes={selectedTypes} onTypeChange={handleTypeChange} />
        <div className="mb-8 max-w-md mx-auto">
            <input type="text" placeholder="Search any Pokémon by name..." className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={handleSearchChange}/>
        </div>
        
        {loading && <p className="text-center text-xl mt-12">Filtering...</p>}
        
        {!loading && (
            paginatedPokemon.length > 0 ? (
              <>
                {/* --- THIS IS THE PART THAT WAS MISSING --- */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {paginatedPokemon.map((pokemon) => (<PokemonCard key={pokemon.name} pokemon={pokemon} onCardClick={() => handleCardClick(pokemon)} />))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300">Previous</button>
                    <span className="font-semibold">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300">Next</button>
                  </div>
                )}
              </>
            ) : (
                <div className="text-center text-xl mt-12 text-gray-600">
                    {suggestion ? (
                        <p>
                            No Pokémon found. Did you mean: <button className="text-blue-600 font-semibold hover:underline" onClick={() => setSearchTerm(suggestion)}>
                                {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
                            </button>?
                        </p>
                    ) : (
                        <p>
                            {searchTerm || selectedTypes.length > 0 ? `No Pokémon found matching your criteria.` : `Please select a type or search for a Pokémon.`}
                        </p>
                    )}
                </div>
            )
        )}
      </main>
      <PokemonDetailsModal isOpen={isModalOpen} onClose={closeModal} pokemon={selectedPokemon} onPokemonSelect={handleSelectNewPokemon} />
    </div>
  );
}

export default App;