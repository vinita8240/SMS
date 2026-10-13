const cmsService = require('../services/cms.service');

class CmsController {
  // -------------------------------------------------------------
  // DASHBOARD
  // -------------------------------------------------------------
  async getDashboardStats(req, res, next) {
    try {
      const stats = await cmsService.getDashboardStats(req.query.school_id || 1);
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // GENERIC IMAGE UPLOAD
  // -------------------------------------------------------------
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const serverUrl = process.env.API_URL ? process.env.API_URL.replace('/api', '') : `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${serverUrl}/uploads/photos/${req.file.filename}`;
      
      res.status(201).json({ success: true, message: 'File uploaded successfully', data: { url: fileUrl } });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // THEMES
  // -------------------------------------------------------------
  async getAllThemes(req, res, next) {
    try {
      const themes = await cmsService.getAllThemes();
      res.json({ success: true, data: themes });
    } catch (err) {
      next(err);
    }
  }

  async getThemeById(req, res, next) {
    try {
      const theme = await cmsService.getThemeById(req.params.id);
      if (!theme) return res.status(404).json({ success: false, message: 'Theme not found' });
      res.json({ success: true, data: theme });
    } catch (err) {
      next(err);
    }
  }

  async activateTheme(req, res, next) {
    try {
      const theme = await cmsService.activateTheme(req.params.id);
      res.json({ success: true, message: `Theme "${theme.theme_name}" activated successfully`, data: theme });
    } catch (err) {
      next(err);
    }
  }

  async updateThemeConfig(req, res, next) {
    try {
      const theme = await cmsService.updateThemeConfig(req.params.id, req.body);
      res.json({ success: true, message: 'Theme configuration updated successfully', data: theme });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // SETTINGS & SECTIONS
  // -------------------------------------------------------------
  async getSettings(req, res, next) {
    try {
      const settings = await cmsService.getSettings(req.query.school_id || 1);
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const settings = await cmsService.updateSettings(req.query.school_id || 1, req.body);
      res.json({ success: true, message: 'Website settings updated successfully', data: settings });
    } catch (err) {
      next(err);
    }
  }

  async getSections(req, res, next) {
    try {
      const sections = await cmsService.getSections(req.query.school_id || 1);
      res.json({ success: true, data: sections });
    } catch (err) {
      next(err);
    }
  }

  async updateSection(req, res, next) {
    try {
      const section = await cmsService.updateSection(req.params.id, req.body);
      res.json({ success: true, message: 'Homepage section updated successfully', data: section });
    } catch (err) {
      next(err);
    }
  }

  async reorderSections(req, res, next) {
    try {
      await cmsService.reorderSections(req.body.sections || []);
      const sections = await cmsService.getSections(req.query.school_id || 1);
      res.json({ success: true, message: 'Homepage layout reordered successfully', data: sections });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // PAGES
  // -------------------------------------------------------------
  async getPages(req, res, next) {
    try {
      const pages = await cmsService.getPages(req.query.school_id || 1);
      res.json({ success: true, data: pages });
    } catch (err) {
      next(err);
    }
  }

  async getPageById(req, res, next) {
    try {
      const page = await cmsService.getPageById(req.params.id);
      if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
      res.json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  async createPage(req, res, next) {
    try {
      const page = await cmsService.createPage(req.body);
      res.status(201).json({ success: true, message: 'Page created successfully', data: page });
    } catch (err) {
      next(err);
    }
  }

  async updatePage(req, res, next) {
    try {
      const page = await cmsService.updatePage(req.params.id, req.body);
      res.json({ success: true, message: 'Page updated successfully', data: page });
    } catch (err) {
      next(err);
    }
  }

  async deletePage(req, res, next) {
    try {
      await cmsService.deletePage(req.params.id);
      res.json({ success: true, message: 'Page deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // MENUS
  // -------------------------------------------------------------
  async getMenus(req, res, next) {
    try {
      const menus = await cmsService.getMenus(req.query.school_id || 1);
      res.json({ success: true, data: menus });
    } catch (err) {
      next(err);
    }
  }

  async createMenu(req, res, next) {
    try {
      const menu = await cmsService.createMenu(req.body);
      res.status(201).json({ success: true, message: 'Menu item created successfully', data: menu });
    } catch (err) {
      next(err);
    }
  }

  async updateMenu(req, res, next) {
    try {
      const menu = await cmsService.updateMenu(req.params.id, req.body);
      res.json({ success: true, message: 'Menu item updated successfully', data: menu });
    } catch (err) {
      next(err);
    }
  }

  async deleteMenu(req, res, next) {
    try {
      await cmsService.deleteMenu(req.params.id);
      res.json({ success: true, message: 'Menu item deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // BANNERS
  // -------------------------------------------------------------
  async getBanners(req, res, next) {
    try {
      const banners = await cmsService.getBanners(req.query.school_id || 1);
      res.json({ success: true, data: banners });
    } catch (err) {
      next(err);
    }
  }

  async createBanner(req, res, next) {
    try {
      const banner = await cmsService.createBanner(req.body);
      res.status(201).json({ success: true, message: 'Banner created successfully', data: banner });
    } catch (err) {
      next(err);
    }
  }

  async updateBanner(req, res, next) {
    try {
      const banner = await cmsService.updateBanner(req.params.id, req.body);
      res.json({ success: true, message: 'Banner updated successfully', data: banner });
    } catch (err) {
      next(err);
    }
  }

  async deleteBanner(req, res, next) {
    try {
      await cmsService.deleteBanner(req.params.id);
      res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // NEWS & EVENTS
  // -------------------------------------------------------------
  async getNews(req, res, next) {
    try {
      const news = await cmsService.getNews(req.query.school_id || 1);
      res.json({ success: true, data: news });
    } catch (err) {
      next(err);
    }
  }

  async createNews(req, res, next) {
    try {
      const item = await cmsService.createNews(req.body);
      res.status(201).json({ success: true, message: 'News created successfully', data: item });
    } catch (err) {
      next(err);
    }
  }

  async updateNews(req, res, next) {
    try {
      const item = await cmsService.updateNews(req.params.id, req.body);
      res.json({ success: true, message: 'News updated successfully', data: item });
    } catch (err) {
      next(err);
    }
  }

  async deleteNews(req, res, next) {
    try {
      await cmsService.deleteNews(req.params.id);
      res.json({ success: true, message: 'News deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getEvents(req, res, next) {
    try {
      const events = await cmsService.getEvents(req.query.school_id || 1);
      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  }

  async createEvent(req, res, next) {
    try {
      const item = await cmsService.createEvent(req.body);
      res.status(201).json({ success: true, message: 'Event created successfully', data: item });
    } catch (err) {
      next(err);
    }
  }

  async updateEvent(req, res, next) {
    try {
      const item = await cmsService.updateEvent(req.params.id, req.body);
      res.json({ success: true, message: 'Event updated successfully', data: item });
    } catch (err) {
      next(err);
    }
  }

  async deleteEvent(req, res, next) {
    try {
      await cmsService.deleteEvent(req.params.id);
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // GALLERY
  // -------------------------------------------------------------
  async getGallery(req, res, next) {
    try {
      const categories = await cmsService.getGalleryCategories(req.query.school_id || 1);
      const items = await cmsService.getGalleryItems(req.query.school_id || 1, req.query.category_id || null);
      res.json({ success: true, data: { categories, items } });
    } catch (err) {
      next(err);
    }
  }

  async createGalleryItem(req, res, next) {
    try {
      const item = await cmsService.createGalleryItem(req.body);
      res.status(201).json({ success: true, message: 'Gallery item uploaded successfully', data: item });
    } catch (err) {
      next(err);
    }
  }

  async updateGalleryItem(req, res, next) {
    try {
      const item = await cmsService.updateGalleryItem(req.params.id, req.body);
      res.json({ success: true, message: 'Gallery item updated successfully', data: item });
    } catch (err) {
      next(err);
    }
  }

  async deleteGalleryItem(req, res, next) {
    try {
      await cmsService.deleteGalleryItem(req.params.id);
      res.json({ success: true, message: 'Gallery item deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // MEDIA LIBRARY
  // -------------------------------------------------------------
  async getMedia(req, res, next) {
    try {
      const media = await cmsService.getMedia(req.query.school_id || 1);
      res.json({ success: true, data: media });
    } catch (err) {
      next(err);
    }
  }

  async createMedia(req, res, next) {
    try {
      const media = await cmsService.createMedia(req.body);
      res.status(201).json({ success: true, message: 'Media uploaded successfully', data: media });
    } catch (err) {
      next(err);
    }
  }

  async deleteMedia(req, res, next) {
    try {
      await cmsService.deleteMedia(req.params.id);
      res.json({ success: true, message: 'Media removed successfully' });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------
  // INQUIRIES
  // -------------------------------------------------------------
  async getInquiries(req, res, next) {
    try {
      const inquiries = await cmsService.getInquiries(req.query.school_id || 1);
      res.json({ success: true, data: inquiries });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CmsController();
