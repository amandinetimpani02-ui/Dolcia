import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('Échap ferme la fenêtre active, une seule mécanique pour toute l’application', () => {
  assert.match(app, /if\(e\.key==='Escape'\)\{e\.preventDefault\(\);modal\.remove\(\);return\}/);
});

test('le focus reste emprisonné dans la fenêtre ouverte (Tab et Shift+Tab ne sortent jamais)', () => {
  assert.match(app, /if\(e\.key==='Tab'\)\{/);
  assert.match(app, /if\(e\.shiftKey&&document\.activeElement===first\)/);
});

test('chaque fenêtre reçoit role="dialog", aria-modal="true", et un focus initial qui évite la croix par défaut', () => {
  assert.match(app, /if\(!modal\.getAttribute\('role'\)\)modal\.setAttribute\('role','dialog'\)/);
  assert.match(app, /modal\.setAttribute\('aria-modal','true'\)/);
  assert.match(app, /function pickInitialFocus\(modal\)\{/);
  assert.match(app, /const useful=focusableIn\(modal\)\.filter\(el=>!el\.classList\.contains\('close'\)\)/);
  assert.match(app, /return useful\[0\]\|\|modal\.querySelector\('\.close'\)\|\|modal/);
});

test('le focus revient sur l’élément qui avait ouvert la fenêtre, à la fermeture', () => {
  assert.match(app, /modalOpenerStack\.push\(document\.activeElement\)/);
  assert.match(app, /const opener=modalOpenerStack\.pop\(\);\n\s*if\(opener&&document\.contains\(opener\)\)opener\.focus\?\.\(\)/);
});

test('chaque bouton de fermeture reçoit un libellé accessible s’il n’en a pas déjà un', () => {
  assert.match(app, /if\(closeBtn&&!closeBtn\.getAttribute\('aria-label'\)\)closeBtn\.setAttribute\('aria-label','Fermer'\)/);
});

test('le fond ne défile plus pendant qu’une fenêtre est ouverte, et se débloque une fois toutes fermées', () => {
  assert.match(app, /document\.body\.style\.overflow='hidden'/);
  assert.match(app, /if\(!document\.querySelector\('\.modal'\)\)document\.body\.style\.overflow=''/);
});

test('le bouton Retour mobile ferme la fenêtre active plutôt que de quitter l’application, sans créer de double fermeture', () => {
  assert.match(app, /history\.pushState\(\{dolciaModal:true\},''\)/);
  assert.match(app, /if\(modalSuppressNextPopstate\)\{modalSuppressNextPopstate=false;return\}/);
  assert.match(app, /if\(modalClosingViaPopstate\)\{modalClosingViaPopstate=false;return\}/);
  assert.match(app, /modalSuppressNextPopstate=true;\n\s*history\.back\(\)/);
});

test('deux drapeaux distincts empêchent la fermeture en cascade de deux fenêtres imbriquées pour un seul geste (bug trouvé et corrigé)', () => {
  const fn = app.match(/function retireModal\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(fn, /if\(modalClosingViaPopstate\)\{modalClosingViaPopstate=false;return\}/, 'une fermeture déclenchée par un vrai popstate ne doit jamais re-consommer l’historique');
  const popstateHandler = app.match(/window\.addEventListener\('popstate',\(\)=>\{[\s\S]*?\n\}\);/)?.[0] || '';
  assert.match(popstateHandler, /if\(modalSuppressNextPopstate\)\{modalSuppressNextPopstate=false;return\}/, 'un popstate que nous avons nous-mêmes déclenché ne doit jamais fermer une autre fenêtre');
});

test('le fond devient réellement inerte (inert), pas seulement visuellement bloqué — un lecteur d’écran ne doit plus pouvoir le parcourir', () => {
  assert.match(app, /function updateInertState\(\)\{/);
  assert.match(app, /if\(appEl\)appEl\.inert=modals\.length>0/);
  assert.match(app, /modals\.forEach\(m=>\{m\.inert=m!==top\}\)/);
});

test('la mécanique s’applique automatiquement à toute nouvelle fenêtre insérée, sans avoir à la répéter à chaque écran', () => {
  assert.match(app, /new MutationObserver\(mutations=>\{/);
  assert.match(app, /node\.classList\?\.contains\('modal'\)\)enhanceModal\(node\)/);
});
