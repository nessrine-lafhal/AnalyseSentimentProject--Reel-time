import schedule
import time
from transformers import GPT2LMHeadModel, GPT2Tokenizer
from collections import defaultdict
import spacy
import rdflib
from rdflib.namespace import RDF, RDFS
from tabulate import tabulate
from datetime import datetime

# **Étape 1 : Intégration de GPT-2 pour Génération de Textes**
def generate_texts_gpt2(prompts, model, tokenizer, max_length=50, num_return_sequences=1):
    generated_texts = []
    for prompt in prompts:
        inputs = tokenizer.encode(prompt, return_tensors="pt")
        outputs = model.generate(
            inputs, max_length=max_length, num_return_sequences=num_return_sequences, pad_token_id=tokenizer.eos_token_id
        )
        generated_texts.extend([tokenizer.decode(output, skip_special_tokens=True) for output in outputs])
    return generated_texts

# **Étape 2 : Analyse et Extraction d'Entités et de Relations**
def extract_entities_and_relations(texts):
    nlp = spacy.load("en_core_web_sm")
    entities = defaultdict(list)
    relations = []

    for text in texts:
        doc = nlp(text)
        # Extraction des entités
        for ent in doc.ents:
            entities[ent.label_].append(ent.text)

        # Extraction des relations en utilisant les dépendances
        for token in doc:
            if token.ent_type_ and token.head.ent_type_:
                relation = {
                    "Source": token.head.text,
                    "Source_Type": token.head.ent_type_,
                    "Target": token.text,
                    "Target_Type": token.ent_type_,
                    "Relation": token.dep_
                }
                relations.append(relation)

    # Supprimer les doublons
    unique_entities = {key: list(set(value)) for key, value in entities.items()}
    return unique_entities, relations

# **Étape 3 : Mise à jour de l'Ontologie RDF avec Concepts et Relations (avec vérification des doublons)**
def update_rdf_ontology(graph, new_entities, new_relations, base_uri="http://www.example.org/ontologie#"):
    # Ajout des entités en tant que classes avec vérification des doublons
    for entity_type, entities in new_entities.items():
        for entity in entities:
            entity_uri = rdflib.URIRef(f"{base_uri}{entity.replace(' ', '_')}")
            
            # Vérification des doublons : Si l'entité est déjà présente
            if (entity_uri, RDF.type, RDFS.Class) not in graph:
                graph.add((entity_uri, RDF.type, RDFS.Class))
                graph.add((entity_uri, RDFS.label, rdflib.Literal(entity)))
                print(f"Entité ajoutée : {entity}")
            else:
                print(f"Entité déjà présente : {entity}")

    # Ajout des relations comme propriétés RDF avec vérification des doublons
    for relation in new_relations:
        source_uri = rdflib.URIRef(f"{base_uri}{relation['Source'].replace(' ', '_')}")
        target_uri = rdflib.URIRef(f"{base_uri}{relation['Target'].replace(' ', '_')}")
        relation_uri = rdflib.URIRef(f"{base_uri}{relation['Relation'].replace(' ', '_')}")
        
        # Vérification des doublons : Si la relation source-target existe déjà
        if (source_uri, relation_uri, target_uri) not in graph:
            graph.add((source_uri, relation_uri, target_uri))
            print(f"Relation ajoutée : {relation['Source']} -> {relation['Relation']} -> {relation['Target']}")
        else:
            print(f"Relation déjà présente : {relation['Source']} -> {relation['Relation']} -> {relation['Target']}")
    
    return graph

# **Étape 4 : Affichage et Sauvegarde de l'Ontologie RDF**
def afficher_triplets(graph):
    """
    Affiche les triplets RDF dans un format tabulaire structuré.
    """
    triplets = [{"Sujet": str(subj), "Prédicat": str(pred), "Objet": str(obj)} for subj, pred, obj in graph]

    if not triplets:
        print("\nAucun triplet à afficher dans l'ontologie.")
        return

    print("\nTriplets actuels dans l'ontologie :\n")
    print(tabulate(triplets, headers="keys", tablefmt="fancy_grid"))

def sauvegarder_ontologie(graph, file_name="ontologie_mise_a_jour.owl"):
    graph.serialize(destination=file_name, format="xml")
    print(f"\nOntologie sauvegardée dans le fichier : {file_name}")

# **Étape 5 : Fonction principale pour la mise à jour automatique**
def mise_a_jour_ontologie():
    try:
        print(f"\n[Mise à jour - {datetime.now()}] Début de la mise à jour de l'ontologie.")

        # Charger GPT-2
        tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
        model = GPT2LMHeadModel.from_pretrained("gpt2")
        tokenizer.pad_token = tokenizer.eos_token
        model.eval()

        # Générer des textes
        prompts = [
            "Breaking news in the elections today!",
            "The elections are heating up with new developments.",
            "Voters are showing strong emotions during this election period."
        ]
        generated_texts = generate_texts_gpt2(prompts, model, tokenizer)

        # Extraire les entités et relations
        extracted_entities, extracted_relations = extract_entities_and_relations(generated_texts)
        print("\n=== Entités extraites ===")
        print(extracted_entities)
        print("\n=== Relations extraites ===")
        for relation in extracted_relations:
            print(relation)

        # Charger et mettre à jour l'ontologie RDF
        ontologie_file = r"E:/IID3/Big project/ontologie.owl"
        graph = rdflib.Graph()
        if not graph.parse(ontologie_file, format="xml"):
            print(f"\nErreur : Impossible de charger le fichier d'ontologie {ontologie_file}")
        else:
            # Mettre à jour l'ontologie
            graph = update_rdf_ontology(graph, extracted_entities, extracted_relations)

            # Afficher les triplets
            afficher_triplets(graph)

            # Sauvegarder l'ontologie mise à jour
            sauvegarder_ontologie(graph)
        print(f"[Mise à jour - {datetime.now()}] Mise à jour terminée.")
    except Exception as e:
        print(f"Erreur lors de la mise à jour de l'ontologie : {e}")

# **Étape 6 : Planifier la tâche avec Schedule**
schedule.every(1).seconds.do(mise_a_jour_ontologie)

# **Étape 7 : Boucle pour exécuter la tâche**
print("\nDémarrage de la mise à jour automatique de l'ontologie...")
while True:
    schedule.run_pending()
    time.sleep(1)
