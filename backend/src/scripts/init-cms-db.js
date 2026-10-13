const pool = require('../config/db');

async function initCmsDatabase() {
  console.log('[CMS Init] Starting CMS database migration and seeding...');
  const connection = await pool.getConnection();

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. CMS Themes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_themes\` (
        \`theme_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`theme_name\` varchar(100) NOT NULL,
        \`slug\` varchar(50) NOT NULL UNIQUE,
        \`description\` text DEFAULT NULL,
        \`preview_image\` varchar(255) DEFAULT NULL,
        \`is_active\` tinyint(1) NOT NULL DEFAULT 0,
        \`is_default\` tinyint(1) NOT NULL DEFAULT 0,
        \`primary_color\` varchar(20) DEFAULT '#0041c2',
        \`secondary_color\` varchar(20) DEFAULT '#f5f7fa',
        \`accent_color\` varchar(20) DEFAULT '#ffb703',
        \`font_family\` varchar(50) DEFAULT 'Inter',
        \`border_radius\` varchar(20) DEFAULT '8px',
        \`config_json\` longtext DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`theme_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. CMS Website Settings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_settings\` (
        \`setting_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`school_name\` varchar(191) NOT NULL DEFAULT 'Mount Carmel International School',
        \`tagline\` varchar(255) DEFAULT 'Empowering Minds, Shaping Global Leaders Since 1998',
        \`school_logo\` varchar(255) DEFAULT '/logo.png',
        \`favicon\` varchar(255) DEFAULT '/favicon.ico',
        \`principal_name\` varchar(191) DEFAULT 'Dr. Margaret E. Harrison, Ph.D.',
        \`principal_title\` varchar(191) DEFAULT 'Principal & Managing Director',
        \`principal_message\` text DEFAULT NULL,
        \`principal_image\` varchar(255) DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        \`address\` text DEFAULT '450 University Boulevard, Academic City, California 90210, USA',
        \`phone\` varchar(50) DEFAULT '+1 (800) 555-0199',
        \`emergency_phone\` varchar(50) DEFAULT '+1 (800) 555-0911',
        \`email\` varchar(100) DEFAULT 'admissions@mountcarmel.edu',
        \`website\` varchar(191) DEFAULT 'https://mountcarmel.edu',
        \`social_links_json\` longtext DEFAULT NULL,
        \`maps_embed_url\` text DEFAULT NULL,
        \`footer_text\` text DEFAULT NULL,
        \`copyright_text\` varchar(255) DEFAULT '© 2026 Mount Carmel International School. All Rights Reserved. Powered by Samarth Technology.',
        \`header_style\` varchar(50) DEFAULT 'default',
        \`admissions_open\` tinyint(1) DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`setting_id\`),
        UNIQUE KEY \`idx_cms_school\` (\`school_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. CMS Homepage Sections Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_sections\` (
        \`section_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`section_key\` varchar(50) NOT NULL,
        \`title\` varchar(191) NOT NULL,
        \`subtitle\` varchar(255) DEFAULT NULL,
        \`content\` longtext DEFAULT NULL,
        \`layout_style\` varchar(50) DEFAULT 'grid-3',
        \`display_order\` int(11) NOT NULL DEFAULT 0,
        \`is_enabled\` tinyint(1) NOT NULL DEFAULT 1,
        \`background_type\` varchar(50) DEFAULT 'light',
        \`image_url\` varchar(255) DEFAULT NULL,
        \`button_text\` varchar(100) DEFAULT NULL,
        \`button_url\` varchar(255) DEFAULT NULL,
        \`config_json\` longtext DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`section_id\`),
        KEY \`idx_sec_order\` (\`display_order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. CMS Dynamic Pages Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_pages\` (
        \`page_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`title\` varchar(191) NOT NULL,
        \`slug\` varchar(191) NOT NULL,
        \`subtitle\` varchar(255) DEFAULT NULL,
        \`seo_title\` varchar(191) DEFAULT NULL,
        \`seo_description\` text DEFAULT NULL,
        \`seo_keywords\` varchar(255) DEFAULT NULL,
        \`featured_image\` varchar(255) DEFAULT NULL,
        \`content\` longtext NOT NULL,
        \`template_type\` varchar(50) DEFAULT 'standard',
        \`is_published\` tinyint(1) NOT NULL DEFAULT 1,
        \`menu_visible\` tinyint(1) NOT NULL DEFAULT 1,
        \`display_order\` int(11) NOT NULL DEFAULT 0,
        \`published_at\` datetime DEFAULT current_timestamp(),
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`page_id\`),
        UNIQUE KEY \`idx_cms_slug\` (\`school_id\`, \`slug\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. CMS Menus Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_menus\` (
        \`menu_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`parent_id\` int(11) DEFAULT NULL,
        \`title\` varchar(100) NOT NULL,
        \`route\` varchar(255) DEFAULT NULL,
        \`external_url\` varchar(255) DEFAULT NULL,
        \`target\` varchar(20) DEFAULT '_self',
        \`display_order\` int(11) NOT NULL DEFAULT 0,
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`is_mega_menu\` tinyint(1) NOT NULL DEFAULT 0,
        \`badge\` varchar(50) DEFAULT NULL,
        \`icon\` varchar(50) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`menu_id\`),
        KEY \`idx_menu_parent\` (\`parent_id\`),
        KEY \`idx_menu_order\` (\`display_order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. CMS Banners / Sliders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_banners\` (
        \`banner_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`title\` varchar(191) NOT NULL,
        \`subtitle\` varchar(255) DEFAULT NULL,
        \`description\` text DEFAULT NULL,
        \`image_url\` varchar(255) NOT NULL,
        \`mobile_image_url\` varchar(255) DEFAULT NULL,
        \`badge_text\` varchar(100) DEFAULT NULL,
        \`button_text\` varchar(100) DEFAULT 'Explore Academics',
        \`button_url\` varchar(255) DEFAULT '/site/academics',
        \`secondary_btn_text\` varchar(100) DEFAULT 'Apply Online',
        \`secondary_btn_url\` varchar(255) DEFAULT '/site/admissions',
        \`display_order\` int(11) NOT NULL DEFAULT 0,
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`start_date\` date DEFAULT NULL,
        \`end_date\` date DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`banner_id\`),
        KEY \`idx_banner_order\` (\`display_order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. CMS News Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_news\` (
        \`news_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`title\` varchar(191) NOT NULL,
        \`slug\` varchar(191) NOT NULL,
        \`summary\` text DEFAULT NULL,
        \`content\` longtext NOT NULL,
        \`image_url\` varchar(255) DEFAULT NULL,
        \`category\` varchar(100) DEFAULT 'General',
        \`is_featured\` tinyint(1) NOT NULL DEFAULT 0,
        \`is_published\` tinyint(1) NOT NULL DEFAULT 1,
        \`published_at\` date DEFAULT current_timestamp(),
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`news_id\`),
        UNIQUE KEY \`idx_news_slug\` (\`school_id\`, \`slug\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. CMS Events Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_events\` (
        \`event_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`title\` varchar(191) NOT NULL,
        \`slug\` varchar(191) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`venue\` varchar(191) DEFAULT 'Main Auditorium',
        \`start_date\` date NOT NULL,
        \`end_date\` date DEFAULT NULL,
        \`time\` varchar(50) DEFAULT '09:00 AM - 02:00 PM',
        \`image_url\` varchar(255) DEFAULT NULL,
        \`category\` varchar(100) DEFAULT 'Academic',
        \`registration_url\` varchar(255) DEFAULT NULL,
        \`is_published\` tinyint(1) NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`event_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. CMS Gallery Categories & Gallery Media
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_gallery_categories\` (
        \`category_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`name\` varchar(100) NOT NULL,
        \`slug\` varchar(100) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`cover_image\` varchar(255) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`category_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_gallery\` (
        \`gallery_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`category_id\` int(11) DEFAULT NULL,
        \`title\` varchar(191) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`image_url\` varchar(255) NOT NULL,
        \`video_url\` varchar(255) DEFAULT NULL,
        \`media_type\` enum('image','video') DEFAULT 'image',
        \`display_order\` int(11) NOT NULL DEFAULT 0,
        \`is_published\` tinyint(1) NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`gallery_id\`),
        KEY \`idx_gal_cat\` (\`category_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. CMS Facilities Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_facilities\` (
        \`facility_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`title\` varchar(100) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`icon\` varchar(50) DEFAULT '🏫',
        \`image_url\` varchar(255) DEFAULT NULL,
        \`display_order\` int(11) NOT NULL DEFAULT 0,
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`facility_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. CMS Testimonials Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_testimonials\` (
        \`testimonial_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`author_name\` varchar(100) NOT NULL,
        \`author_role\` varchar(100) NOT NULL DEFAULT 'Parent',
        \`author_avatar\` varchar(255) DEFAULT NULL,
        \`content\` text NOT NULL,
        \`rating\` int(1) DEFAULT 5,
        \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
        \`display_order\` int(11) NOT NULL DEFAULT 0,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`testimonial_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 12. CMS Media Library Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_media\` (
        \`media_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`file_name\` varchar(255) NOT NULL,
        \`original_name\` varchar(255) NOT NULL,
        \`file_path\` varchar(255) NOT NULL,
        \`file_size\` int(11) DEFAULT 0,
        \`file_type\` varchar(50) DEFAULT 'image',
        \`mime_type\` varchar(100) DEFAULT 'image/jpeg',
        \`alt_text\` varchar(255) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`media_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 13. Public Contact Inquiries Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`cms_inquiries\` (
        \`inquiry_id\` int(11) NOT NULL AUTO_INCREMENT,
        \`school_id\` int(11) NOT NULL DEFAULT 1,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(100) NOT NULL,
        \`phone\` varchar(50) DEFAULT NULL,
        \`subject\` varchar(191) DEFAULT NULL,
        \`message\` text NOT NULL,
        \`status\` enum('new','in_review','resolved') DEFAULT 'new',
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`inquiry_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // =========================================================================
    // SEED INITIAL DATA IF TABLES ARE EMPTY
    // =========================================================================

    // 1. Seed Themes
    const [existingThemes] = await connection.query('SELECT COUNT(*) as count FROM cms_themes');
    if (existingThemes[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_themes\` (\`theme_id\`, \`theme_name\`, \`slug\`, \`description\`, \`preview_image\`, \`is_active\`, \`is_default\`, \`primary_color\`, \`secondary_color\`, \`accent_color\`, \`font_family\`, \`border_radius\`, \`config_json\`) VALUES
        (1, 'Modern Academic', 'theme-1', 'Clean professional design with crisp white background, collegiate navy & crimson accents, KPI counter strip, course grids, and modern academic layout.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80', 1, 1, '#1e3a8a', '#f8fafc', '#dc2626', 'Inter', '8px', '{"headerStyle":"solid","heroStyle":"banner","cardStyle":"elevated","buttonShape":"rounded"}'),
        (2, 'Premium School', 'theme-2', 'Luxury private academy aesthetic with deep forest emerald & rich gold, serif typography, principal message feature, floating cards, and prestige heritage feel.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80', 0, 0, '#064e3b', '#faf5ef', '#d97706', 'Playfair Display', '16px', '{"headerStyle":"glass","heroStyle":"fullscreen","cardStyle":"luxury-border","buttonShape":"pill"}'),
        (3, 'Colorful Education', 'theme-3', 'Bright, cheerful and playful design for primary/K-12 schools with colorful gradient cards, rounded components, activity bubbles, and friendly interactive elements.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80', 0, 0, '#7c3aed', '#fef2f2', '#f59e0b', 'Outfit', '24px', '{"headerStyle":"colorful","heroStyle":"playful-shapes","cardStyle":"bubbly","buttonShape":"squircle"}'),
        (4, 'Institutional', 'theme-4', 'Formal university/college design with structured hierarchical navigation, burgundy & slate palette, department directories, NAAC/NIRF badges, and official documents ticker.', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80', 0, 0, '#881337', '#f1f5f9', '#2563eb', 'Roboto', '4px', '{"headerStyle":"classic-gov","heroStyle":"split-info","cardStyle":"sharp-bordered","buttonShape":"sharp"}'),
        (5, 'Minimal / Modern', 'theme-5', 'Ultra-modern brutalist-minimal aesthetic with generous whitespace, high-contrast monochrome + electric cobalt accent, sleek news timeline, and clean editorial structure.', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80', 0, 0, '#0f172a', '#ffffff', '#2563eb', 'Plus Jakarta Sans', '0px', '{"headerStyle":"minimal-border","heroStyle":"typography-bold","cardStyle":"flat-border","buttonShape":"square"}');
      `);
    }

    // 2. Seed Settings
    const [existingSettings] = await connection.query('SELECT COUNT(*) as count FROM cms_settings');
    if (existingSettings[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_settings\` 
        (\`school_id\`, \`school_name\`, \`tagline\`, \`school_logo\`, \`favicon\`, \`principal_name\`, \`principal_title\`, \`principal_message\`, \`principal_image\`, \`address\`, \`phone\`, \`emergency_phone\`, \`email\`, \`website\`, \`social_links_json\`, \`maps_embed_url\`, \`footer_text\`, \`copyright_text\`, \`admissions_open\`) 
        VALUES 
        (1, 'Mount Carmel International School', 'Empowering Minds, Shaping Global Leaders Since 1998', '/logo.png', '/favicon.ico', 'Dr. Margaret E. Harrison, Ph.D.', 'Principal & Managing Director', 
        'Welcome to Mount Carmel International School. For over two decades, our institution has been dedicated to cultivating intellectual curiosity, ethical character, and innovative thinking in our students. We believe in holistic education that marries academic excellence with artistic expression, sportsmanship, and community leadership.',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        '450 University Boulevard, Academic City, California 90210, USA',
        '+1 (800) 555-0199',
        '+1 (800) 555-0911',
        'admissions@mountcarmel.edu',
        'https://mountcarmel.edu',
        '{"facebook":"https://facebook.com","twitter":"https://twitter.com","instagram":"https://instagram.com","linkedin":"https://linkedin.com","youtube":"https://youtube.com"}',
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.733256133742!2d-118.4451811!3d34.068921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc85f0394017%3A0x6b30644e5cc9f7a7!2sUniversity%20of%20California%2C%20Los%20Angeles!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus',
        'Mount Carmel International School is an accredited global K-12 academic community empowering students with world-class faculty, modern labs, and high-impact extracurricular programs.',
        '© 2026 Mount Carmel International School. All Rights Reserved. Powered by Samarth Technology.',
        1);
      `);
    }

    // 3. Seed Homepage Sections
    const [existingSections] = await connection.query('SELECT COUNT(*) as count FROM cms_sections');
    if (existingSections[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_sections\` (\`school_id\`, \`section_key\`, \`title\`, \`subtitle\`, \`content\`, \`layout_style\`, \`display_order\`, \`is_enabled\`, \`background_type\`, \`image_url\`, \`button_text\`, \`button_url\`) VALUES
        (1, 'hero', 'Empowering Minds, Shaping Global Leaders', 'Admissions Open for Academic Session 2026-2027. Experience World-Class Holistic Education.', '', 'slider', 1, 1, 'dark', '/logo.png', 'Apply for Admission', '/site/admissions'),
        (1, 'welcome_stats', 'Excellence in Numbers', 'Over 28 years of academic distinction, innovation, and global achievement', '', 'kpi-grid', 2, 1, 'light', NULL, 'Discover More', '/site/p/about-us'),
        (1, 'about_school', 'About Mount Carmel School', 'Fostering Academic Brilliance, Creativity, and Character', 'Founded with a vision to provide world-class education, Mount Carmel International School fosters a culture of lifelong learning, innovative discovery, and ethical leadership.', 'split-image', 3, 1, 'white', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', 'Read Our Story', '/site/p/about-us'),
        (1, 'principal_message', 'Message From Our Principal', 'Dr. Margaret E. Harrison, Ph.D.', 'Our mission is to empower each learner to discover their unique potential, cultivate intellectual courage, and contribute meaningfully to our global society.', 'letter-card', 4, 1, 'muted', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', 'Read Full Message', '/site/p/principal-message'),
        (1, 'academics', 'Academic Programs & Curriculum', 'Comprehensive STEAM, Humanities, and International Baccalaureate curricula', '', 'cards-grid', 5, 1, 'light', NULL, 'View All Curricula', '/site/p/academics'),
        (1, 'facilities', 'State-of-the-Art Campus Facilities', 'Modern infrastructure designed for exploration, safety, and physical wellness', '', 'feature-grid', 6, 1, 'white', NULL, 'Explore Campus', '/site/p/facilities'),
        (1, 'why_choose_us', 'Why Choose Mount Carmel?', 'What sets our institution apart in modern global education', '', 'icon-boxes', 7, 1, 'light', NULL, 'Download Prospectus', '/site/admissions'),
        (1, 'news_events', 'Campus News & Upcoming Events', 'Stay connected with our vibrant community activities and milestone achievements', '', 'tabbed-feed', 8, 1, 'white', NULL, 'View All News', '/site/news'),
        (1, 'notices', 'Important Announcements & Circulars', 'Official notifications, examination schedules, and parent circulars', '', 'ticker-box', 9, 1, 'accent', NULL, 'All Notices', '/site/notices'),
        (1, 'gallery', 'Campus Life in Pictures', 'Capturing inspiring moments of learning, sports, and cultural festivals', '', 'masonry-grid', 10, 1, 'light', NULL, 'View Full Gallery', '/site/gallery'),
        (1, 'testimonials', 'Words From Our Community', 'What parents, alumni, and students say about their journey with us', '', 'carousel', 11, 1, 'white', NULL, NULL, NULL),
        (1, 'cta_admissions', 'Begin Your Child’s Journey of Excellence Today', 'Applications for Grade Pre-K through Grade 12 are now being reviewed. Limited seats available for 2026-27.', '', 'banner-box', 12, 1, 'primary', NULL, 'Start Online Application', '/site/admissions'),
        (1, 'contact_map', 'Visit Our Campus', 'We welcome prospective families for personalized guided campus tours', '', 'split-form-map', 13, 1, 'light', NULL, 'Schedule Campus Tour', '/site/contact');
      `);
    }

    // 4. Seed Dynamic Pages
    const [existingPages] = await connection.query('SELECT COUNT(*) as count FROM cms_pages');
    if (existingPages[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_pages\` (\`school_id\`, \`title\`, \`slug\`, \`subtitle\`, \`seo_title\`, \`seo_description\`, \`featured_image\`, \`content\`, \`template_type\`, \`is_published\`, \`menu_visible\`, \`display_order\`) VALUES
        (1, 'About Us', 'about-us', 'Discover our 28-year legacy of academic innovation and values-based education', 'About Us | Mount Carmel International School', 'Learn about Mount Carmel International School, our rich history, leadership, and educational philosophy.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80', 
        '<h2>Welcome to Mount Carmel International School</h2><p>Established in 1998, Mount Carmel International School has evolved into one of the countrys premier educational institutions. We serve over 2,500 students from diverse cultural backgrounds across Kindergarten through Grade 12.</p><h3>Our Educational Philosophy</h3><p>We nurture intellectual inquiry, critical problem solving, emotional resilience, and community responsibility. Our students consistently excel in national and international competitive examinations, sports championships, and cultural festivals.</p><h3>Accreditation & Recognition</h3><p>Mount Carmel is fully accredited by the National Board of Education, the International Baccalaureate Organization (IBO), and affiliated with leading global education consortia.</p>', 'standard', 1, 1, 1),
        
        (1, 'Principal Message', 'principal-message', 'Guiding the next generation toward excellence and integrity', 'Principal Message | Mount Carmel School', 'Read the official message from Principal Dr. Margaret E. Harrison.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
        '<h2>Dear Students, Parents, and Esteemed Visitors,</h2><p>It is my distinct privilege to welcome you to Mount Carmel International School. Education at our institution is not merely the transmission of textbook knowledge; it is the ignition of an inquisitive spirit and the cultivation of compassionate character.</p><p>As we navigate a rapidly evolving technological era, our dedicated faculty ensures that every student is equipped with digital fluency, scientific acumen, creative empathy, and strong moral grounding. We partner closely with parents to foster an environment where children feel secure, inspired, and motivated to achieve their highest aspirations.</p><p>Warmest regards,<br><strong>Dr. Margaret E. Harrison, Ph.D.</strong><br><em>Principal & Managing Director</em></p>', 'letter', 1, 1, 2),

        (1, 'Vision & Mission', 'vision-mission', 'Our guiding purpose and roadmap for educational excellence', 'Vision & Mission | Mount Carmel International School', 'Explore the core vision, mission, and foundational values that guide our institution.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        '<h2>Our Vision</h2><p>To be an internationally recognized center of academic excellence that fosters creative visionaries, compassionate leaders, and ethical global citizens.</p><h2>Our Mission</h2><ul><li>Provide a rigorous, holistic, and inclusive learning environment that inspires intellectual curiosity.</li><li>Integrate advanced STEAM technologies with environmental stewardship and humanistic values.</li><li>Cultivate resilient character, empathy, and collaborative spirit in every student.</li></ul><h2>Core Values</h2><p><strong>Integrity, Excellence, Innovation, Inclusivity, and Empathy.</strong></p>', 'standard', 1, 1, 3),

        (1, 'Campus Facilities', 'facilities', 'Cutting-edge laboratories, sports arenas, digital libraries, and smart classrooms', 'Facilities & Campus | Mount Carmel School', 'Discover the modern world-class campus facilities at Mount Carmel.', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        '<h2>World-Class Infrastructure</h2><p>Our 35-acre sprawling campus offers modern architectural design integrated with green spaces, state-of-the-art scientific research labs, and digital collaborative zones.</p><h3>Key Highlights</h3><ul><li><strong>Advanced Robotics & AI Lab:</strong> Equipped with 3D printers, IoT kits, and robotics workstations.</li><li><strong>Olympic-Standard Sports Complex:</strong> Heated swimming pool, synthetic athletic tracks, indoor basketball and badminton courts.</li><li><strong>Central Digital Media Library:</strong> Over 45,000 physical volumes and access to top international research journals.</li><li><strong>Performing Arts Auditorium:</strong> 1,200-seat acoustic concert hall for theatre, orchestra, and debates.</li><li><strong>Hi-Tech Smart Classrooms:</strong> Interactive touch displays, ergonomic seating, and high-speed Wi-Fi.</li></ul>', 'standard', 1, 1, 4),

        (1, 'Academic Programs', 'academics', 'A holistic continuum of learning from Early Childhood to High School', 'Academic Programs & Curriculum | Mount Carmel School', 'Detailed overview of academic streams, curriculum, and subject choices.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
        '<h2>Rigorous & Inspiring Academics</h2><p>Mount Carmel offers comprehensive academic streams tailored to foster deep understanding, experiential learning, and college readiness.</p><h3>Divisions</h3><ul><li><strong>Primary Years (Grades 1-5):</strong> Foundational literacy, numeracy, experiential science, and exploratory arts.</li><li><strong>Middle Years (Grades 6-8):</strong> Critical thinking, interdisciplinary projects, language enrichment, and coding.</li><li><strong>Senior Secondary (Grades 9-12):</strong> Specialized tracks in Science & Engineering, Commerce & Economics, and Humanities & Social Sciences.</li></ul>', 'standard', 1, 1, 5),

        (1, 'Admissions Process', 'admissions', 'Step-by-step guidance on enrolling your child at Mount Carmel', 'Admissions 2026-27 | Mount Carmel International School', 'Information on the admission process, eligibility criteria, and fee structure.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        '<h2>Admissions 2026-2027</h2><p>We welcome applications from motivated learners who seek a supportive yet challenging academic environment.</p><h3>How to Apply</h3><ol><li><strong>Step 1 - Online Enquiry:</strong> Fill out the online registration form on this portal.</li><li><strong>Step 2 - Campus Tour & Interaction:</strong> Attend an interactive parent session and campus walkthrough.</li><li><strong>Step 3 - Assessment & Interview:</strong> Age-appropriate aptitude check and student interaction.</li><li><strong>Step 4 - Enrollment Confirmation:</strong> Submission of verification documents and fee deposit.</li></ol>', 'standard', 1, 1, 6),

        (1, 'Contact & Directions', 'contact', 'Connect with our admissions office, administration, and campus visit desk', 'Contact Us | Mount Carmel International School', 'Contact details, address, telephone numbers, and inquiry form.', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
        '<h2>Get In Touch</h2><p>Our admissions counselors are available Monday through Saturday, 8:30 AM to 4:30 PM to assist you with any questions regarding enrollment, academic programs, or campus visits.</p><p><strong>Campus Address:</strong> 450 University Boulevard, Academic City, California 90210, USA<br><strong>Phone:</strong> +1 (800) 555-0199<br><strong>Email:</strong> admissions@mountcarmel.edu</p>', 'contact', 1, 1, 7);
      `);
    }

    // 5. Seed Menus
    const [existingMenus] = await connection.query('SELECT COUNT(*) as count FROM cms_menus');
    if (existingMenus[0].count === 0) {
      // Top-level menus
      await connection.query(`
        INSERT INTO \`cms_menus\` (\`menu_id\`, \`school_id\`, \`parent_id\`, \`title\`, \`route\`, \`display_order\`, \`is_active\`, \`is_mega_menu\`, \`icon\`) VALUES
        (1, 1, NULL, 'Home', '/site', 1, 1, 0, 'home'),
        (2, 1, NULL, 'About Us', '/site/p/about-us', 2, 1, 1, 'info'),
        (3, 1, NULL, 'Academics', '/site/p/academics', 3, 1, 1, 'book-open'),
        (4, 1, NULL, 'Admissions', '/site/p/admissions', 4, 1, 0, 'user-plus'),
        (5, 1, NULL, 'Campus Life', '/site/p/facilities', 5, 1, 0, 'compass'),
        (6, 1, NULL, 'News & Events', '/site/news', 6, 1, 0, 'calendar'),
        (7, 1, NULL, 'Gallery', '/site/gallery', 7, 1, 0, 'image'),
        (8, 1, NULL, 'Contact Us', '/site/contact', 8, 1, 0, 'mail');
      `);

      // Child submenu items
      await connection.query(`
        INSERT INTO \`cms_menus\` (\`school_id\`, \`parent_id\`, \`title\`, \`route\`, \`display_order\`, \`is_active\`) VALUES
        (1, 2, 'About School', '/site/p/about-us', 1, 1),
        (1, 2, 'Principal Message', '/site/p/principal-message', 2, 1),
        (1, 2, 'Vision & Mission', '/site/p/vision-mission', 3, 1),
        (1, 3, 'Academic Curriculum', '/site/p/academics', 1, 1),
        (1, 3, 'Departments & Faculty', '/site/faculty', 2, 1),
        (1, 3, 'Class Timetable & Calendar', '/site/academics', 3, 1),
        (1, 4, 'Admission Guidelines', '/site/p/admissions', 1, 1),
        (1, 4, 'Online Admission Form', '/site/admissions', 2, 1),
        (1, 5, 'Campus Infrastructure', '/site/p/facilities', 1, 1),
        (1, 5, 'Library & Digital Center', '/site/p/facilities', 2, 1),
        (1, 5, 'Sports & Fitness Arena', '/site/p/facilities', 3, 1),
        (1, 6, 'Latest News', '/site/news', 1, 1),
        (1, 6, 'Upcoming Events', '/site/events', 2, 1),
        (1, 6, 'Official Notices', '/site/notices', 3, 1);
      `);
    }

    // 6. Seed Banners
    const [existingBanners] = await connection.query('SELECT COUNT(*) as count FROM cms_banners');
    if (existingBanners[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_banners\` (\`school_id\`, \`title\`, \`subtitle\`, \`description\`, \`image_url\`, \`badge_text\`, \`button_text\`, \`button_url\`, \`secondary_btn_text\`, \`secondary_btn_url\`, \`display_order\`, \`is_active\`) VALUES
        (1, 'Empowering Minds, Shaping Global Leaders', 'Admissions Open for Session 2026-2027', 'Join an internationally acclaimed academic community committed to scientific discovery, creative arts, and ethical character building.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=85', 'ADMISSIONS 2026-27 OPEN', 'Apply for Admission', '/site/admissions', 'Explore Campus', '/site/p/facilities', 1, 1),
        (1, 'Innovation & STEAM Excellence', 'Where Curiosity Meets World-Class Technology', 'Our cutting-edge AI robotics labs, biotechnology research suites, and interactive digital studios prepare students for the future.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85', 'FUTURE-READY CURRICULUM', 'Explore STEAM Programs', '/site/p/academics', 'Virtual Tour', '/site/gallery', 2, 1),
        (1, 'Nurturing Champions in Sports & Arts', 'Holistic Development Beyond the Classroom', 'Olympic-grade athletic tracks, heated swimming pools, and acoustic performing arts auditoriums for complete student growth.', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85', 'HOLISTIC EDUCATION', 'Campus Life', '/site/p/facilities', 'Schedule a Visit', '/site/contact', 3, 1);
      `);
    }

    // 7. Seed News
    const [existingNews] = await connection.query('SELECT COUNT(*) as count FROM cms_news');
    if (existingNews[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_news\` (\`school_id\`, \`title\`, \`slug\`, \`summary\`, \`content\`, \`image_url\`, \`category\`, \`is_featured\`, \`is_published\`, \`published_at\`) VALUES
        (1, 'Mount Carmel Students Win National STEAM Olympiad 2026', 'national-steam-olympiad-winners-2026', 'Our Grade 11 robotics team clinched 1st prize at the National Innovation Championship with their autonomous environmental drone.', '<p>Mount Carmel International School is proud to announce that our senior robotics delegation has won the Gold Trophy at the National STEAM Olympiad. The team developed an autonomous solar-powered drone capable of environmental microclimate monitoring.</p><p>Principal Dr. Margaret Harrison praised the students and faculty mentors for their relentless dedication and innovative spirit.</p>', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80', 'Achievement', 1, 1, '2026-09-12'),
        (1, 'Inauguration of New Advanced Artificial Intelligence & Bio-Tech Lab', 'new-ai-biotech-lab-inauguration', 'State-of-the-art facility equipped with 3D printers, genome sequencers, and VR learning stations opened today.', '<p>The school unveiled its newly expanded 10,000 sq.ft AI and Biotechnology Research Center today. The lab provides students from Grades 8 to 12 with direct hands-on exposure to machine learning, computational biology, and sustainable technology.</p>', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80', 'Campus', 1, 1, '2026-09-08'),
        (1, 'Annual Inter-School Cultural & Drama Festival Announced', 'annual-inter-school-cultural-fest-2026', 'Over 40 partner schools will participate in our 3-day arts, music, and debate extravaganza this October.', '<p>The Mount Carmel Cultural Guild has announced the dates for the 2026 Inter-School Festival "Kaleidoscope". Events will span classical orchestra, contemporary drama, poetry slam, and hackathons.</p>', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', 'Event', 0, 1, '2026-09-05'),
        (1, 'Global University Placement Success: Class of 2026', 'global-university-placement-success-2026', 'Over 94% of our graduating seniors secured admissions to Ivy League and top 50 global universities with merit scholarships.', '<p>We celebrate the remarkable achievements of our graduating batch who have received acceptance letters from Harvard, MIT, Oxford, Stanford, and Cambridge, earning over $3.2 Million in aggregate scholarships.</p>', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', 'Academics', 0, 1, '2026-09-01');
      `);
    }

    // 8. Seed Events
    const [existingEvents] = await connection.query('SELECT COUNT(*) as count FROM cms_events');
    if (existingEvents[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_events\` (\`school_id\`, \`title\`, \`slug\`, \`description\`, \`venue\`, \`start_date\`, \`end_date\`, \`time\`, \`image_url\`, \`category\`, \`is_published\`) VALUES
        (1, 'International Science & Innovation Summit 2026', 'science-innovation-summit-2026', 'Interactive exhibits, student project showcases, and keynote lectures by leading aerospace scientists.', 'Main Science Complex & Auditorium', '2026-10-15', '2026-10-16', '09:00 AM - 04:30 PM', 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80', 'Academic', 1),
        (1, 'Annual Parent-Teacher Conclave & Progress Review', 'parent-teacher-conclave-autumn-2026', 'Comprehensive individual progress discussions, student portfolio showcases, and counseling sessions.', 'Academic Classrooms & Hall', '2026-10-24', '2026-10-24', '08:30 AM - 02:00 PM', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', 'Parent', 1),
        (1, 'Inter-House Autumn Athletic Championship', 'autumn-athletic-championship-2026', 'Track and field events, swimming relays, soccer finals, and trophy ceremonies.', 'Olympic Sports Stadium', '2026-11-05', '2026-11-07', '08:00 AM - 05:00 PM', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80', 'Sports', 1);
      `);
    }

    // 9. Seed Gallery Categories & Images
    const [existingGalCat] = await connection.query('SELECT COUNT(*) as count FROM cms_gallery_categories');
    if (existingGalCat[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_gallery_categories\` (\`category_id\`, \`school_id\`, \`name\`, \`slug\`, \`description\`, \`cover_image\`) VALUES
        (1, 1, 'Campus Infrastructure', 'campus', 'Modern academic buildings, smart classrooms, and recreational spaces', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'),
        (2, 1, 'Science & Robotics Labs', 'labs', 'Students engaged in cutting-edge laboratory research and digital robotics', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80'),
        (3, 1, 'Sports & Athletics', 'sports', 'Championship moments, swimming meets, and athletic tournaments', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'),
        (4, 1, 'Cultural Arts & Music', 'arts', 'Concerts, theatrical drama, and visual art exhibitions', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80');
      `);

      await connection.query(`
        INSERT INTO \`cms_gallery\` (\`school_id\`, \`category_id\`, \`title\`, \`description\`, \`image_url\`, \`display_order\`, \`is_published\`) VALUES
        (1, 1, 'Central Academic Quadrangle', 'Architectural view of the main faculty hall', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80', 1, 1),
        (1, 1, 'Digital Media Library', 'High-tech collaborative research center', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80', 2, 1),
        (1, 2, 'Robotics Workshop in Action', 'Senior students building autonomous rovers', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80', 3, 1),
        (1, 2, 'Advanced Chemistry & Molecular Lab', 'Hands-on organic synthesis experiment', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80', 4, 1),
        (1, 3, 'Olympic Swimming Competition', 'Inter-school aquatic championship finals', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80', 5, 1),
        (1, 4, 'Annual Symphony Orchestra', 'Student musicians performing in the grand auditorium', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', 6, 1);
      `);
    }

    // 10. Seed Facilities
    const [existingFacilities] = await connection.query('SELECT COUNT(*) as count FROM cms_facilities');
    if (existingFacilities[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_facilities\` (\`school_id\`, \`title\`, \`description\`, \`icon\`, \`image_url\`, \`display_order\`, \`is_active\`) VALUES
        (1, 'Digital Smart Classrooms', 'Interactive touchscreen smartboards with immersive audio-visual learning capabilities.', '💻', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80', 1, 1),
        (1, 'STEAM & Robotics Innovation Hub', 'Dedicated 3D printing, electronics, IoT, and coding workstations for experiential creation.', '🤖', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80', 2, 1),
        (1, 'Olympic Sports Complex', 'Synthetic athletics track, FIFA-standard turf, heated swimming pool, and tennis courts.', '🏆', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80', 3, 1),
        (1, 'Modern Science Laboratories', 'Specialized, internationally-certified Physics, Chemistry, and Biology research suites.', '🔬', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80', 4, 1),
        (1, 'Grand 1200-Seat Auditorium', 'Acoustically treated concert hall for dramatic theater, music recitals, and conferences.', '🎭', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', 5, 1),
        (1, 'Central Digital Library', 'Over 45,000 reference volumes, silent reading pods, and online research terminal access.', '📚', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80', 6, 1);
      `);
    }

    // 11. Seed Testimonials
    const [existingTestimonials] = await connection.query('SELECT COUNT(*) as count FROM cms_testimonials');
    if (existingTestimonials[0].count === 0) {
      await connection.query(`
        INSERT INTO \`cms_testimonials\` (\`school_id\`, \`author_name\`, \`author_role\`, \`author_avatar\`, \`content\`, \`rating\`, \`is_active\`, \`display_order\`) VALUES
        (1, 'Sarah & David Jenkins', 'Parents of Grade 10 Student', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'Mount Carmel has completely transformed our daughters confidence. The teachers genuinely understand each childs unique talents and provide mentorship that goes beyond standard academics.', 5, 1, 1),
        (1, 'Alexander Chen', 'Alumnus (Class of 2024, Stanford University)', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', 'The rigorous STEAM curriculum and guidance from the faculty at Mount Carmel prepared me seamlessly for university-level engineering research. The culture of innovation is unmatched.', 5, 1, 2),
        (1, 'Dr. Emily Watson, MD', 'Parent of Grade 6 & Grade 8 Students', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', 'The emphasis on moral values, sportsmanship, and mental wellness alongside academic excellence makes Mount Carmel the best educational choice for our family.', 5, 1, 3);
      `);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('[CMS Init] CMS tables migrated and seeded successfully.');
  } catch (error) {
    console.error('[CMS Init] Error during CMS migration:', error);
  } finally {
    connection.release();
  }
}

module.exports = initCmsDatabase;
