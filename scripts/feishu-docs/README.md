# Feishu Docs Sync

This sync treats Git Markdown files as the source of truth and Feishu Wiki pages
as generated mirrors.

## Commands

```bash
npm run docs:sync:feishu:dry-run
npm run docs:sync:feishu
npm run docs:sync:feishu:refresh-hashes
```

`docs/feishu-sync.json` stores the current Wiki node mapping and source content
hashes. New documents are discovered from `docs/.vitepress/config.mjs` sidebar
items plus the fixed root documents in the sync config.

## GitHub Secrets

The docs workflow skips Feishu sync unless these secrets are configured:

```text
FEISHU_APP_ID
FEISHU_APP_SECRET
FEISHU_SPACE_ID
```

The Feishu app must have tenant permissions for Wiki, Docs, and Drive import,
and it must be able to edit the target knowledge base.

## Update Strategy

The first stable implementation updates changed documents by importing a new
Docx from Markdown, moving it into the target Wiki folder, and archiving the old
Wiki node under `同步归档`. This is more stable than block-level editing, but a
document URL changes when the document is replaced.
