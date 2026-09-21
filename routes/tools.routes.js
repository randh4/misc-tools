const express = require('express');
const router = express.Router();
const toolsRegistry = require('../config/tools.registry');
const toolsController = require('../controllers/tools.controller');

router.post('/api/ssl-checker', toolsController.checkSSL);
router.post('/api/dns-lookup', toolsController.resolveDNS);
router.post('/api/ping-test', toolsController.pingHost);
router.post('/api/port-checker', toolsController.checkPort);
router.post('/api/whois-lookup', toolsController.lookupWhois);
router.post('/api/ip-lookup', toolsController.lookupIP);
router.post('/api/http-status-checker', toolsController.checkHTTP);

router.get('/:toolSlug', (req, res, next) => {
  const tool = toolsRegistry[req.params.toolSlug];
  if (!tool) return next();
  res.render('pages/tool-wrapper', {
    title: `${tool.name} - IT Toolbox`,
    tool,
    allTools: Object.values(toolsRegistry)
  });
});

module.exports = router;
