const publicService = require('../services/public.service');

class PublicController {
  async getSiteBundle(req, res, next) {
    try {
      const data = await publicService.getPublicSiteBundle(req.query.school_id || 1, req.query.preview_theme);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getTheme(req, res, next) {
    try {
      const theme = await publicService.getPublicTheme(req.query.preview_theme);
      res.json({ success: true, data: theme });
    } catch (err) {
      next(err);
    }
  }

  async getHomepage(req, res, next) {
    try {
      const data = await publicService.getPublicHomepage(req.query.school_id || 1, req.query.preview_theme);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getPageBySlug(req, res, next) {
    try {
      const page = await publicService.getPublicPage(req.params.slug, req.query.school_id || 1);
      if (!page) {
        return res.status(404).json({ success: false, message: 'Page not found' });
      }
      res.json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  async getNews(req, res, next) {
    try {
      const news = await publicService.getPublicNews(req.query.school_id || 1, req.query.limit || 50);
      res.json({ success: true, data: news });
    } catch (err) {
      next(err);
    }
  }

  async getNewsBySlug(req, res, next) {
    try {
      const newsItem = await publicService.getPublicNewsBySlug(req.params.slug, req.query.school_id || 1);
      if (!newsItem) return res.status(404).json({ success: false, message: 'News article not found' });
      res.json({ success: true, data: newsItem });
    } catch (err) {
      next(err);
    }
  }

  async getEvents(req, res, next) {
    try {
      const events = await publicService.getPublicEvents(req.query.school_id || 1, req.query.limit || 50);
      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  }

  async getGallery(req, res, next) {
    try {
      const gallery = await publicService.getPublicGallery(req.query.school_id || 1, req.query.category_id || null);
      res.json({ success: true, data: gallery });
    } catch (err) {
      next(err);
    }
  }

  async getFacilities(req, res, next) {
    try {
      const facilities = await publicService.getPublicFacilities(req.query.school_id || 1);
      res.json({ success: true, data: facilities });
    } catch (err) {
      next(err);
    }
  }

  async submitInquiry(req, res, next) {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
      }
      const inquiry = await publicService.submitInquiry(req.body);
      res.status(201).json({
        success: true,
        message: 'Thank you! Your inquiry has been submitted successfully. Our admissions team will contact you shortly.',
        data: inquiry
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PublicController();
