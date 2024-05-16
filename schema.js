const { gql } = require('@apollo/server');

const typeDefs = `
  type Article {
    id: String!
    title: String!
    description: String!
    price: Float!
  }

  type ArticleQuantite {
    article: Article!
    quantite: Int!
  }

  type Commande {
    id: String!
    articles_quantites: [ArticleQuantite]!
  }

  type Query {
    getArticle(articleId: String!): Article
    searchArticles(query: String!): [Article]
    getCommande(commandeId: String!): Commande
  }

  type Mutation {
    createArticle(title: String!, description: String!, price: Float!): Article
    createCommande(articlesQuantites: [ArticleQuantiteInput]!): Commande
    deleteArticle(article_id: ID!): Boolean
    deleteCommande(commandeId: ID!): Commande
    updateArticle(article_id: ID!, title: String!, description: String!, price: Float!): Article
  }

  input ArticleQuantiteInput {
    articleId: String!
    quantite: Int!
  }
`;

module.exports = typeDefs;
