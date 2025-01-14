import { supabase } from "@/integrations/supabase/client";

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
    // Parse the card string to extract name, set, and number
    const matches = cardName.match(/^(.*?)(?:\s+([A-Z]{2,4})\s*(\d+))?$/);
    if (!matches) {
      console.log('Could not parse card string:', cardName);
      return null;
    }

    const [, baseName, setCode, cardNumber] = matches;

    // First, check our cache
    const { data: cachedCard } = await supabase
      .from('card_images')
      .select('*')
      .eq('card_name', baseName.trim())
      .eq('set_code', setCode || null)
      .eq('card_number', cardNumber || null)
      .maybeSingle();

    if (cachedCard) {
      console.log('Found cached image for:', baseName);
      return {
        id: cachedCard.id,
        name: cachedCard.card_name,
        images: {
          small: cachedCard.image_url,
          large: cachedCard.image_url,
        },
      };
    }

    // If not in cache, search the API
    const apiKey = import.meta.env.VITE_POKEMON_TCG_API_KEY;
    console.log('Using API Key:', apiKey ? 'Present' : 'Missing');
    
    let query = `name:"${baseName.trim()}"`;
    if (setCode && cardNumber) {
      query += ` (set.ptcgoCode:${setCode} OR set.id:${setCode.toLowerCase()}) number:${cardNumber}`;
    }

    console.log('Searching API with query:', query);

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
            const card = flexibleData.data[0];
            console.log('Found card with flexible search:', card.name);
            
            // Cache the result
            await supabase.from('card_images').insert({
              card_name: baseName.trim(),
              image_url: card.images.small,
              set_code: setCode,
              card_number: cardNumber,
            });

            return card;
          }
        }
      }
      
      console.log('No card found for:', query);
      return null;
    }

    const card = data.data[0];

    // Cache the result
    await supabase.from('card_images').insert({
      card_name: baseName.trim(),
      image_url: card.images.small,
      set_code: setCode,
      card_number: cardNumber,
    });

    return card;
  } catch (error) {
    console.error('Error fetching card:', error);
    return null;
  }
};