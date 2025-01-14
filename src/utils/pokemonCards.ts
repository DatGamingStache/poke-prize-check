export interface PokemonCard {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
}

export const searchCard = async (cardName: string): Promise<PokemonCard | null> => {
  try {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(cardName)}"&pageSize=1`,
      {
        headers: {
          'X-Api-Key': import.meta.env.VITE_POKEMON_TCG_API_KEY || '',
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch card:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data[0] || null;
  } catch (error) {
    console.error('Error fetching card:', error);
    return null;
  }
};