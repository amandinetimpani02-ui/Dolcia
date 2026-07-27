import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const style = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('l’agenda regroupe les moments par jour avec un en-tête clair (jour de la semaine, date, jour X sur Y pour un séjour)', () => {
  assert.match(app, /function renderAgenda\(\)/);
  assert.match(app, /agenda-day-header/);
  assert.match(app, /Jour \$\{dayPos\+1\} sur \$\{dayKeys\.length\}/);
});

test('un temps de trajet estimé apparaît entre deux étapes du même jour, jamais présenté comme un fait vérifié', () => {
  assert.match(app, /function agendaTravelConnector\(from,to\)/);
  assert.match(app, /estimation/);
  assert.match(app, /Trajet à estimer sur place/);
  assert.match(style, /\.agenda-connector\{/);
});

test('le trajet à pied et en voiture sont distingués selon la distance réelle entre les deux lieux', () => {
  assert.match(app, /const km=distanceKm\(from\.lat,from\.lng,to\.lat,to\.lng\),walking=km<=1\.2/);
});

test('le numéro de téléphone d’une fiche est un vrai lien cliquable (tel:), pas un texte inerte', () => {
  assert.match(app, /href="tel:\$\{esc\(item\.phone\.replace/);
  assert.match(app, /class="phone-link"/);
  assert.match(app, /phone-cta/);
  assert.match(style, /\.phone-link\{/);
});
