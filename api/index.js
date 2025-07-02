import { Router } from 'itty-router';

const router = Router();

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// Manejo de OPTIONS para CORS
router.options('*', () => new Response(null, { headers: corsHeaders }));

async function reportWebsite(url) {
  try {
    // Aquí implementamos el reporte real
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
    });
    return response.status;
  } catch (error) {
    return 'Error: ' + error.message;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

router.get('/report', async (request) => {
  const url = request.query.report;
  
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    const results = [];
    // Realizar 5 reportes con 3 segundos de intervalo
    for (let i = 0; i < 5; i++) {
      const status = await reportWebsite(url);
      results.push({ attempt: i + 1, status });
      if (i < 4) await sleep(3000); // Esperar 3 segundos entre reportes
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Reported ${url} 5 times`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Manejo de rutas no encontradas
router.all('*', () => new Response('404, not found!', { status: 404 }));

// Evento fetch principal
addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request));
});
