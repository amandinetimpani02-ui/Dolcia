import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

// Bug réel trouvé et prouvé avant correction : sur 4 activités qui devaient toutes passer un
// filtre "moins de 20€" (3 gratuites + 1 payante), une seule passait. Les activités gratuites
// étaient traitées comme si leur prix était inconnu, alors que la gratuité est une donnée connue.
test('une activité gratuite passe toujours un filtre budget, quel que soit le plafond choisi', () => {
  assert.match(app, /if\(filters\.budget&&filters\.budget!=='all'\)items=items\.filter\(item=>item\.free\|\|item\.freeAccess\|\|\(Number\.isInteger\(item\.price\)&&item\.price<=Number\(filters\.budget\)\)\)/);
});

test('un item non gratuit sans prix réellement connu reste exclu d’un filtre budget restrictif (comportement honnête conservé)', () => {
  assert.match(app, /Number\.isInteger\(item\.price\)&&item\.price<=Number\(filters\.budget\)/);
});

// Bug réel : la musique de session (85% de volume) jouait sans jamais baisser pendant que D
// parlait réellement (synthèse vocale), au risque de couvrir les consignes.
test('la musique baisse automatiquement pendant que D parle réellement, et remonte une fois terminé', () => {
  assert.match(app, /function duckDolciaThemeForSpeech\(\)\{/);
  assert.match(app, /dolciaTheme\.audio\.volume=Math\.min\(restore,\.04\)/);
  assert.match(app, /function playPremiumVoice\(text,onDone\)\{\n\s*const restoreTheme=duckDolciaThemeForSpeech\(\);/);
});

test('le choix muet/musique est mémorisé (sauvegardé), pas seulement pour la session en cours', () => {
  assert.match(app, /function toggleAnimateMute\(\)\{\n\s*state\.animateMuted=!state\.animateMuted;save\(\);/);
});

test('un bouton dédié à la musique reste visible en permanence pendant la session, distinct du bouton qui arrête toute la session', () => {
  assert.match(app, /class="animate-mute-toggle" onclick="toggleAnimateMute\(\)"/);
});

test('la musique ne démarre jamais si le mode muet a été choisi précédemment', () => {
  const fn = app.match(/function playDolciaTheme\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /if\(isAnimateMuted\(\)\)return;/);
});
