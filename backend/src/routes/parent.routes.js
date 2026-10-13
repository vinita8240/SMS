const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parent.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const auditLogger = require('../middleware/audit.middleware');

router.use(authenticate);

router.get('/', parentController.getParents);
router.get('/:id', parentController.getParentById);

router.post(
  '/',
  authorizeRoles('super_admin', 'admin'),
  auditLogger('Parents', 'CREATE_PARENT'),
  parentController.createParent
);

router.put(
  '/:id',
  authorizeRoles('super_admin', 'admin'),
  auditLogger('Parents', 'UPDATE_PARENT'),
  parentController.updateParent
);

router.delete(
  '/:id',
  authorizeRoles('super_admin', 'admin'),
  auditLogger('Parents', 'DELETE_PARENT'),
  parentController.deleteParent
);

module.exports = router;
