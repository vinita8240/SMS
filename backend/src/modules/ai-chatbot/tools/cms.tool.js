const pool = require('../../../config/db');

class CmsTool {
  /**
   * Convert HTML string into clean, readable Markdown
   */
  htmlToMarkdown(html) {
    if (!html) return '';
    let text = html
      // Replace headings
      .replace(/<h[1-2][^>]*>(.*?)<\/h[1-2]>/gi, '\n### $1\n')
      .replace(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/gi, '\n**$1**\n')
      // Replace list items
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '* $1\n')
      // Replace paragraphs & line breaks
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*[\/]?>/gi, '\n')
      // Replace strong & em
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      // Strip remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

    // Normalize multiple newlines and spaces
    return text.replace(/\n{3,}/g, '\n\n').trim();
  }

  async getSchoolInformation() {
    try {
      const [cmsSettings] = await pool.query('SELECT * FROM cms_settings WHERE school_id = 1 LIMIT 1');
      const [generalSettings] = await pool.query('SELECT type, description FROM settings');
      
      const generalMap = {};
      if (generalSettings && generalSettings.length > 0) {
        generalSettings.forEach(g => {
          generalMap[g.type] = g.description;
        });
      }

      const settings = cmsSettings && cmsSettings.length > 0 ? cmsSettings[0] : {};

      return {
        schoolName: settings.school_name || generalMap['system_name'] || generalMap['system_title'] || 'Mount Carmel International School',
        tagline: settings.tagline || 'Excellence in Education & Character Building',
        principalName: settings.principal_name || 'Dr. Margaret E. Harrison, Ph.D.',
        principalTitle: settings.principal_title || 'Principal & Managing Director',
        principalMessage: settings.principal_message || 'Welcome to our institution, dedicated to nurturing young minds with academic rigor and character.',
        address: settings.address || generalMap['address'] || '450 University Boulevard, Academic City, California 90210, USA',
        phone: settings.phone || generalMap['phone'] || '+1 (800) 555-0199',
        emergencyPhone: settings.emergency_phone || '+1 (800) 555-0198',
        email: settings.email || generalMap['system_email'] || 'admissions@mountcarmel.edu',
        website: settings.website || 'https://mountcarmel.edu',
        timings: 'Monday to Friday: 8:00 AM – 2:30 PM (Office: 8:00 AM – 4:00 PM, Saturday: 9:00 AM – 1:00 PM)',
        admissionsOpen: settings.admissions_open !== 0
      };
    } catch (err) {
      return {
        schoolName: 'Mount Carmel International School',
        tagline: 'Excellence in Education',
        timings: 'Monday to Friday: 8:00 AM – 2:30 PM',
        phone: '+1 (800) 555-0199',
        email: 'info@mountcarmel.edu'
      };
    }
  }

  async getCMSPageBySlug(slug) {
    const [rows] = await pool.query('SELECT page_id, title, slug, subtitle, content FROM cms_pages WHERE slug = ? LIMIT 1', [slug]);
    if (rows.length === 0) return null;
    const page = rows[0];
    return {
      ...page,
      markdownContent: this.htmlToMarkdown(page.content)
    };
  }

  async getCMSPage({ slug = null, title = null }) {
    let sql = 'SELECT page_id, title, slug, subtitle, content FROM cms_pages WHERE is_published = 1';
    const params = [];

    if (slug) {
      sql += ' AND slug = ?';
      params.push(slug);
    } else if (title) {
      sql += ' AND (title LIKE ? OR content LIKE ? OR slug LIKE ?)';
      params.push(`%${title}%`, `%${title}%`, `%${title}%`);
    }

    sql += ' LIMIT 1';
    const [rows] = await pool.query(sql, params);
    if (rows.length === 0) return null;
    const page = rows[0];
    return {
      ...page,
      markdownContent: this.htmlToMarkdown(page.content)
    };
  }

  async getCoursesAndSubjects() {
    const [subjects] = await pool.query(`
      SELECT 
        s.subject_id, s.name AS subject_name,
        c.name AS class_name, c.name_numeric,
        t.name AS teacher_name
      FROM subject s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN teacher t ON s.teacher_id = t.teacher_id
      ORDER BY c.name_numeric ASC, s.name ASC
    `);

    const academicsPage = await this.getCMSPageBySlug('academics');

    const [classes] = await pool.query('SELECT class_id, name, name_numeric FROM class ORDER BY name_numeric ASC');

    return {
      subjects,
      classes,
      programOverview: academicsPage ? academicsPage.markdownContent : null
    };
  }

  async getLibraryInfo() {
    try {
      const [totalBooks] = await pool.query('SELECT COUNT(*) as total, SUM(quantity) as total_copies, SUM(available_quantity) as available FROM book');
      const [categories] = await pool.query('SELECT name FROM book_category ORDER BY name ASC');
      const [sampleBooks] = await pool.query('SELECT name, author, subject FROM book LIMIT 6');

      return {
        totalTitles: totalBooks[0]?.total || 0,
        totalCopies: totalBooks[0]?.total_copies || 0,
        availableCopies: totalBooks[0]?.available || 0,
        categories: categories.map(c => c.name),
        sampleBooks
      };
    } catch {
      return null;
    }
  }

  async getTransportInfo() {
    try {
      const [routes] = await pool.query('SELECT route_name, start_place, stop_place, route_fare FROM transport_route');
      const [vehicles] = await pool.query('SELECT vehicle_number, vehicle_model, driver_name, driver_phone FROM vehicle');
      return { routes, vehicles };
    } catch {
      return null;
    }
  }

  async getHostelInfo() {
    try {
      const [dormitories] = await pool.query('SELECT name, type, address, capacity FROM dormitory');
      const [rooms] = await pool.query('SELECT room_no, room_type, cost FROM hostel_room LIMIT 6');
      return { dormitories, rooms };
    } catch {
      return null;
    }
  }

  async getClubsAndActivities() {
    try {
      const [clubs] = await pool.query('SELECT name, description FROM club');
      const [activities] = await pool.query('SELECT title, date, description FROM activity ORDER BY date DESC LIMIT 5');
      return { clubs, activities };
    } catch {
      return null;
    }
  }

  async getCMSNews(params = {}) {
    const limit = typeof params === 'number' ? params : (params?.limit || 5);
    const search = typeof params === 'object' ? (params?.search || null) : null;
    let sql = 'SELECT news_id, title, summary, content, category, published_at FROM cms_news WHERE is_published = 1';
    const queryParams = [];

    if (search) {
      sql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY published_at DESC LIMIT ?';
    queryParams.push(limit);

    const [rows] = await pool.query(sql, queryParams);
    return rows;
  }

  async getCMSGallery(params = {}) {
    const { category = null, limit = 8 } = params || {};
    let sql = `
      SELECT g.gallery_id, g.title, g.description, g.image_url, c.name as category_name
      FROM cms_gallery g
      LEFT JOIN cms_gallery_categories c ON g.category_id = c.category_id
      WHERE g.is_published = 1
    `;
    const queryParams = [];

    if (category) {
      sql += ' AND (c.name LIKE ? OR c.slug LIKE ?)';
      queryParams.push(`%${category}%`, `%${category}%`);
    }

    sql += ' ORDER BY g.display_order ASC, g.gallery_id DESC LIMIT ?';
    queryParams.push(limit);

    const [rows] = await pool.query(sql, queryParams);
    return rows;
  }

  async getCMSFacilities() {
    try {
      const [rows] = await pool.query('SELECT * FROM cms_facilities WHERE is_active = 1 ORDER BY display_order ASC');
      if (rows.length > 0) return rows;
      
      const facilitiesPage = await this.getCMSPageBySlug('facilities');
      return facilitiesPage ? [{ title: 'Campus Facilities', description: facilitiesPage.markdownContent }] : [];
    } catch {
      return [];
    }
  }

  async getEnquiriesCount() {
    try {
      const [cmsInquiries] = await pool.query('SELECT COUNT(*) as count FROM cms_inquiries');
      const [adminEnquiries] = await pool.query('SELECT COUNT(*) as count FROM enquiry');
      const [recent] = await pool.query('SELECT name, email, phone, subject, created_at FROM cms_inquiries ORDER BY inquiry_id DESC LIMIT 5');
      return {
        total: (cmsInquiries[0]?.count || 0) + (adminEnquiries[0]?.count || 0),
        recent
      };
    } catch {
      return { total: 0, recent: [] };
    }
  }
}

module.exports = new CmsTool();
