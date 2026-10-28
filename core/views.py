import json
import time
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST
from .subjects import SUBJECTS, SUBJECT_MAP

SYSTEM = """Tu es « Agent Gaandal », le tuteur IA de MATAM KAGGU LAADEE, conçu par et pour le Lycée Fadel Kane de Matam (Sénégal).
Tu donnes des explications et des cours clairs, progressifs et bienveillants à des lycéens et étudiants. Réponds en français (sauf pour les exemples de langues). Va droit au but pour les questions simples ; développe seulement quand le sujet le demande.
Format de réponse (Markdown) :
- Titres courts, paragraphes aérés, exemples concrets, résumé final « À retenir ».
- Formules en LaTeX : $...$ en ligne, $$...$$ en bloc.
- Tableaux Markdown quand une comparaison ou un récapitulatif aide.
- Courbes et graphes : un bloc de code ```chart contenant un JSON de configuration Chart.js valide
  (ex. {"type":"line","data":{"labels":[0,1,2],"datasets":[{"label":"f(x)","data":[0,1,4]}]},"options":{"plugins":{"title":{"display":true,"text":"Titre"}}}}).
  Calcule toi-même les points. Types : line, bar, scatter, pie, radar.
- Images illustratives, seulement si utiles : ![légende](wiki:Titre exact d'un article Wikipédia), ex. ![Nébuleuse](wiki:Nébuleuse d'Orion).
- Termine souvent par une courte question ou un exercice pour vérifier la compréhension.
Sois exact ; si tu n'es pas sûr, dis-le. Pour la cybersécurité, reste sur la défense et l'éducation."""

def index(request):
    return render(request, "index.html", {"subjects": [
        {"slug": s[0], "title": s[1], "desc": s[2], "icon": s[3], "color": s[4]} for s in SUBJECTS]})

def login_view(request):
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.get_user())
        return redirect("index")
    return render(request, "registration/login.html", {"form": form})

def signup_view(request):
    form = UserCreationForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            user = form.save()
            login(request, user, backend="django.contrib.auth.backends.ModelBackend")
            return redirect("index")
    return render(request, "registration/signup.html", {"form": form})

def logout_view(request):
    logout(request)
    return redirect("index")

@require_POST
def chat_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Connectez-vous pour discuter."}, status=401)
    if not settings.GEMINI_API_KEY:
        return JsonResponse({"error": "Clé GEMINI_API_KEY manquante côté serveur."}, status=500)
    import google.genai as genai

    try:
        data = json.loads(request.body)
        msgs = [{"role": m["role"], "content": str(m["content"])[:8000]}
                for m in data.get("messages", [])[-20:] if m.get("role") in ("user", "assistant")]
        subj = SUBJECT_MAP.get(data.get("subject"))
        if not msgs or msgs[-1]["role"] != "user":
            return JsonResponse({"error": "Message vide."}, status=400)
        system = SYSTEM + (f"\n\nMatière active : {subj[1]}. {subj[5]}" if subj else "")
        if msgs[0]["role"] == "assistant":
            msgs = msgs[1:]
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        contents = [
            {
                "role": "model" if message["role"] == "assistant" else "user",
                "parts": [{"text": message["content"]}],
            }
            for message in msgs
        ]
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=contents,
                    config=genai.types.GenerateContentConfig(
                        system_instruction=system,
                        max_output_tokens=2000,
                        thinking_config=genai.types.ThinkingConfig(thinking_level="low"),
                    ),
                )
                break
            except genai.errors.APIError as e:
                if e.code != 503 or attempt == 2:
                    raise
                time.sleep(2**attempt)
        return JsonResponse({"reply": response.text or ""})
    except genai.errors.APIError as e:
        if e.code == 503:
            return JsonResponse(
                {"error": "Gemini est temporairement surchargé. Réessayez dans quelques instants."},
                status=503,
            )
        return JsonResponse({"error": f"Erreur Gemini ({e.code}) : {e.message}"}, status=502)
    except Exception as e:  # noqa
        return JsonResponse({"error": f"Erreur du service IA : {e}"}, status=502)
