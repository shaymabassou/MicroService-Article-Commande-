const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendArticleMessage } = require('./ArticleProducer'); // Importer la fonction d'envoi de message Kafka pour les articles
const { sendCommandeMessage } = require('./CommandeProducer'); // Importer la fonction d'envoi de message Kafka pour les commandes
const connectDB = require('./db');
const Article = require('./models/Article');
const Commande = require('./models/Commande');

const app = express();

connectDB();

app.use(cors());
app.use(bodyParser.json());

// Endpoints pour les articles
app.get('/article', async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    res.status(500).send("Erreur lors de la recherche des articles: " + err.message);
  }
});

app.get('/article/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).send("Article non trouvé");
    }
    res.json(article);
  } catch (err) {
    res.status(500).send("Erreur lors de la recherche de l'article: " + err.message);
  }
});

app.post('/article', async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const nouvelArticle = new Article({ title, description, price });
    const article = await nouvelArticle.save();
    
    // Envoyer un message Kafka pour l'événement de création d'article
    await sendArticleMessage('creation', article);

    res.json(article);
  } catch (err) {
    res.status(500).send("Erreur lors de la création de l'article: " + err.message);
  }
});

app.delete('/article/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).send("Article non trouvé");
    }

    // Envoyer un message Kafka pour l'événement de suppression d'article
    await sendArticleMessage('suppression', { articleId: req.params.id });

    res.json({ message: "Article supprimé avec succès" });
  } catch (err) {
    res.status(500).send("Erreur lors de la suppression de l'article: " + err.message);
  }
});

app.put('/article/:id', async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const updatedArticle = await Article.findByIdAndUpdate(req.params.id, { title, description, price }, { new: true });
    if (!updatedArticle) {
      return res.status(404).send("Article non trouvé");
    }
    
    // Envoyer un message Kafka pour l'événement de mise à jour d'article
    await sendArticleMessage('modification', updatedArticle);

    res.json(updatedArticle);
  } catch (err) {
    res.status(500).send("Erreur lors de la mise à jour de l'article: " + err.message);
  }
});

// Endpoints pour les commandes
app.get('/commande', async (req, res) => {
  try {
    const commandes = await Commande.find();
    res.json(commandes);
  } catch (err) {
    res.status(500).send("Erreur lors de la recherche des commandes: " + err.message);
  }
});

app.get('/commande/:id', async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).send("Commande non trouvée");
    }
    res.json(commande);
  } catch (err) {
    res.status(500).send("Erreur lors de la recherche de la commande: " + err.message);
  }
});

app.post('/commande', async (req, res) => {
  try {
    const { nom, articles_quantites } = req.body;
    const nouvelleCommande = new Commande({ nom, articles_quantites });
    const commande = await nouvelleCommande.save();
    
    // Envoyer un message Kafka pour l'événement de création de commande
    await sendCommandeMessage('creation', commande);

    res.json(commande);
  } catch (err) {
    res.status(500).send("Erreur lors de la création de la commande: " + err.message);
  }
});

app.delete('/commande/:id', async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) {
      return res.status(404).send("Commande non trouvée");
    }

    // Envoyer un message Kafka pour l'événement de suppression de commande
    await sendCommandeMessage('suppression', { commandeId: req.params.id });

    res.json({ message: "Commande supprimée avec succès" });
  } catch (err) {
    res.status(500).send("Erreur lors de la suppression de la commande: " + err.message);
  }
});

app.put('/commande/:id', async (req, res) => {
  try {
    const { nom } = req.body;
    const updatedCommande = await Commande.findByIdAndUpdate(req.params.id, { nom }, { new: true });
    if (!updatedCommande) {
      return res.status(404).send("Commande non trouvée");
    }

    // Envoyer un message Kafka pour l'événement de mise à jour de commande
    await sendCommandeMessage('modification', updatedCommande);

    res.json(updatedCommande);
  } catch (err) {
    res.status(500).send("Erreur lors de la mise à jour de la commande: " + err.message);
  }
});

// Démarrer le serveur Express
const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway opérationnel sur le port ${port}`);
});
