const router = require('express').Router(),
    apiRoutes = require('./apiRoutes');

router.use('/api', apiRoutes);

module.exports = router;

