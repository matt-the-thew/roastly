# Vercel specific build step commands
# Do not deploy pushes to "dev"
# Vercel's system continues with the build if 1, and cancels with 0
# if [ "$VERCEL_GIT_COMMIT_REF" = "dev" ]; then exit 0; else exit 1; fi
#
# --- DISABLED STEP 7-3-26 ---
# DevOps overhaul; Vercel deploys dev to preview,
# staging to staging.roastly.dev, and prod to www.roastly.dev
