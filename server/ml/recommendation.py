import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Load datasets helper
def load_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venues_path = os.path.join(base_dir, 'venues.csv')
    vendors_path = os.path.join(base_dir, 'vendors.csv')
    products_path = os.path.join(base_dir, 'products.csv')
    
    venues = pd.read_csv(venues_path) if os.path.exists(venues_path) else pd.DataFrame()
    vendors = pd.read_csv(vendors_path) if os.path.exists(vendors_path) else pd.DataFrame()
    products = pd.read_csv(products_path) if os.path.exists(products_path) else pd.DataFrame()
    
    return venues, vendors, products

# Calculate cosine similarity using TfidfVectorizer
def calculate_text_similarity(query, items_text_list):
    if items_text_list is None or len(items_text_list) == 0:
        return np.zeros(0)
    
    # Prepend query to text list to vectorize together
    corpus = [query] + list(items_text_list)
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    # Calculate similarity between query (index 0) and all items (index 1 onwards)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
    return similarities[0]

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json() or {}
        
        # User Inputs
        budget = float(data.get('budget', 50000))
        event_type = str(data.get('event_type', 'Wedding')).strip()
        guest_count = int(data.get('guest_count', 100))
        city = str(data.get('location', 'Mumbai')).strip()
        
        venues, vendors, products = load_data()
        
        if venues.empty or vendors.empty or products.empty:
            return jsonify({
                "status": "error",
                "message": "One or more datasets (venues, vendors, products) are empty or missing."
            }), 400

        # Define sub-budget allocations (e.g. Venue 40%, Catering 30%, Decoration 20%, Products 10%)
        venue_budget = budget * 0.40
        catering_budget = budget * 0.30
        decoration_budget = budget * 0.20
        product_budget = budget * 0.10

        # -------------------------------------------------------------
        # STEP 1: VENUE RECOMMENDATION
        # -------------------------------------------------------------
        # Filter by city
        v_filtered = venues[venues['city'].str.lower() == city.lower()].copy()
        if v_filtered.empty:
            # Fallback to any venue if city not found
            v_filtered = venues.copy()
            
        # Capacity filtering: we want capacity >= guest_count
        v_capacity_filtered = v_filtered[v_filtered['capacity'] >= guest_count].copy()
        if not v_capacity_filtered.empty:
            v_filtered = v_capacity_filtered

        # Calculate cosine similarity based on venue name + city
        venue_texts = v_filtered['venue_name'] + " " + v_filtered['city']
        venue_sims = calculate_text_similarity(event_type, venue_texts)
        v_filtered['sim_score'] = venue_sims

        # Calculate scoring components
        # 1. Rating score (0 to 1)
        v_filtered['rating_score'] = v_filtered['rating'] / 5.0
        
        # 2. Budget score (1 if within budget, linear decay if exceeds budget)
        v_filtered['budget_score'] = v_filtered['price_per_day'].apply(
            lambda p: 1.0 if p <= venue_budget else max(0.0, 1.0 - (p - venue_budget) / venue_budget)
        )
        
        # 3. Capacity score (1 if perfectly sized, lower if oversized, 0 if undersized)
        v_filtered['capacity_score'] = v_filtered.apply(
            lambda r: 0.0 if r['capacity'] < guest_count else 1.0 - (r['capacity'] - guest_count) / r['capacity'],
            axis=1
        )

        # Final Venue Score: 30% rating, 30% budget match, 20% capacity fit, 20% semantic match
        v_filtered['final_score'] = (
            0.30 * v_filtered['rating_score'] + 
            0.30 * v_filtered['budget_score'] + 
            0.20 * v_filtered['capacity_score'] + 
            0.20 * v_filtered['sim_score']
        )
        
        # Select best venue
        best_venue = v_filtered.sort_values(by='final_score', ascending=False).iloc[0].to_dict()

        # -------------------------------------------------------------
        # STEP 2: VENDOR RECOMMENDATIONS (CATERING & DECORATION)
        # -------------------------------------------------------------
        # Filter vendors by city
        vend_filtered = vendors[vendors['city'].str.lower() == city.lower()].copy()
        if vend_filtered.empty:
            vend_filtered = vendors.copy()

        # 2A: Catering Services
        caterers = vend_filtered[vend_filtered['service_type'].str.lower() == 'catering'].copy()
        if caterers.empty:
            # Fallback to any caterer if city has none
            caterers = vendors[vendors['service_type'].str.lower() == 'catering'].copy()
            
        caterer_texts = caterers['service_name'] + " catering"
        caterer_sims = calculate_text_similarity(event_type, caterer_texts)
        caterers['sim_score'] = caterer_sims
        caterers['rating_score'] = caterers['rating'] / 5.0
        caterers['budget_score'] = caterers['package_price'].apply(
            lambda p: 1.0 if p <= catering_budget else max(0.0, 1.0 - (p - catering_budget) / catering_budget)
        )
        
        # Final Catering Score
        caterers['final_score'] = (
            0.40 * caterers['rating_score'] + 
            0.30 * caterers['budget_score'] + 
            0.30 * caterers['sim_score']
        )
        best_caterer = caterers.sort_values(by='final_score', ascending=False).iloc[0].to_dict()

        # 2B: Decoration Services
        decorators = vend_filtered[vend_filtered['service_type'].str.lower() == 'decoration'].copy()
        if decorators.empty:
            # Fallback to any decorator if city has none
            decorators = vendors[vendors['service_type'].str.lower() == 'decoration'].copy()
            
        decorator_texts = decorators['service_name'] + " decoration flowers lights"
        decorator_sims = calculate_text_similarity(event_type, decorator_texts)
        decorators['sim_score'] = decorator_sims
        decorators['rating_score'] = decorators['rating'] / 5.0
        decorators['budget_score'] = decorators['package_price'].apply(
            lambda p: 1.0 if p <= decoration_budget else max(0.0, 1.0 - (p - decoration_budget) / decoration_budget)
        )
        
        # Final Decoration Score
        decorators['final_score'] = (
            0.40 * decorators['rating_score'] + 
            0.30 * decorators['budget_score'] + 
            0.30 * decorators['sim_score']
        )
        best_decorator = decorators.sort_values(by='final_score', ascending=False).iloc[0].to_dict()

        # -------------------------------------------------------------
        # STEP 3: PRODUCT RECOMMENDATIONS
        # -------------------------------------------------------------
        p_filtered = products[products['city'].str.lower() == city.lower()].copy()
        if p_filtered.empty:
            p_filtered = products.copy()

        product_texts = p_filtered['product_name'] + " " + p_filtered['category']
        product_sims = calculate_text_similarity(event_type, product_texts)
        p_filtered['sim_score'] = product_sims
        p_filtered['rating_score'] = p_filtered['rating'] / 5.0
        p_filtered['budget_score'] = p_filtered['rental_price'].apply(
            lambda p: 1.0 if p <= product_budget else max(0.0, 1.0 - (p - product_budget) / product_budget)
        )
        
        # Final Product Score
        p_filtered['final_score'] = (
            0.40 * p_filtered['rating_score'] + 
            0.30 * p_filtered['budget_score'] + 
            0.30 * p_filtered['sim_score']
        )
        
        # Get top 3 product recommendations
        best_products = p_filtered.sort_values(by='final_score', ascending=False).head(3).to_dict(orient='records')

        # -------------------------------------------------------------
        # STEP 4: COST BREAKDOWN AND SUMMARY
        # -------------------------------------------------------------
        venue_cost = float(best_venue['price_per_day'])
        caterer_cost = float(best_caterer['package_price'])
        decorator_cost = float(best_decorator['package_price'])
        products_cost = float(sum(p['rental_price'] for p in best_products))
        
        total_estimated_cost = venue_cost + caterer_cost + decorator_cost + products_cost
        savings = max(0.0, budget - total_estimated_cost)

        response = {
            "status": "success",
            "inputs": {
                "budget": budget,
                "event_type": event_type,
                "guest_count": guest_count,
                "city": city
            },
            "recommendations": {
                "venue": best_venue,
                "caterer": best_caterer,
                "decorator": best_decorator,
                "products": best_products
            },
            "pricing": {
                "venue_cost": venue_cost,
                "caterer_cost": caterer_cost,
                "decorator_cost": decorator_cost,
                "products_cost": products_cost,
                "total_estimated_cost": total_estimated_cost,
                "user_budget": budget,
                "savings": savings,
                "percentage_spent": round((total_estimated_cost / budget) * 100, 1) if budget > 0 else 0
            }
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    # Start Flask recommendation engine
    app.run(host='127.0.0.1', port=5000, debug=True)
