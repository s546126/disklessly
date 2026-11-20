import XCTest
import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import DisklesslyCore
import DisklesslyEngine

/// These tests cover the macOS dashboard, also when they run on Linux.
private let macContext = ManagementUIContext(platform: .macOS)

final class UIServerTests: XCTestCase {
    func testLoopbackRequiresToken() throws {
        let server = LoopbackUIServer(token: "ui-token-9f3a") { request in
            UIResponse.json(["ok": true, "path": request.path])
        }
        try server.start()
        defer { server.stop() }
        XCTAssertGreaterThan(server.port, 0)
        let denied = try request(port: server.port, path: "/api/status", token: nil)
        XCTAssertEqual(denied.status, 401)
        XCTAssertFalse(String(decoding: denied.body, as: UTF8.self).contains("\"path\""))
        let allowed = try request(port: server.port, path: "/api/status?token=ui-token-9f3a", token: nil)
        XCTAssertEqual(allowed.status, 200)
        let bearer = try request(port: server.port, path: "/api/status", token: "ui-token-9f3a")
        XCTAssertEqual(bearer.status, 200)
    }

    func testPageInjectsTokenAndApiPinsEvicts() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let web = root.appendingPathComponent("web")
        try FileManager.default.createDirectory(at: web, withIntermediateDirectories: true)
        try Data("<link rel=\"stylesheet\" href=\"style.css\"><script type=\"module\" src=\"app.js\"></script>".utf8).write(to: web.appendingPathComponent("index.html"))
        try Data("console.log('ui')".utf8).write(to: web.appendingPathComponent("app.js"))
        try Data("body{}".utf8).write(to: web.appendingPathComponent("style.css"))
        let repo = root.appendingPathComponent("repo")
        let cache = root.appendingPathComponent("cache")
        var config = RuntimeConfig(repoPath: repo.path, cacheDir: cache.path, stateDir: root.appendingPathComponent("state").path, mountRoot: root.appendingPathComponent("mounts").path, stubDir: root.appendingPathComponent("apps").path)
        config.backends = [BackendEndpoint(id: "nas", type: "smb", host: "nas.local", mountPoint: "/Volumes/apps")]
        config.activeBackendId = "nas"
        var engine = DisklesslyEngine(config: config, secrets: MemorySecretStore())
        engine.backendOverride = try LocalFolderBackend(root: repo)
        try engine.initialize()
        let bytes = Data("cached image".utf8)
        let sha = SHA256Digest.hex(bytes)
        let image = ImageManifest.Image(file: "images/test.dmg", format: "ULMO", sha256: sha, size: UInt64(bytes.count), volumeName: "Test", appPathInVolume: "Test.app")
        let manifest = ImageManifest(bundleId: "com.test.app", name: "Test", version: "1", image: image, app: .init(originalPath: "/Applications/Test.app", executable: "Test", documentTypes: [], urlTypes: []))
        try LocalFolderBackend(root: repo).put("manifests/\(manifest.imageId).json", data: try manifest.encode())
        let cached = cache.appendingPathComponent("images/\(manifest.imageId).dmg")
        try FileManager.default.createDirectory(at: cached.deletingLastPathComponent(), withIntermediateDirectories: true)
        try bytes.write(to: cached)
        let entry = SessionIndexEntry(id: "abc123", tool: "pi", path: "/tmp/session.jsonl", sha256: sha, size: 4, modified: Date(timeIntervalSince1970: 1_700_000_000), archive: "sessions/pi/2023-11.tar.gz", member: "pi/abc-session.jsonl", preview: "blender notes")
        try SessionArchive.saveIndex(SessionIndex(entries: [entry]), stateDir: config.stateDir)
        let server = LoopbackUIServer(token: "page-token") { request in
            ManagementUI.respond(engine: engine, webRoot: web, request: request, context: macContext)
        }
        try server.start()
        defer { server.stop() }
        let page = try request(port: server.port, path: "/?token=page-token", token: nil)
        XCTAssertEqual(page.status, 200)
        let html = String(decoding: page.body, as: UTF8.self)
        XCTAssertTrue(html.contains("app.js?token=page-token"))
        XCTAssertTrue(html.contains("style.css?token=page-token"))
        let script = try request(port: server.port, path: "/app.js?token=page-token", token: nil)
        XCTAssertEqual(script.status, 200)
        XCTAssertEqual(String(decoding: script.body, as: UTF8.self), "console.log('ui')")
        let status = try request(port: server.port, path: "/api/status", token: "page-token")
        let object = try XCTUnwrap(JSONSerialization.jsonObject(with: status.body) as? [String: Any])
        let apps = try XCTUnwrap(object["apps"] as? [[String: Any]])
        XCTAssertEqual(apps.first?["name"] as? String, "Test")
        XCTAssertEqual(apps.first?["cached"] as? Bool, true)
        XCTAssertEqual(apps.first?["remote"] as? Bool, false)
        XCTAssertEqual(apps.first?["pinned"] as? Bool, false)
        XCTAssertEqual(apps.first?["restored"] as? Bool, false)
        let backend = try XCTUnwrap(object["backend"] as? [String: Any])
        XCTAssertEqual(backend["health"] as? String, "ok")
        XCTAssertEqual(backend["activeId"] as? String, "nas")
        let sessions = try XCTUnwrap(object["sessions"] as? [String: Any])
        let offloaded = try XCTUnwrap(sessions["offloaded"] as? [[String: Any]])
        XCTAssertEqual(offloaded.first?["tier"] as? String, "cold")
        XCTAssertEqual(offloaded.first?["preview"] as? String, "blender notes")
        let cacheInfo = try XCTUnwrap(object["cache"] as? [String: Any])
        XCTAssertGreaterThan((cacheInfo["usedBytes"] as? NSNumber)?.uint64Value ?? 0, 0)
        XCTAssertEqual((cacheInfo["quotaBytes"] as? NSNumber)?.uint64Value, 20 * 1024 * 1024 * 1024)
        XCTAssertEqual((apps.first?["imageBytes"] as? NSNumber)?.uint64Value, UInt64(bytes.count))
        XCTAssertEqual(apps.first?["state"] as? String, "")
        XCTAssertEqual(apps.first?["needsResolution"] as? Bool, false)
        XCTAssertNil(apps.first?["lastUsed"])
        let pin = try runJob(port: server.port, path: "/api/pin", token: "page-token", app: "Test")
        XCTAssertEqual(pin["state"] as? String, "done")
        let pinned = StateStore(config.stateDir).read()["apps"] as? [String: [String: Any]]
        XCTAssertEqual(pinned?["com.test.app"]?["pinned"] as? Bool, true)
        // design §4: evict refuses a pinned app unless forced; the dashboard
        // disables Evict while pinned, and the error names no CLI-only flag.
        let refused = try runJob(port: server.port, path: "/api/evict", token: "page-token", app: "Test")
        XCTAssertEqual(refused["state"] as? String, "failed")
        XCTAssertEqual((refused["error"] as? [String: Any])?["code"] as? String, "pinned")
        XCTAssertFalse(((refused["error"] as? [String: Any])?["message"] as? String ?? "--force").contains("--force"))
        XCTAssertTrue(FileManager.default.fileExists(atPath: cached.path))
        let evict = try runJob(port: server.port, path: "/api/evict", token: "page-token", app: "Test", force: true)
        XCTAssertEqual(evict["state"] as? String, "done")
        XCTAssertFalse(FileManager.default.fileExists(atPath: cached.path))
        XCTAssertTrue(FileManager.default.fileExists(atPath: repo.appendingPathComponent("manifests/\(manifest.imageId).json").path))
        let restore = try runJob(port: server.port, path: "/api/restore", token: "page-token", app: "Test")
        XCTAssertEqual(restore["state"] as? String, "failed")
        let restoreError = try XCTUnwrap(restore["error"] as? [String: Any])
        XCTAssertFalse((restoreError["code"] as? String ?? "").isEmpty)
        XCTAssertFalse((restoreError["message"] as? String ?? "").isEmpty)
        XCTAssertTrue(FileManager.default.fileExists(atPath: repo.appendingPathComponent("manifests/\(manifest.imageId).json").path))
        let unknown = try runJob(port: server.port, path: "/api/prefetch", token: "page-token", app: "Nope")
        XCTAssertEqual(unknown["state"] as? String, "failed")
        XCTAssertEqual((unknown["error"] as? [String: Any])?["code"] as? String, "unknown_app")
    }

    func testBackupCleanupRouteRunsAsJobAndRescansUsage() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let config = RuntimeConfig(repoPath: root.appendingPathComponent("repo").path, cacheDir: root.appendingPathComponent("cache").path, stateDir: root.appendingPathComponent("state").path, mountRoot: root.appendingPathComponent("mounts").path, stubDir: root.appendingPathComponent("apps").path)
        let engine = DisklesslyEngine(config: config, secrets: MemorySecretStore())
        let counter = CallCounter()
        let rescans = CallCounter()
        // The fake replaces the engine's cleanup: no administrator prompt runs in tests.
        let actions = ManagementActions(perform: { kind, _, _, _ in
            if kind == .backupsCleanup { counter.increment() }
        })
        let usage = UsageScanner(run: { _, _ in
            rescans.increment()
            return (UsageNode(name: "Root", kind: .root), false)
        })
        let context = ManagementUIContext(platform: .macOS, actions: actions, usage: usage)
        let server = LoopbackUIServer(token: "cleanup-token") { request in
            ManagementUI.respond(engine: engine, webRoot: nil, request: request, context: context)
        }
        try server.start()
        defer { server.stop() }
        let job = try runJob(port: server.port, path: "/api/backups/cleanup", token: "cleanup-token", app: "backups")
        XCTAssertEqual(job["state"] as? String, "done")
        XCTAssertEqual(job["kind"] as? String, "backups/cleanup")
        XCTAssertEqual(counter.value, 1)
        let deadline = Date().addingTimeInterval(5)
        while rescans.value == 0, Date() < deadline { Thread.sleep(forTimeInterval: 0.05) }
        XCTAssertGreaterThanOrEqual(rescans.value, 1, "a finished cleanup should measure the disk map again")
    }

    func testSlowHandlerDoesNotBlockOtherRequests() throws {
        let server = LoopbackUIServer(token: "slow-token") { request in
            if request.path == "/slow" { Thread.sleep(forTimeInterval: 2) }
            return UIResponse.json(["ok": true, "path": request.path])
        }
        try server.start()
        defer { server.stop() }
        let slowDone = expectation(description: "slow request")
        DispatchQueue.global().async {
            _ = try? self.request(port: server.port, path: "/slow", token: "slow-token")
            slowDone.fulfill()
        }
        Thread.sleep(forTimeInterval: 0.2)
        let started = Date()
        let fast = try request(port: server.port, path: "/api/status", token: "slow-token")
        XCTAssertEqual(fast.status, 200)
        XCTAssertLessThan(Date().timeIntervalSince(started), 1.0, "a slow handler held up /api/status")
        wait(for: [slowDone], timeout: 5)
    }

    func testPreferredPortIsUsedAndFallsBackWhenTaken() throws {
        let probe = LoopbackUIServer { _ in UIResponse.json(["ok": true]) }
        try probe.start()
        let free = probe.port
        probe.stop()
        let first = LoopbackUIServer(token: "a") { _ in UIResponse.json(["ok": true]) }
        try first.start(preferredPort: free)
        defer { first.stop() }
        XCTAssertEqual(first.port, free)
        let second = LoopbackUIServer(token: "b") { _ in UIResponse.json(["ok": true]) }
        try second.start(preferredPort: free)
        defer { second.stop() }
        XCTAssertGreaterThan(second.port, 0)
        XCTAssertNotEqual(second.port, free)
        XCTAssertEqual(try request(port: second.port, path: "/x", token: "b").status, 200)
        XCTAssertEqual(LoopbackUIServer.defaultPort, 47256)
    }

    func testUnauthorizedCarriesStableCode() throws {
        let server = LoopbackUIServer(token: "right") { _ in UIResponse.json(["ok": true]) }
        try server.start()
        defer { server.stop() }
        let denied = try request(port: server.port, path: "/api/status", token: "wrong")
        XCTAssertEqual(denied.status, 401)
        let object = try XCTUnwrap(JSONSerialization.jsonObject(with: denied.body) as? [String: Any])
        XCTAssertEqual((object["error"] as? [String: Any])?["code"] as? String, "unauthorized")
    }

    func testExpiredLinkInBrowserGetsReadablePage() throws {
        let server = LoopbackUIServer(token: "right") { _ in UIResponse.json(["ok": true]) }
        try server.start()
        defer { server.stop() }
        let page = try request(port: server.port, path: "/?token=old", token: nil, accept: "text/html,application/xhtml+xml")
        XCTAssertEqual(page.status, 401)
        let html = String(decoding: page.body, as: UTF8.self)
        XCTAssertTrue(html.contains("disklessly ui"))
        XCTAssertFalse(html.contains("\"unauthorized\""))
        // API calls keep the JSON error even when the client accepts HTML.
        let api = try request(port: server.port, path: "/api/status", token: "old", accept: "text/html")
        let object = try XCTUnwrap(JSONSerialization.jsonObject(with: api.body) as? [String: Any])
        XCTAssertEqual((object["error"] as? [String: Any])?["code"] as? String, "unauthorized")
    }

    func testShippedPageKeepsTokenAndLocalAssets() throws {
        let web = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .appendingPathComponent("Sources/disklessly/web")
        let html = try String(contentsOf: web.appendingPathComponent("index.html"), encoding: .utf8)
        let css = try String(contentsOf: web.appendingPathComponent("style.css"), encoding: .utf8)
        let js = try String(contentsOf: web.appendingPathComponent("app.js"), encoding: .utf8)
        XCTAssertLessThan(html.range(of: "id=\"banner\"").map { $0.lowerBound } ?? html.endIndex, html.range(of: "class=\"grid\"").map { $0.lowerBound } ?? html.startIndex)
        XCTAssertTrue(html.contains("href=\"style.css\""))
        XCTAssertTrue(html.contains("src=\"app.js\""))
        XCTAssertTrue(html.contains("id=\"recommend-section\""))
        XCTAssertTrue(html.contains("id=\"banner\""))
        XCTAssertTrue(html.contains("role=\"alert\""))
        XCTAssertFalse(html.contains("http://"))
        XCTAssertFalse(html.contains("https://"))
        XCTAssertFalse(css.contains("http://"))
        XCTAssertFalse(css.contains("https://"))
        XCTAssertTrue(css.contains("font-size: 52px"))
        XCTAssertTrue(css.contains("min-height: 44px"))
        XCTAssertTrue(html.contains("id=\"recommend-leftovers\""))
        XCTAssertTrue(html.contains("id=\"license-buy\""), "the License card links to the store")
        XCTAssertTrue(js.contains("购买授权"))
        XCTAssertTrue(js.contains("Buy a license"))
        XCTAssertTrue(js.contains("值得卸载"))
        XCTAssertTrue(js.contains("Worth offloading"))
        XCTAssertTrue(js.contains("残留备份"))
        XCTAssertTrue(js.contains("can be removed"))
        XCTAssertTrue(js.contains("Removing them needs an administrator."))
        XCTAssertTrue(js.contains("/api/recommend"))
        XCTAssertTrue(js.contains("清除缓存"))
        XCTAssertTrue(js.contains("运行正常"))
        XCTAssertTrue(js.contains("已缓存"))
        XCTAssertTrue(js.contains("远端"))
        XCTAssertTrue(js.contains("已固定"))
        XCTAssertTrue(js.contains("if (pct >= 95) return \"hot\""))
        XCTAssertTrue(js.contains("if (pct >= 80) return \"warn\""))
        XCTAssertFalse(js.contains("innerHTML"))
        // The disk usage map is a squarified treemap drawn by the page itself, with no chart library.
        XCTAssertTrue(js.contains("function usageSquarify("))
        // The usage tips link out to tools the user opens in their own browser;
        // the page itself still loads nothing remote.
        XCTAssertTrue(js.contains("url: \"https://github.com/omlahore/RemoveMacAI\""))
        let remote = js.replacingOccurrences(of: "http://www.w3.org/2000/svg", with: "")
            .replacingOccurrences(of: "https://github.com/omlahore/RemoveMacAI", with: "")
            .replacingOccurrences(of: "https://github.com/MobAI-App/simslim", with: "")
        XCTAssertFalse(remote.contains("http://"))
        XCTAssertFalse(remote.contains("https://"))

        // All text lives in app.js's one string table; the shell carries no Chinese to flash before it runs.
        XCTAssertFalse(html.contains("lang=\"zh"))
        XCTAssertFalse(html.unicodeScalars.contains { (0x4E00...0x9FFF).contains($0.value) }, "index.html hard-codes Chinese text")
        // One language at a time: ?lang=, then the saved switch, then the system language.
        XCTAssertFalse(html.contains("id=\"lang\""))
        XCTAssertTrue(html.contains("id=\"lang-toggle\""))
        XCTAssertTrue(html.contains("disklessly_lang="))
        XCTAssertTrue(js.contains("function bi("))
        // Theme follows the system.
        XCTAssertTrue(css.contains("prefers-color-scheme: dark"))
        XCTAssertTrue(css.contains("max-width: 720px"))
        // Actions, confirmations, live results, accessibility hooks.
        XCTAssertTrue(js.contains("/api/jobs/"))
        XCTAssertFalse(js.contains("let busy"))
        XCTAssertTrue(html.contains("<dialog id=\"confirm\""))
        XCTAssertTrue(html.contains("aria-live=\"polite\""))
        XCTAssertTrue(html.contains("id=\"onboarding\""))
        XCTAssertTrue(html.contains("id=\"sessions-section\""))
        XCTAssertTrue(html.contains("id=\"devices-section\""))
        XCTAssertTrue(js.contains("Intl.NumberFormat"))
        XCTAssertTrue(js.contains("Intl.RelativeTimeFormat"))
        XCTAssertTrue(js.contains("REFRESH_MS = 20000"))
        // Mockup states: loading, empty, error with retry, near quota, health.
        for text in ["正在读取后端…", "暂无已卸载应用", "无法连接后端", "Backend unreachable", "低于空闲下限时自动清除未固定的缓存", "会话分层", "Session tiers", "空闲下限", "分离延迟", "缓慢", "Degraded", "离线"] {
            XCTAssertTrue(js.contains(text), text)
        }
        // QA fixes: unpack names the app's own folder, raw server text is folded, pinned evict is never forced.
        XCTAssertFalse(js.contains("永久还原到 /Applications"))
        XCTAssertFalse(js.contains("Restore to /Applications"))
        XCTAssertTrue(js.contains("installPath"))
        XCTAssertTrue(js.contains("function detailsFold("))
        XCTAssertFalse(js.contains("${base} (${message})"))
        XCTAssertTrue(js.contains("force: false"))
        XCTAssertTrue(js.contains("evictPinned"))

        let keys = try copyKeys(js)
        XCTAssertGreaterThan(keys.zh.count, 100)
        XCTAssertEqual(keys.zh.subtracting(keys.en).sorted(), [], "keys only in zh")
        XCTAssertEqual(keys.en.subtracting(keys.zh).sorted(), [], "keys only in en")
        for code in ["unknown_app", "offline", "integrity", "no_space", "busy", "unauthorized", "pinned"] {
            XCTAssertTrue(keys.en.contains("err" + code), code)
        }

        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let repo = root.appendingPathComponent("repo")
        let config = RuntimeConfig(repoPath: repo.path, cacheDir: root.appendingPathComponent("cache").path, stateDir: root.appendingPathComponent("state").path, mountRoot: root.appendingPathComponent("mounts").path, stubDir: root.appendingPathComponent("apps").path)
        var engine = DisklesslyEngine(config: config, secrets: MemorySecretStore())
        engine.backendOverride = try LocalFolderBackend(root: repo)
        try engine.initialize()
        let server = LoopbackUIServer(token: "page-token") { request in
            ManagementUI.respond(engine: engine, webRoot: web, request: request, context: macContext)
        }
        try server.start()
        defer { server.stop() }
        let page = try request(port: server.port, path: "/?token=page-token", token: nil)
        XCTAssertEqual(page.status, 200)
        let served = String(decoding: page.body, as: UTF8.self)
        XCTAssertTrue(served.contains("app.js?token=page-token"))
        XCTAssertTrue(served.contains("style.css?token=page-token"))
        XCTAssertTrue(served.contains("id=\"banner\""))
        let style = try request(port: server.port, path: "/style.css?token=page-token", token: nil)
        XCTAssertEqual(style.status, 200)
        XCTAssertTrue(String(decoding: style.body, as: UTF8.self).contains("font-size: 52px"))
        let script = try request(port: server.port, path: "/app.js?token=page-token", token: nil)
        XCTAssertEqual(script.status, 200)
        XCTAssertTrue(String(decoding: script.body, as: UTF8.self).contains("清除缓存"))
        let status = try request(port: server.port, path: "/api/status", token: "page-token")
        let object = try XCTUnwrap(JSONSerialization.jsonObject(with: status.body) as? [String: Any])
        let cacheInfo = try XCTUnwrap(object["cache"] as? [String: Any])
        XCTAssertNotNil(cacheInfo["minFreeBytes"])
        XCTAssertNotNil(cacheInfo["quotaBytes"])
        XCTAssertNotNil(cacheInfo["detachDelaySeconds"])
        let backend = try XCTUnwrap(object["backend"] as? [String: Any])
        XCTAssertEqual(backend["health"] as? String, "ok")
    }

    /// Top-level keys of `copy.zh` and `copy.en` in app.js (four-space indent inside the i18n markers).
    private func copyKeys(_ js: String) throws -> (zh: Set<String>, en: Set<String>) {
        let start = try XCTUnwrap(js.range(of: "// i18n:begin"))
        let end = try XCTUnwrap(js.range(of: "// i18n:end"))
        let block = String(js[start.upperBound..<end.lowerBound])
        let split = try XCTUnwrap(block.range(of: "\n  en: {"))
        func keys(_ text: Substring) -> Set<String> {
            var found = Set<String>()
            for line in text.split(separator: "\n") where line.hasPrefix("    ") && !line.hasPrefix("     ") {
                let body = line.dropFirst(4)
                guard let colon = body.firstIndex(of: ":") else { continue }
                let name = body[..<colon]
                if !name.isEmpty, name.allSatisfy({ $0.isLetter || $0.isNumber || $0 == "_" }) { found.insert(String(name)) }
            }
            return found
        }
        return (keys(block[..<split.lowerBound]), keys(block[split.upperBound...]))
    }

    private func runJob(port: UInt16, path: String, token: String, app: String, force: Bool = false) throws -> [String: Any] {
        let fields: [String: Any] = force ? ["app": app, "force": true] : ["app": app]
        let body = try JSONSerialization.data(withJSONObject: fields)
        let started = try request(port: port, path: path, token: token, method: "POST", body: body)
        XCTAssertEqual(started.status, 202)
        let object = try XCTUnwrap(JSONSerialization.jsonObject(with: started.body) as? [String: Any])
        let id = try XCTUnwrap(object["jobId"] as? String)
        let deadline = Date().addingTimeInterval(10)
        while Date() < deadline {
            let polled = try request(port: port, path: "/api/jobs/\(id)", token: token)
            let job = try XCTUnwrap(JSONSerialization.jsonObject(with: polled.body) as? [String: Any])
            if job["state"] as? String != "running" { return job }
            Thread.sleep(forTimeInterval: 0.05)
        }
        XCTFail("job \(id) did not finish")
        return [:]
    }

    private func request(port: UInt16, path: String, token: String?, method: String = "GET", body: Data? = nil, accept: String? = nil) throws -> (status: Int, body: Data) {
        let target = try XCTUnwrap(URL(string: "http://127.0.0.1:\(port)\(path)"))
        var request = URLRequest(url: target)
        request.httpMethod = method
        if let accept { request.setValue(accept, forHTTPHeaderField: "Accept") }
        request.httpBody = body
        if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        let box = ResponseBox()
        let done = DispatchSemaphore(value: 0)
        URLSession.shared.dataTask(with: request) { data, response, _ in
            box.data = data ?? Data()
            box.status = (response as? HTTPURLResponse)?.statusCode ?? 0
            done.signal()
        }.resume()
        XCTAssertEqual(done.wait(timeout: .now() + 5), .success)
        return (box.status, box.data)
    }
}

private final class CallCounter: @unchecked Sendable {
    private let lock = NSLock()
    private var count = 0
    func increment() { lock.lock(); count += 1; lock.unlock() }
    var value: Int { lock.lock(); defer { lock.unlock() }; return count }
}

private final class ResponseBox: @unchecked Sendable {
    var status = 0
    var data = Data()
}
