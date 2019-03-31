const onPreInit = require('./gatsby/on-pre-init');
const createPages = require('./gatsby/create-pages');
const onCreateNode = require('./gatsby/on-create-node');
const sourceNodes = require('./gatsby/source-nodes');

module.exports.onPreInit = onPreInit;
module.exports.createPages = createPages;
module.exports.onCreateNode = onCreateNode;
module.exports.sourceNodes = sourceNodes;
