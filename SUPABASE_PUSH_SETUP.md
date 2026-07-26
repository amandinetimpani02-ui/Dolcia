# Alertes push (offres flash) — configuration Supabase

Ce document liste ce que Claude ne peut pas faire depuis le code : créer les tables et le webhook
dans le tableau de bord Supabase. À faire une seule fois, dans l'éditeur SQL de Supabase.

## 1. Tables à créer

```sql
create table if not exists push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  latitude double precision,
  longitude double precision,
  updated_at timestamptz not null default now()
);

create table if not exists push_notifications_sent (
  offer_id bigint not null,
  endpoint text not null,
  sent_at timestamptz not null default now(),
  primary key (offer_id, endpoint)
);
```

## 2. Webhook Database → déclenchement instantané

Dans Supabase : **Database → Webhooks → Create a new webhook**

- **Table** : `flash_offers`
- **Events** : `Insert` et `Update`
- **Type** : HTTP Request
- **URL** : `https://dolcia.vercel.app/api/events?service=flash-notify` (remplacer par votre domaine réel)
- **Method** : POST
- **Headers** : ajouter `x-webhook-secret` avec exactement la même valeur que `SUPABASE_WEBHOOK_SECRET` sur Vercel

C'est ce webhook qui remplace le cron Vercel (limité à une fois par jour sur le plan Hobby, donc
inutilisable ici) : Supabase appelle directement l'endpoint dès qu'une offre passe en `status='live'`,
sans délai.

## 3. Variables d'environnement Vercel à ajouter

Voir `.env.example` : `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `SUPABASE_WEBHOOK_SECRET`.

Les clés VAPID fournies dans `.env.example` sont réelles et utilisables (générées avec le module
`crypto` natif de Node, paire EC P-256 conforme à la spécification VAPID). La clé publique est sans
risque à exposer (elle est d'ailleurs déjà dans `app.js`, comme une clé publishable Stripe) ; la clé
privée doit rester uniquement dans les variables d'environnement Vercel, jamais dans le dépôt Git.

## 4. Ce qui reste à décider

Le tableau de bord partenaire (`pro.js`, vue "Visibilité & push") a déjà l'interface pour qu'un
partenaire propose une campagne ("Place libérée", "Offre flash"...), avec un statut "À contrôler" —
mais cette création de campagne n'est pas encore reliée à une vraie table Supabase ni à ce pipeline
d'envoi. Aujourd'hui, seules les lignes réelles de `flash_offers` déclenchent une alerte. Relier les
campagnes partenaires validées à ce même pipeline est un prochain chantier, pas encore fait.
