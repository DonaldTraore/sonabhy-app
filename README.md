# Sonabhy - Système de Gestion d'Entreprise

Application web de gestion d'entreprise avec architecture Angular + FastAPI permettant de gérer les directions, services et employés.

## 🏗️ Architecture

- **Backend** : FastAPI (Python) avec SQLAlchemy et SQLite
- **Frontend** : Angular 20 avec TypeScript
- **Base de données** : SQLite avec données de test automatiques
- **API** : RESTful avec documentation Swagger/OpenAPI

## 📋 Fonctionnalités

- ✅ **Gestion des Directions** : Créer, modifier, supprimer des directions
- ✅ **Gestion des Services** : Créer, modifier, supprimer des services liés aux directions
- ✅ **Gestion des Employés** : Créer, modifier, supprimer des employés avec recherche avancée
- ✅ **Recherche d'employés** : Recherche par nom, prénom, fonction, email, téléphone
- ✅ **Interface d'administration** : Tableau de bord pour gérer toutes les entités
- ✅ **Base de données** : SQLite avec seeding automatique des données de test

## 🚀 Prérequis

- Python 3.8+
- Node.js 16+
- npm ou yarn

## 📦 Installation

### 1. Cloner le projet

```bash
git clone <votre-repository-url>
cd sonabhy
```

### 2. Installer les dépendances Python

```bash
# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel (Windows)
venv\Scripts\activate.bat

# Activer l'environnement virtuel (Linux/Mac)
source venv/bin/activate

# Installer les dépendances
pip install -r backend/requirements.txt
```

### 3. Installer les dépendances Angular

```bash
npm install
```

## 🏃‍♂️ Lancement de l'application

### 1. Démarrer le backend API

Ouvrir un terminal et activer l'environnement virtuel :

```bash
# Windows
venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

Puis démarrer l'API FastAPI :

```bash
uvicorn app.main:app --reload --app-dir backend
```

L'API sera disponible sur : **http://127.0.0.1:8000**

### 2. Vérifier l'API

Ouvrir votre navigateur et accéder à :
- **Documentation API** : http://127.0.0.1:8000/docs
- **Schéma OpenAPI** : http://127.0.0.1:8000/openapi.json

### 3. Démarrer le frontend Angular

Dans un autre terminal :

```bash
ng serve
```

L'application Angular sera disponible sur : **http://localhost:4200**

## 📚 Documentation API

Une fois le backend démarré, vous pouvez accéder à la documentation interactive Swagger :

- **URL** : http://127.0.0.1:8000/docs
- **Endpoints disponibles** :
  - `GET /api/directions` : Lister toutes les directions
  - `POST /api/directions` : Créer une direction
  - `PATCH /api/directions/{id}` : Modifier une direction
  - `DELETE /api/directions/{id}` : Supprimer une direction
  - `GET /api/services` : Lister tous les services (avec filtre par direction)
  - `POST /api/services` : Créer un service
  - `PATCH /api/services/{id}` : Modifier un service
  - `DELETE /api/services/{id}` : Supprimer un service
  - `GET /api/employees` : Lister tous les employés (avec recherche et filtres)
  - `POST /api/employees` : Créer un employé
  - `PATCH /api/employees/{id}` : Modifier un employé
  - `DELETE /api/employees/{id}` : Supprimer un employé

## 🗄️ Base de données

- **Type** : SQLite
- **Fichier** : `sonabhy.db` (créé automatiquement)
- **Seeding** : Données de test insérées automatiquement au premier démarrage
- **Structure** : Directions → Services → Employés (hiérarchique)

## 🌐 Navigation dans l'application

1. **Page d'accueil** : Redirection vers la connexion
2. **Connexion** : Accès à l'application
3. **Recherche** : Rechercher des employés
4. **Historique** : Historique des recherches
5. **Administration** :
   - Tableau de bord général
   - Gestion des directions (`/admin/directions`)
   - Gestion des services (`/admin/services`)
   - Gestion des employés (`/admin/employees`)
   - Liste globale (`/admin/list`)

## 🔧 Configuration

### Variables d'environnement (optionnel)

```bash
# URL de la base de données (par défaut : sqlite:///./sonabhy.db)
SONABHY_DB_URL=sqlite:///./sonabhy.db
```

### Ports par défaut

- **Backend API** : 8000
- **Frontend Angular** : 4200
- **Documentation Swagger** : 8000/docs

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Changer le port Angular
   ng serve --port 4201
   
   # Changer le port API
   uvicorn app.main:app --reload --app-dir backend --port 8001
   ```

2. **Erreur de dépendances Python**
   ```bash
   # Réinstaller les dépendances
   pip uninstall -r backend/requirements.txt -y
   pip install -r backend/requirements.txt
   ```

3. **Erreur de dépendances Angular**
   ```bash
   # Nettoyer et réinstaller
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Problèmes de CORS**
   - Les ports 4200 et 4201 sont déjà configurés dans le backend
   - Pour ajouter d'autres ports, modifier `backend/app/main.py`

## 📝 Développement

### Structure du projet

```
sonabhy/
├── backend/                 # API FastAPI
│   └── app/
│       ├── main.py         # Point d'entrée FastAPI
│       ├── models.py       # Modèles de données
│       └── db.py          # Configuration base de données
├── src/                   # Application Angular
│   └── app/
│       ├── pages/          # Composants de page
│       ├── services/       # Services Angular
│       └── guards/        # Guards de routage
├── package.json           # Dépendances Angular
├── requirements.txt       # Dépendances Python
└── README.md            # Ce fichier
```

### Scripts utiles

```bash
# Backend - tests et linting
pytest backend/
mypy backend/app/

# Frontend - tests et build
npm test
npm run build
npm run lint
```

## 📄 Licence

[À compléter selon vos besoins]

## 👤 Auteur

[Votre nom/organisation]

---

**Note** : Ce projet utilise une architecture moderne avec séparation claire entre frontend et backend, facilitant ainsi la maintenance et l'évolution de l'application.
