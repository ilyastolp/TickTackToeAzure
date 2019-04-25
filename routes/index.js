"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET home page.
 */
const express = require("express");
const router = express.Router();
const path = require('path');
router.get('/', (req, res) => {
    res.render('index.pug', { title: 'Ilya Stolpovskikh Tick Tack Toe Science Project', status: '' });
    //res.sendFile(path.join(__dirname + '/index.html'));
});
exports.default = router;
//# sourceMappingURL=index.js.map