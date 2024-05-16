const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
// const article = require('./models/Article');
// const Commande = require('./models/Commande');
const { sendArticleMessage } = require('./ArticleProducer');
const { sendCommandeMessage } = require('./CommandeProducer');

// Charger le fichier proto pour les articles
const articleProtoPath = 'article.proto';
const articleProtoDefinition = protoLoader.loadSync(articleProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger le fichier proto pour les commandes
const commandeProtoPath = 'commande.proto';
const commandeProtoDefinition = protoLoader.loadSync(commandeProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger les packages gRPC
const articleProto = grpc.loadPackageDefinition(articleProtoDefinition).article;
const commandeProto = grpc.loadPackageDefinition(commandeProtoDefinition).commande;

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
  Query: {
    // Résolveur pour récupérer un article par son ID
    getArticle: (_, { articleId }) => {
      // Effectuer un appel gRPC au microservice d'articles
      const client = new articleProto.ArticleService('localhost:50051', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.getArticle({ articleId: articleId }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.article);
          }
        });
      });
    },
    // Résolveur pour récupérer une commande par son ID
    getCommande: (_, { commandeId }) => {
      // Effectuer un appel gRPC au microservice de commandes
      const client = new commandeProto.CommandeService('localhost:50052', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.getCommande({ commandeId: commandeId }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.commande);
          }
        });
      });
    },
  },
  Mutation: {
    // Résolveur pour créer un article
    createArticle: async (_, { title, description, price }) => {
      try {
        // Effectuer un appel gRPC au microservice d'articles pour créer un nouvel article
        const client = new articleProto.ArticleService('localhost:50051', grpc.credentials.createInsecure());
        const response = await new Promise((resolve, reject) => {
          client.createArticle({ title, description, price }, (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.article);
            }
          });
        });

        // Envoyer un message Kafka pour l'événement de création d'article
        await sendArticleMessage('creation', response.article);

        return response.article;
      } catch (error) {
        throw new Error("Erreur lors de la création de l'article");
      }
    },
    // Résolveur pour mettre à jour un article par son ID
    updateArticle: async (_, {  article_id: articleId, title, description, price }) => {
      try {
        // Effectuer un appel gRPC au microservice d'articles pour mettre à jour l'article
        const client = new articleProto.ArticleService('localhost:50051', grpc.credentials.createInsecure());
        await new Promise((resolve, reject) => {
          client.updateArticle({  article_id: articleId, title, description, price }, (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.article);
            }
          });
        });

        // Envoyer un message Kafka pour l'événement de mise à jour d'article
        await sendArticleMessage('modification', response.article);

        return response.article;// Retourne true si l'article est mis à jour avec succès
      } catch (error) {
        throw new Error("Erreur lors de la mise à jour de l'article");
      }
    },
    // Résolveur pour supprimer un article par son ID
    deleteArticle: async (_, {article_id }) => {
      try {
        const client = new articleProto.ArticleService('localhost:50051', grpc.credentials.createInsecure());
        await new Promise((resolve, reject) => {
          client.deleteArticle({ articleId: article_id }, (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.article);
            }
          });
        });
        await sendArticleMessage('suppression', { articleId:article_id});
        return true; // Retourne true si l'article est supprimé avec succès
      } catch (error) {
        throw new Error("Erreur lors de la suppression de l'article");
      }
    },
    // Résolveur pour créer une commande
    createCommande: async (_, { articlesQuantites }) => {
      try {
        // Effectuer un appel gRPC au microservice de commandes pour créer une nouvelle commande
        const client = new commandeProto.CommandeService('localhost:50052', grpc.credentials.createInsecure());
        const response = await new Promise((resolve, reject) => {
          client.createCommande({ articlesQuantites }, (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          });
        });

        // Envoyer un message Kafka pour l'événement de création de commande
        await sendCommandeMessage('creation', response.commande);

        return response.commande;
      } catch (error) {
        throw new Error("Erreur lors de la création de la commande");
      }
    },
    // Résolveur pour supprimer une commande par son ID
    deleteCommande: async (_, { commandeId }) => {
      try {
        // Effectuer un appel gRPC au microservice de commandes pour supprimer la commande
        const client = new commandeProto.CommandeService('localhost:50052', grpc.credentials.createInsecure());
        const response = await new Promise((resolve, reject) => {
          client.deleteCommande({ commandeId: commandeId }, (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(response);
            }
          });
        });

        // Envoyer un message Kafka pour l'événement de suppression de commande
        await sendCommandeMessage('suppression', { commandeId });

        return { success: true, message: 'Commande supprimée avec succès' };
      } catch (error) {
        throw new Error("Erreur lors de la suppression de la commande");
      }
    },
  },
};

module.exports = resolvers;
