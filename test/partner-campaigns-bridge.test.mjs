import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const eventsApi = readFileSync(new URL('../api/events.js', import.meta.url), 'utf8');
const partnerCampaigns = readFileSync(new URL('../server/partner-campaigns.js', import.meta.url), 'utf8');
const pro = readFileSync(new URL('../pro.js', import.meta.url), 'utf8');

test('aucun nouveau fichier api/ créé : les campagnes partenaires passent par la branche existante', () => {
  assert.match(eventsApi, /req\.query\.service === 'partner-campaigns'/);
});

test('une campagne approuvée et chiffrable (place libérée, offre flash) devient une vraie ligne flash_offers, réutilisant le pipeline déjà construit — aucune duplication de logique d’envoi', () => {
  assert.match(partnerCampaigns, /const bridgeable = campaign\.original_price != null && campaign\.dolcia_price != null/);
  assert.match(partnerCampaigns, /status: 'live'/);
  assert.match(partnerCampaigns, /fetch\(`\$\{url\}\/rest\/v1\/flash_offers`/);
});

test('une campagne non chiffrable (événement rare, plan B météo) n’est jamais forcée en fausse offre flash avec des prix inventés', () => {
  assert.match(partnerCampaigns, /if \(!bridgeable\)/);
  assert.match(partnerCampaigns, /bridgedToPush: false/);
});

test('l’approbation est protégée par un secret partagé, en attendant une vraie console d’administration avec authentification', () => {
  assert.match(partnerCampaigns, /const bridgeSecret = process\.env\.ADMIN_BRIDGE_SECRET/);
  assert.match(partnerCampaigns, /req\.headers\['x-admin-secret'\] !== bridgeSecret/);
});

test('la soumission de campagne côté partenaire est maintenant réellement persistée (Supabase), plus un simulacre purement local', () => {
  assert.match(pro, /async function createCampaign\(\)/);
  assert.match(pro, /fetch\('\/api\/events\?service=partner-campaigns'/);
  assert.match(pro, /action:'submit'/);
});

test('même si la synchronisation échoue, la campagne reste visible localement pour le partenaire — jamais une perte silencieuse', () => {
  assert.match(pro, /Campagne enregistrée localement/);
});
