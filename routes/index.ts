/*
 * GET home page.
 */
import express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req: express.Request, res: express.Response) => {
    res.render('index.pug', { title: 'Ilya Stolpovskikh Tick Tack Toe Science Project', status: '' });
    //res.sendFile(path.join(__dirname + '/index.html'));
});

export default router;