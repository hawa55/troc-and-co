# Troc&Co — Marketplace entre particuliers (V1 / MVP)

Application web (mobile-friendly) où les particuliers publient une annonce avec **photo et/ou vidéo**, discutent par messagerie, et achètent via un **paiement en ligne Stripe**.

## Ce qui est inclus dans cette V1

- Inscription / connexion (sessions sécurisées)
- Dépôt d'annonce avec **upload photo ET vidéo**
- Recherche et filtre par catégorie
- Fiche annonce détaillée
- Messagerie acheteur ↔ vendeur (mise à jour automatique toutes les 4s)
- Paiement en ligne via Stripe Checkout (l'argent arrive directement sur ton compte Stripe, pas de séquestre pour l'instant)
- Tableau de bord "mes annonces"
- Design original (pas un template générique)

## Ce qui n'est PAS dans cette V1 (volontairement, pour tenir le délai d'une semaine)

- Live streaming (fonctionnalité lourde, à prévoir en V2)
- Application mobile native iOS/Android (cette version web fonctionne très bien sur mobile ; une vraie app native peut venir ensuite)
- Séquestre / protection acheteur avancée
- Vérification d'identité ou authentification des articles de luxe

---

## 1. Lancer le projet en local

Prérequis : Node.js **version 22 ou plus récente** (le projet utilise le module SQLite natif de Node, disponible à partir de Node 22).

```bash
npm install
npm run dev
```

Le site est accessible sur http://localhost:3000

Une base de données SQLite est créée automatiquement dans `data/app.db` au premier lancement — aucune installation de base de données à faire.

---

## 2. Configurer les variables d'environnement

Un fichier `.env` est déjà présent avec des valeurs de test. Avant de lancer en vrai, remplace :

```env
DATABASE_URL="file:./dev.db"          # ne pas toucher
JWT_SECRET="..."                       # remplace par une longue chaîne aléatoire secrète
STRIPE_SECRET_KEY="sk_test_..."        # ta clé secrète Stripe (test ou live)
STRIPE_PUBLISHABLE_KEY="pk_test_..."   # ta clé publique Stripe
NEXT_PUBLIC_BASE_URL="http://localhost:3000"   # à remplacer par ton domaine en prod
STRIPE_WEBHOOK_SECRET="whsec_..."      # généré par Stripe (voir étape 3)
```

Pour générer un `JWT_SECRET` solide :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Configurer Stripe (paiement)

1. Crée un compte sur https://dashboard.stripe.com si ce n'est pas déjà fait
2. Récupère tes clés de test dans **Développeurs > Clés API**
3. Colle-les dans `.env` (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)
4. Pour valider automatiquement les paiements, configure un webhook :
   - Dashboard Stripe > **Développeurs > Webhooks > Ajouter un endpoint**
   - URL : `https://ton-domaine.com/api/webhook`
   - Événement à écouter : `checkout.session.completed`
   - Copie le "Signing secret" dans `STRIPE_WEBHOOK_SECRET`
5. Teste avec une carte de test Stripe : `4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC

Quand tu es prêt à encaisser du vrai argent, remplace les clés `sk_test_...`/`pk_test_...` par tes clés `sk_live_...`/`pk_live_...`.

---

## 4. Déployer en ligne

### ⚠️ Important sur l'hébergement

Cette V1 utilise une base **SQLite en fichier local** et stocke les photos/vidéos **sur le disque du serveur**. Ça marche très bien, mais ça demande un serveur avec un **disque persistant** — pas un hébergement "serverless" comme Vercel où le disque est effacé à chaque requête.

**Recommandation pour lancer vite : Render.com**
1. Pousse ce projet sur un dépôt GitHub
2. Sur Render : "New Web Service" → connecte ton repo
3. Build command : `npm install && npm run build`
4. Start command : `npm run start`
5. Ajoute un **disque persistant** (Render > Disks) monté sur `/opt/render/project/src/data` et `/opt/render/project/src/public/uploads`
6. Renseigne les variables d'environnement du `.env` dans l'interface Render

Alternative : n'importe quel VPS (Hetzner, OVH, DigitalOcean...) avec Node 22+ installé, en lançant `npm run build && npm run start` derrière un reverse-proxy (nginx) + certificat SSL (Let's Encrypt).

### Pour grandir plus tard (pas urgent pour le lancement)

Quand le nombre d'utilisateurs augmente et que tu veux plusieurs serveurs, migre vers :
- **Base de données** : PostgreSQL managé (Neon, Supabase, Railway) — la couche d'accès aux données est isolée dans `src/lib/models.ts`, donc la migration ne touche que ce fichier
- **Stockage fichiers** : Cloudflare R2, AWS S3 ou Supabase Storage à la place du dossier `public/uploads` — seul `src/app/api/upload/route.ts` est à adapter

---

## 5. Structure du projet

```
src/
  app/
    page.tsx                 → page d'accueil (liste + recherche)
    login/, register/        → authentification
    listings/new/            → création d'annonce
    listings/[id]/           → fiche annonce
    dashboard/                → mes annonces
    messages/                 → messagerie
    api/                      → toutes les routes serveur (auth, annonces, upload, paiement...)
  components/                 → composants réutilisables (Navbar, ListingCard, etc.)
  lib/
    db.ts                     → connexion base de données
    models.ts                 → toutes les requêtes base de données (users, listings, messages, orders)
    auth.ts                   → hash mot de passe + sessions JWT
    stripe.ts                 → client Stripe
    constants.ts              → catégories et états des articles
```

---

## 6. Prochaines étapes suggérées (V2)

Dans l'ordre de priorité suggéré une fois la V1 en ligne et testée par de vrais utilisateurs :

1. **Notifications** — email ou push quand on reçoit un message ou une vente
2. **IA pour la mise en vente** — générer automatiquement titre/description à partir de la photo (API Claude ou GPT)
3. **Avis et notation** entre acheteurs et vendeurs
4. **Vérification d'identité** optionnelle (badge de confiance)
5. **Application mobile native** (React Native), une fois le concept validé sur le web
6. **Live shopping** — fonctionnalité la plus lourde techniquement, à faire en dernier

---

## Support

Ce projet a été construit comme une base de départ solide et fonctionnelle. Tu peux revenir avec Claude pour :
- ajouter une fonctionnalité (avis, notifications, favoris, etc.)
- corriger un bug
- préparer la migration vers Postgres/S3
- améliorer le design d'une page en particulier
