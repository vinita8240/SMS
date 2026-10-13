/**
 * Natural language date parser for school management queries
 */
class DateParserService {
  /**
   * Parse relative and named date phrases into ISO YYYY-MM-DD bounds
   */
  parseDateRange(text) {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();
    const now = new Date();

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Today
    if (/\b(today|present today)\b/.test(lower)) {
      const d = formatDate(now);
      return { startDate: d, endDate: d, exactDate: d, label: 'Today' };
    }

    // Yesterday
    if (/\b(yesterday)\b/.test(lower)) {
      const prev = new Date(now);
      prev.setDate(now.getDate() - 1);
      const d = formatDate(prev);
      return { startDate: d, endDate: d, exactDate: d, label: 'Yesterday' };
    }

    // Tomorrow
    if (/\b(tomorrow)\b/.test(lower)) {
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      const d = formatDate(next);
      return { startDate: d, endDate: d, exactDate: d, label: 'Tomorrow' };
    }

    // This week
    if (/\b(this week)\b/.test(lower)) {
      const day = now.getDay(); // 0 is Sun
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        startDate: formatDate(monday),
        endDate: formatDate(sunday),
        label: 'This Week'
      };
    }

    // Last week
    if (/\b(last week)\b/.test(lower)) {
      const day = now.getDay();
      const diffToLastMonday = now.getDate() - day - 6 + (day === 0 ? -6 : 1);
      const lastMonday = new Date(now.setDate(diffToLastMonday));
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      return {
        startDate: formatDate(lastMonday),
        endDate: formatDate(lastSunday),
        label: 'Last Week'
      };
    }

    // This month
    if (/\b(this month)\b/.test(lower)) {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
        label: 'This Month'
      };
    }

    // Last month
    if (/\b(last month)\b/.test(lower)) {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
        label: 'Last Month'
      };
    }

    // Explicit Month parsing (e.g. "in January", "for March", "September 2026")
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    for (let i = 0; i < months.length; i++) {
      const monthRegex = new RegExp(`\\b${months[i]}\\b(?:\\s+(\\d{4}))?`, 'i');
      const match = lower.match(monthRegex);
      if (match) {
        const year = match[1] ? parseInt(match[1], 10) : now.getFullYear();
        const firstDay = new Date(year, i, 1);
        const lastDay = new Date(year, i + 1, 0);
        return {
          startDate: formatDate(firstDay),
          endDate: formatDate(lastDay),
          label: `${months[i].charAt(0).toUpperCase() + months[i].slice(1)} ${year}`
        };
      }
    }

    // ISO format check (YYYY-MM-DD)
    const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (isoMatch) {
      return { startDate: isoMatch[1], endDate: isoMatch[1], exactDate: isoMatch[1], label: isoMatch[1] };
    }

    return null;
  }
}

module.exports = new DateParserService();
