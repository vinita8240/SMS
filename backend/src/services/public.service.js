const cmsRepo = require('../repositories/cms.repository');
const pool = require('../config/db');

class PublicService {
  async getPublicSiteBundle(schoolId = 1, previewThemeId = null) {
    let theme;
    if (previewThemeId) {
      theme = await cmsRepo.getThemeById(previewThemeId);
    }
    if (!theme) {
      theme = await cmsRepo.getActiveTheme();
    }
    // Fallback if no theme marked active
    if (!theme) {
      theme = await cmsRepo.getThemeById(1);
    }

    const settings = await cmsRepo.getSettings(schoolId);
    const rawMenus = await cmsRepo.getMenus(schoolId, true);

    const topLevel = rawMenus.filter(m => !m.parent_id);
    const menus = topLevel.map(parent => ({
      ...parent,
      children: rawMenus.filter(m => m.parent_id === parent.menu_id)
    }));

    return {
      theme,
      settings,
      menus
    };
  }

  async getPublicTheme(previewThemeId = null) {
    if (previewThemeId) {
      const theme = await cmsRepo.getThemeById(previewThemeId);
      if (theme) return theme;
    }
    const theme = await cmsRepo.getActiveTheme();
    return theme || (await cmsRepo.getThemeById(1));
  }

  async getPublicHomepage(schoolId = 1, previewThemeId = null) {
    const siteBundle = await this.getPublicSiteBundle(schoolId, previewThemeId);
    const sections = await cmsRepo.getSections(schoolId, true);
    const banners = await cmsRepo.getBanners(schoolId, true);
    const news = await cmsRepo.getNews(schoolId, true, 4);
    const events = await cmsRepo.getEvents(schoolId, true, 3);
    const gallery = await cmsRepo.getGalleryItems(schoolId, null, true);
    const facilities = await cmsRepo.getFacilities(schoolId, true);
    const testimonials = await cmsRepo.getTestimonials(schoolId, true);

    // Fetch existing live school statistics from existing tables
    let stats = {
      totalStudents: 2450,
      totalTeachers: 140,
      totalClasses: 36,
      academicPassRate: '99.4%',
      awardsWon: '85+',
      yearsOfExcellence: '28'
    };

    try {
      const [studentCount] = await pool.query('SELECT COUNT(*) as count FROM student');
      const [teacherCount] = await pool.query('SELECT COUNT(*) as count FROM teacher');
      const [classCount] = await pool.query('SELECT COUNT(*) as count FROM class');
      if (studentCount[0]?.count > 0) stats.totalStudents = studentCount[0].count;
      if (teacherCount[0]?.count > 0) stats.totalTeachers = teacherCount[0].count;
      if (classCount[0]?.count > 0) stats.totalClasses = classCount[0].count;
    } catch (e) {
      // Fallback to defaults
    }

    // Fetch live notices from noticeboard table
    let notices = [];
    try {
      const [rows] = await pool.query('SELECT * FROM noticeboard ORDER BY noticeboard_id DESC LIMIT 5');
      notices = rows;
    } catch (e) {
      notices = [];
    }

    // Fetch classes for academic preview
    let classes = [];
    try {
      const [rows] = await pool.query('SELECT class_id, name, numeric_name FROM class ORDER BY numeric_name ASC LIMIT 8');
      classes = rows;
    } catch (e) {
      classes = [];
    }

    return {
      site: siteBundle,
      sections,
      banners,
      stats,
      classes,
      facilities,
      news,
      events,
      notices,
      gallery: gallery.slice(0, 8),
      testimonials,
      settings: siteBundle.settings
    };
  }

  async getPublicPage(slug, schoolId = 1) {
    const page = await cmsRepo.getPageBySlug(slug, schoolId);
    if (!page || !page.is_published) {
      return null;
    }
    return page;
  }

  async getPublicNews(schoolId = 1, limit = 50) {
    return cmsRepo.getNews(schoolId, true, limit);
  }

  async getPublicNewsBySlug(slug, schoolId = 1) {
    const item = await cmsRepo.getNewsBySlug(slug, schoolId);
    if (!item || !item.is_published) return null;
    return item;
  }

  async getPublicEvents(schoolId = 1, limit = 50) {
    return cmsRepo.getEvents(schoolId, true, limit);
  }

  async getPublicGallery(schoolId = 1, categoryId = null) {
    const categories = await cmsRepo.getGalleryCategories(schoolId);
    const items = await cmsRepo.getGalleryItems(schoolId, categoryId, true);
    return {
      categories,
      items
    };
  }

  async getPublicFacilities(schoolId = 1) {
    return cmsRepo.getFacilities(schoolId, true);
  }

  async submitInquiry(data) {
    return cmsRepo.createInquiry(data);
  }
}

module.exports = new PublicService();
