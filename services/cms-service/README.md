# CMS Service

Comprehensive headless Content Management System for airline marketing content with multi-language support, versioning, workflow management, and powerful personalization features.

## 📋 Table of Contents

- [Overview](#overview)
- [Content Types](#content-types)
- [Features](#features)
- [Architecture](#architecture)
- [API](#api)
- [Admin Interface](#admin-interface)
- [Media Management](#media-management)
- [Personalization](#personalization)
- [Workflow](#workflow)
- [SEO](#seo)
- [Integration](#integration)
- [Deployment](#deployment)

## Overview

The CMS Service is a production-ready headless CMS designed specifically for airline marketing teams. It enables non-technical users to create, manage, and publish content across multiple channels without developer involvement.

### Key Capabilities

✅ **Content Management**
- 7 content types (Pages, Blog, Banners, Routes, Destinations, FAQ, Press Releases)
- Rich text editor with Tiptap
- Multi-language support (same 16 languages as platform)
- Content versioning (up to 50 versions per item)
- Draft/publish workflow with approval process
- Scheduled publishing

✅ **Media Management**
- S3/Cloudflare R2 integration
- Automatic image optimization (WebP, JPEG, PNG)
- Multiple thumbnail sizes (200px, 400px, 800px, 1200px)
- CDN integration
- Folder organization
- Tag-based search

✅ **Dynamic Content**
- Personalization rules by user segment
- A/B testing content variants
- Location-based content delivery
- Time-based content (flash sales, promotions)
- Device-specific content (mobile/desktop)

✅ **Offer Management**
- Promotional offers
- Discount codes with usage limits
- Bundle promotions
- Flash sales with countdown
- Booking window restrictions

✅ **Landing Page Builder**
- Drag-and-drop interface
- Component library
- Responsive previews
- Template gallery
- Quick publish (<5 minutes from creation to live)

✅ **APIs**
- GraphQL API for flexible queries
- REST API for simple requests
- Webhook notifications
- CDN cache invalidation

## Content Types

### 1. Pages

General website pages with rich content.

**Schema**:
```prisma
model Page {
  id              String            @id @default(uuid())
  slug            String            @unique
  title           String
  content         Json              // Rich text
  excerpt         String?
  template        String?
  status          ContentStatus     @default(DRAFT)
  publishedAt     DateTime?
  scheduledFor    DateTime?
  locale          String            @default("en")
  seoMetadata     SeoMetadata?
  versions        PageVersion[]
  localizations   PageLocalization[]
}
```

**Use Cases**:
- Homepage
- About Us
- Policies (Terms, Privacy, Refund)
- Destination guides
- Travel tips
- Corporate pages

**Features**:
- Multiple templates (full-width, sidebar, landing)
- SEO optimization
- Versioning
- Multi-language
- Scheduled publishing

### 2. Blog Posts

Articles and travel content.

**Schema**:
```prisma
model BlogPost {
  id              String            @id
  slug            String            @unique
  title           String
  content         Json
  excerpt         String?
  coverImage      String?
  status          ContentStatus
  publishedAt     DateTime?
  categories      BlogCategory[]
  tags            Tag[]
  viewCount       Int               @default(0)
}
```

**Use Cases**:
- Travel guides
- Destination highlights
- Company news
- Travel tips
- Customer stories

**Features**:
- Categories and tags
- Cover images
- Reading time estimation
- View tracking
- Social sharing
- Related posts

### 3. Promotional Banners

Eye-catching banners for promotions.

**Schema**:
```prisma
model Banner {
  id              String            @id
  name            String
  type            BannerType        // HERO, STRIP, POPUP
  position        BannerPosition
  content         Json
  targetRules     Json?             // Personalization
  startDate       DateTime?
  endDate         DateTime?
  impressions     Int               @default(0)
  clicks          Int               @default(0)
}
```

**Banner Types**:
- **Hero**: Full-width homepage banner
- **Strip**: Horizontal notification bar
- **Popup**: Modal overlay
- **Sidebar**: Side panel banner
- **Inline**: Embedded in content

**Targeting Options**:
```json
{
  "userSegments": ["business", "leisure"],
  "locations": ["US", "UK", "AU"],
  "devices": ["mobile", "desktop"],
  "routes": ["LAX-JFK", "SFO-NYC"]
}
```

**Analytics**:
- Impressions (views)
- Clicks
- CTR (Click-Through Rate)
- Conversion tracking

### 4. Routes

Flight route marketing content.

**Schema**:
```prisma
model Route {
  id              String            @id
  origin          String            // Airport code
  destination     String            // Airport code
  name            String
  description     String?
  content         Json?
  averageDuration Int?
  distance        Int?
  frequency       String?
  popularityScore Int
}
```

**Content Includes**:
- Route overview
- Best time to fly
- Average prices
- Flight frequency
- Aircraft type
- In-flight services
- Destination highlights

**Example**:
```
LAX → JFK
Los Angeles to New York

Average Duration: 5h 30m
Distance: 2,475 miles
Frequency: Daily (5x)

Discover the excitement of New York City...
```

### 5. Destinations

City/country destination pages.

**Schema**:
```prisma
model Destination {
  id              String            @id
  code            String            @unique  // Airport/city code
  name            String
  country         String
  description     String?
  content         Json?
  coverImage      String?
  gallery         String[]
  features        Json?
  popularityScore Int
}
```

**Content Includes**:
- City overview
- Tourist attractions
- Best time to visit
- Weather information
- Local currency
- Language
- Timezone
- Image gallery
- Things to do
- Local tips

**Features JSON**:
```json
{
  "attractions": [
    "Eiffel Tower",
    "Louvre Museum",
    "Notre-Dame"
  ],
  "activities": [
    "Sightseeing",
    "Museums",
    "Dining",
    "Shopping"
  ],
  "transportation": ["Metro", "Bus", "Taxi"]
}
```

### 6. FAQ

Frequently Asked Questions.

**Schema**:
```prisma
model Faq {
  id              String            @id
  question        String
  answer          String
  category        String?
  priority        Int
  viewCount       Int
  helpfulCount    Int
}
```

**Categories**:
- Booking
- Check-in
- Baggage
- Boarding
- Cancellation
- Refunds
- Special Services

**Features**:
- Search functionality
- Category filtering
- "Was this helpful?" voting
- Most viewed tracking
- Auto-suggest

### 7. Press Releases

Corporate announcements.

**Schema**:
```prisma
model PressRelease {
  id              String            @id
  title           String
  subtitle        String?
  content         Json
  excerpt         String?
  publishedAt     DateTime?
  contact         Json?             // Media contact
  downloadUrl     String?           // PDF
}
```

**Content Includes**:
- Title and subtitle
- Publication date
- Full text content
- Media contact information
- PDF download option
- Related images/videos

## Features

### Content Versioning

Track every change to content with automatic versioning.

**Features**:
- Automatic version creation on save
- Compare versions side-by-side
- Restore previous versions
- View version history
- Track who made changes
- Maximum 50 versions per content item

**Usage**:
```typescript
// Auto-save creates new version
await updatePage(pageId, {
  title: 'New Title',
  content: updatedContent,
});

// List versions
const versions = await getPageVersions(pageId);

// Restore version
await restorePageVersion(pageId, versionNumber);
```

**Version Comparison**:
```
Version 5 (Current)        Version 4
────────────────────────  ────────────────────────
Title: Summer Sale 2025   Title: Summer Sale
Content: Extended offer   Content: Limited offer
Modified: 2 hours ago     Modified: 1 day ago
By: john@airline.com      By: jane@airline.com
```

### Multi-Language Support

Create localized versions for each supported language.

**Supported Languages**:
```
en (English)    es (Spanish)    fr (French)     de (German)
it (Italian)    pt (Portuguese) zh (Chinese)    ja (Japanese)
ko (Korean)     ar (Arabic)     he (Hebrew)     ru (Russian)
hi (Hindi)      th (Thai)       tr (Turkish)    nl (Dutch)
```

**Localization Workflow**:
```
1. Create content in default language (English)
2. Mark for translation
3. Translator receives notification
4. Translator creates localized version
5. Review and publish per language
```

**API Example**:
```graphql
query GetPage($slug: String!, $locale: String!) {
  page(slug: $slug, locale: $locale) {
    id
    title
    content
    localizations {
      locale
      title
      content
    }
  }
}
```

### Rich Text Editor

Powered by Tiptap with comprehensive formatting options.

**Features**:
- Headings (H1-H6)
- Bold, Italic, Underline, Strikethrough
- Lists (ordered, unordered, task lists)
- Links with title and target options
- Images with alt text and captions
- Videos (embed or upload)
- Tables
- Code blocks with syntax highlighting
- Blockquotes
- Horizontal rules
- Text alignment
- Color picker
- Font size

**Extensions**:
- **Mention**: @mention users
- **Emoji**: 😀 emoji picker
- **Slash Commands**: Type / for quick formatting
- **Markdown**: Write in Markdown
- **Collaboration**: Real-time editing (planned)

**Custom Components**:
- Call-to-action buttons
- Info boxes / alerts
- Accordion / collapsible sections
- Tabs
- Cards
- Statistics
- Testimonials

**Example**:
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Summer Sale" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Save up to " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "50%" },
        { "type": "text", "text": " on flights!" }
      ]
    }
  ]
}
```

### SEO Optimization

Comprehensive SEO metadata for all content types.

**Meta Tags**:
```typescript
interface SeoMetadata {
  // Basic
  title: string;              // "Cheap Flights to Paris | AirlineOps"
  description: string;        // Max 160 characters
  keywords: string[];

  // Open Graph (Facebook)
  ogTitle: string;
  ogDescription: string;
  ogImage: string;            // 1200x630px recommended
  ogType: string;             // "article", "website"

  // Twitter Card
  twitterCard: string;        // "summary_large_image"
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;

  // Advanced
  canonicalUrl: string;       // Prevent duplicate content
  robots: string;             // "index, follow"
  structuredData: JSON;       // Schema.org JSON-LD
}
```

**Schema.org Structured Data**:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "10 Tips for Traveling to Paris",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "datePublished": "2025-01-15",
  "image": "https://cdn.airline-ops.com/paris.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "Airline Ops",
    "logo": {
      "@type": "ImageObject",
      "url": "https://airline-ops.com/logo.png"
    }
  }
}
```

**SEO Best Practices**:
- ✅ Unique title per page (50-60 characters)
- ✅ Meta description (150-160 characters)
- ✅ Alt text for all images
- ✅ Semantic HTML headings
- ✅ Clean, readable URLs
- ✅ Internal linking
- ✅ Mobile-friendly
- ✅ Fast page load
- ✅ SSL/HTTPS
- ✅ XML sitemap
- ✅ robots.txt

### Workflow & Publishing

Editorial workflow with approval process.

**Content States**:
```
DRAFT → IN_REVIEW → APPROVED → PUBLISHED → ARCHIVED
```

**Roles & Permissions**:

| Role | Create | Edit | Publish | Delete |
|------|--------|------|---------|--------|
| Viewer | ❌ | ❌ | ❌ | ❌ |
| Editor | ✅ | ✅ | ❌ | ❌ |
| Publisher | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

**Workflow Process**:
```
1. Editor creates content (DRAFT)
2. Editor submits for review (IN_REVIEW)
3. Publisher reviews and approves (APPROVED)
4. Publisher publishes (PUBLISHED)
5. Content goes live immediately or at scheduled time
```

**Scheduled Publishing**:
```typescript
await schedulePage({
  id: pageId,
  scheduledFor: new Date('2025-12-01T09:00:00Z'),
});

// Cron job checks every minute for scheduled content
// and publishes when time matches
```

**Auto-Save**:
- Saves draft every 30 seconds
- Prevents data loss
- Shows "Saving..." indicator
- Recovers unsaved changes on crash

## Offer Management

Create and manage promotional offers and discount codes.

### Offer Types

**1. Discount Offers**
```typescript
{
  code: "SUMMER25",
  type: "DISCOUNT",
  discountType: "PERCENTAGE",
  discountValue: 25,
  startDate: "2025-06-01",
  endDate: "2025-08-31",
  usageLimit: 1000,
  usagePerUser: 1
}
```

**2. Bundle Promotions**
```typescript
{
  code: "BUNDLE50",
  type: "BUNDLE",
  discountType: "FIXED_AMOUNT",
  discountValue: 50,
  bundleItems: {
    "flight": true,
    "hotel": true,
    "car": true
  },
  minItems: 2
}
```

**3. Flash Sales**
```typescript
{
  code: "FLASH24H",
  type: "FLASH_SALE",
  discountType: "PERCENTAGE",
  discountValue: 40,
  startDate: "2025-12-01T00:00:00Z",
  endDate: "2025-12-01T23:59:59Z",
  usageLimit: 500,        // First 500 only
  routes: ["LAX-JFK", "SFO-NYC"]
}
```

### Discount Types

| Type | Description | Example |
|------|-------------|---------|
| PERCENTAGE | Percentage off | 25% off |
| FIXED_AMOUNT | Fixed dollar amount | $50 off |
| FREE_ITEM | Free add-on | Free baggage |

### Usage Limits

**Total Usage Cap**:
```typescript
usageLimit: 1000  // Maximum 1000 uses total
```

**Per-User Limit**:
```typescript
usagePerUser: 1   // Each user can use once
```

**Booking Window**:
```typescript
bookingWindow: {
  travelDateStart: "2025-06-01",
  travelDateEnd: "2025-08-31",
  bookByDate: "2025-05-31"
}
```

### Targeting Rules

Target specific segments:
```typescript
targetRules: {
  userSegments: ["business", "frequent_flyer"],
  routes: ["LAX-JFK", "SFO-NYC", "LAX-LHR"],
  fareClasses: ["economy", "premium_economy"],
  minAmount: 500,
  maxAmount: 5000,
  firstTimeBuyers: true,
  loyaltyTiers: ["gold", "platinum"]
}
```

### Validation

Offer validation checks:
```typescript
async function validateOffer(code: string, booking: Booking): Promise<boolean> {
  const offer = await getOfferByCode(code);

  // Check validity period
  if (!isWithinPeriod(offer.startDate, offer.endDate)) {
    throw new Error('Offer expired');
  }

  // Check usage limit
  if (offer.currentUsage >= offer.usageLimit) {
    throw new Error('Offer limit reached');
  }

  // Check per-user limit
  const userUsage = await getUserOfferUsage(userId, offer.id);
  if (userUsage >= offer.usagePerUser) {
    throw new Error('User limit reached');
  }

  // Check targeting rules
  if (!matchesTargetRules(offer.targetRules, booking)) {
    throw new Error('Offer not applicable');
  }

  return true;
}
```

## Media Management

Comprehensive media library with CDN integration.

### Upload & Storage

**Supported Formats**:
- **Images**: JPEG, PNG, WebP, GIF, SVG
- **Videos**: MP4, WebM, QuickTime (up to 100MB)
- **Documents**: PDF, Word, Excel

**Storage Providers**:
- **AWS S3**: Traditional S3 storage
- **Cloudflare R2**: S3-compatible, zero egress fees
- **Local**: Development only

**Upload Process**:
```typescript
// 1. Client uploads to presigned URL
const presignedUrl = await getPresignedUploadUrl({
  filename: 'paris.jpg',
  mimeType: 'image/jpeg',
});

await uploadToS3(presignedUrl, file);

// 2. Server processes image
await processImage({
  key: 'uploads/paris.jpg',
  optimize: true,
  generateThumbnails: true,
});

// 3. Media record created
const media = await createMedia({
  filename: 'paris.jpg',
  originalName: 'paris-eiffel-tower.jpg',
  mimeType: 'image/jpeg',
  size: 2048576,
  width: 3840,
  height: 2160,
  url: 'https://s3.amazonaws.com/airline-ops/paris.jpg',
  cdnUrl: 'https://cdn.airline-ops.com/paris.jpg',
});
```

### Image Optimization

Automatic optimization on upload:
```typescript
const optimized = await sharp(buffer)
  .resize(IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT, {
    fit: 'inside',
    withoutEnlargement: true,
  })
  .webp({ quality: IMAGE_QUALITY })
  .toBuffer();
```

**Thumbnail Generation**:
```typescript
const sizes = [200, 400, 800, 1200];

for (const size of sizes) {
  await sharp(buffer)
    .resize(size, size, { fit: 'cover' })
    .webp({ quality: 85 })
    .toFile(`thumbnails/${filename}-${size}.webp`);
}
```

**Output**:
```
Original: paris.jpg (3840x2160, 2.1MB)
Optimized: paris.webp (3840x2160, 850KB)
Thumbnails:
  - paris-200.webp (200x200, 15KB)
  - paris-400.webp (400x400, 45KB)
  - paris-800.webp (800x800, 120KB)
  - paris-1200.webp (1200x1200, 250KB)
```

### CDN Integration

**Cloudflare CDN**:
```typescript
// Purge cache on content update
await purgeCache({
  urls: [
    'https://cdn.airline-ops.com/paris.jpg',
    'https://cdn.airline-ops.com/blog/summer-sale',
  ],
});

// Purge by tag
await purgeCacheByTag('destination-paris');
```

**Cache Headers**:
```http
Cache-Control: public, max-age=31536000, immutable
ETag: "abc123"
Last-Modified: Tue, 15 Jan 2025 10:00:00 GMT
```

### Organization

**Folders**:
```
/
├── destinations/
│   ├── paris/
│   ├── london/
│   └── tokyo/
├── blog/
│   ├── 2025/
│   │   ├── january/
│   │   └── february/
├── banners/
├── press/
└── misc/
```

**Tags**:
- #paris
- #europe
- #destination
- #summer
- #promotion

**Search**:
```typescript
const media = await searchMedia({
  query: 'paris',
  folder: 'destinations',
  tags: ['europe', 'city'],
  mimeType: 'image/*',
  uploadedAfter: '2025-01-01',
});
```

## API

### GraphQL API

Flexible queries with GraphQL.

**Endpoint**: `/graphql`

**Example Queries**:

**Get Page**:
```graphql
query GetPage($slug: String!, $locale: String!) {
  page(slug: $slug, locale: $locale) {
    id
    title
    content
    seo {
      title
      description
      ogImage
    }
    publishedAt
  }
}
```

**List Blog Posts**:
```graphql
query ListBlogPosts($limit: Int!, $offset: Int!) {
  blogPosts(
    limit: $limit
    offset: $offset
    status: PUBLISHED
    orderBy: { publishedAt: DESC }
  ) {
    id
    slug
    title
    excerpt
    coverImage
    publishedAt
    author {
      name
      avatar
    }
    categories {
      name
      slug
    }
  }
}
```

**Get Destination**:
```graphql
query GetDestination($code: String!) {
  destination(code: $code) {
    id
    name
    country
    description
    content
    coverImage
    gallery
    features
    routes {
      origin
      destination
      frequency
    }
  }
}
```

**Mutations**:

**Create Page**:
```graphql
mutation CreatePage($input: CreatePageInput!) {
  createPage(input: $input) {
    id
    slug
    title
    status
  }
}
```

**Publish Content**:
```graphql
mutation PublishPage($id: ID!) {
  publishPage(id: $id) {
    id
    status
    publishedAt
  }
}
```

### REST API

Simple REST endpoints for common operations.

**Base URL**: `/api/v1`

**Endpoints**:

**Pages**:
```
GET    /pages              List pages
GET    /pages/:slug        Get page by slug
POST   /pages              Create page
PUT    /pages/:id          Update page
DELETE /pages/:id          Delete page
POST   /pages/:id/publish  Publish page
```

**Blog**:
```
GET    /blog              List posts
GET    /blog/:slug        Get post by slug
POST   /blog              Create post
PUT    /blog/:id          Update post
DELETE /blog/:id          Delete post
```

**Media**:
```
GET    /media                List media
POST   /media/upload         Upload media
GET    /media/:id            Get media
DELETE /media/:id            Delete media
POST   /media/presigned-url  Get presigned upload URL
```

**Offers**:
```
GET    /offers            List offers
POST   /offers            Create offer
GET    /offers/:code      Get offer by code
PUT    /offers/:id        Update offer
POST   /offers/validate   Validate offer code
```

### Webhooks

Receive notifications on content changes.

**Events**:
- `content.created`
- `content.updated`
- `content.published`
- `content.deleted`
- `media.uploaded`
- `media.deleted`

**Payload Example**:
```json
{
  "event": "content.published",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "type": "page",
    "id": "abc-123",
    "slug": "summer-sale",
    "title": "Summer Sale 2025",
    "publishedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Setup**:
```typescript
await createWebhook({
  name: 'Booking Engine Sync',
  url: 'https://booking.airline-ops.com/webhooks/cms',
  events: ['content.published', 'content.updated'],
  secret: 'webhook_secret_key',
});
```

**Verification**:
```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}
```

## Admin Interface

Next.js admin portal for content management.

### Dashboard

**Overview**:
- Content statistics (total, published, draft)
- Recent activity
- Scheduled content calendar
- Popular content
- User activity

**Metrics**:
```
Total Content: 1,234
Published: 987
Drafts: 247

This Month:
- 45 new blog posts
- 23 pages updated
- 156 media uploads
```

### Content Editor

**Features**:
- Rich text editor (Tiptap)
- Live preview
- Split view (edit/preview)
- Auto-save every 30s
- Version history sidebar
- SEO panel
- Media picker
- Schedule publish

**Shortcuts**:
```
Cmd/Ctrl + S      Save
Cmd/Ctrl + P      Publish
Cmd/Ctrl + Shift + P  Preview
Cmd/Ctrl + K      Insert link
Cmd/Ctrl + Z      Undo
Cmd/Ctrl + Shift + Z  Redo
```

### Content Calendar

Visual calendar with all scheduled content.

**Views**:
- Month view
- Week view
- Day view
- List view

**Features**:
- Drag-and-drop to reschedule
- Color-coded by content type
- Filter by status, type, author
- Bulk scheduling

**Example**:
```
December 2025

Mon  Tue  Wed  Thu  Fri  Sat  Sun
1    2    3    4    5    6    7
          📄   📝        📰
          Sale Post      Release

8    9    10   11   12   13   14
📝        🎯   📄
Blog      Banner Page
```

### Media Library

**Features**:
- Grid/list view
- Infinite scroll
- Drag-and-drop upload
- Bulk upload
- Folder navigation
- Tag filtering
- Search
- Quick preview
- Bulk actions (delete, move, tag)

**UI**:
```
┌─────────────────────────────────────┐
│ 📁 All Media        🔍 Search       │
├─────────────────────────────────────┤
│ Folders:                            │
│ ├─ 📁 Destinations (234)            │
│ ├─ 📁 Blog (567)                    │
│ ├─ 📁 Banners (89)                  │
│ └─ 📁 Press (45)                    │
├─────────────────────────────────────┤
│ [Grid of images with thumbnails]    │
│                                     │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ │img │ │img │ │img │ │img │        │
│ └────┘ └────┘ └────┘ └────┘        │
└─────────────────────────────────────┘
```

### User Management

**Roles**:
- **Viewer**: Read-only access
- **Editor**: Create and edit content
- **Publisher**: Publish content
- **Admin**: Full access + user management

**Permissions Matrix**:
```
                Viewer  Editor  Publisher  Admin
View content      ✅      ✅        ✅        ✅
Create content    ❌      ✅        ✅        ✅
Edit own content  ❌      ✅        ✅        ✅
Edit any content  ❌      ❌        ✅        ✅
Publish content   ❌      ❌        ✅        ✅
Delete content    ❌      ❌        ❌        ✅
Manage users      ❌      ❌        ❌        ✅
Manage settings   ❌      ❌        ❌        ✅
```

## Deployment

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- S3-compatible storage
- CDN (Cloudflare recommended)

### Installation

```bash
cd services/cms-service

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed initial data
npm run db:seed

# Build
npm run build

# Start
npm start
```

### Admin UI

```bash
cd admin

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Production

**Environment Variables**:
- Set `NODE_ENV=production`
- Use strong secrets for JWT, webhooks
- Configure S3/R2 credentials
- Set up CDN with cache purging
- Enable SSL/TLS
- Configure rate limiting

**Monitoring**:
- Health check: `/health`
- Metrics: `:9007/metrics`
- GraphQL Playground: OFF (production)
- API docs: OFF (production)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-18
**Maintained By**: CMS Team
