const express = require('express');
const router = express.Router();
const toolsRegistry = require('../config/tools.registry');

router.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'IT Engineer Toolbox - Precision Developer Utilities',
    tools: Object.values(toolsRegistry)
  });
});

module.exports = router;
