#!/usr/bin/env bash
# Dump the Supabase database to S3.
#
# The free tier takes no backups of its own, so this is the only copy. Schedule
# it daily and verify a restore at least once — an untested backup is not a
# backup.
#
# Usage:  DIRECT_URL=... S3_BUCKET=... ./scripts/backup-db.sh
#
# Requires: pg_dump (PostgreSQL 16 client), aws CLI.
# Auth to S3 uses the ambient role/profile — no access keys here.

set -euo pipefail

: "${DIRECT_URL:?DIRECT_URL is required (Supabase session pooler, port 5432)}"
: "${S3_BUCKET:?S3_BUCKET is required}"

PREFIX="${BACKUP_PREFIX:-db-backups}"
KEY="${PREFIX}/motojobs-$(date -u +%Y-%m-%dT%H-%M-%SZ).sql.gz"
TMP="$(mktemp -t motojobs-backup.XXXXXX.sql.gz)"
trap 'rm -f "$TMP"' EXIT

# --no-owner/--no-acl keep the dump restorable into a fresh project, whose role
# names differ. Supabase's own schemas are managed by the platform, not us.
pg_dump "$DIRECT_URL" \
  --no-owner --no-acl \
  --schema=public \
  | gzip -9 > "$TMP"

# A dump that failed early can still gzip to a valid-but-tiny file, so check the
# payload rather than trusting the exit code alone.
if [ "$(gzip -dc "$TMP" | head -c 1024 | wc -c)" -lt 100 ]; then
  echo "Dump looks empty — refusing to upload $KEY" >&2
  exit 1
fi

aws s3 cp "$TMP" "s3://${S3_BUCKET}/${KEY}"
echo "Backed up to s3://${S3_BUCKET}/${KEY} ($(du -h "$TMP" | cut -f1))"
