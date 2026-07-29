import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');

assert.match(app,/function zeroResultRecovery\(/,'a shared zero-result recovery must exist');
assert.match(app,/items\.length\?`<div class="catalog-list"/,'filtered zero results must use the recovery instead of an empty catalog');
assert.match(app,/acceptRecoveryBudget\(\)/,'the user must be able to explicitly relax only the budget');
assert.match(app,/acceptRecoveryDistance\(\)/,'the user must be able to explicitly widen only the distance');
assert.match(app,/state\.radius=Math\.max\(Number\(state\.radius\)\|\|12000,20000\)/,'explicit widening must remain capped at 20 km');
assert.match(app,/Les lieux ordinaires éloignés restent exclus/,'widening must preserve the exceptional-merit rule');
assert.match(app,/À 0 €, entre amis, D a déjà de quoi vous faire rire/,'free social laughter must lead to a concrete D animation');
assert.match(app,/Défis, jeux connus et fous rires guidés entre amis au Touquet/,'the free social fallback must be concrete and local');
assert.match(app,/Rien n’est élargi, dépensé ou ajouté sans votre validation/,'recovery must never silently change user constraints');
assert.doesNotMatch(app,/function acceptRecoveryDistance\(\)[\s\S]{0,350}state\.answers\.budget=/,'distance widening must not alter the budget');

console.log('zero-result-cascade: ok');
