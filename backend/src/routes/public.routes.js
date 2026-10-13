const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Public Open APIs for Website & Themes
router.get('/site', publicController.getSiteBundle);
router.get('/theme', publicController.getTheme);
router.get('/home', publicController.getHomepage);
router.get('/pages/:slug', publicController.getPageBySlug);
router.get('/news', publicController.getNews);
router.get('/news/:slug', publicController.getNewsBySlug);
router.get('/events', publicController.getEvents);
router.get('/gallery', publicController.getGallery);
router.get('/facilities', publicController.getFacilities);
router.post('/contact', publicController.submitInquiry);

module.exports = router;
