const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// const formController = new FormController();

router.post('/submit', formController.submitForm.bind(formController));

module.exports = router;