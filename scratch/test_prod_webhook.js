async function test() {
  try {
    const res = await fetch('https://ezyyk-kick-shop.vercel.app/api/kick-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    console.log('Status:', res.status);
    console.log('Response:', await res.text());
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
