# Feuille de route — Moziik

Reconstruction complète, en 8 phases. Chaque phase est livrée séparément,
testable indépendamment, avant de passer à la suivante.

## Phase 1 — Fondations (TERMINÉ)
- Scaffold Next.js 14 (App Router) + TypeScript + Tailwind
- Connexion MongoDB (Mongoose)
- Config Cloudinary
- Système de thème clair / sombre
- Config du site (nom, logo) centralisée et modifiable
- Design system : palette, typographie, composants de base
- Layout principal (sidebar desktop / nav mobile + mini-player)

## Phase 2 — Authentification (TERMINÉ)
- Email + mot de passe (hash bcrypt, sessions)
- OAuth Google (NextAuth)
- Récupération de mot de passe par email
- Rôles : membre / artiste / admin
- Middleware de protection des routes /admin, /artiste, /compte

## Phase 3 — Gestion des erreurs & notifications (TERMINÉ)
- Error boundaries Next.js (page, layout, 404)
- Système de toasts (succès / erreur / info)
- Helper d'erreurs API uniforme
- Notifications in-app avec pages dédiées (nouveau son, nouvel abonné,
  commentaire, évènement, paiement, système) + cloche de notifications

## Phase 4 — Modèles de données complets (TERMINÉ)
- User (fait en Phase 2), Notification (fait en Phase 3)
- Artist : profil étendu, vérification, followers, monétisation
- Song : statut (brouillon/planifié/publié/rejeté), date de sortie planifiable
- Album : album / EP / single
- Playlist : privée ou publique, suiveurs
- Event : créé par admin ou artiste autorisé, statut de validation
- Badge : catalogue de badges (membre, artiste, succès)
- Comment : ancré à un timestamp du son, champ sentiment (analyse à venir en Phase 8)
- Play : traçage écoute (pays/ville/appareil), base des classements et de la monétisation
- Subscription : plan, méthode de paiement (Stripe / Mobile Money), région
- SiteConfig : document unique piloté par l'admin (nom, logo, coûts, taux de rémunération)

## Phase 5 — Musique & artistes (TERMINÉ)
- Upload : audio + pochette envoyés directement navigateur → Cloudinary
  (upload preset non-signé), pour ne pas passer par le serveur Next.js
- Routes API : `/api/songs`, `/api/albums`, `/api/playlists` (CRUD +
  ajout/retrait de sons), `/api/badges`
- Planification des sorties : `releaseDate` future → statut `scheduled`,
  publication automatique via `/api/cron/publish-songs` (à brancher sur
  un cron externe, ex. Vercel Cron) qui notifie les abonnés
- Traçage des écoutes dès Phase 5 : `/api/songs/[id]/play` enregistre
  pays/ville (en-têtes Vercel) et alimente `Play`
- Lecteur complet : `PlayerProvider` (file d'attente, lecture/pause,
  progression), mini-lecteur persistant, lecteur plein écran avec vrai
  égaliseur **10 bandes** (Web Audio API, `BiquadFilterNode`) + **Bass
  Boost** dédié façon Poweramp (low-shelf + compensation de volume),
  presets, et panneau file d'attente
- `SongRow`, `BadgeChip`, `UploadModal` (réservée aux artistes)
- **Menu contextuel par son** (`SongContextMenu`) : déclenché par le
  bouton `...`, le clic droit (desktop) ou l'appui long (mobile, via
  `useLongPress`) — file d'attente, ajout à une playlist (avec
  création à la volée), j'aime, téléchargement, partage, crédits,
  navigation vers l'artiste/l'album, suppression pour le propriétaire/admin
- **Featurings** : un son peut être publié avec des artistes en
  featuring (`FeaturingPicker`, recherche live via `/api/artists`) ;
  l'artiste crédité reçoit une notification et peut confirmer ou
  retirer le crédit (`/api/songs/[id]/featuring`)
- Nouvelles pages `/artiste/[id]` (profil, sons, albums, suivi) et
  `/album/[id]` (lecture de l'album), destinations du menu contextuel
  et des notifications

## Phase 6 — Administration (TERMINÉ)
- Dashboard `/admin` : statistiques (membres, artistes, sons, évènements en attente, abonnements)
- `/admin/membres` : recherche, changement de rôle (membre/artiste/admin),
  vérification artiste (badge), suspension de compte
- `/admin/musiques` : modération des sons soumis par les artistes
  (approbation → publié ou planifié selon la date de sortie ; rejet)
- `/admin/evenements` : modération des évènements soumis par des
  artistes autorisés
- `/admin/parametres` : nom du site, logo (upload Cloudinary), slogan,
  email de support, copyright, **coûts d'abonnement modifiables**
  (USD + MGA), taux de rémunération par écoute
- Les sons créés par un artiste passent désormais par la modération
  (`draft` → `published`/`scheduled` après validation) ; ceux créés
  par un admin sont publiés directement
- Un artiste ne peut publier un évènement que si un admin lui a
  accordé `eventPublishingAuthorized`
- `/api/site-config` (public) + `SiteConfigProvider` : la sidebar,
  l'accueil et les pages d'auth affichent le nom/logo/slogan configurés
  par l'admin, pas des valeurs figées

## Phase 7 — Monétisation (TERMINÉ)
- **Stripe** : `/api/subscriptions/checkout` crée une session Checkout
  avec un prix généré à la volée depuis `SiteConfig` (pas de Price ID
  figé — reste synchronisé avec `/admin/parametres`) ; webhook
  `/api/webhooks/stripe` synchronise `Subscription` (activation,
  renouvellement, annulation)
- **Mobile Money (MVola)** : `lib/mvola.ts` (auth OAuth + initiation
  merchantpay), `/api/subscriptions/mobile-money` initie le paiement,
  `/api/webhooks/mvola` confirme via callback
- **Détection de région** : `/api/region` (en-têtes Vercel) propose le
  mode de paiement adapté ; `/abonnement` affiche les deux avec les
  prix USD *et* MGA configurés par l'admin
- **Rémunération à l'écoute** : modèle `Royalty`, cron
  `/api/cron/compute-royalties` (à planifier quotidiennement) agrège
  les écoutes complètes non monétisées au tarif `payPerListenRateUSD`
  et notifie l'artiste ; page `/artiste/revenus` pour consulter
  l'historique

## Phase 8 — Analytics & recommandations (TERMINÉ)
- Traçage pays/ville déjà en place depuis la Phase 5 (`Play`)
- `/api/charts` : classements jour/semaine/mois/année, par sons,
  artistes ou auditeurs (agrégation MongoDB sur `Play`), page `/classements`
- `/api/songs/[id]/comments` : commentaires avec analyse de sentiment
  automatique (`lib/sentiment.ts`, lexique FR autonome, positif/neutre/
  négatif), affichée avec une icône sur chaque commentaire
- `/api/recommendations` : recommandations par genres écoutés ces 30
  derniers jours (repli sur les sons populaires si pas d'historique ou
  utilisateur anonyme), section "Recommandé pour toi" sur l'accueil
- Nouvelle page `/son/[id]` : détail d'un son, lecture, commentaires —
  c'est la page vers laquelle pointent les notifications "nouveau son"

## Ajustements post-Phase 8 (TERMINÉ)
- **Bug corrigé** : un admin sans profil `Artist` peut désormais publier
  un son en précisant `artistId` (au lieu d'échouer avec 404)
- **Pages manquantes construites** (liens de la nav qui menaient à des
  404) : `/compte`, `/bibliotheque`, `/recherche`, `/evenements`,
  `/radio`, `/playlist/[id]`, `/son/[id]/modifier`
- `/admin/badges` : création de badges + attribution à un membre
- `/admin/membres` : bouton pour autoriser un artiste à publier des
  évènements (`eventPublishingAuthorized`)
- Le titre du site (`<title>`) est maintenant dynamique
  (`generateMetadata` + `getSiteConfig()`), cohérent avec le reste de
  l'app

## Phase 9 — PWA & offline (TERMINÉ)
- `app/manifest.ts` : manifest PWA généré dynamiquement (nom, logo,
  couleurs) depuis `SiteConfig` — pas de fichier statique à resynchroniser
- `public/sw.js` : service worker, network-first pour l'app (repli
  cache si hors-ligne), cache-first pour les médias Cloudinary déjà
  téléchargés explicitement
- `lib/offlineCache.ts` + option **"Écouter hors-ligne"** dans le menu
  contextuel de chaque son : télécharge audio + pochette dans le Cache
  Storage du navigateur, indexés en local pour l'onglet **Hors-ligne**
  de `/bibliotheque` (lecture et suppression, sans connexion)
- `FloatingInstallButton` + `usePWA()` : bouton d'installation natif
  (`beforeinstallprompt`), s'enregistre le service worker au chargement
- Pages **`/contact`** (formulaire → email de support via nodemailer)
  et **`/mentions-legales`** (propriété intellectuelle, contenu
  utilisateurs, données personnelles, copyright — texte dynamique
  depuis `SiteConfig`), liées depuis le pied de la sidebar et `/compte`
