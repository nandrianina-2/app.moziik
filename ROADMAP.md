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

## Phase 5 — Musique & artistes
- Upload (Cloudinary), lecteur complet (mini + full player, EQ)
- Albums, playlists, planification des sorties
- Badges (membre / artiste vérifié)

## Phase 6 — Administration
- Gestion membres / artistes / autres admins
- Modération musiques et évènements
- Coûts d'abonnement modifiables

## Phase 7 — Monétisation
- Abonnements + Stripe (international)
- Paiement mobile (Mobile Money) selon la région
- Rémunération à l'écoute

## Phase 8 — Analytics & recommandations
- Traçage des écoutes (pays / lieu)
- Classements jour / semaine / mois / année
- Analyse de sentiment des commentaires
- Recommandations personnalisées

## Phase 9 — PWA & offline
- Manifest, service worker, téléchargement offline
- Pages contact / mentions légales / copyright
