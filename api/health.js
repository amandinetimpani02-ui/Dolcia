const LAT = 50.5214;
const LNG = 1.5912;

async function probe(name, url, validate) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    const result = validate(response, data);
    return { name, ok: result.ok, message: result.message };
  } catch (error) {
    return { name, ok: false, message: error.name === 'AbortError' ? 'Délai dépassé' : 'Connexion impossible' };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const googleKey = process.env.GOOGLE_KEY;
  const agendaKey = process.env.OPENAGENDA_KEY;
  const weatherKey = process.env.OPENWEATHER_KEY;

  const checks = await Promise.all([
    googleKey
      ? probe(
          'Google Places',
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LAT},${LNG}&radius=5000&type=restaurant&language=fr&key=${googleKey}`,
          (response, data) => ({
            ok: response.ok && ['OK', 'ZERO_RESULTS'].includes(data.status),
            message: response.ok && ['OK', 'ZERO_RESULTS'].includes(data.status) ? 'Opérationnel' : (data.status || 'Clé refusée')
          })
        )
      : Promise.resolve({ name: 'Google Places', ok: false, message: 'Variable absente' }),
    agendaKey
      ? probe(
          'OpenAgenda',
          `https://api.openagenda.com/v2/events?key=${agendaKey}&latLng=${LAT},${LNG}&radius=30&size=1&lang=fr`,
          (response, data) => ({
            ok: response.ok && !data.error,
            message: response.ok && !data.error ? 'Opérationnel' : 'Clé refusée ou API indisponible'
          })
        )
      : Promise.resolve({ name: 'OpenAgenda', ok: false, message: 'Variable absente' }),
    weatherKey
      ? probe(
          'OpenWeather',
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LNG}&appid=${weatherKey}&units=metric&lang=fr`,
          (response, data) => ({
            ok: response.ok && String(data.cod) === '200',
            message: response.ok && String(data.cod) === '200' ? 'Opérationnel' : 'Clé refusée ou abonnement inactif'
          })
        )
      : Promise.resolve({ name: 'OpenWeather', ok: false, message: 'Variable absente' })
  ]);

  const ok = checks.every(check => check.ok);
  return res.status(ok ? 200 : 503).json({
    service: 'Dolcia',
    status: ok ? 'opérationnel' : 'configuration à vérifier',
    destinationTestée: 'Le Touquet-Paris-Plage',
    checks,
    checkedAt: new Date().toISOString()
  });
}
