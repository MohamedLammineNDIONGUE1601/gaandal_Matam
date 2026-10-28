# Agent Gaandal — MATAM KAGGU LAADEE (Django)
```
python -m venv .venv && source .venv/bin/activate   # Windows : .venv\Scripts\activate
python -m pip install -r requirements.txt
cp .env.example .env      # renseigner GEMINI_API_KEY (+ GOOGLE_CLIENT_ID/SECRET)
python manage.py migrate
python manage.py runserver
```
Google : console.cloud.google.com → Identifiants → ID client OAuth (Web), URI de redirection
`http://localhost:8000/accounts/google/login/callback/`.
Changer le son : remplacer `static/audio/wakanda.mp3`. Matières : `core/subjects.py`.
