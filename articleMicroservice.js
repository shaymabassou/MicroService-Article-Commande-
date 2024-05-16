const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Article = require('./models/Article'); // Modèle Mongoose pour les articles
const { sendArticleMessage } = require('./ArticleProducer');// Importez la fonction d'envoi de message Kafka pour les articles
// const {  updateArticle } = require('./articleMicroservice'); 

// Chemin vers le fichier Protobuf pour les articles
const articleProtoPath = './article.proto';

// Charger le Protobuf pour les articles
const articleProtoDefinition = protoLoader.loadSync(articleProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger le service Article du package gRPC
const articleProto = grpc.loadPackageDefinition(articleProtoDefinition).article;

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/miniproject') // Utilisez IPv4 pour éviter les problèmes
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1); // Quitte le processus en cas d'erreur
  });

// Implémentation du service gRPC pour les articles
const articleService = {
  // Fonction pour créer un nouvel article
  createArticle: async (call, callback) => {
    try {
      const { title, description, price } = call.request;
      const newArticle = new Article({ title, description, price });
      const article = await newArticle.save();

      // Envoyer un message Kafka pour l'événement de création d'article
      await sendArticleMessage('creation', article);

      callback(null, { article });
    } catch (err) {
      callback(new Error("Erreur lors de la création de l'article"));
    }
  },

  // Fonction pour mettre à jour un article existant
  updateArticle: async (call, callback) => {
    try {
      const { article_id, title, description, price } = call.request;
      const updatedArticle = await Article.findByIdAndUpdate(article_id, { title, description, price }, { new: true });

      if (!updatedArticle) {
        return callback(new Error("Article non trouvé"));
      }

      // Envoyer un message Kafka pour l'événement de modification d'article
      await sendArticleMessage('modification', updatedArticle);

      callback(null, { article: updatedArticle });
    } catch (err) {
      callback(new Error("Erreur lors de la mise à jour de l'article"));
    }
  },

  // Fonction pour supprimer un article existant
  deleteArticle: async (call, callback) => {
    try {
      const articleId = call.request.article_id;
      const article = await Article.findByIdAndDelete(articleId);

      if (!article) {
        return callback(new Error("Article non trouvé"));
      }

      // Envoyer un message Kafka pour l'événement de suppression d'article
      await sendArticleMessage('suppression', article);

      callback(null, { message: "Article supprimé avec succès" });
    } catch (err) {
      callback(new Error("Erreur lors de la suppression de l'article"));
    }
  },

  // Fonction pour obtenir tous les articles
  searchArticles: async (call, callback) => {
    try {
      const articles = await Article.find();
      callback(null, { articles });
    } catch (err) {
      callback(new Error("Erreur lors de la recherche des articles"));
    }
  },

  // Fonction pour obtenir un article par son ID
  getArticle: async (call, callback) => {
    try {
      const articleId = call.request.article_id;
      const article = await Article.findById(articleId);

      if (!article) {
        return callback(new Error("Article non trouvé"));
      }

      callback(null, { article });
    } catch (err) {
      callback(new Error("Erreur lors de la recherche de l'article"));
    }
  },
};

// Créer le serveur gRPC pour les articles
const server = new grpc.Server();
server.addService(articleProto.ArticleService.service, articleService);

const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
  if (err) {
    console.error("Échec de la liaison du serveur:", err);
    return;
  }
  console.log(`Microservice Article opérationnel sur le port ${boundPort}`);
});
