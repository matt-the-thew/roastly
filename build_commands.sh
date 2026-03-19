if [[ "$VERCEL_GIT_COMMIT_REF" == "dev" ]];
  exit 0;
else
  exit 1;
fi