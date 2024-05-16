const grpc = require('@grpc/grpc-js'); // Pour gRPC
const protoLoader = require('@grpc/proto-loader'); // Pour charger Protobuf

// Chemin vers le fichier Protobuf
const commandeProtoPath = './commande.proto';

// Charger le Protobuf
const commandeProtoDefinition = protoLoader.loadSync(commandeProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger le service Commande du package gRPC
const commandeProto = grpc.loadPackageDefinition(commandeProtoDefinition).commande;

// Adresse du serveur gRPC
const serverAddress = 'localhost:50052';

// Créer un client gRPC
const client = new commandeProto.CommandeService(serverAddress, grpc.credentials.createInsecure());

// Fonction pour créer une commande
function createCommande(commandeId, nom, articlesQuantites) {
    const request = { commande_id: commandeId, nom, articles_quantites: articlesQuantites };
  
    client.createCommande(request, (error, response) => {
      if (error) {
        console.error('Erreur lors de la création de la commande:', error.message);
        return;
      }
      console.log('Commande créée avec succès:', response.commande);
    });
  }

  
// Fonction pour obtenir une commande par ID
function getCommandeById(commandeId) {
  const request = { commande_id: commandeId };

  client.getCommande(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la récupération de la commande:', error.message);
      return;
    }
    console.log('Commande récupérée avec succès:', response.commande);
  });
}

// Appel de la fonction pour créer une commande
 const nouvelleCommandeNom = 'chaima';
 const articlesQuantites = [
   { article:  '663a322c1b5a6e1c983ff8d9' , quantite: 5 }
 ];
 createCommande(nouvelleCommandeNom, articlesQuantites);
 
// Appel de la fonction pour mettre à jour une commande par ID
// const commandeIdToUpdate = '663cc2fe3596e41224ec486e';
// const commandeNomUpdated = 'Commande Mise à Jour';
// const articlesQuantitesUpdated = [{ article: { id: '12345', nom: 'Article 1' }, quantite: 10 }];
// updateCommande(commandeIdToUpdate, commandeNomUpdated, articlesQuantitesUpdated);

// Appel de la fonction pour supprimer une commande par ID
//const commandeIdToDelete = '663bde10653f77aa4c8d1c92';
// deleteCommandeById(commandeIdToDelete);

// Appel de la fonction pour obtenir une commande par ID
// const commandeId = '663cc2fe3596e41224ec486e';
// getCommandeById(commandeIdToFetch);
