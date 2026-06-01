#!/usr/bin/env python3
# bot/bot.py — Bot Vinted fonctionnel
# Lance avec : python bot/bot.py

import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()

API_URL       = os.getenv("API_URL", "http://localhost:3000")
BOT_TOKEN     = os.getenv("BOT_TOKEN", "")
MIN_DISCOUNT  = int(os.getenv("MIN_DISCOUNT", "40"))
SCAN_INTERVAL = int(os.getenv("SCAN_INTERVAL", "5"))
KEYWORDS      = os.getenv("KEYWORDS", "jordan 1,north face,jacquemus,carhartt").split(",")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Accept-Language": "fr-FR,fr;q=0.9",
}

def search_vinted(keyword):
    """Cherche des annonces sur Vinted."""
    print(f"  🔍 {keyword.strip()}")
    try:
        r = requests.get(
            "https://www.vinted.fr/api/v2/catalog/items",
            params={"search_text": keyword.strip(), "per_page": 20, "order": "newest_first"},
            headers=HEADERS,
            timeout=10
        )
        if r.status_code == 200:
            return r.json().get("items", [])
        print(f"  ⚠️  Vinted {r.status_code}")
        return []
    except Exception as e:
        print(f"  ❌ {e}")
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

    # État
    cond = item.get("status", "")
    if cond == "new_with_tags":   score += 30
    elif cond == "very_good":     score += 20
    elif cond == "good":          score += 10

    # Photos
    n = len(item.get("photos", []))
    if n >= 3:   score += 20
    elif n >= 1: score += 10

    return min(score, 100)

def is_good_deal(item):
    """Vérifie si la réduction dépasse le seuil."""
    price    = get_price(item, "price")
    original = get_price(item, "original_item_price")
    if price <= 0 or original <= 0: return False
    return (original - price) / original * 100 >= MIN_DISCOUNT

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
            print(f"  ✅ {deal['name'][:50]} — {price}€ (−{discount}%) [score: {score}]")
            return True
        print(f"  ⚠️  API {r.status_code}: {r.text[:100]}")
        return False
    except Exception as e:
        print(f"  ❌ API error: {e}")
        return False

def scan():
    """Lance un scan complet."""
    print(f"\n🤖 Scan démarré ({len(KEYWORDS)} mots-clés)...")
    total = 0
    for keyword in KEYWORDS:
        items = search_vinted(keyword)
        for item in items:
            if is_good_deal(item):
                score = calculate_score(item)
                if send_to_api(item, score):
                    total += 1
        time.sleep(2)  # pause entre chaque mot-clé pour éviter le rate limiting
    print(f"✅ Scan terminé — {total} bon(s) plan(s) envoyé(s)")
    return total

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 VintedBot démarré")
    print(f"   API      : {API_URL}")
    print(f"   Intervalle : {SCAN_INTERVAL} min")
    print(f"   Réduction min : {MIN_DISCOUNT}%")
    print(f"   Mots-clés : {', '.join(KEYWORDS)}")
    print("=" * 50)

    if not BOT_TOKEN:
        print("⚠️  BOT_TOKEN manquant dans .env — les deals ne seront pas enregistrés")

    while True:
        try:
            scan()
        except KeyboardInterrupt:
            print("\n⛔ Bot arrêté.")
            break
        except Exception as e:
            print(f"❌ Erreur inattendue: {e}")

        print(f"\n⏳ Prochain scan dans {SCAN_INTERVAL} minutes...")
        time.sleep(SCAN_INTERVAL * 60)
