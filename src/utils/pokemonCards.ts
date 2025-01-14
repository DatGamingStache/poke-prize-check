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
    
    // Parse the card string to extract name, set, and number
    const matches = cardName.match(/^(.*?)\s+(?:([A-Z]{3})\s*(\d+))?$/);
    if (!matches) {
      console.log('Could not parse card string:', cardName);
      return null;
    }

    const [, baseName, setCode, cardNumber] = matches;
    let query = `name:"${baseName.trim()}"`;
    
    // Add set and number constraints if available
    if (setCode && cardNumber) {
      query += ` set.ptcgoCode:${setCode} number:${cardNumber}`;
    }

    console.log('Searching with query:', query);

    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=1`,
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
      console.log('No card found for:', query);
      return null;
    }

    return data.data[0] || null;
  } catch (error) {
    console.error('Error fetching card:', error);
    return null;
  }
};