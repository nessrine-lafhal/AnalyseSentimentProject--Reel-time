from flask import Flask, render_template, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS  
import json
import pickle
app = Flask(__name__)
CORS(app)  # Activer CORS pour toutes les routes

# Configurer l'URI de connexion MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/sentiment"

# Initialiser PyMongo
mongo = PyMongo(app)

@app.route('/')
def home():
    data = {"message": "Hello from Flask!"}
    return jsonify(data)

@app.route('/test_db')
def test_db():
    try:
        db = mongo.db
        collection = db.data
        data = collection.find_one()

        if data:
            return f"Connection successful! Sample data: {data}"
        else:
            return "Connection successful, but no data found in the test collection."
    except Exception as e:
        return f"Error connecting to database: {e}"

@app.route('/sentiments', methods=['GET'])
def get_sentiment_counts():
    db = mongo.db
    collection = db.data
    counts = {
        "neutre": collection.count_documents({"sentiment": 0}),
        "positif": collection.count_documents({"sentiment": 1}),
        "negatif": collection.count_documents({"sentiment": 2})
    }
    return jsonify(counts)




@app.route('/tweet_counts_by_country', methods=['GET'])
def tweet_counts_by_country():
    # Accéder à la collection des tweets
    db = mongo.db
    collection = db.data 

    # Agrégation pour compter le nombre de tweets par pays
    pipeline = [
        {"$group": {"_id": "$Country", "count": {"$sum": 1}}}
    ]
    result = list(collection.aggregate(pipeline))

    # Formatage des résultats pour le frontend
    tweet_counts = {item["_id"]: item["count"] for item in result}
    
    return jsonify(tweet_counts)


@app.route('/countries_geojson', methods=['GET'])
def countries_geojson():
    try:
        with open('C:/Users/hp/Desktop/IID3/S1/Projet pluridisciplinaire/AnalyseSentimentProject/AnalyseSentimentProject/countries.geo.json') as f:
            # Charger le fichier GeoJSON et le renvoyer sous forme de réponse JSON
            data = json.load(f)
            return jsonify(data)
    except Exception as e:
        # En cas d'erreur, renvoyer un message d'erreur
        return jsonify({"error": str(e)}), 500




#----------------------Get sentiment by time------------------
@app.route('/sentiments_by_time', methods=['GET'])
def sentiments_by_time():
    db = mongo.db
    collection = db.data

    # Agrégation pour obtenir les sentiments par heure (en utilisant 'Time of Tweet' comme champ de temps)
    pipeline = [
        {"$group": {
            "_id": "$Time of Tweet",  # Grouper par 'Time of Tweet'
            "total_sentiment": {"$sum": "$sentiment"}  # Calculer la somme des sentiments
        }},
        {"$sort": {"_id": 1}}  # Trier les résultats par période de la journée
    ]

    result = list(collection.aggregate(pipeline))

    # Formatage des résultats pour le frontend
    sentiment_by_time = {item["_id"]: item["total_sentiment"] for item in result}

    # Assurez-vous que toutes les périodes sont présentes dans les résultats, même si elles sont nulles
    periods = ["morning", "noon", "night"]
    for period in periods:
        # Si aucune donnée n'existe pour une période, initialisez à 0
        if period not in sentiment_by_time or sentiment_by_time[period] is None:
            sentiment_by_time[period] = 0  # Mettre à zéro si aucune donnée n'est présente pour une période

    return jsonify(sentiment_by_time)

#---------------------------Tweet by age-------------------------------------
@app.route('/tweets_by_age', methods=['GET'])
def tweets_by_age():
    db = mongo.db
    collection = db.data

    # Agrégation pour compter les tweets par groupe d'âge
    pipeline = [
        {"$group": {
            "_id": "$Age of User",  # Grouper par groupe d'âge
            "tweet_count": {"$sum": 1}  # Compter le nombre de tweets
        }},
        {"$sort": {"_id": 1}}  # Trier par groupe d'âge (ordre croissant)
    ]

    result = list(collection.aggregate(pipeline))

    # Formatage des résultats pour le frontend
    tweets_by_age = {item["_id"]: item["tweet_count"] for item in result}

    return jsonify(tweets_by_age)







#Gan + producer + consumer (traitement en temps réel)
import random
import pandas as pd
import warnings
from transformers import GPT2Tokenizer, GPT2LMHeadModel
from datetime import datetime
import threading
import queue
import time
import torch
import torch.nn as nn
from collections import defaultdict

# Ignorer les avertissements
warnings.filterwarnings("ignore")

# Charger le modèle et le tokenizer GPT-2
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")

# Définir le pad_token si nécessaire
tokenizer.pad_token = tokenizer.eos_token  # Définir eos_token comme pad_token

# Charger le fichier CSV avec pandas
df = pd.read_csv("Prenoms.csv", delimiter=";", encoding="ISO-8859-1")

# Extraire les colonnes des prénoms et genres
first_names = df["01_prenom"].dropna().tolist()  # Liste des prénoms
genders = df["02_genre"].dropna().tolist()  # Liste des genres

# Liste enrichie des types de tweets
tweet_prompts = {
    "positive": [
        "I really, really love this! Wow, just amazing.",
        "This is the best day of my life!",
        "Feeling so happy and blessed today!",
        "Wow, such an incredible moment! Can't stop smiling.",
        "I'm so proud of myself for achieving this!",
        "This song is amazing! On repeat all day.",
        "Life is beautiful, and today proved it again.",
    ],
    "negative": [
        "I hate this. Why does it always happen to me?",
        "Feeling so down today. Nothing is going right.",
        "What a terrible day. I just want it to end.",
        "Why does life have to be so unfair sometimes?",
        "Ugh, I can't stand this anymore. So frustrating.",
        "Everything feels hopeless right now.",
        "I feel like giving up. Nothing makes sense anymore.",
    ],
    "neutral": [
        "What a day. Nothing special, just the usual.",
        "Another day, another dollar. Same routine.",
        "Life goes on. Just living one day at a time.",
        "Hmm, not sure what to feel today. Neutral vibes.",
        "Nothing much to report. Just a regular day.",
        "The weather is fine. Nothing else to add.",
        "Quiet day at home. Just me and my thoughts.",
    ],
}
"""Génère des informations aléatoires, telles qu'un prénom, un âge
(entre 18 et 65 ans), et un genre (homme ou femme). Le résultat est 
accompagné d'un timestamp."""
# Fonction pour générer des informations aléatoires
# Liste pour stocker les données générées
generated_data = []

def generate_random_info():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Timestamp
    first_name = random.choice(first_names)  # Prénom aléatoire
    gender = random.choice(genders)  # Sexe aléatoire
    age = random.randint(18, 65)  # Âge aléatoire
    
    # Ajuster l'affichage du sexe
    gender_display = "Homme" if gender.lower() == "m" else "Femme"  # Assurer un affichage correct du sexe
    return timestamp, first_name, age, gender_display
gpt2_model = GPT2LMHeadModel.from_pretrained("gpt2")
gpt2_model.eval()  # Passer en mode évaluation pour GPT-2



"""Fonction producteur qui génère des tweets de manière aléatoire en 
choisissant une émotion (positive, négative, ou neutre) et en utilisant 
GPT-2 pour compléter un tweet basé sur un prompt.
Elle génère également des informations aléatoires et les ajoute à la
fin du tweet avant de les mettre dans une file d'attente (tweet_queue)."""
# Fonction Producteur
def producer(tweet_queue):
    for i in range(1000):
        # Choisir un type de tweet au hasard
        emotion = random.choice(list(tweet_prompts.keys()))
        prompt = random.choice(tweet_prompts[emotion])  # Sélectionner une phrase aléatoire dans la catégorie
        
        tweet = ""
        max_retries = 5  # Nombre maximal d'essais pour générer un tweet complet
        retries = 0
        while retries < max_retries:
            retries += 1
            # Convertir le texte de base en entrée pour le modèle GPT-2
            inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)
            
            # Ajouter le `attention_mask` et `pad_token_id` pour éviter les avertissements
            attention_mask = inputs["attention_mask"]
            pad_token_id = tokenizer.eos_token_id  # Définir le pad_token_id sur eos_token_id

            # Générer un tweet avec GPT-2
            outputs = gpt2_model.generate(
            inputs["input_ids"], 
            max_new_tokens=30,  # Nombre maximum de nouveaux tokens à générer
            num_return_sequences=1,
            temperature=0.7,
            top_k=50,
            top_p=0.9,
            do_sample=True,
            attention_mask=attention_mask,
            pad_token_id=pad_token_id,
            no_repeat_ngram_size=2
        )
            # Décoder le tweet généré
            tweet = tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Vérifier si le tweet semble coupé
            if not tweet.endswith((".", "!", "?")):
                # Si coupé, ajouter plus de contenu
                prompt = tweet.strip()
            else:
                break  # Tweet complet généré

        # Générer des informations aléatoires
        timestamp, first_name, age, gender = generate_random_info()
        
        # Ajouter ces informations à la fin du tweet
        tweet_with_info = f"{tweet.strip()} - Name: {first_name}, Age: {age}, Gender: {gender}, Time: {timestamp}"
        
        # Mettre le tweet dans la file d'attente
        tweet_queue.put(tweet_with_info)
         # Ajouter seulement le tweet sans les informations supplémentaires
        tweet_clean = tweet.strip()  # Suppression des informations supplémentaires
        emotion_prediction = test_model_with_sentence(model, tweet_clean, word_to_index, device)
        # Ajouter ces données dans la liste avec la prédiction
        generated_data.append({
            "name": first_name, 
            "age": age, 
            "tweet": tweet_clean,  # Utilisation du tweet propre
            "timestamp": timestamp, 
            "gender": gender,
            "prediction": emotion_prediction  # Ajout de la colonne de prédiction
        })
        time.sleep(random.uniform(0.5, 1.5))  # Ajouter un délai aléatoire entre la génération des tweets


# Fonction Consommateur
def consumer(tweet_queue, model, word_to_index, device):
    while True:
        # Attendre qu'un tweet soit disponible dans la file d'attente
        tweet = tweet_queue.get()
        # Extraire uniquement la phrase avant le délimiteur "- Name:"
        if " - Name:" in tweet:
            sentence = tweet.split(" - Name:")[0].strip()
        else:
            sentence = tweet  # Si le format attendu n'est pas trouvé, utiliser le tweet complet
        # Analyser la phrase avec le modèle BiLSTM
        print(f"Phrase reçue pour analyse : {sentence}")
        # Prédire l'émotion de la phrase
        test_model_with_sentence(model, sentence, word_to_index, device)
        # Indiquer que le tweet a été consommé
        tweet_queue.task_done()



"""rend une phrase, la découpe en tokens et les transforme en indices 
selon un dictionnaire word_to_index. Le résultat est un tensor prêt 
pour l'entrée dans un modèle."""
# Fonction de tokenisation et de prétraitement de la phrase
def process_text(sentence, word_to_index):
    tokens = sentence.split()
    indices = [word_to_index.get(token, 0) for token in tokens]  # 0 pour les mots inconnus
    input_tensor = torch.tensor([indices])
    return input_tensor



"""Parcourt une phrase et ajoute les nouveaux mots au dictionnaire 
word_to_index avec un nouvel index si le mot n'est pas déjà présent."""
def create_word_to_index(sentence, word_to_index):
    tokens = sentence.split()
    for token in tokens:
        if token not in word_to_index:
            word_to_index[token] = len(word_to_index) + 1  # Ajoute un nouvel index pour chaque mot non connu
    return word_to_index





"""Un modèle de réseau de neurones basé sur un BiLSTM (Long Short-Term 
Memory bidirectionnel) avec attention. Ce modèle est utilisé pour 
prédire des émotions dans des phrases.
Le modèle utilise une couche d'Embedding, une LSTM bidirectionnelle,
une attention multi-têtes, une couche de dropout, et une couche fully 
connected (dense)."""
# Définition du modèle BiLSTM avec attention
class sentimentBiLSTM(nn.Module):
    def __init__(self, embedding_matrix, hidden_dim, output_size, num_heads=8):
        super(sentimentBiLSTM, self).__init__()
        self.embedding_matrix = embedding_matrix
        num_words = self.embedding_matrix.shape[0]
        embed_dim = self.embedding_matrix.shape[1]

        self.embedding = nn.Embedding(num_embeddings=num_words, embedding_dim=embed_dim)
        self.embedding.weight = nn.Parameter(torch.tensor(embedding_matrix, dtype=torch.float32))
        self.embedding.weight.requires_grad = True  # Fine-tune embeddings
        
        self.lstm = nn.LSTM(embed_dim, hidden_dim, bidirectional=True, batch_first=True)
        self.multihead_attention = nn.MultiheadAttention(embed_dim=hidden_dim*2, num_heads=num_heads, batch_first=True)
        self.dropout = nn.Dropout(p=0.5)  # Dropout layer
        self.fc = nn.Linear(hidden_dim*2, output_size)

    def forward(self, x):
        embeds = self.embedding(x)
        lstm_out, _ = self.lstm(embeds)
        attn_output, _ = self.multihead_attention(lstm_out, lstm_out, lstm_out)
        attn_output = attn_output[:, -1]  # Sélectionner la dernière sortie
        out = self.dropout(attn_output)  # Appliquer dropout
        out = self.fc(out)
        return out



"""Cette fonction évalue une phrase en utilisant le modèle BiLSTM. 
Elle convertit la phrase en indices de mots, effectue une prédiction, 
et affiche la classe prédite (émotion) de la phrase"""
# Fonction pour prédire la classe d'une phrase
def test_model_with_sentence(model, sentence, word_to_index, device):
    model.eval()  # Passer le modèle en mode évaluation
    input_tensor = process_text(sentence, word_to_index)
    
    # Déplacer l'entrée et le modèle sur le même appareil (CPU ou GPU)
    input_tensor = input_tensor.to(device)
    model = model.to(device)
    
    with torch.no_grad():  # Désactiver le calcul des gradients pour la prédiction
        output = model(input_tensor)  # Effectuer la prédiction
    
    # Pour une tâche de classification, obtenir la classe prédite
    _, predicted_class = torch.max(output, dim=1)
    
    # Retourner la classe prédite sous forme d'un label ou d'un texte
    prediction = "Positive" if predicted_class.item() == 1 else ("Negative" if predicted_class.item() == 2 else "Neutral")
    
    return prediction 


# Exemple d'utilisation
if __name__ == "__main__":
    # Vérifiez si un GPU est disponible, sinon utilisez le CPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Charger le modèle préalablement enregistré
    model_path = "C:/Users/hp/Desktop/IID3/S1/Projet pluridisciplinaire/AnalyseSentimentProject/AnalyseSentimentProject/RealModel/sentiment_modelfinal.pth" 
    embedding_matrix = torch.load('C:/Users/hp/Desktop/IID3/S1/Projet pluridisciplinaire/AnalyseSentimentProject/AnalyseSentimentProject/RealModel/embedding(1).pt') 

    # Charger l'embedding matrix dans le consumer
    model = sentimentBiLSTM(embedding_matrix=embedding_matrix, hidden_dim=128, output_size=3)
    model.load_state_dict(torch.load(model_path, map_location=device), strict=False)  # Charger les poids

    # Mettre le modèle en mode évaluation

    with open('C:/Users/hp/Desktop/IID3/S1/Projet pluridisciplinaire/AnalyseSentimentProject/AnalyseSentimentProject/RealModel/word_index.pkl', 'rb') as file:
        word_to_index = pickle.load(file)
    

    # Créer une file d'attente
    tweet_queue = queue.Queue()

    threading.Thread(target=producer, args=(tweet_queue,)).start()
    threading.Thread(target=consumer, args=(tweet_queue,)).start()
    
    



# Route pour récupérer les données générées
@app.route("/get_data", methods=["GET"])
def get_data():
    print("Received request for /get_data")
    
    # Formater les données en renvoyant les informations souhaitées, incluant la prédiction
    formatted_data = [
        {"name": data["name"], "age": data["age"], "tweet": data["tweet"], "timestamp": data["timestamp"], "gender": data["gender"], "prediction": data["prediction"]}
        for data in generated_data
    ]
    
    return jsonify(formatted_data)



#---------------------Population and comments chart 


@app.route('/population_and_comments_by_country', methods=['GET'])
def dashboard_data():
    db = mongo.db
    collection = db.data

    # Pipeline d'agrégation pour calculer la somme des populations et des tweets par pays
    pipeline = [
    {
  "$project": {
    "Country": 1,
    "Population -2020": 1, 
  }
    },
    {
        "$group": {
            "_id": "$Country",
            "total_population": {"$sum": "$Population -2020"},


            "total_sentiments": {"$sum": 1}
        }
    },
    {
        "$sort": {"_id": 1}
    }
]


    # Exécuter l'agrégation
    result = list(collection.aggregate(pipeline))

    # Formatage des données pour le frontend
    formatted_data = [
        {
            "Country": item["_id"],
            "Population": item["total_population"],
            "Sentiments": item["total_sentiments"]
        }
        for item in result
    ]

    return jsonify(formatted_data)


#////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@app.route('/tweets_by_sentiment_and_time', methods=['GET'])
def tweets_by_sentiment_and_time():
    db = mongo.db
    collection = db.data
    
    
    time_mapping = {
        "morning": 6,
        "noon": 12,
        "night": 18
    }
    
    # Récupérer les données des tweets avec leur sentiment et leur heure
    pipeline = [
        {
            "$project": {
                "sentiment": 1,
                "time_of_tweet": {
                    "$cond": {
                        "if": {"$in": ["$Time of Tweet", ["morning", "noon", "night"]]},
                        "then": {
                            "$switch": {
                                "branches": [
                                    {"case": {"$eq": ["$Time of Tweet", "morning"]}, "then": 6},
                                    {"case": {"$eq": ["$Time of Tweet", "noon"]}, "then": 12},
                                    {"case": {"$eq": ["$Time of Tweet", "night"]}, "then": 18}
                                ],
                                "default": 0  
                            }
                        },
                        "else": 0  
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "sentiment": "$sentiment",
                    "hour": "$time_of_tweet"  # Regrouper par heure
                },
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"_id.hour": 1}  # Trier par heure
        }
    ]
    
    data = collection.aggregate(pipeline)
    
    # Organiser les résultats par sentiment et heure
    result2 = {}
    for item in data:
        sentiment = item["_id"]["sentiment"]
        hour = item["_id"]["hour"]
        if sentiment not in result2:
            result2[sentiment] = [0] * 24  # Initialiser un tableau de 24 heures
        result2[sentiment][hour] = item["count"]
    
    return jsonify(result2)

#////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@app.route('/hashtags_sentiment_network',  methods=['GET'])
def hashtags_sentiment_network():
    # Pipeline MongoDB pour agréger les hashtags et sentiments
    pipeline = [
        {
            "$project": {
                "hashtags": 1,  # Sélection des hashtags dans les tweets
                "sentiment": 1  # Sélection du sentiment des tweets
            }
        },
        {
            "$unwind": "$hashtags"  # Décompose les tableaux de hashtags pour chaque tweet
        },
        {
            "$group": {
                "_id": {
                    "hashtag": "$hashtags",
                    "sentiment": "$sentiment"
                },
                "count": {"$sum": 1}  # Compte le nombre d'occurrences pour chaque paire (hashtag, sentiment)
            }
        },
        {
            "$sort": {"count": -1}  # Trie par nombre d'occurrences
        }
    ]
    
    data = collection.aggregate(pipeline)
    
    nodes = []
    links = []
    sentiment_dict = {"positive": 1, "negative": 2, "neutral": 3}  # Lien entre sentiments et groupe

    # Transformation des résultats de MongoDB en données de graphe
    for item in data:
        hashtag = item["_id"]["hashtag"]
        sentiment = item["_id"]["sentiment"]
        count = item["count"]

        # Ajouter les nœuds
        if not any(node['id'] == hashtag for node in nodes):
            nodes.append({
                "id": hashtag,
                "group": 0  # Groupe des hashtags
            })
        if not any(node['id'] == sentiment for node in nodes):
            nodes.append({
                "id": sentiment,
                "group": sentiment_dict.get(sentiment, 3)  # Groupe des sentiments
            })
        
        # Ajouter les liens entre les hashtags et les sentiments
        links.append({
            "source": hashtag,
            "target": sentiment,
            "value": count  # Nombre de tweets pour chaque relation hashtag-sentiment
        })
    
    graph_data = {
        "nodes": nodes,
        "links": links
    }

    return jsonify(graph_data)





# =====================================================================
if __name__ == '__main__':
    app.run(debug=True)
