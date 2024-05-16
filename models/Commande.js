const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
    nom:String,
  articles_quantites: [{
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    quantite: Number
    
  }],
 
});

const Commande = mongoose.model('Commande', commandeSchema);

module.exports = Commande;
