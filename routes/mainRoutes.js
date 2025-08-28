const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to Week 2 MVC Lab');
});

module.exports = router;    