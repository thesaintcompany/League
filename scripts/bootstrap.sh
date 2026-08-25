#!/bin/sh
# Production bootstrap. Zero-config: works even with no env vars set.
# Idempotent: safe to run on every container start.

set -e

cd /app

# Run Node bootstrap (schema sync + demo seeding)
node prisma/bootstrap.js
