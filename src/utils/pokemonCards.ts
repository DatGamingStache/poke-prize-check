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
    const matches = cardName.match(/^(.*?)(?:\s+([A-Z]{2,4})\s*(\d+))?$/);
    if (!matches) {
      console.log('Could not parse card string:', cardName);
      return null;
    }

    const [, baseName, setCode, cardNumber] = matches;
    
    // Try first with exact matching
    let query = `name:"${baseName.trim()}"`;
    if (setCode && cardNumber) {
      // Try with exact set code first
      query += ` (set.ptcgoCode:${setCode} OR set.id:${setCode.toLowerCase()}) number:${cardNumber}`;
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
    
    // If no results found with exact match, try a more flexible search
    if (!data.data || data.data.length === 0) {
      console.log('No exact match found, trying flexible search for:', baseName);
      
      // Try just the name and number if we had a set code
      if (setCode && cardNumber) {
        query = `name:"${baseName.trim()}" number:${cardNumber}`;
        const flexibleResponse = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=1`,
          {
            headers: {
              'X-Api-Key': apiKey || '',
            },
          }
        );
        
        if (flexibleResponse.ok) {
          const flexibleData = await flexibleResponse.json();
          if (flexibleData.data && flexibleData.data.length > 0) {
            console.log('Found card with flexible search:', flexibleData.data[0].name);
            return flexibleData.data[0];
          }
        }
      }
      
      console.log('No card found for:', query);
      return null;
    }

    return data.data[0] || null;
  } catch (error) {
    console.error('Error fetching card:', error);
    return null;
  }
};