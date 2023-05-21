export default async function simulateSystem(system) {
  try {
    const res = await fetch('http://localhost:8000/simulate/step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(system),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}
