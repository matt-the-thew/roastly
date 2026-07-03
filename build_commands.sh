# Vercel specific build step commands
# Vercel's system continues with the build if 1, and cancels with 0
if [ "$VERCEL_GIT_COMMIT_REF" = "staging" ]; then exit 1; else exit 0; fi
