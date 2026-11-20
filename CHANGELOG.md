# Changelog

All notable changes to Disklessly (`disklessly`) are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- The dashboard's disk usage map is now a nested treemap (squarified, like WinDirStat or WizTree)
  instead of a four-row flame chart: each box's area is its size, boxes with room show their
  children under a title strip, and the map keeps about a 16:9 shape and redraws when the window
  is resized. Click to zoom, the path above, the hover line and the right-click menu work as before.

## [0.3.0] - 2026-11-14

- Every session archive path (CLI apply, dashboard apply, settling pending rows) scans the user's
  running processes and herdr's saved layout for referenced session ids and `.jsonl` paths, at plan
  time and again before each local delete. A failed process listing keeps every local file of the
  run (`reference check failed`).
- `sessions status` and the sessions commands no longer create a missing local repo folder; it is
  reported unreachable. Status adds `stateDir`.
- `sessions restore` takes the sessions lock and never replaces a file that appeared during the
  download (exit 9).
- Archived sessions of this device get a local plain-text index, `stateDir/sessions/text/<entryId>.jsonl`
  (a header line, then one line per user or assistant message), written before the local file is
  deleted and never uploaded. A transcript whose text file cannot be written is skipped (`text index
  failed`) and stays local. `sessions status` adds `textDir` and `textFiles`. Each apply keeps one
  text file per session (the newest archived version) and removes files left by failed runs.
- `sessions list` prints the archived-session index with session ids, working directories, titles,
  first prompts, and segment paths; `sessions status` reports index counts and whether the backend's
  `repo.json` answers (`--check-segments` stats every referenced segment).
- `sessions --exclude-from FILE|-` keeps referenced sessions local; the list is checked again before
  each local delete. The `--apply` report adds `uploadedBytes` and `archived`.
- New segments are filed under `sessions/<device>/<tool>/<project>/<yyyy-MM>/`; `reindex` reads this
  and the earlier flat layout. The session index is schema 4 (`cwd`, `first_prompt`).
- `sessions --apply`, `restore`, and `reindex` exit 4 (`backend unreachable`) when the repo marker
  cannot be read, before anything is uploaded or deleted, instead of filling a missing or unmounted
  folder or reporting an empty reindex.
- Archiving a restored, unchanged session again no longer fails with a duplicate index id, and restore
  by path picks the newest archived copy. A restored pi or Codex session is no longer archived again
  on the next run (it stays local for the cold period), and an unchanged re-archive reuses the stored
  segment instead of uploading an orphan copy.
- Excluding a Claude Code session also keeps its `subagents/` transcripts. `sessions restore` can read
  from a mirror when the primary has no marker and opens no backend when the file is already in place.
  A repo with images or manifests but no `repo.json` still counts as reachable.
- `sessions status --check-segments` reports failed stats as `unchecked` (never `missing`) and stops
  after 60 s.
- First release under the proprietary license (copyright Shengtao Lin, all rights reserved).
  The repository history before this release was squashed into a single commit.
