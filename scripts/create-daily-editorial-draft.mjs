/**
 * GiaHuy Land — tạo tối đa một bản nháp/ngày từ nguồn công khai đã allowlist.
 *
 * Script KHÔNG tự xuất bản. Chỉ sử dụng Quảng Ninh Portal, lưu URL nguồn,
 * ngày công bố, fingerprint chống trùng và trạng thái `draft` để admin duyệt.
 * Khóa ghi Supabase chỉ được đọc từ GitHub Actions Secrets.
 */
import { createHash } from 'node:crypto';

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const RUN_ID = String(process.env.GITHUB_RUN_ID || `manual-${Date.now()}`);

const SOURCE = {
  name: 'Cổng thông tin điện tử tỉnh Quảng Ninh',
  catalogUrl: 'https://www.quangninh.gov.vn/Trang/tin-tuc-su-kien.aspx',
  allowedHost: 'www.quangninh.gov.vn',
};

const TOPIC_PATTERN = /quảng yên|hà an|quy hoạch|hạ tầng|xây dựng|giao thông|đô thị|khu công nghiệp|khu kinh tế|logistics|đầu tư công|phát triển kinh tế|khởi công|công trình/i;
const ARTICLE_PATH_PATTERN = /^\/Trang\/ChiTietTinTuc\.aspx\?nid=\d+(?:&[^\s"<>]*)?$/i;

function fail(message) {
  throw new Error(message);
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, decimal) => String.fromCodePoint(parseInt(decimal, 10)))
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractMeta(html, names) {
  for (const name of names) {
    const escaped = escapeRegex(name);
    const match = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["']`, 'i'));
    if (match) return decodeHtml(match[1]);
  }
  return '';
}

function toIsoDate(value) {
  const match = String(value || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  return `${match[3]}-${month}-${day}`;
}

function truncate(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  const shortened = text.slice(0, Math.max(0, maxLength - 1));
  const boundary = shortened.lastIndexOf(' ');
  return `${(boundary > 40 ? shortened.slice(0, boundary) : shortened).trim()}…`;
}

function slugify(value) {
  const base = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const suffix = createHash('sha256').update(value).digest('hex').slice(0, 8);
  return `${truncate(base, 68).replace(/-+$/g, '')}-${suffix}`.slice(0, 80);
}

function fingerprint(url) {
  return createHash('sha256').update(url).digest('hex');
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GiaHuyLandContentDraft/1.0 (+https://tradetolive.github.io/giahuyland/)' },
    });
    if (!response.ok) fail(`Nguồn trả HTTP ${response.status}: ${url}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function isAllowedArticle(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === SOURCE.allowedHost && ARTICLE_PATH_PATTERN.test(parsed.pathname + parsed.search);
  } catch {
    return false;
  }
}

function parseCatalog(html) {
  const candidates = [];
  const seen = new Set();
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorPattern)) {
    const title = decodeHtml(match[2]);
    let url;
    try { url = new URL(decodeHtml(match[1]), SOURCE.catalogUrl).href; } catch { continue; }
    if (!title || !isAllowedArticle(url) || !TOPIC_PATTERN.test(title) || seen.has(url)) continue;
    seen.add(url);
    candidates.push({ title, url });
  }
  return candidates;
}

function extractArticleInfo(html, candidate) {
  const title = truncate(extractMeta(html, ['og:title', 'twitter:title']) || candidate.title, 160);
  const description = truncate(extractMeta(html, ['description', 'og:description']) || '', 450);
  const date = toIsoDate(html);
  return { title, description, date };
}

async function rest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) fail(`Supabase trả HTTP ${response.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

async function getAutomationAuthorId() {
  const users = await rest('admin_users?select=user_id&order=created_at.asc&limit=1');
  if (!Array.isArray(users) || !users[0]?.user_id) fail('Không tìm thấy admin_users để gán tác giả cho bản nháp.');
  return users[0].user_id;
}

async function alreadyUsed(sourceFingerprint) {
  const rows = await rest(`content_posts?select=id&source_fingerprint=eq.${sourceFingerprint}&limit=1`);
  return Array.isArray(rows) && rows.length > 0;
}

function makeDraft(candidate, article, authorId) {
  const sourceDate = article.date ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(`${article.date}T00:00:00Z`)) : 'chưa xác định';
  const sourceSummary = article.description
    ? `Nội dung nguồn cho biết: ${article.description}`
    : 'Vui lòng đọc toàn văn nguồn gốc trước khi biên tập hoặc xuất bản.';
  const title = truncate(`Cập nhật từ nguồn chính thức: ${article.title}`, 160);
  return {
    slug: slugify(title),
    title,
    eyebrow: `Nguồn nhà nước · ${sourceDate}`,
    excerpt: truncate(`${article.title}. Bản nháp từ nguồn công khai, cần được kiểm chứng và biên tập trước khi xuất bản.`, 600),
    body: [
      `Bài viết này được hệ thống tạo ở dạng bản nháp từ ${SOURCE.name}.`,
      sourceSummary,
      `Nguồn gốc: ${candidate.url}`,
      'Ghi chú biên tập: Hãy đối chiếu phạm vi địa lý, văn bản gốc, thời điểm công bố và hiệu lực trước khi xuất bản. Không coi nội dung này là tư vấn đầu tư, cam kết lợi nhuận hoặc xác nhận pháp lý cho bất kỳ bất động sản nào.',
    ].join('\n\n'),
    category: 'market-update',
    home_slot: null,
    display_order: 1000,
    status: 'draft',
    author_id: authorId,
    source_name: SOURCE.name,
    source_url: candidate.url,
    source_published_on: article.date,
    source_fingerprint: fingerprint(candidate.url),
    origin: 'daily-source',
    automation_run_id: RUN_ID,
  };
}

async function main() {
  if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
    if (process.env.GITHUB_EVENT_NAME === 'schedule') {
      console.warn('Bỏ qua lần chạy hằng ngày: chưa có SUPABASE_SERVICE_ROLE_KEY trong GitHub Actions Secrets.');
      return;
    }
    fail('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong GitHub Actions Secrets.');
  }
  const catalogHtml = await fetchText(SOURCE.catalogUrl);
  const candidates = parseCatalog(catalogHtml);
  if (DRY_RUN) console.log(`DRY RUN: phát hiện ${candidates.length} tin phù hợp từ allowlist.`);
  if (!candidates.length) {
    console.log('Không có tin phù hợp từ allowlist hôm nay; không tạo bản nháp.');
    return;
  }
  for (const candidate of candidates) {
    const sourceFingerprint = fingerprint(candidate.url);
    if (!DRY_RUN && await alreadyUsed(sourceFingerprint)) continue;
    const articleHtml = await fetchText(candidate.url);
    const article = extractArticleInfo(articleHtml, candidate);
    if (!TOPIC_PATTERN.test(`${article.title} ${article.description}`)) continue;
    if (DRY_RUN) {
      console.log(`DRY RUN: nguồn phù hợp: ${candidate.url}`);
      console.log(`DRY RUN: tiêu đề nguồn: ${article.title}`);
      return;
    }
    const authorId = await getAutomationAuthorId();
    const draft = makeDraft(candidate, article, authorId);
    try {
      await rest('content_posts', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(draft) });
      console.log(`Đã tạo 1 bản nháp: ${draft.title}`);
      return;
    } catch (error) {
      if (/23505|duplicate key/i.test(error.message)) {
        console.log('Nguồn vừa được xử lý bởi lần chạy khác; không tạo trùng.');
        return;
      }
      throw error;
    }
  }
  console.log('Không còn tin phù hợp chưa dùng; không tạo bản nháp.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
