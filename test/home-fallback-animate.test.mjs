import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSandbox } from './harness.mjs';

// Ce fichier existe suite à un signalement réel : l'accueil affichait "Les
// sources officielles sont momentanément indisponibles" sans jamais proposer
// D anime, laissant un vrai cul-de-sac dès la première page.

test('quand la connexion aux sources échoue, l’accueil propose D anime, pas un cul-de-sac', async () => {
  const { sandbox, fields } = createSandbox();
  const fakeList = { innerHTML: '' };
  fields['#pulseEventList'] = fakeList;
  fields['#pulseTemp'] = { textContent: '' };
  fields['#pulseWeather'] = { textContent: '' };
  sandbox.state.view = 'home';
  sandbox.state.location = { lat: 50.5, lng: 1.6 };
  sandbox.fetch = async () => { throw new Error('réseau coupé'); };
  await sandbox.loadHomePulse();
  assert.match(fakeList.innerHTML, /D anime/, 'un appel à D anime doit apparaître même si tout échoue');
});

test('quand la recherche réussit mais ne trouve vraiment aucun événement, D anime est aussi proposé', async () => {
  const { sandbox, fields } = createSandbox();
  const fakeList = { innerHTML: '' };
  fields['#pulseEventList'] = fakeList;
  fields['#pulseTemp'] = { textContent: '' };
  fields['#pulseWeather'] = { textContent: '' };
  sandbox.state.view = 'home';
  sandbox.state.location = { lat: 50.5, lng: 1.6 };
  sandbox.fetch = async () => ({ ok: true, json: async () => ({ events: [] }) });
  await sandbox.loadHomePulse();
  assert.match(fakeList.innerHTML, /D anime/, 'un appel à D anime doit apparaître même sans aucun événement trouvé');
});
