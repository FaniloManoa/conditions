# Guide de Configuration Rapide (Nouveau PC)

### 1. Préparation Backend (Python)
Dans le dossier du projet, installez l'environnement :
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Base de Données (PostgreSQL)
1.  Ouvrez **pgAdmin** ou **psql**.
2.  Exécutez la commande suivante pour créer la base :
    ```sql
    CREATE DATABASE conditions;
    ```
3.  Vérifiez que vos identifiants PostgreSQL (utilisateur/mot de passe) dans `backend/database.py` sont corrects (par défaut `postgresql://sa:sa@localhost/conditions`).

### 3. Initialisation et Migration
Exécutez cette commande pour créer les tables et charger les données initiales (Standards Banques, Clients démos) :
```bash
python seed_db.py
```
*Note : Si vous changez de PC, ce script créera automatiquement les nouveaux types (ENUM) et toutes les tables nécessaires.*

### 4. Lancement
**Backend :**
```bash
cd backend
uvicorn main:app --reload
```
**Frontend :**
```bash
cd conditions
npm install
npm run dev
```
