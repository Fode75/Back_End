# bot/bot.py
# Bot Vinted — scrape les annonces et envoie les bons plans à l'API backend.
# Pour lancer : python bot/bot.py

import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()

# ── Configuration ────────────────────────────────────
API_URL       = os.getenv("API_URL", "http://localhost:3000")
BOT_TOKEN     = os.getenv("BOT_TOKEN")
MIN_DISCOUNT  = int(os.getenv("MIN_DISCOUNT", "40"))
SCAN_INTERVAL = int(os.getenv("SCAN_INTERVAL", "5"))

# Mots-clés à rechercher sur Vinted
KEYWORDS = ["jordan 1", "north face", "jacquemus", "carhartt"]

# ── Fonctions ─────────────────────────────────────────

def search_vinted(keyword):
    """Cherche des annonces sur Vinted pour un mot-clé."""
    print(f"  🔍 Recherche : {keyword}")
    try:
        url = "https://www.vinted.fr/api/v2/catalog/items"
        params = { "search_text": keyword, "per_page": 20, "order": "newest_first" }
        headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"  ⚠️  Vinted a répondu {response.status_code}")
            return []
        return response.json().get("items", [])
    except Exception as e:
        print(f"  ❌ Erreur scraping : {e}")
        return []


def calculate_score(item):
    """Calcule un score de 0 à 100 pour une annonce."""
    score = 0
    price    = float(item.get("price", {}).get("amount", 0))
    original = float(item.get("original_item_price", {}).get("amount", 0) or 0)

    if original > 0 and price > 0:
        discount = ((original - price) / original) * 100
        if discount >= 70:   score += 50
        elif discount >= 50: score += 35
        elif discount >= 30: score += 20

    condition = item.get("status", "")
    if condition == "new_with_tags": score += 30
    elif condition == "very_good":   score += 20
    elif condition == "good":        score += 10

    photos = len(item.get("photos", []))
    if photos >= 3:   score += 20
    elif photos >= 1: score += 10

    return min(score, 100)


def is_good_deal(item):
    """Vérifie si une annonce dépasse le seuil de réduction."""
    price    = float(item.get("price", {}).get("amount", 0))
    original = float(item.get("original_item_price", {}).get("amount", 0) or 0)
    if original == 0 or price == 0:
        return False
    discount = ((original - price) / original) * 100
    return discount >= MIN_DISCOUNT


def send_to_api(item, score):
    """Envoie le bon plan à l'API backend."""
    price    = float(item.get("price", {}).get("amount", 0))
    original = float(item.get("original_item_price", {}).get("amount", 0) or 0)

    deal = {
        "name":           item.get("title", ""),
        "brand":          item.get("brand_title", ""),
        "price":          price,
        "original_price": original,
        "score":          score,
        "condition":      item.get("status", ""),
        "city":           item.get("city", ""),
        "url":            f"https://www.vinted.fr/items/{item.get('id')}",
        "category":       item.get("catalog_branch_title", ""),
        "image":          item.get("photos", [{}])[0].get("url", "") if item.get("photos") else "",
    }

    try:
        response = requests.post(
            f"{API_URL}/api/deals",
            json=deal,
            headers={"Authorization": f"Bearer {BOT_TOKEN}"},
            timeout=10
        )
        if response.status_code == 201:
            print(f"  ✅ Deal envoyé : {deal['name']} — {price}€")
            return True
        else:
            print(f"  ⚠️  API a répondu {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Erreur envoi API : {e}")
        return False


def scan():
    """Lance un scan complet de tous les mots-clés."""
    print(f"\n🤖 Scan démarré...")
    total_found = 0

    for keyword in KEYWORDS:
        items = search_vinted(keyword)
        for item in items:
            if is_good_deal(item):
                score = calculate_score(item)
                if send_to_api(item, score):
                    total_found += 1
        time.sleep(1)  # pause entre chaque mot-clé

    print(f"✅ Scan terminé — {total_found} bon(s) plan(s) trouvé(s)")


# ── Point d'entrée ────────────────────────────────────
if __name__ == "__main__":
    print("🚀 VintedBot démarré !")
    print(f"   Intervalle : toutes les {SCAN_INTERVAL} minutes")
    print(f"   Réduction minimum : {MIN_DISCOUNT}%")
    print(f"   Mots-clés : {', '.join(KEYWORDS)}")

    while True:
        scan()
        print(f"\n⏳ Prochain scan dans {SCAN_INTERVAL} minutes...")
        time.sleep(SCAN_INTERVAL * 60)
