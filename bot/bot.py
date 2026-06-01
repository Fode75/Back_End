#!/usr/bin/env python3
# bot/bot.py — Bot Vinted fonctionnel
# Lance avec : python bot/bot.py

import requests
import time
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Windows : évite UnicodeEncodeError sur les emojis dans la console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BOT_DIR = Path(__file__).resolve().parent
load_dotenv(BOT_DIR / ".env")

API_URL       = os.getenv("API_URL", "http://localhost:3000")
BOT_TOKEN     = os.getenv("BOT_TOKEN", "")
MIN_DISCOUNT  = int(os.getenv("MIN_DISCOUNT", "40"))
MIN_SCORE     = int(os.getenv("MIN_SCORE", "50"))
MAX_PRICE     = float(os.getenv("MAX_PRICE", "0") or 0)  # 0 = pas de plafond
SCAN_INTERVAL = int(os.getenv("SCAN_INTERVAL", "5"))
KEYWORDS      = os.getenv("KEYWORDS", "jordan 1,north face,jacquemus,carhartt").split(",")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "fr-FR,fr;q=0.9",
}

_vinted_session = None

def get_vinted_session():
    """Session Vinted avec cookies anonymes (requis depuis 2024+)."""
    global _vinted_session
    if _vinted_session is None:
        _vinted_session = requests.Session()
        _vinted_session.headers.update(HEADERS)
        r = _vinted_session.get("https://www.vinted.fr/", timeout=15)
        if r.status_code != 200:
            print(f"  [!] Session Vinted: HTTP {r.status_code}")
    return _vinted_session

def search_vinted(keyword):
    """Cherche des annonces sur Vinted."""
    print(f"  [>] {keyword.strip()}")
    try:
        session = get_vinted_session()
        r = session.get(
            "https://www.vinted.fr/api/v2/catalog/items",
            params={"search_text": keyword.strip(), "per_page": 20, "order": "newest_first"},
            timeout=15
        )
        if r.status_code == 200:
            return r.json().get("items", [])
        if r.status_code == 401:
            global _vinted_session
            _vinted_session = None
            print("  [!] Vinted 401 — nouvelle session...")
            session = get_vinted_session()
            r = session.get(
                "https://www.vinted.fr/api/v2/catalog/items",
                params={"search_text": keyword.strip(), "per_page": 20, "order": "newest_first"},
                timeout=15
            )
            if r.status_code == 200:
                return r.json().get("items", [])
        print(f"  [!] Vinted HTTP {r.status_code}")
        return []
    except Exception as e:
        print(f"  [X] {e}")
        return []

def get_price(item, key):
    """Récupère un prix depuis l'objet Vinted."""
    try:
        return float(item.get(key, {}).get("amount", 0) or 0)
    except:
        return 0.0

def calculate_score(item):
    """Score de 0 à 100 basé sur la réduction, l'état et les photos."""
    score = 0
    price    = get_price(item, "price")
    original = get_price(item, "original_item_price")

    # Réduction
    if original > 0 and price > 0:
        d = (original - price) / original * 100
        if d >= 70:   score += 50
        elif d >= 50: score += 35
        elif d >= 30: score += 20

    # État (codes API anglais ou libellés français du catalogue)
    cond = (item.get("status") or "").lower()
    if cond in ("new_with_tags",) or "neuf avec" in cond:
        score += 30
    elif cond in ("new_without_tags",) or "neuf sans" in cond:
        score += 25
    elif cond in ("very_good",) or "très bon" in cond:
        score += 20
    elif cond in ("good",) or cond == "bon état" or cond.startswith("bon "):
        score += 10

    # Photos
    n = len(item.get("photos", []))
    if n >= 3:   score += 20
    elif n >= 1: score += 10

    return min(score, 100)

def is_good_deal(item):
    """Filtre les annonces intéressantes (réduction Vinted ou score qualité)."""
    price    = get_price(item, "price")
    original = get_price(item, "original_item_price")
    if price <= 0:
        return False
    if MAX_PRICE > 0 and price > MAX_PRICE:
        return False
    if original > 0:
        return (original - price) / original * 100 >= MIN_DISCOUNT
    # L'API catalogue ne renvoie plus original_item_price : on filtre par score
    return calculate_score(item) >= MIN_SCORE

def send_to_api(item, score):
    """Envoie le deal à l'API backend."""
    price    = get_price(item, "price")
    original = get_price(item, "original_item_price")
    photos   = item.get("photos", [])

    deal = {
        "name":          item.get("title", ""),
        "brand":         item.get("brand_title", ""),
        "price":         price,
        "originalPrice": original,
        "score":         score,
        "condition":     item.get("status", ""),
        "city":          item.get("city", ""),
        "url":           f"https://www.vinted.fr/items/{item.get('id', '')}",
        "category":      item.get("catalog_branch_title", ""),
        "image":         photos[0].get("url", "") if photos else "",
    }

    try:
        r = requests.post(
            f"{API_URL}/api/deals",
            json=deal,
            headers={"Authorization": f"Bearer {BOT_TOKEN}", "Content-Type": "application/json"},
            timeout=10
        )
        if r.status_code == 201:
            discount = round((original - price) / original * 100) if original > 0 else 0
            print(f"  [OK] {deal['name'][:50]} — {price}EUR (-{discount}%) [score: {score}]")
            return True
        print(f"  [!] API {r.status_code}: {r.text[:100]}")
        return False
    except Exception as e:
        print(f"  [X] API: {e} — le backend tourne-t-il sur {API_URL} ?")
        return False

def scan():
    """Lance un scan complet."""
    print(f"\n[*] Scan demarre ({len(KEYWORDS)} mots-cles)...")
    total = 0
    for keyword in KEYWORDS:
        items = search_vinted(keyword)
        for item in items:
            if is_good_deal(item):
                score = calculate_score(item)
                if send_to_api(item, score):
                    total += 1
        time.sleep(2)  # pause entre chaque mot-clé pour éviter le rate limiting
    print(f"[OK] Scan termine — {total} bon(s) plan(s) envoye(s)")
    return total

if __name__ == "__main__":
    print("=" * 50)
    print("VintedBot demarre")
    print(f"   API           : {API_URL}")
    print(f"   Intervalle    : {SCAN_INTERVAL} min")
    print(f"   Reduction min : {MIN_DISCOUNT}%")
    print(f"   Score min     : {MIN_SCORE} (si pas de prix barre)")
    if MAX_PRICE > 0:
        print(f"   Prix max      : {MAX_PRICE} EUR")
    print(f"   Mots-cles     : {', '.join(KEYWORDS)}")
    print("=" * 50)

    env_file = BOT_DIR / ".env"
    if not env_file.exists():
        print(f"[!] Creez {env_file} (copiez bot/.env.example)")

    while True:
        try:
            scan()
        except KeyboardInterrupt:
            print("\n[!] Bot arrete.")
            break
        except Exception as e:
            print(f"[X] Erreur inattendue: {e}")

        print(f"\n[...] Prochain scan dans {SCAN_INTERVAL} minutes...")
        time.sleep(SCAN_INTERVAL * 60)
