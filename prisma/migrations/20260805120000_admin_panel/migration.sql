-- Admin panel: managed taxonomy, CMS, site settings and operational logs.

-- Users: suspension trail and last sign-in, for admin user management.
ALTER TABLE "users"
  ADD COLUMN "suspendedAt" TIMESTAMP(3),
  ADD COLUMN "suspendedReason" TEXT,
  ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE INDEX "users_role_createdAt_idx" ON "users"("role", "createdAt");

-- Blog: tags, byline and SEO fields the admin editor writes.
ALTER TABLE "blogs"
  ADD COLUMN "tags" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "authorName" TEXT,
  ADD COLUMN "seoTitle" TEXT,
  ADD COLUMN "seoDescription" TEXT;

-- Support: the admin groups tickets by category, so it needs an index.
CREATE INDEX "support_tickets_status_createdAt_idx"
  ON "support_tickets"("status", "createdAt");
CREATE INDEX "support_tickets_category_createdAt_idx"
  ON "support_tickets"("category", "createdAt");

CREATE TABLE "taxonomies" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT,
    "blurb" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxonomies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "taxonomies_kind_value_key" ON "taxonomies"("kind", "value");
CREATE INDEX "taxonomies_kind_isActive_sortOrder_idx"
  ON "taxonomies"("kind", "isActive", "sortOrder");

CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isHub" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cities_stateId_name_key" ON "cities"("stateId", "name");
CREATE INDEX "cities_stateId_isActive_idx" ON "cities"("stateId", "isActive");

ALTER TABLE "cities"
  ADD CONSTRAINT "cities_stateId_fkey"
  FOREIGN KEY ("stateId") REFERENCES "states"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cms_pages" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "blocks" TEXT NOT NULL DEFAULT '{}',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cms_pages_key_key" ON "cms_pages"("key");

CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "group" TEXT NOT NULL DEFAULT 'BRANDING',
    "label" TEXT NOT NULL,
    "inputType" TEXT NOT NULL DEFAULT 'TEXT',
    "hint" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");
CREATE INDEX "site_settings_group_sortOrder_idx" ON "site_settings"("group", "sortOrder");

CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "variables" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_templates_key_key" ON "email_templates"("key");

CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "announcements_status_createdAt_idx" ON "announcements"("status", "createdAt");

CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "login_history_userId_createdAt_idx" ON "login_history"("userId", "createdAt");
CREATE INDEX "login_history_email_createdAt_idx" ON "login_history"("email", "createdAt");
CREATE INDEX "login_history_success_createdAt_idx" ON "login_history"("success", "createdAt");

ALTER TABLE "login_history"
  ADD CONSTRAINT "login_history_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "source" TEXT,
    "method" TEXT,
    "path" TEXT,
    "userId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "error_logs_resolvedAt_createdAt_idx" ON "error_logs"("resolvedAt", "createdAt");
