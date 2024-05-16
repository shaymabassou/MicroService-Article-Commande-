const grpc = require('@grpc/grpc-js'); // Pour gRPC
const protoLoader = require('@grpc/proto-loader'); // Pour charger Protobuf

// Chemin vers le fichier Protobuf
const articleProtoPath = './article.proto';

// Charger le Protobuf
const articleProtoDefinition = protoLoader.loadSync(articleProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Charger le service Article du package gRPC
const articleProto = grpc.loadPackageDefinition(articleProtoDefinition).article;

// Adresse du serveur gRPC
const serverAddress = 'localhost:50051';

// Créer un client gRPC
const client = new articleProto.ArticleService(serverAddress, grpc.credentials.createInsecure());

// Fonction pour obtenir un article par ID
function getArticleById(articleId) {
  const request = { article_id: articleId };

  client.getArticle(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la récupération de l\'article:', error.message);
      return;
    }
    console.log('Article récupéré avec succès:', response.article);
  });
}

// Fonction pour créer un nouvel article
function createArticle(title, description, price) {
  const request = {  title, description, price };

  client.createArticle(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la création de l\'article:', error.message);
      return;
    }
    console.log('Article créé avec succès:', response.article);
  });
}

// Fonction pour supprimer un article par ID
function deleteArticleById(articleId) {
  const request = { article_id: articleId };

  client.deleteArticle(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la suppression de l\'article:', error.message);
      return;
    }
    console.log('Article supprimé avec succès.', response.article);
  });
}

// Fonction pour mettre à jour un article par ID
function updateArticle(articleId, title, description, price) {
  const request = { article_id: articleId, title, description, price };

  client.updateArticle(request, (error, response) => {
    if (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error.message);
      return;
    }
    console.log('Article mis à jour avec succès:', response.article);
  });
}


// Exemple d'utilisation

// const newArticleTitle = ' Cliente';
// const newArticleDescription = 'Description du nouveau article';
// const  newArticlePrice=30.00;
// Appel de la fonction pour créer un nouveau article
// createArticle(newArticleTitle, newArticleDescription, newArticlePrice);


// Appel de la fonction pour obtenir un article par ID
const articleIdToFetch = '663be9a5c02fa6d413e91620';
getArticleById(articleIdToFetch);

// Exemple d'utilisation update
// const articleIdToFetch = '663be990c02fa6d413e9161e';
// const newArticleTitle = ' Article';
// const newArticleDescription = 'Description du nouvel article';
// const newArticlePrice = 99.99;

// updateArticle(articleIdToFetch, newArticleTitle, newArticleDescription, newArticlePrice);


// Appel de la fonction pour supprimer un article par ID
// const articleIdToDelete = '663be9a5c02fa6d413e91620';
// deleteArticleById(articleIdToDelete);
