const cmsRepo = require('../repositories/cms.repository');
const pool = require('../config/db');

class CmsService {
  // -------------------------------------------------------------
  // THEMES
  // -------------------------------------------------------------
  async getAllThemes() {
    return cmsRepo.getAllThemes();
  }

  async getThemeById(themeId) {
    return cmsRepo.getThemeById(themeId);
  }

  async getActiveTheme() {
    return cmsRepo.getActiveTheme();
  }

  async activateTheme(themeId) {
    return cmsRepo.activateTheme(themeId);
  }

  async updateThemeConfig(themeId, data) {
    return cmsRepo.updateThemeConfig(themeId, data);
  }

  // -------------------------------------------------------------
  // SETTINGS & SECTIONS
  // -------------------------------------------------------------
  async getSettings(schoolId = 1) {
    return cmsRepo.getSettings(schoolId);
  }

  async updateSettings(schoolId = 1, data) {
    return cmsRepo.updateSettings(schoolId, data);
  }

  async getSections(schoolId = 1) {
    return cmsRepo.getSections(schoolId, false);
  }

  async updateSection(sectionId, data) {
    return cmsRepo.updateSection(sectionId, data);
  }

  async reorderSections(orders) {
    return cmsRepo.reorderSections(orders);
  }

  // -------------------------------------------------------------
  // PAGES
  // -------------------------------------------------------------
  async getPages(schoolId = 1) {
    return cmsRepo.getPages(schoolId, false);
  }

  async getPageById(pageId) {
    return cmsRepo.getPageById(pageId);
  }

  async createPage(data) {
    return cmsRepo.createPage(data);
  }

  async updatePage(pageId, data) {
    return cmsRepo.updatePage(pageId, data);
  }

  async deletePage(pageId) {
    return cmsRepo.deletePage(pageId);
  }

  // -------------------------------------------------------------
  // MENUS
  // -------------------------------------------------------------
  async getMenus(schoolId = 1) {
    const rawMenus = await cmsRepo.getMenus(schoolId, false);
    // Transform into tree structure for convenience
    const topLevel = rawMenus.filter(m => !m.parent_id);
    return topLevel.map(parent => ({
      ...parent,
      children: rawMenus.filter(m => m.parent_id === parent.menu_id)
    }));
  }

  async createMenu(data) {
    return cmsRepo.createMenu(data);
  }

  async updateMenu(menuId, data) {
    return cmsRepo.updateMenu(menuId, data);
  }

  async deleteMenu(menuId) {
    return cmsRepo.deleteMenu(menuId);
  }

  // -------------------------------------------------------------
  // BANNERS, NEWS, EVENTS, GALLERY
  // -------------------------------------------------------------
  async getBanners(schoolId = 1) {
    return cmsRepo.getBanners(schoolId, false);
  }

  async createBanner(data) {
    return cmsRepo.createBanner(data);
  }

  async updateBanner(bannerId, data) {
    return cmsRepo.updateBanner(bannerId, data);
  }

  async deleteBanner(bannerId) {
    return cmsRepo.deleteBanner(bannerId);
  }

  async getNews(schoolId = 1) {
    return cmsRepo.getNews(schoolId, false, 100);
  }

  async createNews(data) {
    return cmsRepo.createNews(data);
  }

  async updateNews(newsId, data) {
    return cmsRepo.updateNews(newsId, data);
  }

  async deleteNews(newsId) {
    return cmsRepo.deleteNews(newsId);
  }

  async getEvents(schoolId = 1) {
    return cmsRepo.getEvents(schoolId, false, 100);
  }

  async createEvent(data) {
    return cmsRepo.createEvent(data);
  }

  async updateEvent(eventId, data) {
    return cmsRepo.updateEvent(eventId, data);
  }

  async deleteEvent(eventId) {
    return cmsRepo.deleteEvent(eventId);
  }

  async getGalleryCategories(schoolId = 1) {
    return cmsRepo.getGalleryCategories(schoolId);
  }

  async getGalleryItems(schoolId = 1, categoryId = null) {
    return cmsRepo.getGalleryItems(schoolId, categoryId, false);
  }

  async createGalleryItem(data) {
    return cmsRepo.createGalleryItem(data);
  }

  async updateGalleryItem(galleryId, data) {
    return cmsRepo.updateGalleryItem(galleryId, data);
  }

  async deleteGalleryItem(galleryId) {
    return cmsRepo.deleteGalleryItem(galleryId);
  }

  async getFacilities(schoolId = 1) {
    return cmsRepo.getFacilities(schoolId, false);
  }

  async getTestimonials(schoolId = 1) {
    return cmsRepo.getTestimonials(schoolId, false);
  }

  async getMedia(schoolId = 1) {
    return cmsRepo.getMedia(schoolId);
  }

  async createMedia(data) {
    return cmsRepo.createMedia(data);
  }

  async deleteMedia(mediaId) {
    return cmsRepo.deleteMedia(mediaId);
  }

  async getInquiries(schoolId = 1) {
    return cmsRepo.getInquiries(schoolId);
  }

  // -------------------------------------------------------------
  // CMS DASHBOARD STATS
  // -------------------------------------------------------------
  async getDashboardStats(schoolId = 1) {
    const activeTheme = await cmsRepo.getActiveTheme();
    const [pages] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published FROM cms_pages WHERE school_id = ?', [schoolId]);
    const [news] = await pool.query('SELECT COUNT(*) as total FROM cms_news WHERE school_id = ?', [schoolId]);
    const [events] = await pool.query('SELECT COUNT(*) as total FROM cms_events WHERE school_id = ?', [schoolId]);
    const [banners] = await pool.query('SELECT COUNT(*) as total FROM cms_banners WHERE school_id = ?', [schoolId]);
    const [gallery] = await pool.query('SELECT COUNT(*) as total FROM cms_gallery WHERE school_id = ?', [schoolId]);
    const [menus] = await pool.query('SELECT COUNT(*) as total FROM cms_menus WHERE school_id = ?', [schoolId]);
    const [inquiries] = await pool.query('SELECT COUNT(*) as total FROM cms_inquiries WHERE school_id = ?', [schoolId]);

    return {
      activeTheme,
      pages: { total: pages[0].total || 0, published: pages[0].published || 0, draft: (pages[0].total || 0) - (pages[0].published || 0) },
      newsCount: news[0].total || 0,
      eventsCount: events[0].total || 0,
      bannersCount: banners[0].total || 0,
      galleryCount: gallery[0].total || 0,
      menusCount: menus[0].total || 0,
      inquiriesCount: inquiries[0].total || 0
    };
  }
}

module.exports = new CmsService();
