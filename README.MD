# Epilogue

Plateforme de gestion de contenu avec génération IA, analyse SEO et synchronisation Notion.

---

## Stack

| Couche | Technologie |
|---|---|
| Backend | NestJS 11 · Fastify · TypeORM · MySQL |
| Frontend | Next.js 16 · React 19 · Tailwind CSS v4 · DaisyUI v5 |
| IA | Mistral API |
| Intégrations | Notion API · Google OAuth2 |

---

## Démarrage rapide

### Backend

```bash
cd backend
cp .env.example .env   # remplir les variables
npm install
npm run start:dev      # http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev            # http://localhost:3000
```

### Seeder (données de test)

```bash
cd backend
npm run seed
```

---

## Fonctionnalités

- **Posts** — création, édition rich-text, gestion du statut (brouillon / en attente / publié)
- **Génération IA** — génération de posts via Mistral selon la plateforme cible (Blog, LinkedIn, Twitter, Instagram)
- **Analyse SEO** — score, mots-clés, suggestions d'optimisation
- **Curation** — agrégation de sources RSS/URL, extraction de contenus
- **Synchronisation Notion** — envoi et mise à jour de posts vers une page Notion
- **Calendrier éditorial** — vue mensuelle des publications

---

## Synchronisation Notion

### 1. Créer une intégration Notion

1. Aller sur [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Cliquer **+ Nouvelle connexion**
3. Donner un nom (ex : `Epilogue`), choisir votre workspace
4. Dans **Accès au contenu**, activer :
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
5. Cliquer **Enregistrer** puis copier le **Jeton d’accès** (commence par `ntn_...`)

### 2. Configurer Epilogue

Dans **Paramètres → Notion** :

- **Clé API** : coller le secret copié à l'étape précédente
- **Page parente** : coller l'URL ou l'ID de la page Notion qui accueillera les posts

> L'ID se trouve dans l'URL de la page Notion :  
> `https://www.notion.so/Mon-espace-<ID_32_caractères>`  
> Epilogue accepte aussi l'URL complète, il extrait l'ID automatiquement.

### 3. Connecter l'intégration à la page Notion

1. Ouvrir la page parente dans Notion
2. Cliquer sur **···** (menu en haut à droite) → **Connections**
3. Chercher et sélectionner votre intégration (`Epilogue`)
4. Confirmer l'accès

### Statuts de synchronisation

| Statut | Signification |
|---|---|
| Non synchronisé | Le post n'a jamais été envoyé vers Notion |
| En cours… | Synchronisation en cours |
| Synchronisé | La page Notion est à jour |
| Erreur | Échec — vérifier la clé API et l'accès à la page |

---

## API

Swagger disponible en développement : [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

Toutes les routes sont préfixées `/api`. L'authentification utilise un cookie HTTP-only `access_token`.
