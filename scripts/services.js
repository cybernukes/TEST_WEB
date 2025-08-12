// services.js
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new service
router.post('/', async (req, res) => {
  const service = new Service({
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    description: req.body.description,
    features: req.body.features,
    link: req.body.link
  });

  try {
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Similar routes for update and delete
module.exports = router;