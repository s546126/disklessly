<img src="Resources/AppIcon-1024.png" alt="Disklessly icon" width="96" align="right">

# Disklessly

> **Free up disk space without deleting anything.** Cleaners make room by deleting;
> Disklessly makes room by trading a few seconds at launch for space, and keeps
> every app and its data.
>
> **清理磁盘的另一种思路：用时间换空间，数据一样不丢。** 清理软件靠删东西腾空间，Disklessly 只让你打开时多等几秒，应用和数据都还在。

**中文简介：** 把不常用的 macOS 应用打包存到 iCloud Drive、NAS 或 WebDAV，本机只留一个很小的替身（stub）。双击替身时再下载、校验、挂载并启动应用。256 GB 的 Mac 也够用。

Disklessly moves Mac apps you rarely use out of `/Applications` and into a repo
you control: a folder in iCloud Drive, an SMB or NFS share, a WebDAV or OpenList
server, or any local folder. Each app is stored as a verified DMG image and is
replaced by a small signed stub with the same name and icon. When you open the
stub, Disklessly downloads the image (or uses the cached copy), checks its
SHA-256, mounts it read-only, and starts the app. Documents and URLs you open
with the stub are passed on to the app.

It comes as a menu-bar app, **Disklessly.app**, with a dashboard, and as the
`disklessly` command-line tool. Both use the same engine.

**用户指南 / User guide:** [`docs/user-guide.md`](docs/user-guide.md) covers
install, packing, launching, the cache, backends, several Macs, the menu-bar app,
troubleshooting, and uninstalling, in Chinese and English.

## Install

**App (recommended).** Download `Disklessly-<version>.dmg` from
[Releases](https://github.com/nwverse/disklessly/releases), drag Disklessly to
Applications, and open it. A drive icon appears in the menu bar; choose
**Open Dashboard**. The app is signed with a Developer ID and notarized. The CLI
is inside it at `/Applications/Disklessly.app/Contents/MacOS/disklessly`:

```sh
sudo ln -s /Applications/Disklessly.app/Contents/MacOS/disklessly /usr/local/bin/disklessly
```

**Homebrew.** The CLI comes from the project tap:

```sh
brew tap nwverse/tap
brew install disklessly-cli
```

That installs `disklessly` and the `dkl` alias from the release tarball. On macOS it
also installs `disklessly-stub`. The macOS binary is not signed with a Developer ID
and is not notarized, so Gatekeeper blocks the first run; `brew install` prints the
`xattr` command that clears the quarantine flag. On Linux the same formula installs
the matching build (x86_64 or aarch64), which needs glibc 2.34 or newer plus
`libsqlite3`, `libcurl`, and `libxml2`.

`brew install --cask disklessly` will install the menu-bar app and link the CLI once
an Apple Developer ID certificate is available. The cask is not published yet. The
formula and cask templates are in `packaging/homebrew/`.

**Tarball.** `disklessly-<version>-macos-universal.tar.gz` holds `bin/disklessly`,
`bin/disklessly-stub`, and `share/disklessly/web`. Keep that layout: the CLI looks
for the stub launcher beside itself and for the dashboard in `../share/disklessly/web`.
Linux builds are `disklessly-<version>-linux-x86_64.tar.gz` and
`disklessly-<version>-linux-aarch64.tar.gz`. Check downloads against `SHA256SUMS`.

Requires macOS 13 or later, on Apple silicon or Intel.

## First run

```sh
disklessly init                       # repo in iCloud Drive by default; or: init --root /Volumes/NAS/Disklessly
disklessly recommend                  # big apps you have not opened in a while
disklessly pack "/Applications/Some App.app"
```

`init` prints where the repo, cache, and stubs are, and the cache quota (20 GiB
by default). `recommend` ranks apps by size and time since last use, skips system
apps, running apps, and things that should stay installed (login items, menu-bar
agents, Xcode and other toolchains), and says when an app is already in the repo
from another Mac so packing it needs no upload.

`pack` builds the image, verifies it, uploads it, and only then replaces the app
with a stub. It prints the size, whether the image was reused or uploaded, where
the stub is, and what happened to the original. The original is deleted after the
image is confirmed; pass `--keep-original` to keep it next to the stub as
`<Name>.256orig.app`. If the cloud copy is not confirmed yet, pack keeps the
original and says why.

Mac App Store apps are packed in **restore** mode by default (`--mode restore`
selects it for any app): the app is copied back for the session and returned to
the repo after you quit it. Everything else uses **mount** mode and runs straight
from the read-only image.

## Everyday use

- Open the stub from Finder, Launchpad, Spotlight, or the Dock as usual.
  Or run `disklessly launch "Some App"` (`--doc FILE`, `--url URL`, `--no-wait`);
  `disklessly restore "Some App"` forces restore mode for one launch.
- `disklessly list` shows packed apps; `disklessly status` shows the cache and the state of each app.
- `disklessly pin APP` keeps an app's image in the cache; `unpin` lets the cache drop it.
- `disklessly prefetch APP` downloads ahead of time, for example before a flight.
- `disklessly evict APP` drops the cached image; the repo copy stays.
  `disklessly evict-local` removes local iCloud copies of repo files that finished uploading.
- `disklessly gc` tidies up: finishes interrupted launches, moves unreferenced images to
  the repo's trash (kept 7 days), and trims the cache to its quota. `gc --dry-run` shows
  what it would do.
- `disklessly doctor` checks the setup and prints each check as it finishes.

A mistyped app name gets suggestions (`Did you mean: ...`). Add `--json` to any
command for machine-readable output.

## The dashboard

The menu-bar app opens the dashboard in its own window. From a terminal,
`disklessly ui --open` serves the same page and opens it in your browser
(`disklessly ui --json` prints `url`, `port`, and `token` for scripts). The page
shows the backend, cache use against the quota, packed apps with icons and sizes,
pins, other Macs that share the repo, and the recommend list. From each app row you
can open, prefetch, pin or unpin, evict, and unpack; packing a new app is
`disklessly pack`. The page is bilingual (Chinese and English) and follows the
system light or dark appearance. It listens only on `127.0.0.1` and needs the
random token in the URL.

The menu-bar item has **Open Dashboard**, **Copy Dashboard URL**, the version, and
**Quit**. The app has no Dock icon; reopening it shows the dashboard window again.

## Bring apps back, or uninstall

- `disklessly unpack APP` puts the real app back in place of its stub after checking
  its tree hash and code signature. `unpack APP --to ~/Desktop` copies it out and
  leaves the stub.
- To remove Disklessly completely:
  1. Run `disklessly list` and `disklessly unpack APP` for every app you want back.
  2. If you used `disklessly sessions --apply`, run `disklessly sessions restore ID`
     for every archived transcript you want back (`sessions search` finds them).
     Keep the Keychain session key until this is done if you used `--encrypt`.
  3. Quit Disklessly from the menu bar and move it to the Trash (or `brew uninstall --cask Disklessly`).
  4. Delete `~/Library/Application Support/Disklessly/` and `~/Library/Caches/Disklessly/`.
  5. Delete the repo folder only after steps 1 and 2, and only if no other Mac uses it.

**Deleting the repo is permanent.** After `pack` the repo image is the only copy of
the app, and `sessions --apply` deletes the local transcripts it archives. Apps you
did not unpack and sessions you did not restore are gone with the repo.

Stubs for apps you did not unpack stop working once step 4 removes the engine copy
they run (`~/Library/Application Support/Disklessly/bin/disklessly`).

## Several Macs, one repo

Point every Mac at the same repo (`disklessly init --root ...`, or the default iCloud
Drive folder). Images are write-once and keyed by bundle id, version, build,
architectures, and a content hash, so the same app on two Macs is stored once and
the second `pack` does not upload again. Each Mac writes only its own
`devices/<id>.json`, and `gc` never deletes an image that any Mac still lists, even
a Mac that has been offline for months. `disklessly devices` lists the Macs and what
they use; `devices rename NAME` sets this Mac's name, and
`devices forget DEVICEID --yes` drops a Mac you no longer use. Pins, cache, and launch state
stay on each Mac.

Repos on a share or WebDAV server: `disklessly backend add smb|nfs|webdav|openlist ...`,
then `backend use ID`. Cloud drives go through the bundled rclone: `disklessly cloud connect
gdrive|dropbox|onedrive|box|pcloud`, and `disklessly openlist install` sets up a local OpenList. Passwords are read from `--password-stdin` and kept in the
Keychain. See [`docs/backends.md`](docs/backends.md).

## Free version and license

The free version offloads up to **2 items at once**: apps, and files or folders offloaded with `disklessly offload`, counted together. Starting, restoring (`unpack`), evicting and detaching
apps you already offloaded never needs a license; only `pack` checks the limit, and packing an app that is
already offloaded again does not count as a new one. A license code removes the limit:

Codes are checked offline against a public key built into the app; nothing is sent anywhere.
A license does not expire and includes a year of updates. A promo code has a last day; after it
the free limit applies again and apps already offloaded keep working.

<!-- TODO: replace the link below (and License.purchaseURL) with the store's product page. -->
[Buy a license](https://github.com/nwverse/disklessly#free-version-and-license), then:

```sh
disklessly license              # shows "Free version: 1 of 2 apps offloaded" or your license
disklessly license activate DSL1.…
disklessly license deactivate
```

The dashboard has a License card with the same actions and a **Buy a license** button.

## Permissions

- **App Management** (System Settings > Privacy & Security > App Management): needed
  to replace or restore apps in `/Applications`. Grant it to Disklessly.app, and to
  your terminal if you use the CLI. Without it, `pack` and `unpack` fail with a
  permission error and leave the app as it was.
- **Full Disk Access**: only needed when the repo or the apps live in a protected
  location, or for `disklessly sessions` on folders macOS guards.
- Apps owned by root: `pack` may leave `/Applications/.disklessly-original-*.app`
  behind. `disklessly cleanup-backups` verifies and removes them with one
  administrator prompt. It never asks for or stores your password itself.

## Privacy

No telemetry, analytics, or update checks. Disklessly talks only to the repo you
configure. Details are in [PRIVACY.md](PRIVACY.md).

## Safety

- Nothing is replaced until a verified image exists in the repo. A missing,
  placeholder, or mismatched image stops `pack` with exit 5 and the app stays.
- Every launch checks the image SHA-256 before mounting. A dataless iCloud file is
  never attached.
- Restore-mode launches are journaled. A crash or power loss is finished by the next
  `launch`, `gc`, or `doctor --fix`. If you changed an app while it was restored,
  `disklessly resolve APP` keeps, exports, or discards those changes.
- Stubs that `pack` writes are ad-hoc signed on your Mac. They are generated per app
  and never leave the Mac, so they cannot carry the release's Developer ID.
- Try it first on an app you can reinstall.

## Mount lifecycle and repo scoping

- `disklessly evict APP` refuses a pinned app (exit 9, reason `pinned`); add
  `--force` to drop its cache anyway (the pin stays). A mounted or in-use image is
  never evicted, even with `--force`.
- `disklessly detach APP [--force]` detaches an app's image now instead of after the
  detach delay (120 s by default). It refuses while the app is still running.
- `disklessly reap [--dry-run]` detaches images left mounted under the mount root
  after their owner died. `launch`, `gc`, and `doctor --fix` also reap.
- Each stub records the repo that packed it (`repoId` in `stub.json`), so another
  repo never claims it. `disklessly stub refresh --all` stamps older stubs.

## Large files and folders

Not only apps: `disklessly files` lists large files and folders in your home folder that you have not opened for a while.
`disklessly offload PATH` moves one into the repo and leaves a small `PATH.disklessly` placeholder.
`disklessly fetch PLACEHOLDER` brings it back. In Finder, right-click and choose Services → Offload with Disklessly or
Bring back with Disklessly. Double-clicking a placeholder brings the file back too.
The dashboard lists the same items under Worth offloading. See [`docs/files.md`](docs/files.md).

## Coding-agent sessions

`disklessly sessions` (dry run by default; `--apply` to act) moves cold coding-agent
transcripts into write-once zstd segments in the repo, optionally encrypted
(`sessions key init`, `--encrypt`), and keeps a local search index
(`sessions search`, `sessions restore`). See [`docs/sessions.md`](docs/sessions.md).

## Encrypted images

`disklessly images key init` then `disklessly images encrypt on` (or `pack --encrypt`)
encrypts new app images before they are uploaded, so the repo holds only ciphertext.
The key lives in iCloud Keychain; the local cache stays a plain disk image.
See [`docs/image-encryption.md`](docs/image-encryption.md).

## Command reference

`disklessly help` prints every command grouped by task. Exit codes: 0 ok, 1 failure,
2 usage, 3 unsupported, 4 backend, 5 integrity, 6 disk image, 8 no space, 9 busy,
10 hook, 14 needs attention, 64 no command. With `--json`, errors are
`{"ok": false, "error": {"code", "message"}}`. Set `DISKLESSLY_DEBUG=1` to include
Foundation error details.

Environment overrides, useful for isolated test runs: `DISKLESSLY_REPO_PATH`,
`DISKLESSLY_CACHE_DIR`, `DISKLESSLY_STATE_DIR`, `DISKLESSLY_MOUNT_ROOT`,
`DISKLESSLY_STUB_DIR`, `DISKLESSLY_CONFIG`, `DISKLESSLY_DETACH_DELAY`,
`DISKLESSLY_QUOTA_BYTES`, `DISKLESSLY_MIN_FREE_BYTES`, `DISKLESSLY_SIGN_IDENTITY`,
`DISKLESSLY_DOCTOR_TIMEOUT`, `DISKLESSLY_WEB_ROOT`, `DISKLESSLY_HOME` (the home folder `files` scans and `offload` accepts), `DISKLESSLY_SCAN_ROOTS` (colon-separated
folders scanned instead of `/Applications` and `~/Applications` by `recommend`
and backup cleanup).

After upgrading, run `disklessly install-engine` and `disklessly stub refresh --app ID`
for each packed app so existing stubs use the new engine.

## Linux

A Linux build of the CLI covers the parts that do not need macOS: coding-agent
session archiving (`sessions`, including `--encrypt`), the disk usage map and
dashboard (`ui`), `backend`, `devices`, `license`, `init`, `list`, `status`, and
`version`. Offloading apps (`pack`, `launch`, `unpack`, `recommend`, stubs, `gc`,
`doctor`, ...) is macOS only and exits 3 with "… is macOS only".

```sh
tar -xzf disklessly-<version>-linux-x86_64.tar.gz     # or -linux-aarch64
sudo cp -R disklessly-<version>-linux-*/{bin,share} /usr/local/
disklessly init && disklessly sessions                 # dry run: what would be archived
disklessly ui --open
```

Keep `bin/` and `share/disklessly/web` side by side. The binary needs glibc 2.34 or
later plus libsqlite3, libcurl, and libxml2, which servers and desktops already have
(RHEL/Oracle/Rocky 9, Debian 12, Ubuntu 22.04 and newer).
State lives in `~/.local/share/disklessly`, the cache in `~/.cache/disklessly`.
Secrets go to the Secret Service via `secret-tool` when a desktop session is up,
otherwise to `~/.config/disklessly/secrets.json` (mode 0600); back that file up if
you use `sessions --encrypt`. SMB and NFS shares must already be mounted. Details,
and the plan for offloading AppImage files, are in [`docs/linux.md`](docs/linux.md).

## Building from source

```sh
swift build && swift test       # Swift 5.9+; on Linux install libsqlite3-dev and g++ first
scripts/linux-test.sh           # Linux build, tests, and CLI smoke run in a swift:6.0 container
scripts/release-linux.sh        # dist/disklessly-<ver>-linux-<arch>.tar.gz (Docker or Apple's container)
scripts/build-app.sh            # universal build/Disklessly.app (see gui/README.md)
scripts/make-icon.sh            # redraw Resources/AppIcon.icns (committed; build-app.sh copies it)
scripts/release-sign.sh         # sign, notarize, DMG, tarball; a dry run without DISKLESSLY_SIGN_IDENTITY
bash scripts/e2e.sh             # macOS end-to-end run against fixture apps in temp folders
```

Releases are cut by pushing a `v*` tag; `.github/workflows/release.yml` builds,
tests, signs, notarizes, and drafts the GitHub Release after a manual approval.
The design is in [`docs/design.md`](docs/design.md). Changes are listed in
[CHANGELOG.md](CHANGELOG.md).

## License

Proprietary. Copyright © 2026 Shengtao Lin, all rights reserved; see [LICENSE](LICENSE). Bundled libraries are listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
