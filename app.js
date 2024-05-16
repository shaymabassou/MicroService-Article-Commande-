const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const connectDB = require('./db');

// Connecter à la base de données MongoDB
connectDB();

// Créer un serveur Apollo GraphQL
const server = new ApolloServer({ typeDefs, resolvers });

// Démarrer le serveur
server.listen().then(({ url }) => {
  console.log(`🚀 Serveur GraphQL prêt à l'adresse ${url}`);
});


const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});
