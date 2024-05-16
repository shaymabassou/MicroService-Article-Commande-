const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Commande = require('./models/Commande'); // Modèle Mongoose pour les commandes
const { sendCommandeMessage } = require('./CommandeProducer'); // Importez la fonction d'envoi de message Kafka pour les commandes

// Chemin vers le fichier Protobuf des commandes
const commandeProtoPath = './commande.proto';

// Charger le Protobuf des commandes
const commandeProtoDefinition = protoLoader.loadSync(commandeProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger le service Commande du package gRPC
const commandeProto = grpc.loadPackageDefinition(commandeProtoDefinition).commande;

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/miniproject')
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });

// Implémentation du service gRPC pour les commandes
const commandeService = {
  getCommande: async (call, callback) => {
    try {
      const commandeId = call.request.commande_id;
      const commande = await Commande.findById(commandeId);

      if (!commande) {
        return callback(new Error("Commande non trouvée"));
      }

      callback(null, { commande });
    } catch (err) {
      callback(new Error("Erreur lors de la recherche de la commande"));
    }
  },

  createCommande: async (call, callback) => {
    try {
      const { nom, articles_quantites } = call.request;
      const nouvelleCommande = new Commande({ nom, articles_quantites });
      const commande = await nouvelleCommande.save();

      // Envoyer un message Kafka pour l'événement de création de commande
      await sendCommandeMessage('creation', commande);

      callback(null, {commande });
    } catch (err) {
      callback(new Error("Erreur lors de la création de la commande"));
    }
  },
};

// Créer le serveur gRPC
const server = new grpc.Server();
server.addService(commandeProto.CommandeService.service, commandeService);

const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
  if (err) {
    console.error("Échec de la liaison du serveur:", err);
    return;
  }
  console.log(`Microservice Commande opérationnel sur le port ${boundPort}`);
});
