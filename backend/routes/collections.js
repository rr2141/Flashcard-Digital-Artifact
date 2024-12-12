const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { authenticate } = require('../middleware/authenticate');

// Route to collections.
router.get('/', authenticate, collectionController.getUserCollections);
router.get('/:collectionId', authenticate, collectionController.getCollectionById);
router.post('/', authenticate, collectionController.createCollection);
router.put('/:collectionId', authenticate, collectionController.updateCollectionById);
router.delete('/:collectionId', authenticate, collectionController.deleteCollectionById);

module.exports = router;
