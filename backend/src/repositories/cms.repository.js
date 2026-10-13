const pool = require('../config/db');

class CmsRepository {
  // -------------------------------------------------------------
  // THEMES
  // -------------------------------------------------------------
  async getAllThemes() {
    const [rows] = await pool.query('SELECT * FROM cms_themes ORDER BY theme_id ASC');
    return rows;
  }

  async getThemeById(themeId) {
    const [rows] = await pool.query('SELECT * FROM cms_themes WHERE theme_id = ?', [themeId]);
    return rows[0] || null;
  }

  async getActiveTheme() {
    const [rows] = await pool.query('SELECT * FROM cms_themes WHERE is_active = 1 LIMIT 1');
    return rows[0] || null;
  }

  async activateTheme(themeId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('UPDATE cms_themes SET is_active = 0');
      await connection.query('UPDATE cms_themes SET is_active = 1 WHERE theme_id = ?', [themeId]);
      await connection.commit();
      const [rows] = await connection.query('SELECT * FROM cms_themes WHERE theme_id = ?', [themeId]);
      return rows[0];
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async updateThemeConfig(themeId, data) {
    const { primary_color, secondary_color, accent_color, font_family, border_radius, config_json } = data;
    await pool.query(
      `UPDATE cms_themes SET 
        primary_color = COALESCE(?, primary_color),
        secondary_color = COALESCE(?, secondary_color),
        accent_color = COALESCE(?, accent_color),
        font_family = COALESCE(?, font_family),
        border_radius = COALESCE(?, border_radius),
        config_json = COALESCE(?, config_json)
      WHERE theme_id = ?`,
      [primary_color, secondary_color, accent_color, font_family, border_radius, typeof config_json === 'object' ? JSON.stringify(config_json) : config_json, themeId]
    );
    return this.getThemeById(themeId);
  }

  // -------------------------------------------------------------
  // SETTINGS
  // -------------------------------------------------------------
  async getSettings(schoolId = 1) {
    const [rows] = await pool.query('SELECT * FROM cms_settings WHERE school_id = ? LIMIT 1', [schoolId]);
    return rows[0] || null;
  }

  async updateSettings(schoolId = 1, data) {
    const keys = [
      'school_name', 'tagline', 'school_logo', 'favicon', 'principal_name', 
      'principal_title', 'principal_message', 'principal_image', 'address', 
      'phone', 'emergency_phone', 'email', 'website', 'social_links_json', 
      'maps_embed_url', 'footer_text', 'copyright_text', 'header_style', 'admissions_open'
    ];

    const updates = [];
    const values = [];

    keys.forEach(key => {
      if (data[key] !== undefined) {
        updates.push(`\`${key}\` = ?`);
        values.push(typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
    });

    if (updates.length > 0) {
      values.push(schoolId);
      await pool.query(`UPDATE cms_settings SET ${updates.join(', ')} WHERE school_id = ?`, values);
    }
    return this.getSettings(schoolId);
  }

  // -------------------------------------------------------------
  // HOMEPAGE SECTIONS
  // -------------------------------------------------------------
  async getSections(schoolId = 1, onlyEnabled = false) {
    let sql = 'SELECT * FROM cms_sections WHERE school_id = ?';
    const params = [schoolId];
    if (onlyEnabled) {
      sql += ' AND is_enabled = 1';
    }
    sql += ' ORDER BY display_order ASC, section_id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async updateSection(sectionId, data) {
    const fields = ['title', 'subtitle', 'content', 'layout_style', 'display_order', 'is_enabled', 'background_type', 'image_url', 'button_text', 'button_url', 'config_json'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (data[f] !== undefined) {
        updates.push(`\`${f}\` = ?`);
        values.push(typeof data[f] === 'object' ? JSON.stringify(data[f]) : data[f]);
      }
    });

    if (updates.length > 0) {
      values.push(sectionId);
      await pool.query(`UPDATE cms_sections SET ${updates.join(', ')} WHERE section_id = ?`, values);
    }
    const [rows] = await pool.query('SELECT * FROM cms_sections WHERE section_id = ?', [sectionId]);
    return rows[0];
  }

  async reorderSections(orders) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const item of orders) {
        await connection.query('UPDATE cms_sections SET display_order = ?, is_enabled = COALESCE(?, is_enabled) WHERE section_id = ?', [item.display_order, item.is_enabled, item.section_id]);
      }
      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // -------------------------------------------------------------
  // PAGES
  // -------------------------------------------------------------
  async getPages(schoolId = 1, onlyPublished = false) {
    let sql = 'SELECT * FROM cms_pages WHERE school_id = ?';
    const params = [schoolId];
    if (onlyPublished) {
      sql += ' AND is_published = 1';
    }
    sql += ' ORDER BY display_order ASC, page_id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getPageBySlug(slug, schoolId = 1) {
    const [rows] = await pool.query('SELECT * FROM cms_pages WHERE school_id = ? AND slug = ? LIMIT 1', [schoolId, slug]);
    return rows[0] || null;
  }

  async getPageById(pageId) {
    const [rows] = await pool.query('SELECT * FROM cms_pages WHERE page_id = ? LIMIT 1', [pageId]);
    return rows[0] || null;
  }

  async createPage(data) {
    const { school_id = 1, title, slug, subtitle, seo_title, seo_description, seo_keywords, featured_image, content, template_type = 'standard', is_published = 1, menu_visible = 1, display_order = 0 } = data;
    const [res] = await pool.query(
      `INSERT INTO cms_pages (school_id, title, slug, subtitle, seo_title, seo_description, seo_keywords, featured_image, content, template_type, is_published, menu_visible, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [school_id, title, slug, subtitle, seo_title || title, seo_description, seo_keywords, featured_image, content, template_type, is_published, menu_visible, display_order]
    );
    return this.getPageById(res.insertId);
  }

  async updatePage(pageId, data) {
    const fields = ['title', 'slug', 'subtitle', 'seo_title', 'seo_description', 'seo_keywords', 'featured_image', 'content', 'template_type', 'is_published', 'menu_visible', 'display_order'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (data[f] !== undefined) {
        updates.push(`\`${f}\` = ?`);
        values.push(data[f]);
      }
    });

    if (updates.length > 0) {
      values.push(pageId);
      await pool.query(`UPDATE cms_pages SET ${updates.join(', ')} WHERE page_id = ?`, values);
    }
    return this.getPageById(pageId);
  }

  async deletePage(pageId) {
    const [res] = await pool.query('DELETE FROM cms_pages WHERE page_id = ?', [pageId]);
    return res.affectedRows > 0;
  }

  // -------------------------------------------------------------
  // MENUS
  // -------------------------------------------------------------
  async getMenus(schoolId = 1, onlyActive = false) {
    let sql = 'SELECT * FROM cms_menus WHERE school_id = ?';
    const params = [schoolId];
    if (onlyActive) {
      sql += ' AND is_active = 1';
    }
    sql += ' ORDER BY parent_id ASC, display_order ASC, menu_id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createMenu(data) {
    const { school_id = 1, parent_id, title, route, external_url, target = '_self', display_order = 0, is_active = 1, is_mega_menu = 0, badge, icon } = data;
    const [res] = await pool.query(
      `INSERT INTO cms_menus (school_id, parent_id, title, route, external_url, target, display_order, is_active, is_mega_menu, badge, icon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [school_id, parent_id || null, title, route, external_url, target, display_order, is_active, is_mega_menu, badge, icon]
    );
    const [rows] = await pool.query('SELECT * FROM cms_menus WHERE menu_id = ?', [res.insertId]);
    return rows[0];
  }

  async updateMenu(menuId, data) {
    const fields = ['parent_id', 'title', 'route', 'external_url', 'target', 'display_order', 'is_active', 'is_mega_menu', 'badge', 'icon'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (data[f] !== undefined) {
        updates.push(`\`${f}\` = ?`);
        values.push(data[f] === '' ? null : data[f]);
      }
    });

    if (updates.length > 0) {
      values.push(menuId);
      await pool.query(`UPDATE cms_menus SET ${updates.join(', ')} WHERE menu_id = ?`, values);
    }
    const [rows] = await pool.query('SELECT * FROM cms_menus WHERE menu_id = ?', [menuId]);
    return rows[0];
  }

  async deleteMenu(menuId) {
    await pool.query('DELETE FROM cms_menus WHERE parent_id = ?', [menuId]);
    const [res] = await pool.query('DELETE FROM cms_menus WHERE menu_id = ?', [menuId]);
    return res.affectedRows > 0;
  }

  // -------------------------------------------------------------
  // BANNERS
  // -------------------------------------------------------------
  async getBanners(schoolId = 1, onlyActive = false) {
    let sql = 'SELECT * FROM cms_banners WHERE school_id = ?';
    const params = [schoolId];
    if (onlyActive) {
      sql += ' AND is_active = 1';
    }
    sql += ' ORDER BY display_order ASC, banner_id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createBanner(data) {
    const { school_id = 1, title, subtitle, description, image_url, mobile_image_url, badge_text, button_text, button_url, secondary_btn_text, secondary_btn_url, display_order = 0, is_active = 1, start_date, end_date } = data;
    const [res] = await pool.query(
      `INSERT INTO cms_banners (school_id, title, subtitle, description, image_url, mobile_image_url, badge_text, button_text, button_url, secondary_btn_text, secondary_btn_url, display_order, is_active, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [school_id, title, subtitle, description, image_url, mobile_image_url, badge_text, button_text, button_url, secondary_btn_text, secondary_btn_url, display_order, is_active, start_date || null, end_date || null]
    );
    const [rows] = await pool.query('SELECT * FROM cms_banners WHERE banner_id = ?', [res.insertId]);
    return rows[0];
  }

  async updateBanner(bannerId, data) {
    const fields = ['title', 'subtitle', 'description', 'image_url', 'mobile_image_url', 'badge_text', 'button_text', 'button_url', 'secondary_btn_text', 'secondary_btn_url', 'display_order', 'is_active', 'start_date', 'end_date'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (data[f] !== undefined) {
        updates.push(`\`${f}\` = ?`);
        values.push(data[f] === '' ? null : data[f]);
      }
    });

    if (updates.length > 0) {
      values.push(bannerId);
      await pool.query(`UPDATE cms_banners SET ${updates.join(', ')} WHERE banner_id = ?`, values);
    }
    const [rows] = await pool.query('SELECT * FROM cms_banners WHERE banner_id = ?', [bannerId]);
    return rows[0];
  }

  async deleteBanner(bannerId) {
    const [res] = await pool.query('DELETE FROM cms_banners WHERE banner_id = ?', [bannerId]);
    return res.affectedRows > 0;
  }

  // -------------------------------------------------------------
  // NEWS
  // -------------------------------------------------------------
  async getNews(schoolId = 1, onlyPublished = false, limit = 50) {
    let sql = 'SELECT * FROM cms_news WHERE school_id = ?';
    const params = [schoolId];
    if (onlyPublished) {
      sql += ' AND is_published = 1';
    }
    sql += ' ORDER BY published_at DESC, news_id DESC LIMIT ?';
    params.push(parseInt(limit, 10));
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getNewsBySlug(slug, schoolId = 1) {
    const [rows] = await pool.query('SELECT * FROM cms_news WHERE school_id = ? AND slug = ? LIMIT 1', [schoolId, slug]);
    return rows[0] || null;
  }

  async createNews(data) {
    const { school_id = 1, title, slug, summary, content, image_url, category = 'General', is_featured = 0, is_published = 1, published_at } = data;
    const [res] = await pool.query(
      `INSERT INTO cms_news (school_id, title, slug, summary, content, image_url, category, is_featured, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [school_id, title, slug, summary, content, image_url, category, is_featured, is_published, published_at || new Date().toISOString().slice(0, 10)]
    );
    const [rows] = await pool.query('SELECT * FROM cms_news WHERE news_id = ?', [res.insertId]);
    return rows[0];
  }

  async updateNews(newsId, data) {
    const fields = ['title', 'slug', 'summary', 'content', 'image_url', 'category', 'is_featured', 'is_published', 'published_at'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (data[f] !== undefined) {
        updates.push(`\`${f}\` = ?`);
        values.push(data[f]);
      }
    });

    if (updates.length > 0) {
      values.push(newsId);
      await pool.query(`UPDATE cms_news SET ${updates.join(', ')} WHERE news_id = ?`, values);
    }
    const [rows] = await pool.query('SELECT * FROM cms_news WHERE news_id = ?', [newsId]);
    return rows[0];
  }

  async deleteNews(newsId) {
    const [res] = await pool.query('DELETE FROM cms_news WHERE news_id = ?', [newsId]);
    return res.affectedRows > 0;
  }

  // -------------------------------------------------------------
  // EVENTS
  // -------------------------------------------------------------
  async getEvents(schoolId = 1, onlyPublished = false, limit = 50) {
    let sql = 'SELECT * FROM cms_events WHERE school_id = ?';
    const params = [schoolId];
    if (onlyPublished) {
      sql += ' AND is_published = 1';
    }
    sql += ' ORDER BY start_date ASC, event_id ASC LIMIT ?';
    params.push(parseInt(limit, 10));
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createEvent(data) {
    const { school_id = 1, title, slug, description, venue, start_date, end_date, time, image_url, category = 'Academic', registration_url, is_published = 1 } = data;
    const [res] = await pool.query(
      `INSERT INTO cms_events (school_id, title, slug, description, venue, start_date, end_date, time, image_url, category, registration_url, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [school_id, title, slug, description, venue, start_date, end_date || null, time, image_url, category, registration_url, is_published]
    );
    const [rows] = await pool.query('SELECT * FROM cms_events WHERE event_id = ?', [res.insertId]);
    return rows[0];
  }

  async updateEvent(eventId, data) {
    const fields = ['title', 'slug', 'description', 'venue', 'start_date', 'end_date', 'time', 'image_url', 'category', 'registration_url', 'is_published'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (data[f] !== undefined) {
        updates.push(`\`${f}\` = ?`);
        values.push(data[f] === '' ? null : data[f]);
      }
    });

    if (updates.length > 0) {
      values.push(eventId);
      await pool.query(`UPDATE cms_events SET ${updates.join(', ')} WHERE event_id = ?`, values);
    }
    const [rows] = await pool.query('SELECT * FROM cms_events WHERE event_id = ?', [eventId]);
    return rows[0];
  }

  async deleteEvent(eventId) {
    const [res] = await pool.query('DELETE FROM cms_events WHERE event_id = ?', [eventId]);
    return res.affectedRows > 0;
  }

  // -------------------------------------------------------------
  // GALLERY
  // -------------------------------------------------------------
  async getGalleryCategories(schoolId = 1) {
    const [rows] = await pool.query('SELECT * FROM cms_gallery_categories WHERE school_id = ? ORDER BY category_id ASC', [schoolId]);
    return rows;
  }

  async getGalleryItems(schoolId = 1, categoryId = null, onlyPublished = false) {
    let sql = `
      SELECT g.*, c.name as category_name, c.slug as category_slug 
      FROM cms_gallery g
      LEFT JOIN cms_gallery_categories c ON g.category_id = c.category_id
      WHERE g.school_id = ?
    `;
    const params = [schoolId];
    if (categoryId) {
      sql += ' AND g.category_id = ?';
      params.push(categoryId);
    }
    if (onlyPublished) {
      sql += ' AND g.is_published = 1';
    }
    sql += ' ORDER BY g.display_order ASC, g.gallery_id DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async createGalleryItem(data) {
    const { school_id = 1, category_id, title, description, image_url, video_url, media_type = 'image', display_order = 0, is_published = 1 } = data;
    const [res] = await pool.query(
      `INSERT INTO cms_gallery (school_id, category_id, title, description, image_url, video_url, media_type, display_order, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [school_id, category_id || null, title, description, image_url, video_url, media_type, display_order, is_published]
    );
    const [rows] = await pool.query('SELECT * FROM cms_gallery WHERE gallery_id = ?', [res.insertId]);
    return rows[0];
  }

  async updateGalleryItem(galleryId, data) {
    const fields = ['category_id', 'title', 'description', 'image_url', 'video_url', 'media_type', 'display_order', 'is_published'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (data[f] !== undefined) {
        updates.push(`\`${f}\` = ?`);
        values.push(data[f] === '' ? null : data[f]);
      }
    });

    if (updates.length > 0) {
      values.push(galleryId);
      await pool.query(`UPDATE cms_gallery SET ${updates.join(', ')} WHERE gallery_id = ?`, values);
    }
    const [rows] = await pool.query('SELECT * FROM cms_gallery WHERE gallery_id = ?', [galleryId]);
    return rows[0];
  }

  async deleteGalleryItem(galleryId) {
    const [res] = await pool.query('DELETE FROM cms_gallery WHERE gallery_id = ?', [galleryId]);
    return res.affectedRows > 0;
  }

  // -------------------------------------------------------------
  // FACILITIES & TESTIMONIALS
  // -------------------------------------------------------------
  async getFacilities(schoolId = 1, onlyActive = true) {
    let sql = 'SELECT * FROM cms_facilities WHERE school_id = ?';
    const params = [schoolId];
    if (onlyActive) sql += ' AND is_active = 1';
    sql += ' ORDER BY display_order ASC, facility_id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async getTestimonials(schoolId = 1, onlyActive = true) {
    let sql = 'SELECT * FROM cms_testimonials WHERE school_id = ?';
    const params = [schoolId];
    if (onlyActive) sql += ' AND is_active = 1';
    sql += ' ORDER BY display_order ASC, testimonial_id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // -------------------------------------------------------------
  // INQUIRIES
  // -------------------------------------------------------------
  async createInquiry(data) {
    const { school_id = 1, name, email, phone, subject, message } = data;
    const [res] = await pool.query(
      `INSERT INTO cms_inquiries (school_id, name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [school_id, name, email, phone, subject, message]
    );
    return { inquiry_id: res.insertId, ...data };
  }

  async getInquiries(schoolId = 1) {
    const [rows] = await pool.query('SELECT * FROM cms_inquiries WHERE school_id = ? ORDER BY created_at DESC', [schoolId]);
    return rows;
  }

  // -------------------------------------------------------------
  // MEDIA LIBRARY
  // -------------------------------------------------------------
  async getMedia(schoolId = 1) {
    const [rows] = await pool.query('SELECT * FROM cms_media WHERE school_id = ? ORDER BY created_at DESC', [schoolId]);
    return rows;
  }

  async createMedia(data) {
    const { school_id = 1, file_name, original_name, file_path, file_size, file_type, mime_type, alt_text } = data;
    const [res] = await pool.query(
      `INSERT INTO cms_media (school_id, file_name, original_name, file_path, file_size, file_type, mime_type, alt_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [school_id, file_name, original_name, file_path, file_size, file_type, mime_type, alt_text]
    );
    const [rows] = await pool.query('SELECT * FROM cms_media WHERE media_id = ?', [res.insertId]);
    return rows[0];
  }

  async deleteMedia(mediaId) {
    const [res] = await pool.query('DELETE FROM cms_media WHERE media_id = ?', [mediaId]);
    return res.affectedRows > 0;
  }
}

module.exports = new CmsRepository();
