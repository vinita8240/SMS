const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cms.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { uploadPhoto } = require('../middleware/upload.middleware');

// All CMS management endpoints require authentication & admin role
router.use(authenticate);
router.use(authorizeRoles('super_admin', 'admin'));

// Dashboard Stats
router.get('/dashboard', cmsController.getDashboardStats);

// Generic CMS Image Upload
router.post('/upload', uploadPhoto.single('image'), cmsController.uploadFile);

// Themes
router.get('/themes', cmsController.getAllThemes);
router.get('/themes/:id', cmsController.getThemeById);
router.post('/themes/:id/activate', cmsController.activateTheme);
router.put('/themes/:id', cmsController.updateThemeConfig);

// Website Settings
router.get('/settings', cmsController.getSettings);
router.put('/settings', cmsController.updateSettings);

// Homepage Sections
router.get('/homepage', cmsController.getSections);
router.get('/sections', cmsController.getSections);
router.put('/homepage', cmsController.reorderSections);
router.put('/sections', cmsController.reorderSections);
router.put('/homepage/sections/:id', cmsController.updateSection);
router.put('/sections/:id', cmsController.updateSection);

// Pages
router.get('/pages', cmsController.getPages);
router.get('/pages/:id', cmsController.getPageById);
router.post('/pages', cmsController.createPage);
router.put('/pages/:id', cmsController.updatePage);
router.delete('/pages/:id', cmsController.deletePage);

// Menus
router.get('/menu', cmsController.getMenus);
router.get('/menus', cmsController.getMenus);
router.post('/menu', cmsController.createMenu);
router.post('/menus', cmsController.createMenu);
router.put('/menu/:id', cmsController.updateMenu);
router.put('/menus/:id', cmsController.updateMenu);
router.delete('/menu/:id', cmsController.deleteMenu);
router.delete('/menus/:id', cmsController.deleteMenu);

// Banners
router.get('/banners', cmsController.getBanners);
router.post('/banners', cmsController.createBanner);
router.put('/banners/:id', cmsController.updateBanner);
router.delete('/banners/:id', cmsController.deleteBanner);

// News
router.get('/news', cmsController.getNews);
router.post('/news', cmsController.createNews);
router.put('/news/:id', cmsController.updateNews);
router.delete('/news/:id', cmsController.deleteNews);

// Events
router.get('/events', cmsController.getEvents);
router.post('/events', cmsController.createEvent);
router.put('/events/:id', cmsController.updateEvent);
router.delete('/events/:id', cmsController.deleteEvent);

// Gallery
router.get('/gallery', cmsController.getGallery);
router.post('/gallery', cmsController.createGalleryItem);
router.put('/gallery/:id', cmsController.updateGalleryItem);
router.delete('/gallery/:id', cmsController.deleteGalleryItem);

// Media Library
router.get('/media', cmsController.getMedia);
router.post('/media', cmsController.createMedia);
router.delete('/media/:id', cmsController.deleteMedia);

// Inquiries
router.get('/inquiries', cmsController.getInquiries);

module.exports = router;
