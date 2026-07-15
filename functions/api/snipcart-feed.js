// Cloudflare Pages Function — serves a live Snipcart price-validation feed.
// It reads the CMS-managed data/products.json on every request, so the feed
// is ALWAYS in sync with the shop. Snipcart's crawler fetches this URL
// (set as each product's data-item-url) to verify prices at checkout.
// Route: /api/snipcart-feed

function slugify(n) {
  return (n || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function priceNum(x) {
  var m = String(x).match(/[0-9.]+/);
  return m ? Math.round(parseFloat(m[0]) * 100) / 100 : 0;
}

export async function onRequest(context) {
  var request = context.request;
  var products = [];
  try {
    var url = new URL('/data/products.json', request.url);
    var res;
    if (context.env && context.env.ASSETS && context.env.ASSETS.fetch) {
      res = await context.env.ASSETS.fetch(new Request(url.toString()));
    } else {
      res = await fetch(url.toString());
    }
    var data = await res.json();
    products = (data && data.products) ? data.products : (Array.isArray(data) ? data : []);
  } catch (e) {
    products = [];
  }

  var feed = products.map(function (p) {
    return {
      id: slugify(p.name),
      name: p.name,
      price: priceNum(p.price),
      url: '/api/snipcart-feed'
    };
  });

  return new Response(JSON.stringify(feed), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    }
  });
}
