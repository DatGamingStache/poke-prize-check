
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import FirecrawlApp from '@mendable/firecrawl-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const POKEMON_TCG_API_KEY = Deno.env.get('POKEMON_TCG_API_KEY');
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting card price update process');
    const { shopUrl } = await req.json();

    // Initialize Firecrawl
    const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });

    // Scrape local shop website
    console.log('Scraping shop website:', shopUrl);
    const crawlResponse = await firecrawl.crawlUrl(shopUrl, {
      limit: 100,
      scrapeOptions: {
        formats: ['html'],
        selectors: {
          cards: {
            selector: '.card-item', // Adjust based on actual website structure
            type: 'list',
            properties: {
              name: '.card-name',
              price: '.card-price',
              set: '.card-set',
              condition: '.card-condition'
            }
          }
        }
      }
    });

    if (!crawlResponse.success) {
      throw new Error('Failed to scrape shop website');
    }

    // Process scraped data
    const cards = crawlResponse.data.cards || [];
    console.log(`Found ${cards.length} cards`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.7');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process each card
    for (const card of cards) {
      // Store card market data
      const { data: marketData, error: marketError } = await supabase
        .from('card_market_data')
        .upsert({
          card_name: card.name,
          set_name: card.set,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'card_name',
          returning: 'minimal'
        });

      if (marketError) {
        console.error('Error storing market data:', marketError);
        continue;
      }

      // Store local shop price
      const { error: priceError } = await supabase
        .from('card_prices')
        .insert({
          card_market_data_id: marketData?.[0]?.id,
          source: 'local_shop',
          price: parseFloat(card.price.replace(/[^0-9.]/g, '')),
          condition: card.condition?.toUpperCase() || 'NM'
        });

      if (priceError) {
        console.error('Error storing price:', priceError);
      }

      // Fetch and store TCGPlayer price
      try {
        const tcgResponse = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(card.name)}"`,
          { headers: { 'X-Api-Key': POKEMON_TCG_API_KEY! } }
        );
        const tcgData = await tcgResponse.json();
        
        if (tcgData.data?.[0]?.cardmarket?.price) {
          const { error: tcgPriceError } = await supabase
            .from('card_prices')
            .insert({
              card_market_data_id: marketData?.[0]?.id,
              source: 'tcgplayer',
              price: tcgData.data[0].cardmarket.price,
              condition: 'NM'
            });

          if (tcgPriceError) {
            console.error('Error storing TCG price:', tcgPriceError);
          }
        }
      } catch (error) {
        console.error('Error fetching TCG price:', error);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Prices updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-card-prices function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
