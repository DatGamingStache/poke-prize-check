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
    const apiKey = import.meta.env.VITE_POKEMON_TCG_API_KEY;
    console.log('Using API Key:', apiKey ? 'Present' : 'Missing');
    
    // Clean the card name to handle special characters and set numbers
    const cleanCardName = cardName.split(/\s+(?:\(|\d)/).shift()?.trim() || cardName;
    console.log('Searching for card:', cleanCardName);

    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(cleanCardName)}"&pageSize=1`,
      {
        headers: {
          'X-Api-Key': apiKey || '',
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return null;
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data.data || data.data.length === 0) {
      console.log('No card found for:', cleanCardName);
      return null;
    }

    return data.data[0] || null;
  } catch (error) {
    console.error('Error fetching card:', error);
    return null;
  }
};