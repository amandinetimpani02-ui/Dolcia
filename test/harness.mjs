import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_JS_PATH = path.join(__dirname, '..', 'app.js');

function makeFakeElement() {
  return {
    innerHTML: '', textContent: '', value: '', checked: false, className: '',
    classList: { add(){}, remove(){}, contains(){ return false; } },
    style: {}, dataset: {}, children: [],
    addEventListener(){}, removeEventListener(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    appendChild(){}, insertAdjacentHTML(){}, remove(){},
    setAttribute(){}, getAttribute(){ return null; },
    focus(){}, setSelectionRange(){}, scrollIntoView(){},
    closest(){ return { remove(){} }; }
  };
}

// Crée une instance fraîche et isolée de l'application pour un test.
// C'est le vrai app.js qui s'exécute (pas une copie de sa logique) : un bug
// introduit dans app.js fera échouer ces tests, exactement comme en production.
export function createSandbox(extraFields = {}) {
  const fakeApp = makeFakeElement();
  const fakeToast = makeFakeElement();
  const fakeQuestion = makeFakeElement();
  const fakeBody = makeFakeElement();
  const store = new Map();
  const fields = { ...extraFields };

  const sandbox = {
    console,
    navigator: { geolocation: null },
    document: {
      querySelector(sel) {
        if (sel === '#app') return fakeApp;
        if (sel === '#toast') return fakeToast;
        if (sel === '#eclatQuestion') return fakeQuestion;
        if (fields[sel]) return fields[sel];
        return null;
      },
      querySelectorAll(sel) { return fields[sel] || []; },
      body: fakeBody,
      addEventListener(){},
      createElementNS(){ return makeFakeElement(); }
    },
    fetch: async () => { throw new Error('réseau désactivé dans les tests'); },
    localStorage: {
      getItem(k){ return store.has(k) ? store.get(k) : null; },
      setItem(k, v){ store.set(k, v); },
      removeItem(k){ store.delete(k); }
    },
    setTimeout, clearTimeout, Date, Math, JSON, Object, Array, Map, Set,
    Promise, RegExp, String, Number, Boolean
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  const code = fs.readFileSync(APP_JS_PATH, 'utf8');
  vm.runInContext(code, sandbox, { filename: 'app.js' });

  return { sandbox, fields, store, fakeApp, fakeToast };
}
