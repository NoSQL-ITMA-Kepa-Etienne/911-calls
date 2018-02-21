# 911 Calls avec ElasticSearch

## Import du jeu de données

Pour importer le jeu de données, complétez le script `import.js` (ici aussi, cherchez le `TODO` dans le code :wink:).

Exécutez-le ensuite :

```bash
npm install
node import.js
```

Vérifiez que les données ont été importées correctement grâce au shell (le nombre total de documents doit être `153194`) :

```
GET <nom de votre index>/_count
```

## Requêtes

À vous de jouer ! Écrivez les requêtes ElasticSearch permettant de résoudre les problèmes posés.

### Question 1 : Compter le nombre d'appels autour de Lansdale dans un rayon de 500 mètres
```
GET call_index/call/_count
{
  "query": {
    "bool": {
      "must": {
        "match_all":{}
      },
      "filter": {
          "geo_distance": {
          "distance": "500m",
          "location": {
            "lat": 40.241493,
            "lon": -75.283783
          }
        }
      }
    }
  }
}
```

### Question 2 : Compter le nombre d'appels par catégorie
```
GET 911/appel/_search
{
  "size": 0, 
  "aggs": {
    "group_by_cat": {
      "terms": {
        "field": "cat.keyword"
      }
    }
  }
}
```

### Question 3 : Trouver les 3 mois ayant comptabilisés le plus d'appels
```
GET 911/appel/_search
{
  "size": 0, 
  "aggs": {
    "group_by_nbCalls": {
      "date_histogram": {
        "field": "timeStamp",
        "interval" : "month",
        "order": {
          "_count": "desc"
        }
      }
    }
  }
}
```

### Question 4 : Trouver le top 3 des villes avec le plus d'appels pour overdose
```
GET 911/appel/_search
{
  "size" : 0,
  "query" : {
    "match" : {
      "title" : "OVERDOSE"
    }
  },
  "aggs" : {
      "group_by_city": {
      "terms": {
        "field": "twp.keyword",
        "order": {
          "_count": "desc"
        }
      }
    }
  }
}
```
