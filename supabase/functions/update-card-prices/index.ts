
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting card price update process');
    const { shopUrl } = await req.json();

    // Create Firecrawl instance using fetch
    console.log('Initializing Firecrawl API connection');
    const firecrawlHeaders = {
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Supabase Edge Function'
    };

    // Scrape local shop website using Firecrawl API directly
    console.log('Scraping shop website:', shopUrl);
    const crawlResponse = await fetch('https://api.firecrawl.com/v1/crawl', {
      method: 'POST',
      headers: firecrawlHeaders,
      body: JSON.stringify({
        url: shopUrl,
        limit: 100,
        scrapeOptions: {
          formats: ['html'],
          selectors: {
            cards: {
              selector: '.card-item',
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
      })
    });

    if (!crawlResponse.ok) {
      const errorText = await crawlResponse.text();
      console.error('Firecrawl API error:', errorText);
      throw new Error(`Firecrawl API returned ${crawlResponse.status}: ${errorText}`);
    }

    const crawlData = await crawlResponse.json();
    if (!crawlData.success) {
      throw new Error('Failed to scrape shop website');
    }

    // Process scraped data
    const cards = crawlData.data.cards || [];
    console.log(`Found ${cards.length} cards`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process each card
    for (const card of cards) {
      try {
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
      } catch (cardError) {
        console.error('Error processing card:', card.name, cardError);
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
