# Gestion des Échéances - Application Web

Application web simple et élégante pour la gestion des échéances dans les établissements médico-sociaux.

## Caractéristiques

- **Interface intuitive** : Design moderne et épuré pour une utilisation facile
- **Gestion des usagers** : Ajout, modification et suppression d'usagers
- **Gestion des échéances** : Suivi des démarches avec dates de renouvellement et de fin
- **Notifications intelligentes** : Alertes automatiques pour les échéances proches
- **Recherche et filtres** : Trouvez rapidement l'information dont vous avez besoin
- **Statistiques en temps réel** : Vue d'ensemble de votre portefeuille
- **Stockage local** : Toutes vos données sont conservées dans votre navigateur

## Installation

### Prérequis

- Un navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Aucune installation de logiciel supplémentaire nécessaire

### Démarrage

1. Téléchargez ou clonez ce dossier sur votre ordinateur
2. Ouvrez le fichier `index.html` avec votre navigateur web
3. L'application est prête à l'emploi !

**Important** : Pour conserver vos données, ne supprimez pas le dossier de l'application et utilisez toujours le même navigateur sur le même ordinateur.

## Utilisation

### Premier démarrage

1. **Autoriser les notifications** : Lors du premier lancement, le navigateur vous demandera l'autorisation d'afficher des notifications. Cliquez sur "Autoriser" pour recevoir des alertes pour les échéances proches.

### Ajouter un usager

1. Cliquez sur le bouton **"Nouvel Usager"** en haut à droite
2. Remplissez le nom de l'usager (obligatoire)
3. Ajoutez des notes si nécessaire (optionnel)
4. Cliquez sur **"Enregistrer"**

### Ajouter une échéance

1. Cliquez sur la carte d'un usager pour voir ses détails
2. Cliquez sur le bouton **"Nouvelle Échéance"**
3. Remplissez les informations :
   - **Titre de la démarche** : Ex: "Renouvellement AAH", "Dossier MDPH"
   - **Description** : Détails complémentaires (optionnel)
   - **Date de début renouvellement** : Quand commencer la démarche
   - **Date de fin** : Date d'expiration
   - **Notification avant échéance** : Choisissez quand recevoir l'alerte (7, 14, 30 ou 60 jours avant)
4. Cliquez sur **"Enregistrer"**

### Rechercher un usager

Utilisez la barre de recherche en haut de la page pour trouver rapidement un usager par son nom.

### Filtrer les usagers

Utilisez les boutons de filtre pour afficher :
- **Tous** : Tous les usagers
- **Échéances urgentes** : Usagers avec des échéances dans moins de 7 jours
- **À renouveler** : Usagers avec des renouvellements à prévoir dans moins de 30 jours

### Modifier ou supprimer

- **Modifier un usager** : Ouvrez les détails de l'usager et cliquez sur "Modifier"
- **Supprimer un usager** : Ouvrez les détails et cliquez sur "Supprimer" (attention, cela supprime aussi toutes ses échéances)
- **Modifier une échéance** : Dans les détails d'un usager, cliquez sur l'icône crayon à côté de l'échéance
- **Supprimer une échéance** : Cliquez sur l'icône poubelle

## Système de notifications

L'application vous alerte automatiquement dans deux cas :

1. **Échéance urgente** : Quand une date de fin est dans moins de 7 jours
2. **Renouvellement à prévoir** : Selon le nombre de jours configuré pour chaque échéance

Les notifications apparaissent :
- Dans le navigateur (si vous avez autorisé les notifications)
- Dans l'interface de l'application (coin supérieur droit)

Les notifications sont vérifiées automatiquement toutes les heures.

## Codes couleurs

L'application utilise des codes couleurs pour identifier rapidement l'urgence :

- **Rouge** : Échéances urgentes (moins de 7 jours)
- **Orange** : Renouvellements à prévoir (moins de 30 jours)
- **Vert** : Tout est à jour

## Statistiques

Le tableau de bord affiche en temps réel :
- Le nombre total d'usagers
- Le nombre d'échéances urgentes
- Le nombre de renouvellements à prévoir

## Sauvegarde des données

### Stockage automatique

Toutes vos données sont automatiquement sauvegardées dans le navigateur (localStorage). Vous n'avez rien à faire, l'enregistrement est instantané.

### Exporter vos données (RECOMMANDÉ)

**Il est fortement recommandé d'exporter régulièrement vos données pour éviter toute perte.**

1. Cliquez sur le bouton **"Exporter"** en haut de la page
2. Un fichier JSON sera téléchargé automatiquement avec un nom comme `echeances-sauvegarde-2025-01-15.json`
3. Conservez ce fichier dans un endroit sûr (dossier personnel, clé USB, cloud personnel, etc.)

**Conseils :**
- Exportez vos données au moins une fois par semaine
- Conservez plusieurs sauvegardes à différentes dates
- Nommez vos fichiers de manière claire si vous les renommez

### Importer vos données

Pour restaurer vos données depuis une sauvegarde :

1. Cliquez sur le bouton **"Importer"** en haut de la page
2. Sélectionnez le fichier JSON que vous avez précédemment exporté
3. Confirmez l'import (attention, cela remplacera vos données actuelles)
4. Vos données sont restaurées !

**Utilisation entre navigateurs :**
- Vous pouvez exporter vos données sur un navigateur (ex: Chrome) et les importer sur un autre (ex: Firefox)
- Vous pouvez transférer vos données d'un ordinateur à un autre en copiant simplement le fichier JSON

## Limitations

- Les données sont stockées uniquement dans votre navigateur sur cet ordinateur
- Si vous videz le cache du navigateur, les données seront perdues (sauf si vous avez exporté une sauvegarde)
- L'application fonctionne hors ligne une fois chargée
- Pas de synchronisation automatique entre plusieurs ordinateurs (utilisez l'export/import pour transférer vos données)

## Conseils d'utilisation

1. **Exportez vos données régulièrement** (au moins une fois par semaine) avec le bouton "Exporter"
2. **Conservez vos fichiers de sauvegarde** dans plusieurs endroits sûrs
3. **Utilisez l'export/import** pour transférer vos données entre différents navigateurs ou ordinateurs
4. **Configurez les notifications** pour ne jamais manquer une échéance
5. **Vérifiez régulièrement** le tableau de bord pour suivre vos statistiques
6. **Testez l'import** de temps en temps pour vous assurer que vos sauvegardes fonctionnent

## Support navigateurs

L'application fonctionne sur :
- Google Chrome (recommandé)
- Mozilla Firefox
- Microsoft Edge
- Safari
- Opera

**Version minimale recommandée** : Version actuelle -1 an

## Dépannage

### Les notifications ne s'affichent pas

1. Vérifiez que vous avez autorisé les notifications dans les paramètres du navigateur
2. Rechargez la page et autorisez les notifications quand le navigateur le demande

### Mes données ont disparu

1. Vérifiez que vous utilisez le même navigateur
2. Vérifiez que vous n'avez pas vidé le cache
3. Si vous avez exporté une sauvegarde, utilisez le bouton "Importer" pour restaurer vos données
4. Si vous n'avez pas de sauvegarde, les données sont malheureusement perdues (pensez à exporter régulièrement !)

### L'application ne s'affiche pas correctement

1. Vérifiez que vous utilisez un navigateur moderne et à jour
2. Essayez de vider le cache et recharger la page (Ctrl + F5)
3. Essayez avec un autre navigateur

## Confidentialité et sécurité

- **Toutes les données restent sur votre ordinateur**
- Aucune donnée n'est envoyée sur internet
- L'application ne nécessite pas de connexion internet une fois chargée
- Respecte le RGPD car aucune donnée personnelle n'est partagée

## Auteur

Application développée pour les établissements médico-sociaux.

## Licence

Usage libre pour les établissements médico-sociaux.
