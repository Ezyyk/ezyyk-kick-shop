async function trigger() {
  const token = 'ezyyk2025admin';
  try {
    const res = await fetch('http://localhost:3000/api/bot-tick', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    console.log('Response:', data);
  } catch (e) {
    console.error('Error:', e);
  }
}

trigger();
