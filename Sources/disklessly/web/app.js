// Loopback management page. The token stays in the page URL; the server rejects
// calls that do not present it. No remote assets and no embedded secrets.
//
// The page shows one language (Chinese or English), chosen in index.html and switched
// from the top bar. All text lives in `copy`.

const params = new URLSearchParams(location.search);
const token = params.get("token") || "";
const REFRESH_MS = 20000;
const JOB_POLL_MS = 700;
const USAGE_STALE_MS = 5 * 60 * 1000;
// Key in `pending` for the leftover backup cleanup job (not an app name).
const LEFTOVER_JOB = "backups";
const TICK_MS = 15000;

// i18n:begin — both languages must carry the same keys (checked by UIServerTests and scripts/ui-screenshots.mjs).
const copy = {
  zh: {
    subtitle: "256G 就够了",
    updatedJustNow: "刚刚更新",
    updatedAgo: (m) => `${m} 分钟前更新`,
    updatedNever: "尚未更新",
    refresh: "刷新",
    skip: "跳到应用",
    retry: "重试",
    cancel: "取消",
    details: "详情",
    dismiss: "关闭",
    backend: "后端",
    locationremote: "远端",
    locationlocal: "本地",
    healthok: "运行正常",
    healthdegraded: "缓慢",
    healthmissing: "仓库不完整",
    healthoffline: "离线",
    healthunknown: "正在检查",
    latency: (ms) => `延迟 ${ms} ms`,
    timedOut: (s) => `超时 ${s} s`,
    missingHint: "能连上，但缺少 repo.json",
    offlineHint: "已缓存的应用仍可打开",
    activeEndpoint: "活动端点",
    kind: "类型",
    endpoints: "端点",
    endpointactive: "活动",
    endpointstandby: "待机",
    endpointlocal: "本地",
    kindlocal: "本地目录",
    kindicloud: "iCloud 云盘",
    kindsmb: "SMB 共享",
    kindnfs: "NFS 共享",
    kindwebdav: "WebDAV",
    kindopenlist: "OpenList",
    kinds3: "S3",
    cache: "缓存",
    levelok: "空间充足",
    levelnear: "接近配额",
    levelcritical: "配额将满",
    levelunset: "未设配额",
    quotaWord: "配额",
    usedPct: "已用",
    floorLabel: "空闲下限",
    floorKeep: (size) => `保留 ${size}`,
    floorMarkerHint: (size) => `缓存长到这里时，磁盘可用空间会降到 ${size} 的下限`,
    legendNormal: "正常",
    legendNear: "接近",
    legendCritical: "临界",
    quotaLeft: "配额剩余",
    floor: "空闲下限",
    diskFree: "磁盘可用",
    detach: "分离延迟",
    durationS: (n) => `${n} 秒`,
    durationM: (n) => `${n} 分钟`,
    nearNote: "低于空闲下限时自动清除未固定的缓存",
    quotaUnset: "未设置配额",
    noData: "没有数据",
    apps: "已卸载应用",
    appsSummary: (n, m, size, k) => `${n} 个应用 · ${m} 个已缓存 ${size} · ${k} 个已固定`,
    colApp: "应用",
    colStatus: "状态",
    colCache: "缓存",
    colActions: "操作",
    backfillIcons: "补齐图标",
    search: "搜索",
    sortBy: "排序",
    sortName: "名称",
    sortSize: "大小",
    sortLastUsed: "最近使用",
    filterBy: "显示",
    filterAll: "全部",
    filterCached: "已缓存",
    filterRemote: "仅远端",
    filterPinned: "已固定",
    noMatches: "没有符合条件的应用",
    modemount: "按需",
    moderestore: "完整",
    modeskip: "跳过",
    modeunsupported: "不支持",
    cached: "已缓存",
    remote: "远端",
    pinned: "已固定",
    restored: "已还原",
    stateAttention: "需要处理",
    stateMounted: "已挂载",
    stateDownloading: "下载中",
    notCached: "未缓存",
    toDownload: "需下载",
    lastUsedAt: (iso) => `${relativeTime(iso, "zh")}使用`,
    onDevices: (names) => `也在 ${names}`,
    packedOn: (names) => `在 ${names} 上卸载`,
    notInstalledHere: "这台 Mac 没有安装",
    launcherMissing: "这台 Mac 上的入口不见了",
    fullAppHere: (version) => `这台 Mac 已装完整版 ${version}`.trim(),
    elsewhereTitle: (n) => `其他 Mac 上卸载的应用（${n}）`,
    elsewhereNote: "仓库在 iCloud 里由你的各台 Mac 共用，所以能看到它们。这些不是这台 Mac 卸载的，这台 Mac 上的应用没有被动过。",
    nothingHere: "这台 Mac 还没有卸载过应用。",
    open: "打开",
    openFor: (name) => `打开 ${name}`,
    prefetch: "预取",
    prefetchFor: (name) => `预取 ${name}`,
    pin: "固定",
    unpin: "取消固定",
    evict: "清除缓存",
    evictMounted: "应用正在使用，退出后再清除",
    detach: "推出",
    detachFor: (name) => `推出 ${name} 的磁盘镜像`,
    detachHint: "推出磁盘镜像，释放挂载。应用在运行时无法推出，退出后约 2 分钟也会自动推出",
    evictPinned: "已固定的应用不能清除，先取消固定",
    more: "更多",
    moreFor: (name) => `${name} 的更多操作`,
    restore: "临时还原",
    unpack: (dir) => `永久还原到 ${dir}…`,
    share: (n) => `占配额 ${n}%`,
    evictNote: "清除缓存只删除本地副本，应用仍保留在后端，下次打开时自动拉取。固定的应用不会被自动清除。",
    emptyApps: "暂无已卸载应用",
    emptyAppsHint: "卸载的应用会显示在这里。",
    loadingApps: "正在加载…",
    loading: "正在读取后端…",
    loadFailed: "未能加载应用",
    unreachable: "无法连接后端",
    appsLoadFailed: "无法读取应用列表",
    confirmEvictTitle: (name) => `清除 ${name} 的缓存？`,
    confirmEvictBody: (size) => `本机会腾出 ${size}。仓库里的镜像保留，下次打开时会重新下载。`,
    confirmEvictOk: "清除缓存",
    confirmRestoreTitle: (name) => `临时还原 ${name}？`,
    confirmRestoreBody: "会把应用解压回本机原位置并打开，退出后再放回仓库。期间会占用完整的磁盘空间。",
    confirmRestoreOk: "还原并打开",
    confirmUnpackTitle: (name, dir) => `把 ${name} 永久还原到 ${dir}？`,
    confirmUnpackBody: (path) => `应用会完整复制回 ${path}，入口替换为真正的应用，此后不再按需挂载。仓库里的镜像保留。`,
    confirmUnpackOk: "永久还原",
    jobDone: (action, name) => `${name}：${action}完成`,
    jobFailed: (action, name) => `${name}：${action}失败`,
    actionlaunch: "打开",
    actionprefetch: "预取",
    actionevict: "清除缓存",
    actiondetach: "推出",
    actionrestore: "临时还原",
    actionunpack: "永久还原",
    actionpin: "固定",
    actionunpin: "取消固定",
    actionpack: "卸载",
    actionoffloadfile: "卸载",
    actiontrashpath: "删除",
    phasepack: "卸载中",
    phasestop: "正在停止",
    phasesnapshot: "正在快照",
    phasearchive: "正在打包",
    phaseencrypt: "正在加密",
    phasehash: "正在校验",
    phaseextract: "正在解包",
    phaseplace: "正在放回",
    "actiondata/enable": "数据放云端",
    "actiondata/disable": "数据留本机",
    dataEnable: "数据也放云端",
    dataOffloadNow: "现在放到云端",
    usageMenuRefused: (why) => `不能在这里操作：${why}`,
    revealInFinder: "在访达中显示",
    revealFailed: "无法在访达中显示",
    bigDataWaiting: "已开启数据上云，但数据还在这台 Mac 上；应用退出后会自动搬走，也可以现在就搬",
    bigReason_appDataOwned: (app) => `${app} 的应用数据。这个应用已卸载，数据可以跟着放到云端`,
    dataDisable: "数据留在本机",
    dataInRepo: (size) => `数据在云端（${size}），打开时自动取回`,
    dataOnQuit: "数据会在退出后放到云端",
    dataLocal: (size) => `数据还有 ${size} 没上云，退出后放上去`,
    cloudBadge: "已卸载，在云端",
    permTitle: "先确认两项系统权限",
    permBody: "Disklessly 要替换或删除 /Applications 里的 App，系统需要你允许。没打开时，卸载和打包会被系统阻止，并一直弹出提示。",
    permFda: "完全磁盘访问",
    permAppMgmt: "App 管理",
    permAppMgmtBody: "允许 Disklessly 更新或删除其他 App。这一项系统无法自动检查，请自己确认打开。",
    permOpen: "打开设置",
    permDone: "我已打开",
    permGranted: "已允许",
    permMissing: "未允许",
    dataWaiting: (why) => `数据暂留本机：${why}`,
    confirmDataEnableTitle: (name) => `把 ${name} 的数据也放到云端？`,
    confirmDataEnableBody: "它在「应用支持」里的文件夹会打包进仓库，然后从本机移走。打开它时先取回数据再启动，退出后数据有改动才重新上传。数据取不回来（比如离线）时不会启动，以免它用空数据打开。应用没退出时会等到它退出。",
    confirmDataDisableTitle: (name) => `把 ${name} 的数据留在本机？`,
    confirmDataDisableBody: "如果数据在云端，会先取回来，之后不再移走。",

    stopAndOffload: "停止并卸载",
    stopAndOffloadFor: (name) => `停止 ${name} 并卸载`,
    loginItemsSettings: "登录项设置",
    confirmStopPackBody: (size) => `会先退出这个应用在后台运行的辅助进程，再把它打包进仓库（约 ${size}），原位置换成一个入口，之后按需下载打开。可能要几分钟。`,
    offloadNow: "立即卸载",
    offloadNowFor: (name) => `立即卸载 ${name}`,
    offloading: "卸载中…",
    confirmPackTitle: (name) => `卸载 ${name}？`,
    confirmPackBody: (size) => `应用会被打包进仓库（约 ${size}），原位置换成一个入口，之后按需下载打开。需要先退出这个应用；可能要几分钟。`,
    confirmPackOk: "卸载",
    confirmFileTitle: (name) => `卸载 ${name}？`,
    confirmTrashTitle: (name) => `删除 ${name}？`,
    confirmTrashBody: (size) => `它会被移到废纸篓（约 ${size}），清空废纸篓后才真正释放空间。需要先在其他 app 里关闭它。`,
    trashOk: "移到废纸篓",
    bigUpload: "放到云端",
    bigDelete: "删除",
    confirmFileBody: (size) => `它会被移进仓库（约 ${size}），原位置留下一个同名的 .disklessly 占位文件；文件夹的原路径还会变成一个带云角标的链接。双击占位文件，或在访达里右键选“用 Disklessly 取回”，就能把它拿回来。需要先在其他 app 里关闭它。`,
    phasequeued: "排队中",
    phaseresolve: "查找镜像",
    phasedownload: "下载中",
    phaseopen: "正在打开",
    phaserunning: "已打开",
    phaseevict: "清除中",
    phasedetach: "推出中",
    phaseunpack: "复制中",
    phasepin: "更新中",
    errunknown_app: "仓库里找不到这个应用。",
    erroffline: "连不上仓库，请检查网络或共享盘后重试。",
    errintegrity: "下载的镜像校验失败，已丢弃，请重试。",
    errno_space: "磁盘空间不足，先清除一些缓存再试。",
    errbusy: "这个应用正在执行另一项操作，请稍后再试。",
    errpinned: "这个应用已固定，先取消固定再清除缓存。",
    errunauthorized: "链接已失效。",
    errunsupported: "这台 Mac 不支持这个操作。",
    errneeds_resolution: "这个应用有未处理的改动，请先在终端里运行 disklessly resolve。",
    errbad_request: "请求无效。",
    errfailed: "操作失败。",
    expiredTitle: "链接已失效",
    expiredBody: "这个页面的访问令牌已过期或不正确。请在终端里重新运行 disklessly ui，再打开它给出的链接。",
    heroTitle: "三步腾出空间",
    heroBody: "把很少用的大应用放到仓库里，本机只留一个很小的入口；双击入口时再按需下载并打开。",
    heroStep1: "1. 选择仓库",
    heroStep2: "2. 查看建议",
    heroStep2Body: "下面会列出体积大、久未使用的应用。",
    heroStep2Link: "跳到建议",
    heroStep3: "3. 卸载到仓库",
    heroStep3Body: "复制建议里的命令到终端运行：",
    heroRepo: (path) => `当前仓库：${path}`,
    license: "授权",
    licenseCode: "授权码",
    licenseActivate: "激活",
    licenseRemove: "移除授权",
    licenseBuy: "购买授权",
    licenseFree: (used, limit) => `免费版：已卸载 ${used} / ${limit} 个应用或文件`,
    licenseFreeBody: "启动、还原和取消卸载已卸载的应用，以及取回已卸载的文件，永远免费。要卸载更多，请输入授权码。",
    licenseFull: "已授权：卸载应用和文件数量不限",
    licenseUntil: (date) => `有效期至 ${date}`,
    licenseUpdates: (date) => `${date} 前的更新已包含`,
    licenseExpired: (date) => `授权码已于 ${date} 过期，免费版限额重新生效`,
    licenseInvalid: "已保存的授权码无法使用，免费版限额生效",
    licenseOk: "授权已激活",
    licenseRemoved: "授权已移除",
    cloudTitle: "云盘与仓库",
    cloudRepoDefault: (kind) => kind === "icloud" ? "当前仓库：iCloud 云盘（默认）" : "当前仓库：本机文件夹（默认）",
    cloudRepoBackend: (id) => `当前仓库：${id}`,
    cloudSummary: (n) => n ? `已连接 ${n} 个网盘` : "仓库默认放在 iCloud 云盘",
    cloudDrives: "网盘（内置 rclone）",
    cloudDrivesNote: "连接后可以把已卸载的应用放到网盘里。登录在浏览器中完成，凭据只保存在这台 Mac 上。",
    cloudConnect: (name) => `连接 ${name}`,
    cloudNoRemotes: "还没有连接网盘。",
    cloudUse: "设为仓库",
    cloudDefaultName: (kind) => kind === "icloud" ? "iCloud 云盘" : "本机文件夹",
    cloudActive: "当前仓库",
    cloudDisconnect: "断开",
    cloudBackDefault: (kind) => kind === "icloud" ? "切回 iCloud 云盘" : "切回本机文件夹",
    cloudUseConfirm: (target, n) => n
      ? `把仓库切换到 ${target}？\n\n会先把当前仓库搬过去：${n} 个应用的镜像和其他数据逐个复制、校验，全部成功后才切换，已卸载的应用照常打开。旧仓库保留为备份，新仓库读不到时自动从备份读。`
      : `把仓库切换到 ${target}？\n\n当前仓库里的数据会先复制过去并校验，完成后才切换；旧仓库保留为备份。`,
    cloudTaskmigrate: (phase, p) => `正在搬家（${({ scan: "清点", copy: "复制", verify: "校验", switch: "切换", done: "完成" })[phase] || "准备"}）${p}`,
    "cloudTaskmirror-sync": (phase, p) => `正在同步备份（${({ scan: "清点", copy: "复制", verify: "校验", done: "完成" })[phase] || "准备"}）${p}`,
    cloudProgress: (files, total, done, size) => `：${files}/${total} 个文件，${done} / ${size}`,
    cloudMirror: "备份",
    cloudMirrorAdd: "设为备份",
    cloudMirrorRemove: "取消备份",
    cloudMirrorSync: "立即同步备份",
    cloudMirrorsLine: (n) => `另有 ${n} 个备份仓库，主仓库读不到时自动从备份读。`,
    cloudMirrorLast: (when, ok) => ok ? `上次同步 ${when}` : `上次同步失败（${when}）`,
    cloudMirrorNever: "还没同步过",
    cloudMigrated: (target, n) => `已搬到 ${target}（复制 ${n} 个文件）`,
    cloudDisconnectConfirm: (name) => `断开 ${name}？网盘上的文件不会被删除。`,
    cloudTaskconnect: "正在等待你在浏览器里登录…",
    cloudTaskopenlist: (phase) => `正在安装 OpenList（${({ download: "下载中", verify: "校验中", configure: "配置中", start: "启动中" })[phase] || "准备中"}）…`,
    cloudTaskDone: "完成",
    cloudTaskFailed: (msg) => `失败：${msg}`,
    cloudSwitched: (target) => `仓库已切换到 ${target}`,
    cloudNoRclone: "找不到内置的 rclone，请重新安装 Disklessly。",
    openlistTitle: "OpenList（可选）",
    openlistNote: "OpenList 能把阿里云盘、百度网盘、115、夸克等网盘统一成 WebDAV。它只在这台 Mac 的 127.0.0.1 上运行；首次安装需下载约 50 MB。",
    openlistInstall: "一键安装 OpenList",
    openlistRunning: (url) => `运行中：${url}`,
    openlistStopped: "已停止",
    openlistOpen: "打开管理页",
    openlistPassword: "显示管理员密码",
    openlistPasswordIs: (pw) => `用户 admin，密码 ${pw}`,
    openlistStart: "启动",
    openlistStop: "停止",
    openlistHint: "先在管理页里添加你的网盘，再把 OpenList 设为仓库。",
    errlicense_required: "免费版的卸载数量已用完（应用和文件合计）。在授权卡片里购买授权并输入授权码，即可继续卸载。",
    sessionTiers: "会话分层",
    coldAfter: (n) => `${n} 天未用转冷`,
    offloadedCount: (n) => `已卸载 ${n} 个`,
    emptySessions: "还没有归档的会话",
    sessionIntro: "扫描各个 AI 编程助手的会话记录。勾选后，久未打开的会话会把完整快照上传到仓库，本机只留一份短文本摘要，随时可以还原原文件。",
    sessionPlanLine: (files, size, cold, coldSize) => `${files} 个会话，${size}；${cold} 个可转移（${coldSize}）`,
    sessionPlanNone: "没找到 AI 编程助手的会话记录。",
    sessionPlanAbsent: "这台 Mac 上没有",
    sessionApply: "转移选中的冷会话",
    sessionApplying: "正在转移…",
    sessionConfirmTitle: (n, size) => `转移 ${n} 个冷会话（${size}）？`,
    sessionConfirmBody: (agents) => `${agents}：完整会话文件打包上传到仓库，读回校验无误后才删除本机文件；本机保留短文本摘要，可以搜索和查看。需要时点「还原」把原文件放回原处。最近 24 小时改过或正在打开的会话不会动。`,
    sessionApplied: (n, size) => `已转移 ${n} 个会话，腾出 ${size}`,
    sessionFailed: "会话转移失败",
    sessionDigest: "摘要",
    sessionDigestHide: "收起",
    sessionRestore: "还原",
    sessionUntitled: "（无标题）",
    sessionShowList: (n) => `查看 ${n} 个`,
    sessionHideList: () => "收起",
    sessionPickAll: "全选",
    sessionPickNone: "全不选",
    sessionPicked: (n, size) => `已选 ${n} 个，${size}`,
    sessionFilter: "按标题、工具或路径筛选",
    sessionFilterNone: "没有匹配的会话",
    sessionRestored: (path) => `已还原到 ${path}`,
    sessionRestoreFailed: "还原失败",
    tiercold: "冷",
    daysAgo: (n) => (n <= 0 ? "今天" : `${n} 天前`),
    recommend: "值得卸载",
    recommendWarn: "不建议卸载",
    recommendEmpty: "没有达到大小阈值的应用",
    recommendEmptyHint: "较大且久未使用的应用会显示在这里",
    foldedTitle: (n) => `其他应用：较小、正在运行或最近在用（${n}）`,
    foldedHint: "按打开次数和大小综合排序；不展开也不影响上面的清单。",
    recommendUnavailable: "扫描已安装应用需要 macOS",
    recommendFailed: "未能加载建议",
    recommendScanning: "正在扫描已安装的应用…",
    recommendSummary: (count, min) => `${count} 个应用 · 只列出不小于 ${min} 的应用`,
    filesTitle: "大文件和文件夹",
    bigTitle: "其他大头",
    bigScanning: "正在测量模拟器、缓存和应用数据…",
    bigSummary: (n, size) => `${n} 项，共 ${size}。应用以外的空间大多在这里。`,
    bigNone: "没有超过 1 GB 的模拟器、缓存或应用数据。",
    bigGoDev: "去模拟器",
    bigClean: "清理",
    bigCleaning: "正在清理…",
    bigShowUsage: "看占用",
    bigReason_unusedRuntime: "没有模拟器在用这个运行时，可以放到云端，要用时再取回",
    bigReason_runtime: "模拟器运行时，可以放到云端，要用时再取回",
    bigReason_idleSimulator: "模拟器数据，可以放到云端，取回后换新 UDID",
    bigReason_running: "模拟器正在运行，关掉后才能放到云端",
    bigReason_rebuildable: "工具会自动重新下载或生成，清理后挪到废纸篓",
    "bigReason_claude-vm-bundles": "Claude 桌面端下载的 Linux 虚拟机包，退出 Claude 后可以删，需要时会重新下载",
    loc_claudeVmBundles: "Claude 虚拟机包",
    sipSuffix: "（SIP 保护）",
    sip_siri: "Siri 离线模型",
    sip_speech: "离线听写模型",
    sip_linguistic: "语言数据",
    sip_translation: "离线翻译模型",
    sip_devdocs: "Apple 离线开发文档",
    sip_font: "扩展字体",
    sip_dictionary: "词典",
    sip_ttsax: "辅助功能语音",
    sip_macintalk: "系统语音",
    bigReason_adviceSip: "系统资产，受 SIP 保护；关闭 SIP 后这里会出现删除按钮",
    bigReason_adviceSipOff: "系统资产。SIP 已关闭，可以删除；需要管理员密码，系统以后可能会重新下载",
    bigConfirmBodySip: (size) => `大约释放 ${size}。这些系统资产会被直接删除（不进废纸篓），需要输入管理员密码。相关功能（如 Siri、听写、离线文档）可能失效，系统以后可能会重新下载。`,
    bigReason_appData: "应用数据。在应用里清理；或者先把它的应用卸载上云，数据就能跟着放到云端",
    bigReason_personal: "个人文件夹。可在「大文件和文件夹」里把不常用的放到云端",
    bigConfirmTitle: (name) => `清理「${name}」？`,
    ctrTitle: "容器镜像",
    ctrScanning: "正在读取容器镜像…",
    ctrNone: "这台 Mac 上没有 Apple container、Docker Desktop、OrbStack、Colima 或 Dory。",
    ctrSummary: (n, size, free) => `${n} 个镜像，共 ${size}；没在用的 ${free} 可以放到云端或清理。`,
    ctrEngine: (name, size) => `${name} · 磁盘上共 ${size}`,
    ctrEngine_running: "运行中",
    ctrEngine_stopped: "没在运行，只能看到磁盘大小；启动后才能列出镜像",
    ctrEngine_noCli: "找不到命令行工具，只能看到磁盘大小",
    ctrUse_running: (names) => `在用：容器 ${names} 正在运行`,
    ctrUse_stopped: (names) => `在用：停止的容器 ${names} 还引用它，先删掉容器才能移走`,
    ctrUse_recent: (days) => `最近 ${days} 天内拉取或运行过，可能还会用`,
    ctrUse_dangling: "没有标签的旧镜像，通常可以直接清理",
    ctrUse_idle: "没有容器在用，也很久没拉取或运行",
    ctrLastUsed: (days) => (days <= 0 ? "今天用过" : `${days} 天前用过`),
    ctrOffload: "放到云端",
    ctrClean: "清理",
    ctrRestore: "恢复",
    ctrForget: "从仓库删除",
    ctrOffloaded: "已放到云端",
    ctrVolumes: "卷",
    ctrVolumeInUse: "有容器在用",
    ctrVolumeNote: "卷里是容器的数据，这里只显示大小，不会动它们。",
    ctrInstalledHere: "这台 Mac 上也有",
    ctrConfirmOffloadTitle: (name) => `把镜像 ${name} 放到云端？`,
    ctrConfirmOffloadBody: (size, engine, recent) => `${recent ? "这个镜像最近用过。" : ""}用 ${engine} 把镜像导出成 tar（约 ${size}），写到仓库并校验 sha256 之后，再从这台 Mac 删除镜像。之后可以一键恢复。`,
    ctrConfirmCleanTitle: (name) => `清理镜像 ${name}？`,
    ctrConfirmCleanBody: (size) => `直接删除这个镜像（约 ${size}），不保存。以后需要时要重新拉取或构建。`,
    ctrConfirmForgetTitle: (name) => `从仓库删除 ${name}？`,
    ctrConfirmForgetBody: (size) => `删除仓库里的 ${size}，之后就不能再恢复了。`,
    ctrVMNote: "镜像在虚拟机磁盘里，删除后要等虚拟机回收磁盘（通常重启一次）空间才会回到 Mac。",
    ctrJobDone: (name, freed) => (freed ? `${name}：完成，腾出 ${freed}` : `${name}：完成`),
    ctrJobFailed: (name) => `${name}：失败`,
    phasecheck: "检查中",
    phasesave: "导出中",
    phaseupload: "上传中",
    phaseverify: "校验中",
    phaseremove: "删除中",
    phaseload: "导入中",
    phaseforget: "删除中",
    bigConfirmBody: (size) => `大约释放 ${size}。内容挪到废纸篓（Homebrew 用 brew cleanup），对应的工具下次用到时会重新下载或生成。`,
    filesSummary: (count, min, days) => `${count} 项 · 不小于 ${min}，且 ${days} 天以上没打开过`,
    filesEmpty: "主文件夹里没有又大又久未打开的文件",
    filesScanning: "正在扫描主文件夹…",
    filesPartial: "扫描提前结束，列表可能不完整",
    filesFolder: "文件夹",
    filesFile: "文件",
    filesIdle: (days) => `${days} 天未打开`,
    filesNever: "从未打开",
    couldFree: "大约可腾出",
    scannedAgo: (iso) => `扫描于${relativeTime(iso, "zh")}`,
    rescan: "重新扫描",
    usage: "磁盘占用",
    usageScan: "分析占用",
    usageRescan: "重新分析",
    usageScanning: "正在分析磁盘…",
    usageIntro: "看看 256G 都被谁占了：应用的包体、缓存和数据，以及 Disklessly 自己的缓存。只读取大小，不会改动任何文件。",
    usagePartial: "部分目录超时没有读完，没读完的部分计入“系统及其他”。",
    usageFailed: "无法读取占用",
    usageHint: "点击方块放大，点击上方路径返回。",
    usageTotal: (used, free, total) => `共 ${total} · 已用 ${used} · 可用 ${free}`,
    usage_disk: "整块磁盘",
    usage_apps: "应用",
    usage_disklessly: "Disklessly",
    usage_personal: "个人文件",
    usage_library: "资源库",
    usage_appdata: "应用数据（~ 下的隐藏目录）",
    usage_system: "系统及其他",
    usage_macos: "macOS 系统",
    usage_vm: "虚拟内存",
    usage_simruntimes: "iOS 模拟器运行时",
    usage_simdevices: "模拟器设备",
    usage_deriveddata: "Xcode 编译缓存",
    usage_homebrew: "Homebrew",
    usage_var: "系统数据 /private/var",
    usage_unmeasured: "未能测量",
    cleanTitle: "可以腾出空间的地方",
    cleanNote: "“未能测量”包括时间机器本地快照、可清除空间、其他用户的文件，以及没有完全磁盘访问权限时读不到的文件夹。",
    cleanRun: "清理",
    cleanRunning: "清理中…",
    cleanDone: (name, freed) => `${name}：腾出 ${freed}`,
    cleanFailed: (name) => `${name}清理失败`,
    cleanWhat_brew_cleanup: "删除旧版本和下载缓存（brew cleanup --prune=all）",
    cleanWhat_sim_runtimes: "删除已有更新版本或已损坏的模拟器运行时（simctl runtime delete --outdated / --unusable）",
    cleanWhat_sim_devices: "删除运行时已经不存在的模拟器设备（simctl delete unavailable）",
    cleanWhat_derived_data: "删除 Xcode 的编译缓存，下次编译时会重新生成",
    cleanConfirm: (name) => `清理${name}？`,
    usage_free: "可用",
    usage_bundle: "包体",
    usage_cache: "缓存",
    usage_data: "数据",
    usage_repo: "本机仓库",
    usage_state: "状态与临时文件",
    usage_files: "散落文件",
    usage_rest: (n) => `其余 ${n} 项`,
    usage_other: "其他",
    cachesLine: (size, n) => `已卸载的 ${n} 个应用还留着 ${size} 缓存，可以清掉。`,
    cachesNone: "已卸载的应用没有留下缓存。",
    cachesRunning: (names) => `运行中的应用会跳过：${names}`,
    cachesClear: "清理应用缓存",
    cachesConfirmTitle: (size) => `清理已卸载应用的缓存（${size}）？`,
    cachesConfirmBody: "只清空 ~/Library/Caches 里这些应用的缓存文件夹，以及沙盒容器里的 Data/Library/Caches。Application Support 和其他数据不会动；正在运行的应用会跳过。应用下次打开时会重新生成缓存。",
    cachesDone: (size) => `已清理 ${size} 缓存`,
    cachesFailed: "无法清理缓存",
    usageTips: "可以腾出空间的地方",
    dev: "Xcode 模拟器",
    devIntro: "模拟器运行时和模拟器设备可以放到云端，用的时候再取回。运行时取回后和原来一样；模拟器取回后会换一个新的 UDID。",
    devRuntimes: "运行时",
    devSimulators: "模拟器",
    devOffloaded: "已放到云端",
    devOffload: "放到云端",
    devRestore: "取回",
    devForget: "从仓库删除",
    devCleanDerived: "清理 DerivedData",
    devNone: "没有",
    devShutdown: "关闭模拟器",
    devRunning: "正在运行，关掉后才能放到云端",
    devInUseBy: (names) => `${names} 正在用它，关掉后才能放到云端`,
    devConfirmShutdownTitle: (name) => `关闭模拟器「${name}」？`,
    devConfirmShutdownBody: "如果有测试或应用正在这台模拟器里跑，会被中断。",
    devUnavailable: "读不到模拟器信息（需要安装 Xcode）",
    devInstalledHere: "这台 Mac 上也有",
    devFrom: (host) => `来自 ${host}`,
    devConfirmRuntimeTitle: (name) => `把 ${name} 放到云端？`,
    devConfirmRuntimeBody: (size) => `上传 ${size} 到仓库，校验后用 simctl 从这台 Mac 删除。需要时可以原样取回。`,
    devConfirmSimTitle: (name) => `把模拟器 ${name} 放到云端？`,
    devConfirmSimBody: (size) => `把模拟器的数据（${size}）打包上传，校验后删除这台模拟器。取回时会新建同型号的模拟器并放回数据，UDID 会变。`,
    devConfirmForgetTitle: (name) => `从仓库删除 ${name}？`,
    devConfirmForgetBody: (size) => `删除仓库里的 ${size}，之后就不能再取回了。`,
    devConfirmCleanTitle: "清理 DerivedData？",
    devConfirmCleanBody: "把 Xcode 的编译缓存移到废纸篓，Xcode 下次编译时会重新生成。",
    devConfirmOk: "继续",
    devJobDone: (name) => `${name}：完成`,
    devJobFailed: (name) => `${name}：失败`,
    tipRemoveMacAITitle: "Apple Intelligence 模型",
    tipRemoveMacAIBody: "“系统及其他”里有 Apple Intelligence 下载的模型，往往有好几 GB。开源工具 RemoveMacAI 可以关掉 Apple Intelligence、删掉这些模型并阻止重新下载，随时能撤销。",
    tipRemoveMacAILink: "打开 RemoveMacAI",
    tipDevOffloadTitle: "Xcode 模拟器",
    tipDevOffloadBody: "“资源库 › Developer”和“系统及其他”里的模拟器运行时和模拟器设备，可以放到云端，用时再取回。",
    tipDevOffloadLink: "去放到云端",
    tipPackTitle: "系统数据太大？先卸载大应用",
    tipPackBody: "“系统及其他”常常是大应用留下的文件。推荐列表里的应用可以用“卸载”放到云端，本机只留一个小入口，要用时再装回来。",
    tipPackLink: "看推荐卸载的应用",
    tipSimslimTitle: "模拟器占内存？用 simslim 瘦身",
    tipSimslimBody: "simslim 能关掉模拟器里用不到的后台服务，每台模拟器的内存大约能少一半以上。它只省内存，不会让模拟器的磁盘占用变小。",
    tipSimslimLink: "打开 simslim",
    copyCommand: "复制命令",
    copyCommandFor: (name) => `复制命令：打包 ${name}`,
    copied: (name) => `已复制 ${name} 的打包命令`,
    copyFailed: "无法写入剪贴板，请手动复制命令",
    leftoverBackups: (count, size) => `${count} 个残留备份（${size}）可以删除`,
    leftoverAdmin: "删除需要管理员权限。",
    leftoverClean: "删除残留备份",
    leftoverCleanTitle: (count, size) => `删除 ${count} 个残留备份（${size}）？`,
    leftoverCleanBody: "上面列出的残留备份文件（.disklessly-original- 备份）会被删除。macOS 会先弹出管理员密码框；之后只删除已与仓库镜像核对一致的备份。删除后无法撤销。",
    leftoverCleanOk: "删除",
    leftoverCleanDone: "残留备份已删除",
    leftoverCleanFailed: "无法删除残留备份",
    neverUsed: "从未使用",
    idleDays: (n) => (n === 1 ? "1 天未使用" : `${n} 天未使用`),
    restoreNeeded: "含商店收据，需要还原模式",
    sizeBound: "大小是下限（扫描超时）",
    warnloginItem: "登录项",
    warnmenuBarAgent: "菜单栏代理",
    warnbackgroundHelper: "后台辅助进程在运行",
    warnsystemExtension: "带系统扩展",
    warnkernelExtension: "带内核扩展",
    warntoolchain: "引擎使用的工具链",
    warnpinned: "已固定",
    warnalreadyPacked: "已经打包",
    warnsizeTimedOut: "体积扫描超时",
    alreadyInRepo: "仓库里已有相同版本，打包无需上传",
    devices: "设备",
    devicesEmpty: "还没有登记的 Mac",
    devicesSummary: (n) => `${n} 台 Mac 共用这个仓库`,
    thisMac: "本机",
    conflictCopies: (n) => `${n} 个 iCloud 冲突副本，未合并`,
    placeholders: (n) => `${n} 个设备文件还没下载`,
    countNone: "无",
    machinesTitle: "远程机器（SSH）",
    machinesSummary: (n, r) => `${n} 台机器 · ${r} 台 SSH 远程`,
    machinesHostLabel: "SSH 主机",
    machinesHostPlaceholder: "例如 gpu-box 或 dev-server",
    machinesAdd: "添加主机",
    machinesRemove: "移除",
    machinesScan: "扫描磁盘",
    machinesScanning: "正在通过 SSH 扫描…",
    machinesInspect: "查看大项",
    machinesLocalBadge: "本机",
    machinesRemoteBadge: "SSH",
    machinesLevel_offline: "离线",
    machinesLevel_critical: "紧张",
    machinesLevel_warning: "偏高",
    machinesLevel_ok: "正常",
    machinesDiskLine: (used, total, reclaim) => `已用 ${used} / ${total} · 可清理/可卸载 ${reclaim}`,
    machinesNotScanned: "尚未扫描，点击“扫描磁盘”采集挂载点与大项",
    machinesDetailTitle: (host, mode) => `${host} 扫描详情（${mode || "ssh"}）`,
    machinesMountsTitle: "挂载点",
    machinesMountFree: (dev, fs, size) => `${dev} (${fs}) · 可用 ${size}`,
    machinesItemsTitle: "可清理缓存与可卸载大项",
    machinesOffloadedTitle: "已卸载到云端仓库",
    machinesNoItems: "未发现可清理或可卸载的大项",
    machinesCleanBtn: "清理",
    machinesOffloadBtn: "卸载上云",
    machinesRestoreBtn: "取回还原",
    machinesPlanConfirmTitle: (act, title, host) => `在 ${host} 上${act} ${title}？`,
    machinesPlanConfirmBody: (path, size, rec) => `目标路径：${path}\n预计释放：${size}\n可从仓库恢复：${rec ? "是（先上传校验再移除原件，留存 .disklessly-remote 占位与事务日志）" : "否（可重建缓存/日志直接清理）"}`,
    machinesRestoreConfirmTitle: (title, host) => `取回 ${title} 并还原到 ${host}？`,
    machinesRestoreConfirmBody: (path, size) => `将从云端仓库流式还原到 ${path}（${size}），校验通过后移除占位标记。`,
    machinesActionDone: (host, title) => `${host}: ${title} 已完成`,
    machinesActionFailed: (host, title) => `${host}: ${title} 失败`,
  },
  en: {
    subtitle: "256G is enough",
    updatedJustNow: "Updated just now",
    updatedAgo: (m) => `Updated ${m} min ago`,
    updatedNever: "Not updated yet",
    refresh: "Refresh",
    skip: "Skip to apps",
    retry: "Retry",
    cancel: "Cancel",
    details: "Details",
    dismiss: "Dismiss",
    backend: "Backend",
    locationremote: "Remote",
    locationlocal: "Local",
    healthok: "Healthy",
    healthdegraded: "Degraded",
    healthmissing: "Repo incomplete",
    healthoffline: "Offline",
    healthunknown: "Checking",
    latency: (ms) => `latency ${ms} ms`,
    timedOut: (s) => `timed out after ${s} s`,
    missingHint: "Reachable, but repo.json is missing",
    offlineHint: "Cached apps still open",
    activeEndpoint: "Active",
    kind: "Kind",
    endpoints: "Endpoints",
    endpointactive: "Active",
    endpointstandby: "standby",
    endpointlocal: "local",
    kindlocal: "Local folder",
    kindicloud: "iCloud Drive",
    kindsmb: "SMB share",
    kindnfs: "NFS share",
    kindwebdav: "WebDAV",
    kindopenlist: "OpenList",
    kinds3: "S3",
    cache: "Cache",
    levelok: "Plenty of room",
    levelnear: "Near quota",
    levelcritical: "Almost full",
    levelunset: "No quota",
    quotaWord: "quota",
    usedPct: "used",
    floorLabel: "Free floor",
    floorKeep: (size) => `keeps ${size} free`,
    floorMarkerHint: (size) => `At this cache size, free disk space falls to the ${size} floor`,
    legendNormal: "Normal",
    legendNear: "Near",
    legendCritical: "Critical",
    quotaLeft: "Quota left",
    floor: "Floor",
    diskFree: "free on disk",
    detach: "Detach delay",
    durationS: (n) => `${n} s`,
    durationM: (n) => `${n} min`,
    nearNote: "Unpinned cache is cleared automatically below the free floor",
    quotaUnset: "No quota set",
    noData: "No data",
    apps: "Offloaded apps",
    appsSummary: (n, m, size, k) => `${n} ${n === 1 ? "app" : "apps"} · ${m} cached ${size} · ${k} pinned`,
    colApp: "App",
    colStatus: "Status",
    colCache: "Cache",
    colActions: "Actions",
    backfillIcons: "Backfill icons",
    search: "Search",
    sortBy: "Sort",
    sortName: "Name",
    sortSize: "Size",
    sortLastUsed: "Last used",
    filterBy: "Show",
    filterAll: "All",
    filterCached: "Cached",
    filterRemote: "Remote only",
    filterPinned: "Pinned",
    noMatches: "No apps match",
    modemount: "on-demand",
    moderestore: "full",
    modeskip: "skip",
    modeunsupported: "unsupported",
    cached: "Cached",
    remote: "Remote",
    pinned: "Pinned",
    restored: "Restored",
    stateAttention: "Needs attention",
    stateMounted: "Mounted",
    stateDownloading: "Downloading",
    notCached: "Not cached",
    toDownload: "to download",
    lastUsedAt: (iso) => `used ${relativeTime(iso, "en")}`,
    onDevices: (names) => `Also on ${names}`,
    packedOn: (names) => `Offloaded on ${names}`,
    notInstalledHere: "Not installed on this Mac",
    launcherMissing: "This Mac's launcher is missing",
    fullAppHere: (version) => `Full app ${version} is installed on this Mac`.replace("  ", " "),
    elsewhereTitle: (n) => `Offloaded on other Macs (${n})`,
    elsewhereNote: "Your Macs share one repo in iCloud, so their apps show up here. They were not offloaded from this Mac, and nothing on this Mac was touched.",
    nothingHere: "No apps offloaded on this Mac yet.",
    open: "Open",
    openFor: (name) => `Open ${name}`,
    prefetch: "Prefetch",
    prefetchFor: (name) => `Prefetch ${name}`,
    pin: "Pin",
    unpin: "Unpin",
    evict: "Evict",
    evictMounted: "The app is in use; quit it first",
    detach: "Eject",
    detachFor: (name) => `Eject ${name}'s disk image`,
    detachHint: "Ejects the disk image. Refused while the app runs; it also ejects about 2 minutes after you quit",
    evictPinned: "Pinned apps can't be evicted; unpin first",
    more: "More",
    moreFor: (name) => `More actions for ${name}`,
    restore: "Restore temporarily",
    unpack: (dir) => `Restore to ${dir} for good…`,
    share: (n) => `${n}% of quota`,
    evictNote: "Evict only drops the local copy; pinned apps are never auto-evicted.",
    emptyApps: "No offloaded apps.",
    emptyAppsHint: "Apps you offload show up here.",
    loadingApps: "Loading…",
    loading: "Loading",
    loadFailed: "Could not load apps",
    unreachable: "Backend unreachable",
    appsLoadFailed: "Couldn't load the app list",
    confirmEvictTitle: (name) => `Evict ${name} from the cache?`,
    confirmEvictBody: (size) => `This frees ${size} on this Mac. The image stays in the repo and downloads again the next time you open the app.`,
    confirmEvictOk: "Evict",
    confirmRestoreTitle: (name) => `Restore ${name} temporarily?`,
    confirmRestoreBody: "The app is copied back to its original place and opened, then returned to the repo after it quits. It uses the full disk space meanwhile.",
    confirmRestoreOk: "Restore and open",
    confirmUnpackTitle: (name, dir) => `Restore ${name} to ${dir} for good?`,
    confirmUnpackBody: (path) => `The full app is copied back to ${path} and replaces the launcher; it is no longer mounted on demand. The image stays in the repo.`,
    confirmUnpackOk: "Restore for good",
    jobDone: (action, name) => `${name}: ${action} finished`,
    jobFailed: (action, name) => `${name}: ${action} failed`,
    actionlaunch: "open",
    actionprefetch: "prefetch",
    actionevict: "evict",
    actiondetach: "eject",
    actionrestore: "restore",
    actionunpack: "permanent restore",
    actionpin: "pin",
    actionunpin: "unpin",
    actionpack: "offload",
    actionoffloadfile: "offload",
    actiontrashpath: "delete",
    phasepack: "Offloading",
    phasestop: "Stopping",
    phasesnapshot: "Snapshotting",
    phasearchive: "Packing",
    phaseencrypt: "Encrypting",
    phasehash: "Checking",
    phaseextract: "Unpacking",
    phaseplace: "Putting back",
    "actiondata/enable": "Move data to the repo",
    "actiondata/disable": "Keep data here",
    dataEnable: "Move its data too",
    dataOffloadNow: "Offload now",
    usageMenuRefused: (why) => `Not available here: ${why}`,
    revealInFinder: "Show in Finder",
    revealFailed: "Could not show it in Finder",
    bigDataWaiting: "Data offload is on but the data is still on this Mac; it moves after the app quits, or you can move it now",
    bigReason_appDataOwned: (app) => `Data of ${app}. The app is offloaded, so its data can follow it to the cloud`,
    dataDisable: "Keep its data here",
    dataInRepo: (size) => `Data in the repo (${size}), fetched when you open it`,
    dataOnQuit: "Data moves to the repo after it quits",
    dataLocal: (size) => `${size} of data is not in the repo yet; it moves after quit`,
    cloudBadge: "Uninstalled; in the cloud",
    permTitle: "Check two system permissions first",
    permBody: "Disklessly has to replace or delete apps in /Applications, and macOS needs your permission for that. Until both are on, uninstall and pack are blocked and macOS keeps prompting.",
    permFda: "Full Disk Access",
    permAppMgmt: "App Management",
    permAppMgmtBody: "Lets Disklessly update or delete other apps. macOS cannot be checked automatically, so turn it on yourself.",
    permOpen: "Open Settings",
    permDone: "I turned it on",
    permGranted: "Allowed",
    permMissing: "Not allowed",
    dataWaiting: (why) => `Data stays here for now: ${why}`,
    confirmDataEnableTitle: (name) => `Move ${name}'s data to the repo too?`,
    confirmDataEnableBody: "Its folders in Application Support are packed into the repo and removed from this Mac. Opening it fetches the data first; after it quits, the data is uploaded again only if it changed. If the data cannot be fetched (offline, for example) the app does not open, so it never starts with empty data. If the app is open, this waits until it quits.",
    confirmDataDisableTitle: (name) => `Keep ${name}'s data on this Mac?`,
    confirmDataDisableBody: "If the data is in the repo it is brought back first, and it stays here from then on.",

    stopAndOffload: "Stop and offload",
    stopAndOffloadFor: (name) => `Stop ${name} and offload it`,
    loginItemsSettings: "Login items",
    confirmStopPackBody: (size) => `Its background helpers are quit first, then the app is packed into your repo (about ${size}) and its place gets a launcher that downloads and opens it on demand. This can take a few minutes.`,
    offloadNow: "Offload now",
    offloadNowFor: (name) => `Offload ${name} now`,
    offloading: "Offloading…",
    confirmPackTitle: (name) => `Offload ${name}?`,
    confirmPackBody: (size) => `The app is packed into your repo (about ${size}) and its place gets a launcher that downloads and opens it on demand. Quit the app first. This can take a few minutes.`,
    confirmPackOk: "Offload",
    confirmFileTitle: (name) => `Offload ${name}?`,
    confirmTrashTitle: (name) => `Delete ${name}?`,
    confirmTrashBody: (size) => `It moves to the Trash (about ${size}); the space comes back when you empty the Trash. Close it in other apps first.`,
    trashOk: "Move to Trash",
    bigUpload: "Offload",
    bigDelete: "Delete",
    confirmFileBody: (size) => `It moves into your repo (about ${size}) and leaves a small .disklessly placeholder with the same name; a folder's old path also becomes a link with a cloud badge. Double-click the placeholder, or right-click it in Finder and choose Bring back with Disklessly, to get it back. Close it in other apps first.`,
    phasequeued: "Queued",
    phaseresolve: "Finding image",
    phasedownload: "Downloading",
    phaseopen: "Opening",
    phaserunning: "Open",
    phaseevict: "Evicting",
    phasedetach: "Ejecting",
    phaseunpack: "Copying",
    phasepin: "Updating",
    errunknown_app: "The repo has no app by that name.",
    erroffline: "The repository is unreachable. Check the network or share and try again.",
    errintegrity: "The downloaded image failed its checksum and was discarded. Try again.",
    errno_space: "Not enough disk space. Evict some cached apps and try again.",
    errbusy: "This app is busy with another action. Try again shortly.",
    errpinned: "This app is pinned. Unpin it before evicting.",
    errunauthorized: "The link has expired.",
    errunsupported: "This Mac does not support that action.",
    errneeds_resolution: "This app has unresolved changes. Run disklessly resolve in Terminal first.",
    errbad_request: "The request was not valid.",
    errfailed: "The action failed.",
    expiredTitle: "This link has expired",
    expiredBody: "The page token is missing or no longer valid. Run disklessly ui in Terminal again and open the link it prints.",
    heroTitle: "Free up space in three steps",
    heroBody: "Large apps you rarely use move into your repo; this Mac keeps a tiny launcher that downloads and opens them on demand.",
    heroStep1: "1. Choose a repo",
    heroStep2: "2. Review recommendations",
    heroStep2Body: "Large apps that have sat unused are listed below.",
    heroStep2Link: "Jump to recommendations",
    heroStep3: "3. Offload",
    heroStep3Body: "Copy a command from the recommendations and run it in Terminal:",
    heroRepo: (path) => `Current repo: ${path}`,
    license: "License",
    licenseCode: "License code",
    licenseActivate: "Activate",
    licenseRemove: "Remove license",
    licenseBuy: "Buy a license",
    licenseFree: (used, limit) => `Free version: ${used} of ${limit} apps or files offloaded`,
    licenseFreeBody: "Starting, restoring and unpacking offloaded apps, and bringing back offloaded files, is always free. Enter a license code to offload more.",
    licenseFull: "Licensed: unlimited offloaded apps and files",
    licenseUntil: (date) => `Valid until ${date}`,
    licenseUpdates: (date) => `Updates included until ${date}`,
    licenseExpired: (date) => `Your code expired on ${date}; the free limit applies again`,
    licenseInvalid: "The saved license code is not usable; the free limit applies",
    licenseOk: "License activated",
    licenseRemoved: "License removed",
    cloudTitle: "Cloud drives and repo",
    cloudRepoDefault: (kind) => kind === "icloud" ? "Repo: iCloud Drive (default)" : "Repo: a folder on this Mac (default)",
    cloudRepoBackend: (id) => `Repo: ${id}`,
    cloudSummary: (n) => n ? `${n} cloud drive${n === 1 ? "" : "s"} connected` : "The repo lives in iCloud Drive by default",
    cloudDrives: "Cloud drives (built-in rclone)",
    cloudDrivesNote: "Connect a drive to keep offloaded apps there. You sign in in your browser; the credentials stay on this Mac.",
    cloudConnect: (name) => `Connect ${name}`,
    cloudNoRemotes: "No cloud drive connected yet.",
    cloudUse: "Use as repo",
    cloudDefaultName: (kind) => kind === "icloud" ? "iCloud Drive" : "the local folder",
    cloudActive: "Current repo",
    cloudDisconnect: "Disconnect",
    cloudBackDefault: (kind) => kind === "icloud" ? "Back to iCloud Drive" : "Back to the local folder",
    cloudUseConfirm: (target, n) => n
      ? `Switch the repo to ${target}?\n\nThe current repo moves first: the images of ${n} app${n === 1 ? "" : "s"} and everything else are copied and checked, and only then does the switch happen, so offloaded apps keep opening. The old repo stays as a backup; reads fall back to it when the new repo can't be reached.`
      : `Switch the repo to ${target}?\n\nWhat is in the current repo is copied and checked first; the old repo stays as a backup.`,
    cloudTaskmigrate: (phase, p) => `Moving the repo (${({ scan: "counting", copy: "copying", verify: "checking", switch: "switching", done: "done" })[phase] || "preparing"})${p}`,
    "cloudTaskmirror-sync": (phase, p) => `Syncing backups (${({ scan: "counting", copy: "copying", verify: "checking", done: "done" })[phase] || "preparing"})${p}`,
    cloudProgress: (files, total, done, size) => `: ${files}/${total} files, ${done} / ${size}`,
    cloudMirror: "Backup",
    cloudMirrorAdd: "Use as backup",
    cloudMirrorRemove: "Stop backup",
    cloudMirrorSync: "Sync backups now",
    cloudMirrorsLine: (n) => `${n} backup repo${n === 1 ? "" : "s"}; reads fall back to them when the main repo can't be reached.`,
    cloudMirrorLast: (when, ok) => ok ? `Last synced ${when}` : `Last sync failed (${when})`,
    cloudMirrorNever: "Not synced yet",
    cloudMigrated: (target, n) => `Moved to ${target} (${n} files copied)`,
    cloudDisconnectConfirm: (name) => `Disconnect ${name}? Files on the drive are not deleted.`,
    cloudTaskconnect: "Waiting for you to sign in in the browser…",
    cloudTaskopenlist: (phase) => `Installing OpenList (${({ download: "downloading", verify: "verifying", configure: "configuring", start: "starting" })[phase] || "preparing"})…`,
    cloudTaskDone: "Done",
    cloudTaskFailed: (msg) => `Failed: ${msg}`,
    cloudSwitched: (target) => `The repo is now ${target}`,
    cloudNoRclone: "The built-in rclone is missing. Reinstall Disklessly.",
    openlistTitle: "OpenList (optional)",
    openlistNote: "OpenList serves many cloud drives (Aliyun, Baidu, 115, Quark, …) over WebDAV. It runs only on this Mac at 127.0.0.1; the first install downloads about 50 MB.",
    openlistInstall: "Install OpenList",
    openlistRunning: (url) => `Running at ${url}`,
    openlistStopped: "Stopped",
    openlistOpen: "Open admin page",
    openlistPassword: "Show admin password",
    openlistPasswordIs: (pw) => `User admin, password ${pw}`,
    openlistStart: "Start",
    openlistStop: "Stop",
    openlistHint: "Add your drives on the admin page first, then use OpenList as the repo.",
    errlicense_required: "The free limit (apps and files together) is used up. Buy a license in the License card and enter the code to offload more.",
    sessionTiers: "Session tiers",
    coldAfter: (n) => `Cold after ${n} days`,
    offloadedCount: (n) => `${n} offloaded`,
    emptySessions: "No archived sessions",
    sessionIntro: "Scans the session logs of AI coding agents. For the agents you tick, sessions not opened for a while go to the repo as a full snapshot, and this Mac keeps a short text digest. You can restore the original file any time.",
    sessionPlanLine: (files, size, cold, coldSize) => `${files} sessions, ${size}; ${cold} can move (${coldSize})`,
    sessionPlanNone: "No AI coding agent sessions found.",
    sessionPlanAbsent: "Not on this Mac",
    sessionApply: "Move selected cold sessions",
    sessionApplying: "Moving…",
    sessionConfirmTitle: (n, size) => `Move ${n} cold sessions (${size})?`,
    sessionConfirmBody: (agents) => `${agents}: the full session files are packed and uploaded to the repo, read back and checked, and only then deleted here. This Mac keeps a short digest you can search and read. Restore puts the original file back. Sessions changed in the last 24 hours or open now are left alone.`,
    sessionApplied: (n, size) => `Moved ${n} sessions, freed ${size}`,
    sessionFailed: "Moving sessions failed",
    sessionDigest: "Digest",
    sessionDigestHide: "Hide",
    sessionRestore: "Restore",
    sessionUntitled: "(untitled)",
    sessionShowList: (n) => `Show ${n}`,
    sessionHideList: () => "Hide",
    sessionPickAll: "Select all",
    sessionPickNone: "Select none",
    sessionPicked: (n, size) => `${n} selected, ${size}`,
    sessionFilter: "Filter by title, agent or path",
    sessionFilterNone: "No matching sessions",
    sessionRestored: (path) => `Restored to ${path}`,
    sessionRestoreFailed: "Restore failed",
    tiercold: "Cold",
    daysAgo: (n) => (n <= 0 ? "today" : n === 1 ? "1 day ago" : `${n} days ago`),
    recommend: "Worth offloading",
    recommendWarn: "Poor candidates",
    recommendEmpty: "No apps above the size threshold",
    recommendEmptyHint: "Large apps that have sat unused show up here",
    foldedTitle: (n) => `Other apps: small, running, or used recently (${n})`,
    foldedHint: "Sorted by open count and size together. Nothing is hidden; it is only folded.",
    recommendUnavailable: "Scanning installed apps requires macOS",
    recommendFailed: "Could not load recommendations",
    recommendScanning: "Scanning installed apps…",
    recommendSummary: (count, min) => `${count} ${count === 1 ? "app" : "apps"} · only apps of ${min} or more are listed`,
    filesTitle: "Large files and folders",
    bigTitle: "Other big items",
    bigScanning: "Measuring simulators, caches, and app data…",
    bigSummary: (n, size) => `${n} items, ${size} in all. Most space outside apps is here.`,
    bigNone: "No simulator, cache, or app data over 1 GB.",
    bigGoDev: "Go to simulators",
    bigClean: "Clean",
    bigCleaning: "Cleaning…",
    bigShowUsage: "Usage map",
    bigReason_unusedRuntime: "No simulator uses this runtime. Offload it and bring it back when needed",
    bigReason_runtime: "Simulator runtime. Offload it and bring it back when needed",
    bigReason_idleSimulator: "Simulator data. Offload it; it comes back with a new UDID",
    bigReason_running: "Simulator is running. Shut it down to offload it",
    bigReason_rebuildable: "Its tool downloads or builds it again. Cleaning moves it to the Trash",
    "bigReason_claude-vm-bundles": "A Linux VM bundle that Claude desktop downloaded. Safe to delete after quitting Claude; it downloads again when needed",
    loc_claudeVmBundles: "Claude VM bundles",
    sipSuffix: " (SIP protected)",
    sip_siri: "Siri offline models",
    sip_speech: "Offline dictation models",
    sip_linguistic: "Language data",
    sip_translation: "Offline translation models",
    sip_devdocs: "Apple developer documentation",
    sip_font: "Extra fonts",
    sip_dictionary: "Dictionaries",
    sip_ttsax: "Accessibility voices",
    sip_macintalk: "System voices",
    bigReason_adviceSip: "A system asset protected by SIP; a delete button appears here once SIP is off",
    bigReason_adviceSipOff: "A system asset. SIP is off, so it can be deleted; it needs an administrator password, and macOS may download it again later",
    bigConfirmBodySip: (size) => `Frees about ${size}. These system assets are deleted outright (not moved to the Trash) after an administrator password. Features that use them (Siri, dictation, offline docs) may stop working, and macOS may download them again later.`,
    bigReason_appData: "App data. Clean it up in the app, or offload its app first so the data can follow it to the cloud",
    bigReason_personal: "Personal folder. Offload what you rarely use under Large files and folders",
    bigConfirmTitle: (name) => `Clean “${name}”?`,
    ctrTitle: "Container images",
    ctrScanning: "Reading container images…",
    ctrNone: "No Apple container, Docker Desktop, OrbStack, Colima or Dory on this Mac.",
    ctrSummary: (n, size, free) => `${n} images, ${size} in all; ${free} nothing uses can be offloaded or cleaned.`,
    ctrEngine: (name, size) => `${name} · ${size} on disk`,
    ctrEngine_running: "Running",
    ctrEngine_stopped: "Not running, so only its disk size is known; start it to list images",
    ctrEngine_noCli: "Its command-line tool was not found, so only its disk size is known",
    ctrUse_running: (names) => `In use: container ${names} is running`,
    ctrUse_stopped: (names) => `In use: stopped container ${names} still refers to it; remove the container first`,
    ctrUse_recent: (days) => `Pulled or run in the last ${days} days; you may still need it`,
    ctrUse_dangling: "Old untagged image; usually safe to clean",
    ctrUse_idle: "No container uses it, and it has not been pulled or run for a while",
    ctrLastUsed: (days) => (days <= 0 ? "used today" : days === 1 ? "used 1 day ago" : `used ${days} days ago`),
    ctrOffload: "Offload",
    ctrClean: "Clean",
    ctrRestore: "Restore",
    ctrForget: "Delete from repo",
    ctrOffloaded: "In the repo",
    ctrVolumes: "Volumes",
    ctrVolumeInUse: "used by a container",
    ctrVolumeNote: "Volumes hold container data; they are listed here and never touched.",
    ctrInstalledHere: "also on this Mac",
    ctrConfirmOffloadTitle: (name) => `Offload image ${name}?`,
    ctrConfirmOffloadBody: (size, engine, recent) => `${recent ? "This image was used recently. " : ""}${engine} saves the image as a tar (about ${size}). Once it is in the repo and its sha256 checks out, the image is removed from this Mac. You can restore it in one click.`,
    ctrConfirmCleanTitle: (name) => `Clean image ${name}?`,
    ctrConfirmCleanBody: (size) => `Deletes the image (about ${size}) without saving it. Pull or build it again when you need it.`,
    ctrConfirmForgetTitle: (name) => `Delete ${name} from the repo?`,
    ctrConfirmForgetBody: (size) => `Deletes ${size} from the repo; it can no longer be restored.`,
    ctrVMNote: "The image lives in a VM disk; the space comes back to the Mac once the VM trims its disk (usually after a restart).",
    ctrJobDone: (name, freed) => (freed ? `${name}: done, freed ${freed}` : `${name}: done`),
    ctrJobFailed: (name) => `${name}: failed`,
    phasecheck: "Checking",
    phasesave: "Saving",
    phaseupload: "Uploading",
    phaseverify: "Verifying",
    phaseremove: "Removing",
    phaseload: "Loading",
    phaseforget: "Deleting",
    bigConfirmBody: (size) => `Frees about ${size}. The contents go to the Trash (Homebrew uses brew cleanup); the tool fetches or rebuilds them when it next needs them.`,
    filesSummary: (count, min, days) => `${count} ${count === 1 ? "item" : "items"} · ${min} or more, not opened for ${days} days`,
    filesEmpty: "No large files that have sat unopened in your home folder",
    filesScanning: "Scanning your home folder…",
    filesPartial: "The scan stopped early; the list may be incomplete",
    filesFolder: "folder",
    filesFile: "file",
    filesIdle: (days) => `not opened for ${days} days`,
    filesNever: "never opened",
    couldFree: "Could free about",
    scannedAgo: (iso) => `Scanned ${relativeTime(iso, "en")}`,
    rescan: "Rescan",
    usage: "Disk usage",
    usageScan: "Analyze",
    usageRescan: "Analyze again",
    usageScanning: "Analyzing the disk…",
    usageIntro: "See what takes up your 256G: each app's bundle, cache and data, plus Disklessly's own cache. It only reads sizes and changes nothing.",
    usagePartial: "Some folders timed out and were not fully read; what is missing is counted as System & other.",
    usageFailed: "Could not read disk usage",
    usageHint: "Click a box to zoom in; click the path above to go back.",
    usageTotal: (used, free, total) => `${total} total · ${used} used · ${free} free`,
    usage_disk: "Whole disk",
    usage_apps: "Apps",
    usage_disklessly: "Disklessly",
    usage_personal: "Personal files",
    usage_library: "Library",
    usage_appdata: "App data (dot folders in ~)",
    usage_system: "System & other",
    usage_macos: "macOS",
    usage_vm: "Virtual memory",
    usage_simruntimes: "iOS simulator runtimes",
    usage_simdevices: "Simulator devices",
    usage_deriveddata: "Xcode DerivedData",
    usage_homebrew: "Homebrew",
    usage_var: "System data /private/var",
    usage_unmeasured: "Not measured",
    cleanTitle: "Where you can free space",
    cleanNote: "Not measured covers Time Machine local snapshots, purgeable space, other users' files, and folders unreadable without Full Disk Access.",
    cleanRun: "Clean up",
    cleanRunning: "Cleaning…",
    cleanDone: (name, freed) => `${name}: freed ${freed}`,
    cleanFailed: (name) => `${name}: cleanup failed`,
    cleanWhat_brew_cleanup: "Removes old versions and the download cache (brew cleanup --prune=all)",
    cleanWhat_sim_runtimes: "Deletes simulator runtimes replaced by a newer build or marked unusable (simctl runtime delete --outdated / --unusable)",
    cleanWhat_sim_devices: "Deletes simulator devices whose runtime is gone (simctl delete unavailable)",
    cleanWhat_derived_data: "Deletes Xcode's build cache; it is rebuilt on the next build",
    cleanConfirm: (name) => `Clean up ${name}?`,
    usage_free: "Free",
    usage_bundle: "Bundle",
    usage_cache: "Cache",
    usage_data: "Data",
    usage_repo: "Repo on this Mac",
    usage_state: "State and temp files",
    usage_files: "Loose files",
    usage_rest: (n) => `${n} more`,
    usage_other: "Other",
    cachesLine: (size, n) => `${n} offloaded ${n === 1 ? "app still leaves" : "apps still leave"} ${size} of caches you can clear.`,
    cachesNone: "Offloaded apps left no caches behind.",
    cachesRunning: (names) => `Running apps are skipped: ${names}`,
    cachesClear: "Clear app caches",
    cachesConfirmTitle: (size) => `Clear the caches of offloaded apps (${size})?`,
    cachesConfirmBody: "Only these apps' folders in ~/Library/Caches and a sandbox container's Data/Library/Caches are emptied. Application Support and other data stay; running apps are skipped. Apps rebuild their caches the next time they open.",
    cachesDone: (size) => `Cleared ${size} of caches`,
    cachesFailed: "Could not clear caches",
    usageTips: "Where to free up space",
    dev: "Xcode simulators",
    devIntro: "Simulator runtimes and devices can live in the repo until you need them. A runtime comes back as it was; a simulator comes back with a new UDID.",
    devRuntimes: "Runtimes",
    devSimulators: "Simulators",
    devOffloaded: "In the repo",
    devOffload: "Offload",
    devRestore: "Bring back",
    devForget: "Delete from repo",
    devCleanDerived: "Clean DerivedData",
    devNone: "None",
    devShutdown: "Shut down",
    devRunning: "Running. Shut it down to offload it.",
    devInUseBy: (names) => `In use by ${names}. Shut it down to offload this runtime.`,
    devConfirmShutdownTitle: (name) => `Shut down simulator “${name}”?`,
    devConfirmShutdownBody: "Any test or app running in it will be interrupted.",
    devUnavailable: "Could not read simulators (Xcode is needed)",
    devInstalledHere: "Also on this Mac",
    devFrom: (host) => `from ${host}`,
    devConfirmRuntimeTitle: (name) => `Offload ${name}?`,
    devConfirmRuntimeBody: (size) => `Uploads ${size} to the repo, checks it, then simctl deletes it from this Mac. It can come back unchanged.`,
    devConfirmSimTitle: (name) => `Offload the simulator ${name}?`,
    devConfirmSimBody: (size) => `Packs the simulator's data (${size}), uploads and checks it, then deletes this simulator. Bringing it back creates the same model and puts the data in; the UDID changes.`,
    devConfirmForgetTitle: (name) => `Delete ${name} from the repo?`,
    devConfirmForgetBody: (size) => `Deletes ${size} from the repo. It can't be brought back afterwards.`,
    devConfirmCleanTitle: "Clean DerivedData?",
    devConfirmCleanBody: "Moves Xcode's build cache to the Trash. Xcode rebuilds it the next time you build.",
    devConfirmOk: "Continue",
    devJobDone: (name) => `${name}: done`,
    devJobFailed: (name) => `${name}: failed`,
    tipRemoveMacAITitle: "Apple Intelligence models",
    tipRemoveMacAIBody: "\"System & other\" includes the models Apple Intelligence downloads, often several GB. The open-source RemoveMacAI turns Apple Intelligence off, deletes those models and stops them downloading again. Every change can be undone.",
    tipRemoveMacAILink: "Open RemoveMacAI",
    tipDevOffloadTitle: "Xcode simulators",
    tipDevOffloadBody: "Simulator runtimes and devices in \"Library › Developer\" and \"System & other\" can wait in the repo until you need them.",
    tipDevOffloadLink: "Offload them",
    tipPackTitle: "System data too big? Offload big apps",
    tipPackBody: "\"System & other\" is often left behind by big apps. Apps in the recommendations can be offloaded to the repo; this Mac keeps a small stub and they come back when you open them.",
    tipPackLink: "See recommended apps",
    tipSimslimTitle: "Simulators use too much memory? Try simslim",
    tipSimslimBody: "simslim turns off background services a simulator does not need, cutting each simulator's memory by more than half. It saves memory only; a simulator's disk use stays the same.",
    tipSimslimLink: "Open simslim",
    copyCommand: "Copy command",
    copyCommandFor: (name) => `Copy command to pack ${name}`,
    copied: (name) => `Copied the pack command for ${name}`,
    copyFailed: "Could not write to the clipboard; copy the command by hand",
    leftoverBackups: (count, size) => `${count} leftover backup${count === 1 ? "" : "s"} (${size}) can be removed`,
    leftoverAdmin: "Removing them needs an administrator.",
    leftoverClean: "Remove leftover backups",
    leftoverCleanTitle: (count, size) => `Remove ${count} leftover backup${count === 1 ? "" : "s"} (${size})?`,
    leftoverCleanBody: "The leftover backup files listed above (.disklessly-original- copies) will be deleted. macOS asks for an administrator password first, and only backups verified against the repo image are removed. This cannot be undone.",
    leftoverCleanOk: "Delete",
    leftoverCleanDone: "Leftover backups removed",
    leftoverCleanFailed: "Could not remove leftover backups",
    neverUsed: "Never used",
    idleDays: (n) => (n === 1 ? "Last used 1 day ago" : `Last used ${n} days ago`),
    restoreNeeded: "Mac App Store receipt, restore mode",
    sizeBound: "Size is a lower bound (scan timed out)",
    warnloginItem: "Login item",
    warnmenuBarAgent: "Menu bar agent",
    warnbackgroundHelper: "Background helper is running",
    warnsystemExtension: "Bundles a system extension",
    warnkernelExtension: "Bundles a kernel extension",
    warntoolchain: "Toolchain used by the engine",
    warnpinned: "Pinned",
    warnalreadyPacked: "Already packed",
    warnsizeTimedOut: "Size scan timed out",
    alreadyInRepo: "already in repo, packing is instant, no upload",
    devices: "Devices",
    devicesEmpty: "No Macs have registered yet",
    devicesSummary: (n) => `${n} ${n === 1 ? "Mac shares" : "Macs share"} this repo`,
    thisMac: "This Mac",
    conflictCopies: (n) => `${n} iCloud conflict ${n === 1 ? "copy" : "copies"}, not merged`,
    placeholders: (n) => `${n} device ${n === 1 ? "file is" : "files are"} not downloaded`,
    countNone: "None",
    machinesTitle: "Machines (SSH)",
    machinesSummary: (n, r) => `${n} ${n === 1 ? "machine" : "machines"} · ${r} over SSH`,
    machinesHostLabel: "SSH Host",
    machinesHostPlaceholder: "e.g. gpu-box or dev-server",
    machinesAdd: "Add host",
    machinesRemove: "Remove",
    machinesScan: "Scan disk",
    machinesScanning: "Scanning over SSH…",
    machinesInspect: "Inspect items",
    machinesLocalBadge: "This machine",
    machinesRemoteBadge: "SSH",
    machinesLevel_offline: "Offline",
    machinesLevel_critical: "Critical",
    machinesLevel_warning: "Warning",
    machinesLevel_ok: "Healthy",
    machinesDiskLine: (used, total, reclaim) => `${used} / ${total} used · ${reclaim} reclaimable`,
    machinesNotScanned: "Not scanned yet; click Scan disk to inspect mounts and big items",
    machinesDetailTitle: (host, mode) => `${host} scan details (${mode || "ssh"})`,
    machinesMountsTitle: "Mounts",
    machinesMountFree: (dev, fs, size) => `${dev} (${fs}) · ${size} free`,
    machinesItemsTitle: "Cleanable caches & offloadable big items",
    machinesOffloadedTitle: "Offloaded in the repo",
    machinesNoItems: "No large cleanable or offloadable items found",
    machinesCleanBtn: "Clean",
    machinesOffloadBtn: "Offload",
    machinesRestoreBtn: "Restore",
    machinesPlanConfirmTitle: (act, title, host) => `${act} ${title} on ${host}?`,
    machinesPlanConfirmBody: (path, size, rec) => `Path: ${path}\nSize: ${size}\nRestorable from repo: ${rec ? "Yes (verified in repo before removal, leaves .disklessly-remote stub and journal)" : "No (rebuildable cache/logs deleted in place)"}`,
    machinesRestoreConfirmTitle: (title, host) => `Restore ${title} to ${host}?`,
    machinesRestoreConfirmBody: (path, size) => `Streams ${size} from the repo back to ${path} and removes the stub after verification.`,
    machinesActionDone: (host, title) => `${host}: ${title} finished`,
    machinesActionFailed: (host, title) => `${host}: ${title} failed`,
  },
};
// i18n:end
window.disklesslyI18n = { copy };

const root = document.documentElement;
const primary = root.getAttribute("data-lang") === "en" ? "en" : "zh";
const langTag = { zh: "zh-Hans", en: "en" };

let lastStatus = null;
let lastRecommend = null;
// Remembers whether the folded below-threshold list is open, so re-renders after an action keep it open.
let recommendFoldedOpen = false;
let recommendError = null;
let loadError = null; // { code, message } when /api/status itself failed
let updatedAt = 0;
let expired = false;
let refreshing = null;
let recommendLoading = false;
const pending = new Map(); // app name -> { kind, jobId, phase }
const view = { search: "", sort: "name", filter: "all" };
const folds = {};

// ---- text -----------------------------------------------------------------

function tl(language, key, ...args) {
  let value = copy[language][key];
  if (value === undefined) {
    console.warn(`disklessly ui: missing ${language} text for "${key}"`);
    value = copy.en[key];
  }
  if (value === undefined) return key;
  return typeof value === "function" ? value(...args) : value;
}

function t(key, ...args) {
  return tl(primary, key, ...args);
}

function has(key) {
  return copy.zh[key] !== undefined && copy.en[key] !== undefined;
}

/// Text in the chosen language, for aria-label and title.
function both(key, ...args) {
  return tl(primary, key, ...args);
}

/// Text in the chosen language as a node.
function bi(key, ...args) {
  return biPair(tl(primary, key, ...args));
}

function one(key, ...args) {
  const node = el("span", "one", tl(primary, key, ...args));
  node.lang = langTag[primary];
  return node;
}

/// Bilingual label followed by a single value: "已用 used 19%".
function biValue(key, value) {
  const node = el("span", "bi-value");
  node.append(bi(key), document.createTextNode(` ${value}`));
  return node;
}

/// The page shows one language, switched from the top bar.
function biPair(first, _unused, className) {
  const node = el("span", ["bi", className].filter(Boolean).join(" "));
  const main = el("span", "bi-p", first);
  main.lang = langTag[primary];
  node.append(main);
  return node;
}

function locale(language) {
  return langTag[language || primary];
}

function url(path) {
  const target = new URL(path, location.origin);
  if (token) target.searchParams.set("token", token);
  return target;
}

class ApiError extends Error {
  constructor(code, message, status, payload) {
    super(message);
    this.code = code;
    this.status = status;
    this.payload = payload;
  }
}

async function api(path, options) {
  let response;
  try {
    response = await fetch(url(path), options);
  } catch (error) {
    throw new ApiError("offline", error.message || String(error), 0, {});
  }
  let payload = {};
  try { payload = await response.json(); } catch (e) { payload = {}; }
  if (response.status === 401) {
    showExpired();
    throw new ApiError("unauthorized", "", 401, payload);
  }
  if (!response.ok || payload.ok === false) {
    const error = payload.error;
    const code = (error && typeof error === "object" && error.code) || "failed";
    const message = (error && typeof error === "object" ? error.message : error) || response.statusText || "";
    throw new ApiError(code, message, response.status, payload);
  }
  return payload;
}

/// Error key for a stable server code. The raw server text is never shown inline.
function errorKey(code) {
  const key = "err" + (code || "failed");
  return has(key) ? key : "errfailed";
}

/// Localized error line plus the raw server text folded into a Details disclosure.
function errorBlock(code, raw) {
  const wrap = el("div", "err-block");
  wrap.append(bi(errorKey(code)));
  if (raw && code !== "unauthorized") wrap.append(detailsFold(raw));
  return wrap;
}

function detailsFold(raw) {
  const fold = el("details", "raw");
  const summary = el("summary");
  summary.append(bi("details"));
  fold.append(summary, el("code", "", raw));
  return fold;
}

// One size rule everywhere: 1024-based units, one decimal below 100 for GiB and up.
function bytes(value) {
  let n = Math.max(0, Number(value || 0));
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let unit = 0;
  while (n >= 1024 && unit < units.length - 1) {
    n /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || n >= 100 || (unit < 3 && n >= 10) ? 0 : 1;
  const number = new Intl.NumberFormat(locale(), { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(n);
  return `${number} ${units[unit]}`;
}

function relativeTime(iso, language) {
  const when = Date.parse(iso || "");
  if (!Number.isFinite(when)) return "";
  const seconds = Math.round((when - Date.now()) / 1000);
  const format = new Intl.RelativeTimeFormat(locale(language), { numeric: "auto" });
  const steps = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, "second");
}

function duration(seconds) {
  const n = Math.max(0, Number(seconds || 0));
  if (n >= 60 && n % 60 === 0) return one("durationM", n / 60);
  return one("durationS", n);
}

function usagePercent(used, quota) {
  if (!quota) return 0;
  return Math.round((used / quota) * 100);
}

function usageLevel(pct) {
  if (pct >= 95) return "hot";
  if (pct >= 80) return "warn";
  return "ok";
}

/// Page level for a server health status.
function healthLevel(status) {
  if (status === "ok") return "healthy";
  if (status === "offline") return "offline";
  if (status === "degraded" || status === "missing") return "degraded";
  return "unknown";
}

function kindKey(kind) {
  const key = "kind" + String(kind || "local").toLowerCase();
  return has(key) ? key : null;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function setText(node, text) {
  if (node && node.textContent !== text) node.textContent = text;
}

// ---- chrome ---------------------------------------------------------------

function applyChrome() {
  root.lang = langTag[primary];
  for (const node of document.querySelectorAll("[data-t]")) {
    node.replaceChildren(node.dataset.mono === "1" ? document.createTextNode(t(node.dataset.t)) : bi(node.dataset.t));
  }
  // Options and other text-only slots take plain text.
  for (const node of document.querySelectorAll("[data-tp]")) setText(node, both(node.dataset.tp));
  for (const node of document.querySelectorAll("[data-t-label]")) node.setAttribute("aria-label", both(node.dataset.tLabel));
  renderUpdated();
}

/// Saves the other language and reloads. Keeps the token, drops any ?lang= override.
function setupLanguageToggle() {
  const button = document.querySelector("#lang-toggle");
  if (!button) return;
  const other = primary === "zh" ? "en" : "zh";
  button.textContent = other === "en" ? "English" : "中文";
  button.lang = langTag[other];
  button.setAttribute("aria-label", other === "en" ? "Switch to English" : "切换到中文");
  button.addEventListener("click", () => {
    document.cookie = `disklessly_lang=${other}; path=/; max-age=31536000; SameSite=Strict`;
    const next = new URL(location.href);
    next.searchParams.delete("lang");
    location.replace(next);
  });
}

function renderUpdated() {
  const node = document.querySelector("#updated");
  if (!updatedAt) {
    node.replaceChildren(bi("updatedNever"));
    return;
  }
  const minutes = Math.floor((Date.now() - updatedAt) / 60000);
  node.replaceChildren(minutes < 1 ? bi("updatedJustNow") : bi("updatedAgo", minutes));
}

function showBanner(code, raw) {
  const banner = document.querySelector("#banner");
  const body = document.querySelector("#banner-text");
  // Only touch the live region when the error changes, so a refresh does not re-announce it.
  const signature = `${code}|${raw}`;
  if (banner.dataset.signature !== signature) {
    banner.dataset.signature = signature;
    body.replaceChildren(errorBlock(code, raw));
  }
  if (banner.hidden) banner.hidden = false;
}

function hideBanner() {
  const banner = document.querySelector("#banner");
  if (!banner.hidden) banner.hidden = true;
  banner.dataset.signature = "";
  document.querySelector("#banner-text").replaceChildren();
}

function showExpired() {
  if (expired) return;
  expired = true;
  hideBanner();
  document.querySelector("#expired").hidden = false;
  document.querySelector("#content").hidden = true;
  document.querySelector("#refresh").disabled = true;
}

/// Toast with a bilingual headline and an optional localized error with raw details.
function toast({ title, error, tone }) {
  const region = document.querySelector("#toasts");
  const item = el("div", `toast ${tone || ""}`.trim());
  const text = el("div", "toast-text");
  text.append(title);
  if (error) text.append(errorBlock(error.code, error.message));
  const close = el("button", "toast-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", both("dismiss"));
  close.addEventListener("click", () => item.remove());
  item.append(text, close);
  region.append(item);
  while (region.children.length > 4) region.firstElementChild.remove();
  let timer = setTimeout(() => item.remove(), tone === "error" ? 15000 : 6000);
  // Keep an error open while the pointer or focus is on it, so its details can be read.
  item.addEventListener("mouseenter", () => clearTimeout(timer));
  item.addEventListener("focusin", () => clearTimeout(timer));
  item.addEventListener("mouseleave", () => { timer = setTimeout(() => item.remove(), 6000); });
}

// ---- icons ----------------------------------------------------------------

// The SVG namespace is not fetched. The pieces stay split so the page source has no URL.
const svgNS = "http" + "://www.w3.org/2000/svg";
const iconOpen = "M8 5v14l11-7z";
const iconEject = "M12 5l7 8H5zM5 15h14v3H5z";
const iconDownload = "M11 4h2v8.2l3.3-3.3 1.4 1.4L12 16l-5.7-5.7 1.4-1.4 3.3 3.3V4zM5 18h14v2H5z";
const iconPin = "M14.5 2.6 21.4 9.5l-1.4 1.4-1.1-.4-3.6 3.6.4 3.9-1.4 1.4-3.6-3.6-4.8 4.8-1.4-1.4 4.8-4.8-3.6-3.6L7.1 9.4l3.9.4 3.6-3.6-.4-1.1z";
const iconTrash = "M9 3h6l1 2h4v2H4V5h4l1-2zM6 9h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9zm4 2v8h1.6v-8H10zm2.4 0v8H14v-8h-1.6z";
const iconMore = "M6 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z";
const iconCopy = "M8 3h10a2 2 0 0 1 2 2v10h-2V5H8V3zM5 7h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm0 2v10h10V9H5z";
const iconRefresh = "M12 4a8 8 0 0 1 7.4 5H17v2h6V5h-2v2.3A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8zm8 8a8 8 0 0 1-15.4 3H7v-2H1v6h2v-2.3A10 10 0 0 0 22 12h-2z";
const iconTray = "M5 4h14l3 9v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3-9zm1.4 2-2.3 7H8l1 2h6l1-2h3.9l-2.3-7H6.4z";
const iconPower = "M11 2h2v10h-2V2zM6.3 5.3l1.4 1.4A7 7 0 1 0 16.3 6.7l1.4-1.4A9 9 0 1 1 6.3 5.3z";
const iconAlert = "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-1 3h2v7h-2V7zm0 9h2v2h-2v-2z";
const iconInfo = "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-1 6h2v7h-2v-7zm0-3h2v2h-2V7z";

function svgIcon(path, size) {
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size || 16));
  svg.setAttribute("height", String(size || 16));
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("glyph");
  const drawing = document.createElementNS(svgNS, "path");
  drawing.setAttribute("fill", "currentColor");
  drawing.setAttribute("d", path);
  svg.append(drawing);
  return svg;
}

/// Button with a glyph and a bilingual label. A `blocked` reason keeps the button
/// focusable (aria-disabled) so its tooltip still shows and screen readers hear why.
function actionButton({ labelKey, labelArgs, name, icon, onClick, className, busy, disabled, blocked, iconOnly }) {
  const node = document.createElement("button");
  node.type = "button";
  node.className = ["btn", className, iconOnly ? "icon-only" : ""].filter(Boolean).join(" ");
  const spinner = el("span", "spinner");
  spinner.setAttribute("aria-hidden", "true");
  node.append(svgIcon(icon), spinner);
  const args = labelArgs || [];
  if (!iconOnly) {
    const label = el("span", "btn-label");
    label.append(bi(labelKey, ...args));
    node.append(label);
  }
  node.setAttribute("aria-label", name || both(labelKey, ...args));
  node.title = name || both(labelKey, ...args);
  if (busy) {
    node.setAttribute("aria-busy", "true");
    node.classList.add("is-busy");
  }
  if (disabled) node.disabled = true;
  if (blocked && !disabled) {
    node.setAttribute("aria-disabled", "true");
    node.title = blocked;
    node.setAttribute("aria-description", blocked);
  }
  node.addEventListener("click", (event) => {
    if (node.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      return;
    }
    onClick(event);
  });
  return node;
}

function letterIcon(name) {
  const letter = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const tones = ["#d9622b", "#2563eb", "#15803d", "#7c3aed", "#dc2626", "#0e7490", "#be185d", "#4f46e5"];
  let hash = 0;
  for (const ch of name || "?") hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
  const node = el("div", "avatar", letter);
  node.style.background = tones[hash % tones.length];
  node.setAttribute("aria-hidden", "true");
  return node;
}

function appIcon(name, imageId) {
  if (!imageId) return letterIcon(name);
  const node = document.createElement("img");
  node.className = "avatar";
  node.alt = "";
  node.width = 40;
  node.height = 40;
  node.src = String(url("/api/icon/" + encodeURIComponent(imageId)));
  node.addEventListener("error", () => node.replaceWith(letterIcon(name)));
  return node;
}

function cloudBadge() {
  const badge = el("span", "cloud-badge");
  badge.title = t("cloudBadge");
  badge.setAttribute("aria-label", t("cloudBadge"));
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", "M7 18a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 7.5H7z");
  svg.append(path);
  badge.append(svg);
  return badge;
}

function pill(kind, key, ...args) {
  const node = el("span", `pill ${kind}`);
  node.append(bi(key, ...args));
  return node;
}

function skeleton(rows) {
  const wrap = el("div", "skeleton-wrap");
  for (let i = 0; i < rows; i += 1) {
    const row = el("div", "sk-row");
    row.append(el("div", "sk-avatar"), el("div", "sk-lines"));
    row.lastChild.append(el("div", "sk-line"), el("div", "sk-line short"));
    wrap.append(row);
  }
  const note = el("p", "sk-note");
  note.append(bi("loading"));
  wrap.append(note);
  return wrap;
}

// ---- backend ---------------------------------------------------------------

function healthTitleKey(status) {
  if (status === "ok") return "healthok";
  if (status === "degraded") return "healthdegraded";
  if (status === "missing") return "healthmissing";
  if (status === "offline") return "healthoffline";
  return "healthunknown";
}

/// Second status line: latency when it answered, the timeout or a hint when not.
function healthSubline(backend) {
  const words = el("span", "health-sub");
  const status = backend.health;
  const parts = [];
  if (backend.latencyMs != null && status !== "offline") parts.push(t("latency", backend.latencyMs));
  else if (status === "offline" && backend.timedOut) parts.push(t("timedOut", Math.round(Number(backend.timeoutMs || 5000) / 1000)));
  else if (status === "offline") parts.push(t("offlineHint"));
  else if (status === "missing") parts.push(t("missingHint"));
  words.textContent = parts.join(" · ");
  return words;
}

function renderBackend(backend) {
  const card = document.querySelector("#backend-card");
  const body = document.querySelector("#backend-body");
  const pillSlot = document.querySelector("#backend-pill");
  body.removeAttribute("aria-busy");
  body.replaceChildren();
  pillSlot.replaceChildren();
  if (!backend) {
    card.dataset.level = "offline";
    const status = el("div", "health-line");
    const dot = el("span", "dot");
    dot.setAttribute("aria-hidden", "true");
    const words = el("div");
    words.append(el("strong", "health-title", t("healthoffline")));
    status.append(dot, words);
    body.append(status);
    return;
  }
  const level = healthLevel(backend.health);
  card.dataset.level = level;
  const location = backend.location === "local" ? "local" : "remote";
  pillSlot.append(pill(location === "remote" ? "blue" : "grey", "location" + location));

  const status = el("div", "health-line");
  status.setAttribute("role", "status");
  const dot = el("span", "dot");
  dot.setAttribute("aria-hidden", "true");
  const words = el("div");
  const title = el("strong", "health-title", t(healthTitleKey(backend.health)));
  title.lang = langTag[primary];
  words.append(title, healthSubline(backend));
  status.append(dot, words);
  body.append(status);
  if (backend.healthDetail && backend.healthDetail !== "timeout" && backend.health !== "ok") body.append(detailsFold(backend.healthDetail));

  const facts = el("dl", "kv");
  const activeId = backend.activeId || "local";
  const addFact = (labelKey, value, mono, titleText) => {
    const row = el("div");
    const dt = el("dt");
    dt.append(bi(labelKey));
    const dd = el("dd", mono ? "mono" : "");
    if (typeof value === "string") dd.textContent = value;
    else dd.append(value);
    if (titleText) dd.title = titleText;
    row.append(dt, dd);
    facts.append(row);
  };
  addFact("activeEndpoint", activeId, true, backend.activePlace || "");
  // Local repos already say "Local" in the pill; the kind row would only repeat it.
  const key = kindKey(backend.kind);
  if (backend.kind && backend.kind !== "local") addFact("kind", key ? bi(key) : String(backend.kind), false);
  body.append(facts);

  const endpoints = backend.endpoints || [];
  const head = el("p", "list-label");
  head.append(bi("endpoints"), document.createTextNode(` · ${endpoints.length}`));
  body.append(head);
  const list = el("ul", "endpoints");
  for (const endpoint of endpoints) {
    const row = el("li", endpoint.state === "active" ? "endpoint is-active" : "endpoint");
    const name = el("div", "endpoint-name");
    name.append(el("span", "mono", endpoint.id || ""));
    if (endpoint.place) name.append(el("span", "endpoint-place", endpoint.place));
    name.title = endpoint.place || "";
    row.append(name);
    const state = endpoint.state || "standby";
    if (state === "active") {
      const active = pill("green", "endpointactive");
      active.prepend(el("span", "pill-dot"));
      row.append(active);
    } else {
      const quiet = el("span", "endpoint-state");
      quiet.append(bi("endpoint" + (state === "local" ? "local" : "standby")));
      row.append(quiet);
    }
    list.append(row);
  }
  body.append(list);
}

// ---- cache -----------------------------------------------------------------

/// Big number and unit apart, as on the mockup: "12.4" "GiB".
function heroBytes(value) {
  const text = bytes(value);
  const space = text.lastIndexOf(" ");
  const wrap = el("span", "hero-num");
  wrap.append(el("span", "hero-value", text.slice(0, space)), el("span", "hero-unit", text.slice(space + 1)));
  return wrap;
}

function renderCache(cache) {
  const card = document.querySelector("#cache-card");
  const body = document.querySelector("#cache-body");
  const pillSlot = document.querySelector("#cache-pill");
  body.removeAttribute("aria-busy");
  body.replaceChildren();
  pillSlot.replaceChildren();
  if (!cache) {
    card.dataset.level = "ok";
    body.append(el("p", "muted", "—"));
    return;
  }
  const used = Number(cache.usedBytes || 0);
  const quota = Number(cache.quotaBytes || 0);
  const floor = Number(cache.minFreeBytes || 0);
  const pct = usagePercent(used, quota);
  const level = quota > 0 ? usageLevel(pct) : "ok";
  card.dataset.level = level;
  const pillKind = { ok: "blue", warn: "amber", hot: "red" }[level];
  const pillKey = quota <= 0 ? "levelunset" : { ok: "levelok", warn: "levelnear", hot: "levelcritical" }[level];
  pillSlot.append(pill(pillKind, pillKey));

  const hero = el("div", "hero-line");
  hero.append(heroBytes(used));
  const rest = el("span", "hero-rest");
  if (quota > 0) {
    rest.append(document.createTextNode(`/ ${bytes(quota)} `), bi("quotaWord"), document.createTextNode(" · "), biValue("usedPct", `${pct}%`));
  } else {
    rest.append(bi("quotaUnset"));
  }
  hero.append(rest);
  body.append(hero);

  if (quota > 0) {
    const meter = el("div", "meter");
    const marker = cache.floorMarkerBytes != null ? Math.max(0, Math.min(100, (Number(cache.floorMarkerBytes) / quota) * 100)) : null;
    if (marker != null) {
      const label = el("div", "floor-label");
      label.style.left = `${marker}%`;
      label.classList.toggle("align-end", marker > 70);
      label.classList.toggle("align-start", marker < 30);
      label.append(bi("floorLabel"));
      const keep = el("strong", "", t("floorKeep", bytes(floor)));
      label.append(keep);
      meter.append(label);
    }
    const track = el("div", "track");
    track.setAttribute("role", "meter");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(quota));
    track.setAttribute("aria-valuenow", String(Math.min(used, quota)));
    track.setAttribute("aria-valuetext", `${bytes(used)} / ${bytes(quota)}, ${both("usedPct")} ${pct}%`);
    track.setAttribute("aria-labelledby", "cache-title");
    track.append(el("div", "zone near"), el("div", "zone critical"));
    const fill = el("div", `fill ${level}`);
    fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    // The 6 px minimum keeps a small cache visible; an empty cache shows no fill.
    if (!(Number(used) > 0)) fill.classList.add("empty");
    track.append(fill);
    if (marker != null) {
      const line = el("div", "floor-marker");
      line.style.left = `${marker}%`;
      line.title = both("floorMarkerHint", bytes(floor));
      track.append(line);
    }
    meter.append(track);
    const ticks = el("div", "ticks");
    ticks.append(el("span", "", "0"), el("span", "", bytes(quota / 2)), el("span", "", bytes(quota)));
    meter.append(ticks);
    body.append(meter);
    const legend = el("ul", "legend");
    for (const [kind, prefix, key] of [["ok", "", "legendNormal"], ["warn", "≥ 80% ", "legendNear"], ["hot", "≥ 95% ", "legendCritical"]]) {
      const item = el("li");
      const swatch = el("i", `swatch ${kind}`);
      swatch.setAttribute("aria-hidden", "true");
      item.append(swatch, document.createTextNode(prefix), bi(key));
      legend.append(item);
    }
    body.append(legend);
    if (level !== "ok") {
      const note = el("p", `near-note ${level}`);
      note.append(svgIcon(iconAlert, 14), bi("nearNote"));
      body.append(note);
    }
  }

  const stats = el("dl", "stats");
  const left = cache.quotaLeftBytes != null ? Number(cache.quotaLeftBytes) : Math.max(0, quota - used);
  const stat = (value, labelKey, extra) => {
    const row = el("div");
    const dd = el("dd", "stat-value", value);
    const dt = el("dt");
    dt.append(bi(labelKey));
    row.append(dt, dd);
    if (extra) row.append(extra);
    stats.append(row);
  };
  stat(quota > 0 ? bytes(left) : "—", "quotaLeft");
  let disk = null;
  if (cache.diskFreeBytes != null) {
    disk = el("p", "stat-extra");
    disk.append(biValue("diskFree", bytes(cache.diskFreeBytes)));
  }
  stat(bytes(floor), "floor", disk);
  const delay = el("div");
  const delayValue = el("dd", "stat-value");
  delayValue.append(duration(cache.detachDelaySeconds));
  const delayLabel = el("dt");
  delayLabel.append(bi("detach"));
  delay.append(delayLabel, delayValue);
  stats.append(delay);
  body.append(stats);
}

// ---- apps -----------------------------------------------------------------

function visibleApps(apps) {
  const needle = view.search.trim().toLowerCase();
  const filtered = apps.filter((app) => {
    if (needle && !`${app.name || ""} ${app.bundleId || ""}`.toLowerCase().includes(needle)) return false;
    if (view.filter === "cached") return Boolean(app.cached);
    if (view.filter === "remote") return !app.cached;
    if (view.filter === "pinned") return Boolean(app.pinned);
    return true;
  });
  const size = (app) => Number(app.cached ? app.cachedBytes : app.imageBytes) || 0;
  const used = (app) => Date.parse(app.lastUsed || "") || 0;
  const byName = (a, b) => String(a.name || "").localeCompare(String(b.name || ""), locale());
  filtered.sort((a, b) => {
    if (view.sort === "size") return size(b) - size(a) || byName(a, b);
    if (view.sort === "lastUsed") return used(b) - used(a) || byName(a, b);
    return byName(a, b);
  });
  return filtered;
}

function closeMenus(except) {
  for (const menu of document.querySelectorAll(".menu:not([hidden])")) {
    if (menu === except) continue;
    menu.hidden = true;
    const trigger = menu.previousElementSibling;
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }
}

/// Folder that holds the app's launcher, which a permanent restore writes back to.
function installDir(app) {
  const full = String(app.installPath || "");
  const cut = full.lastIndexOf("/");
  if (cut <= 0) return "/Applications";
  const dir = full.slice(0, cut);
  const home = dir.match(/^\/Users\/[^/]+(\/.*)?$/);
  return home ? `~${home[1] || ""}` : dir;
}

function overflowMenu(app, busy) {
  const wrap = el("div", "more");
  const menuId = `menu-${String(app.imageId || app.name).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const menu = el("div", "menu");
  const trigger = actionButton({
    labelKey: "more",
    name: both("moreFor", app.name),
    icon: iconMore,
    className: "quiet",
    iconOnly: true,
    disabled: busy,
    onClick: (event) => {
      event.stopPropagation();
      const open = menu.hidden;
      closeMenus(menu);
      menu.hidden = !open;
      trigger.setAttribute("aria-expanded", String(open));
      if (open) menu.querySelector("[role=menuitem]").focus();
    },
  });
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", menuId);
  menu.id = menuId;
  menu.setAttribute("role", "menu");
  menu.hidden = true;
  const dir = installDir(app);
  // With the full app already installed here, restore and unpack would collide with it.
  const items = fullAppHere(app) ? [] : [
    [bi("restore"), both("restore"), () => confirmAction("restore", app)],
    [bi("unpack", dir), both("unpack", dir), () => confirmAction("unpack", app)],
  ];
  if (!app.cached) items.unshift([bi("prefetch"), both("prefetchFor", app.name), () => startJob("prefetch", app)]);
  if (!fullAppHere(app) && isOnThisMac(app)) {
    const data = app.data || {};
    if (data.enabled) items.push([bi("dataDisable"), both("dataDisable"), () => confirmAction("data/disable", app)]);
    else items.push([bi("dataEnable"), both("dataEnable"), () => confirmAction("data/enable", app)]);
  }
  for (const [label, name, run] of items) {
    const item = el("button", "menuitem");
    item.append(label);
    item.type = "button";
    item.setAttribute("role", "menuitem");
    item.setAttribute("aria-label", name);
    item.tabIndex = -1;
    item.addEventListener("click", () => {
      closeMenus();
      run();
    });
    menu.append(item);
  }
  menu.addEventListener("keydown", (event) => {
    const entries = [...menu.querySelectorAll("[role=menuitem]")];
    const index = entries.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = (index + (event.key === "ArrowDown" ? 1 : entries.length - 1)) % entries.length;
      entries[next].focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenus();
      trigger.focus();
    } else if (event.key === "Tab") {
      closeMenus();
    }
  });
  wrap.append(trigger, menu);
  return wrap;
}

function statusPills(app, job) {
  const pills = el("div", "pills");
  if (app.needsResolution || app.state === "needsResolution") pills.append(pill("red attention", "stateAttention"));
  if (job && job.phase === "download") pills.append(pill("blue downloading", "stateDownloading"));
  else if (app.mounted || app.state === "running") pills.append(pill("blue mounted", "stateMounted"));
  if (app.cached) {
    const node = pill("green", "cached");
    node.prepend(el("span", "pill-dot"));
    pills.append(node);
  } else {
    pills.append(pill("grey", "remote"));
  }
  if (app.pinned) {
    const node = pill("amber", "pinned");
    node.prepend(svgIcon(iconPin, 12));
    pills.append(node);
  }
  if (app.restored && !app.needsResolution) pills.append(pill("grey", "restored"));
  return pills;
}

function cacheCell(app, quota) {
  const cell = el("div", "cell cache-cell");
  if (!app.cached) {
    const line = el("div", "cache-size muted");
    line.append(bi("notCached"));
    const sub = el("div", "cache-sub", `${t("toDownload")} ${bytes(app.imageBytes)}`);
    cell.append(line, sub);
    return cell;
  }
  cell.append(el("div", "cache-size", bytes(app.cachedBytes)));
  if (quota > 0) {
    const sharePct = Math.max(0, Math.min(100, (Number(app.cachedBytes || 0) / quota) * 100));
    const shownPct = sharePct >= 10 ? Math.round(sharePct) : Math.round(sharePct * 10) / 10;
    const bar = el("div", "share");
    bar.setAttribute("role", "meter");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(Math.round(sharePct)));
    bar.setAttribute("aria-label", both("share", shownPct));
    bar.title = both("share", shownPct);
    const fill = el("span");
    fill.style.width = `${Math.max(sharePct, 1.5)}%`;
    bar.append(fill);
    cell.append(bar);
  }
  return cell;
}

function emptyState() {
  const empty = el("div", "state-empty");
  const icon = el("div", "tray");
  icon.append(svgIcon(iconTray, 22));
  empty.append(icon, el("strong", "", t("emptyApps")));
  empty.append(el("span", "muted", t("emptyAppsHint")));
  return empty;
}

/// Red panel with the endpoint, the reason, raw details and Retry. Only an
/// `offline` code claims the backend is unreachable; anything else (a corrupt
/// manifest on a reachable repo, say) reads as "couldn't load the app list".
function errorState(code, raw) {
  const offline = !code || code === "offline";
  const titleKey = offline ? "unreachable" : "appsLoadFailed";
  const panel = el("div", "state-error");
  panel.setAttribute("role", "alert");
  const box = el("div", "error-box");
  const head = el("div", "error-head");
  head.append(svgIcon(iconAlert, 18));
  const words = el("div");
  words.append(el("strong", "", t(titleKey)));
  head.append(words);
  box.append(head);
  const backend = lastStatus && lastStatus.backend;
  const where = (backend && (backend.activeId || "local")) || "";
  const reasonParts = [where];
  if (offline && backend && backend.timedOut) reasonParts.push(t("timedOut", Math.round(Number(backend.timeoutMs || 5000) / 1000)));
  else if (code) reasonParts.push(t(errorKey(code)));
  box.append(el("p", "error-where mono", reasonParts.filter(Boolean).join(" · ")));
  if (raw) box.append(detailsFold(raw));
  panel.append(box);
  const retry = actionButton({ labelKey: "retry", icon: iconRefresh, className: "retry", onClick: () => retryNow() });
  panel.append(retry);
  return panel;
}

function renderAppsSummary(apps) {
  const node = document.querySelector("#apps-summary");
  if (!apps) {
    node.replaceChildren();
    return;
  }
  const mine = apps.filter(isOnThisMac);
  const cached = apps.filter((app) => app.cached);
  const size = bytes(cached.reduce((sum, app) => sum + Number(app.cachedBytes || 0), 0));
  const pinned = apps.filter((app) => app.pinned).length;
  node.replaceChildren(one("appsSummary", mine.length, cached.length, size, pinned));
}

function renderApps(list, failure) {
  const rootNode = document.querySelector("#app-list");
  const tools = document.querySelector("#list-tools");
  const head = document.querySelector("#table-head");
  const focusedKey = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.key : "";
  rootNode.replaceChildren();
  // Rows from the last answer stay on screen, dimmed, while a reload is in flight.
  if (appsLoading) rootNode.setAttribute("aria-busy", "true");
  else rootNode.removeAttribute("aria-busy");
  const apps = list || [];
  renderAppsSummary(!list || (failure && !apps.length) ? null : apps);
  tools.hidden = apps.length < 2;
  head.hidden = !apps.length;
  if (failure && !apps.length) {
    rootNode.append(errorState(failure.code, failure.message));
    return;
  }
  if (!apps.length) {
    rootNode.append(appsLoading || !appsSettled ? loadingState() : emptyState());
    return;
  }
  const shown = visibleApps(apps);
  if (!shown.length) {
    rootNode.append(el("div", "state-note", both("noMatches")));
    return;
  }
  const quota = Number((lastStatus && lastStatus.cache && lastStatus.cache.quotaBytes) || 0);
  // The repo is shared by every Mac on the account. Apps offloaded on another Mac are listed
  // apart, so they do not look like apps that vanished from this one.
  const here = shown.filter(isOnThisMac);
  const elsewhere = shown.filter((app) => !isOnThisMac(app));
  for (const app of here) rootNode.append(appRow(app, quota));
  if (!here.length) rootNode.append(el("div", "state-note", both("nothingHere")));
  if (elsewhere.length) {
    const group = el("details", "elsewhere");
    group.open = elsewhereOpen;
    group.addEventListener("toggle", () => { elsewhereOpen = group.open; });
    const summary = el("summary", "elsewhere-head");
    summary.append(bi("elsewhereTitle", elsewhere.length));
    group.append(summary, el("p", "elsewhere-note", both("elsewhereNote")));
    for (const app of elsewhere) group.append(appRow(app, quota));
    rootNode.append(group);
  }
  if (focusedKey) {
    const again = rootNode.querySelector(`[data-key="${CSS.escape(focusedKey)}"]`);
    if (again && !again.disabled) again.focus();
  }
}

let elsewhereOpen = false;
// appsLoading: a /api/status request is in flight. appsSettled: a load has finished at least once,
// so "no apps" is only shown after a real answer.
let appsLoading = false;
let appsSettled = false;

/// Shown while the app list has nothing to show yet, or is still loading.
function loadingState() {
  const note = el("div", "state-note state-loading");
  note.setAttribute("role", "status");
  note.append(el("span", "spinner-inline"), el("span", "", t("loadingApps")));
  return note;
}

/// Rows from servers without `local` count as this Mac's, as before.
function isOnThisMac(app) {
  const local = app.local;
  return !local || local.kind === "stub" || local.mine === true;
}

/// The full app is installed here: launching or restoring the image would fight with it.
function fullAppHere(app) {
  return Boolean(app.local && app.local.kind === "installed");
}

function localNote(app) {
  const local = app.local;
  if (!local) return "";
  if (local.kind === "installed") return t("fullAppHere", local.version ? `v${String(local.version).replace(/^v/, "")}` : "");
  if (local.kind === "absent") return t(local.mine ? "launcherMissing" : "notInstalledHere");
  return "";
}

/// One line on what happens to the app's Application Support (data follows the app).
function dataNote(app) {
  const data = app.data;
  if (!data) return "";
  if (data.state === "offloaded") return t("dataInRepo", bytes(data.bytes));
  if (data.lastError) return t("dataWaiting", data.lastError);
  if (!data.enabled) return "";
  if (data.bytes > 0) return t("dataLocal", bytes(data.bytes));
  return t("dataOnQuit");
}

function appRow(app, quota) {
    const job = pending.get(app.name);
    const busy = Boolean(job);
    const row = el("article", "app-row");
    row.dataset.app = app.name || "";
    row.dataset.state = app.state || "";
    if (busy) row.setAttribute("aria-busy", "true");

    const who = el("div", "cell app-cell");
    const icon = appIcon(app.name, app.imageId);
    if (!fullAppHere(app) && isOnThisMac(app)) {
      // Uninstalled from this Mac: the app lives in the repo, so a cloud badge marks it.
      const wrap = el("span", "avatar-wrap");
      wrap.append(icon, cloudBadge());
      who.append(wrap);
    } else {
      who.append(icon);
    }
    const words = el("div", "app-words");
    words.append(el("h3", "app-name", app.name || ""));
    const meta = el("div", "app-meta");
    if (app.version) meta.append(document.createTextNode(`v${String(app.version).replace(/^v/, "")} · `));
    const modeKey = "mode" + (app.mode || "mount");
    meta.append(has(modeKey) ? bi(modeKey) : document.createTextNode(String(app.mode || "")));
    words.append(meta);
    const holders = (app.devices || []).filter(Boolean);
    const fromKey = isOnThisMac(app) ? "onDevices" : "packedOn";
    const extra = [localNote(app), app.lastUsed ? t("lastUsedAt", app.lastUsed) : "", holders.length ? t(fromKey, holders.join(", ")) : "", dataNote(app)].filter(Boolean);
    if (extra.length) words.append(el("div", "app-extra", extra.join(" · ")));
    if (job) {
      const line = el("div", "job-line");
      line.append(bi("phase" + (job.phase || "queued")));
      words.append(line);
    }
    who.append(words);

    const status = el("div", "cell status-cell");
    status.append(statusPills(app, job));

    const actions = el("div", "cell actions");
    const isBusy = (kind) => busy && job.kind === kind;
    const open = actionButton({ labelKey: "open", name: both("openFor", app.name), icon: iconOpen, className: "quiet", iconOnly: true, busy: isBusy("launch"), disabled: busy, onClick: () => startJob("launch", app) });
    const pinKind = app.pinned ? "unpin" : "pin";
    const pinButton = actionButton({ labelKey: pinKind, icon: iconPin, className: "tint", busy: isBusy("pin") || isBusy("unpin"), disabled: busy, onClick: () => startJob(pinKind, app) });
    pinButton.setAttribute("aria-pressed", String(Boolean(app.pinned)));
    let second;
    if (app.mounted) {
      // A mounted image cannot be evicted; offer to eject it instead.
      second = actionButton({ labelKey: "detach", name: both("detachFor", app.name), icon: iconEject, className: "outline", busy: isBusy("detach"), disabled: busy, onClick: () => startJob("detach", app) });
      second.title = t("detachHint");
      second.dataset.key = `${app.name}:detach`;
    } else if (app.cached) {
      const blocked = app.pinned ? both("evictPinned") : app.mounted ? both("evictMounted") : "";
      second = actionButton({ labelKey: "evict", icon: iconTrash, className: "danger-outline", busy: isBusy("evict"), disabled: busy, blocked, onClick: () => confirmAction("evict", app) });
      second.dataset.key = `${app.name}:evict`;
    } else {
      second = actionButton({ labelKey: "prefetch", name: both("prefetchFor", app.name), icon: iconDownload, className: "outline", busy: isBusy("prefetch"), disabled: busy, onClick: () => startJob("prefetch", app) });
      second.dataset.key = `${app.name}:prefetch`;
    }
    open.dataset.key = `${app.name}:launch`;
    pinButton.dataset.key = `${app.name}:pin`;
    if (fullAppHere(app)) actions.append(pinButton, second, overflowMenu(app, busy));
    else actions.append(open, pinButton, second, overflowMenu(app, busy));

    row.append(who, status, cacheCell(app, quota), actions);
    return row;
}

// ---- jobs -----------------------------------------------------------------

function confirmAction(kind, app) {
  const dir = installDir(app);
  const size = bytes(app.cachedBytes || app.imageBytes);
  const spec = {
    evict: { title: ["confirmEvictTitle", app.name], body: ["confirmEvictBody", size], ok: "confirmEvictOk", danger: true },
    restore: { title: ["confirmRestoreTitle", app.name], body: ["confirmRestoreBody"], ok: "confirmRestoreOk", danger: false },
    pack: { title: ["confirmPackTitle", app.name], body: [app.stopFirst ? "confirmStopPackBody" : "confirmPackBody", size], ok: app.stopFirst ? "stopAndOffload" : "confirmPackOk", danger: false },
    offloadfile: { title: ["confirmFileTitle", app.label || app.name], body: ["confirmFileBody", size], ok: "confirmPackOk", danger: false },
    trashpath: { title: ["confirmTrashTitle", app.label || app.name], body: ["confirmTrashBody", size], ok: "trashOk", danger: true },
    "data/enable": { title: ["confirmDataEnableTitle", app.name], body: ["confirmDataEnableBody"], ok: "dataEnable", danger: false },
    "data/disable": { title: ["confirmDataDisableTitle", app.name], body: ["confirmDataDisableBody"], ok: "dataDisable", danger: false },
    unpack: { title: ["confirmUnpackTitle", app.name, dir], body: ["confirmUnpackBody", app.installPath || `${dir}/${app.name}.app`], ok: "confirmUnpackOk", danger: true },
  }[kind];
  askConfirm(spec, () => startJob(kind, app));
}

/// The shared confirm dialog. `spec` holds [key, ...args] for title and body.
function askConfirm(spec, onOk) {
  const dialog = document.querySelector("#confirm");
  const title = document.querySelector("#confirm-title");
  title.replaceChildren(document.createTextNode(t(...spec.title)));
  const body = document.querySelector("#confirm-body");
  body.replaceChildren(document.createTextNode(t(...spec.body)));
  const ok = document.querySelector("#confirm-ok");
  ok.replaceChildren(bi(spec.ok));
  ok.className = spec.danger ? "btn danger" : "btn primary";
  const opener = document.activeElement;
  dialog.returnValue = "";
  dialog.onclose = () => {
    dialog.onclose = null;
    if (dialog.returnValue === "ok") onOk();
    else if (opener && opener.isConnected) opener.focus();
  };
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    document.querySelector("#confirm-cancel").focus();
  } else if (window.confirm(`${title.textContent}\n\n${body.textContent}`)) {
    onOk();
  }
}

function jobTitle(key, kind, name) {
  return biPair(tl(primary, key, tl(primary, "action" + kind), name));
}

async function startJob(kind, app) {
  if (pending.has(app.name)) return;
  pending.set(app.name, { kind, jobId: "", phase: "queued" });
  rerenderApps();
  try {
    // Evict never forces from the page: a pinned app is refused by the server too.
    const payload = kind === "evict" ? { app: app.name, force: false } : kind === "pack" ? { app: app.name, path: app.path, stopFirst: Boolean(app.stopFirst) } : (kind === "offloadfile" || kind === "trashpath") ? { app: app.name, path: app.path } : { app: app.name };
    const started = await api(`/api/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    pending.set(app.name, { kind, jobId: started.jobId, phase: started.phase || "queued" });
    rerenderApps();
    pollJob(app.name, kind, started.jobId);
  } catch (error) {
    pending.delete(app.name);
    rerenderApps();
    if (error.code === "unauthorized") return;
    if (error.code === "busy" && error.payload && error.payload.jobId) {
      pending.set(app.name, { kind, jobId: error.payload.jobId, phase: "queued" });
      pollJob(app.name, kind, error.payload.jobId);
    }
    toast({ title: jobTitle("jobFailed", kind, app.name), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

async function pollJob(name, kind, jobId) {
  while (!expired) {
    await new Promise((resolve) => setTimeout(resolve, JOB_POLL_MS));
    let job;
    try {
      job = await api(`/api/jobs/${encodeURIComponent(jobId)}`);
    } catch (error) {
      if (error.code === "unauthorized") return;
      if (error.status === 404) break;
      continue;
    }
    const current = pending.get(name);
    if (job.state === "running") {
      if (current && current.phase !== job.phase) {
        pending.set(name, { kind, jobId, phase: job.phase });
        rerenderApps();
      }
      continue;
    }
    pending.delete(name);
    if (job.state === "done") toast({ title: jobTitle("jobDone", kind, name), tone: "ok" });
    else toast({ title: jobTitle("jobFailed", kind, name), error: { code: job.error && job.error.code, message: job.error && job.error.message }, tone: "error" });
    break;
  }
  pending.delete(name);
  await load();
  if (kind === "pack") loadRecommendations(true);
  if (kind === "offloadfile" || kind === "trashpath") { loadFiles(); loadBig(); startUsageScan(); }
}

function adoptServerJobs(status) {
  for (const job of (status && status.jobs) || []) {
    if (!job.app || pending.has(job.app)) continue;
    pending.set(job.app, { kind: job.kind, jobId: job.id, phase: job.phase });
    pollJob(job.app, job.kind, job.id);
  }
}

function rerenderApps() {
  if (lastRecommend && !recommendLoading) renderRecommend(lastRecommend, null);
  if (filesData) renderFiles();
  if (lastStatus) renderApps(lastStatus.apps || [], lastStatus.appsError ? { code: appsErrorCode(lastStatus), message: lastStatus.appsError } : null);
}

/// Server code for an app-list failure; older servers sent only the text.
function appsErrorCode(status) {
  return status.appsErrorCode || "failed";
}

// ---- sessions -------------------------------------------------------------

function renderSessions(sessions) {
  const summary = document.querySelector("#sessions-summary");
  const list = document.querySelector("#sessions");
  list.replaceChildren();
  summary.replaceChildren();
  const offloaded = (sessions && sessions.offloaded) || [];
  if (sessions) {
    const days = Number(sessions.coldDays || 14);
    summary.append(bi("coldAfter", days), document.createTextNode(" · "), one("offloadedCount", offloaded.length));
  }
  if (!offloaded.length) {
    document.querySelector("#sessions-filter")?.remove();
    const empty = el("li", "state-note");
    empty.append(bi("emptySessions"));
    list.append(empty);
    return;
  }
  const sorted = [...offloaded].sort((a, b) => (Date.parse(b.modified || "") || 0) - (Date.parse(a.modified || "") || 0));
  let filter = document.querySelector("#sessions-filter");
  if (!filter) {
    filter = el("input", "session-filter");
    filter.id = "sessions-filter";
    filter.type = "search";
    filter.autocomplete = "off";
    filter.addEventListener("input", () => {
      sessionFilter = filter.value;
      renderSessions(lastSessions);
    });
    list.before(filter);
  }
  filter.placeholder = t("sessionFilter");
  filter.value = sessionFilter;
  lastSessions = sessions;
  const needle = sessionFilter.trim().toLowerCase();
  const shown = needle ? sorted.filter((e) => [e.title, e.tool, e.displayPath, e.path].some((v) => (v || "").toLowerCase().includes(needle))) : sorted;
  if (!shown.length) {
    const none = el("li", "state-note", t("sessionFilterNone"));
    list.append(none);
  }
  for (const entry of shown) {
    const item = el("li", "session-row");
    // Only cold files are archived, so every offloaded row is cold.
    item.append(pill("grey", "tiercold"));
    item.append(el("span", "session-tool", entry.tool || ""));
    const main = el("span", "session-main");
    const title = el("span", "session-title", entry.title || t("sessionUntitled"));
    title.title = entry.title || "";
    const path = el("span", "session-path mono", entry.displayPath || entry.path || "");
    path.title = entry.path || "";
    main.append(title, path);
    item.append(main);
    const age = entry.ageDays != null ? Number(entry.ageDays) : Math.max(0, Math.floor((Date.now() - (Date.parse(entry.modified || "") || Date.now())) / 86400000));
    const ageNode = el("span", "session-age", t("daysAgo", age));
    item.append(ageNode);
    const actions = el("span", "session-actions");
    if (entry.hasDigest) {
      const open = sessionDigestOpen.has(entry.id);
      const toggle = el("button", "btn quiet", t(open ? "sessionDigestHide" : "sessionDigest"));
      toggle.type = "button";
      toggle.addEventListener("click", () => toggleSessionDigest(entry.id, sessions));
      actions.append(toggle);
    }
    const restore = el("button", "btn outline", t("sessionRestore"));
    restore.type = "button";
    restore.disabled = sessionBusy();
    restore.addEventListener("click", () => restoreSession(entry));
    actions.append(restore);
    item.append(actions);
    if (sessionDigestOpen.has(entry.id)) item.append(el("pre", "session-digest", sessionDigestOpen.get(entry.id) || "…"));
    list.append(item);
  }
}

// Agent session plan: what each agent has, and what could move to the repo.
let sessionPlan = null;
let sessionPick = null; // Set of tool ids the user ticked; null until the plan first loads
const sessionExcluded = new Set(); // paths of cold sessions the user unticked
const sessionExpanded = new Set(); // agents whose session list is open
let sessionTimer = null;
let sessionApplyBytes = 0;
const sessionDigestOpen = new Map(); // entry id -> digest text
let sessionFilter = ""; // text typed into the archived-session filter
let lastSessions = null;

function sessionBusy() {
  return !!(sessionPlan && sessionPlan.task && sessionPlan.task.state === "running");
}

function sessionPickedItems(tool) {
  return (tool.sessions || []).filter((item) => !sessionExcluded.has(item.path));
}

function renderSessionPlan() {
  const box = document.querySelector("#sessions-plan");
  if (!box) return;
  box.removeAttribute("aria-busy");
  box.replaceChildren();
  if (!sessionPlan) return;
  const tools = (sessionPlan.tools || []).filter((tool) => tool.present && tool.files > 0);
  if (!tools.length) { box.append(el("p", "muted", t("sessionPlanNone"))); return; }
  if (!sessionPick) sessionPick = new Set(tools.filter((tool) => tool.coldFiles > 0).map((tool) => tool.tool));
  const busy = sessionBusy();
  for (const tool of tools) {
    const row = el("div", "session-plan-row");
    const label = el("label", "session-plan-tool");
    const box2 = document.createElement("input");
    box2.type = "checkbox";
    const chosen = sessionPickedItems(tool).length;
    box2.checked = sessionPick.has(tool.tool) && tool.coldFiles > 0 && chosen > 0;
    box2.indeterminate = box2.checked && chosen < (tool.sessions || []).length;
    box2.disabled = busy || tool.coldFiles === 0;
    box2.addEventListener("change", () => {
      if (box2.checked) {
        sessionPick.add(tool.tool);
        for (const item of tool.sessions || []) sessionExcluded.delete(item.path);
      } else sessionPick.delete(tool.tool);
      renderSessionPlan();
    });
    label.append(box2, el("strong", null, tool.label || tool.tool));
    row.append(label, el("span", "muted", t("sessionPlanLine", tool.files, bytes(tool.bytes), tool.coldFiles, bytes(tool.coldBytes))));
    if ((tool.sessions || []).length) {
      const open = sessionExpanded.has(tool.tool);
      const toggle = el("button", "btn quiet", t(open ? "sessionHideList" : "sessionShowList", tool.sessions.length));
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.addEventListener("click", () => {
        if (sessionExpanded.has(tool.tool)) sessionExpanded.delete(tool.tool); else sessionExpanded.add(tool.tool);
        renderSessionPlan();
      });
      row.append(toggle);
    }
    box.append(row);
    if (sessionExpanded.has(tool.tool)) box.append(sessionPlanList(tool, busy));
  }
  const picked = tools.filter((tool) => sessionPick.has(tool.tool) && tool.coldFiles > 0);
  const items = picked.flatMap((tool) => sessionPickedItems(tool));
  const narrowed = picked.some((tool) => sessionPickedItems(tool).length < (tool.sessions || []).length);
  const count = items.length;
  const size = items.reduce((n, item) => n + Number(item.bytes || 0), 0);
  const actions = el("div", "session-plan-actions");
  const apply = el("button", "btn tint", t(busy ? "sessionApplying" : "sessionApply"));
  apply.type = "button";
  apply.disabled = busy || !count;
  if (busy) apply.setAttribute("aria-busy", "true");
  apply.addEventListener("click", () => askConfirm(
    { title: ["sessionConfirmTitle", count, bytes(size)], body: ["sessionConfirmBody", picked.map((tool) => tool.label || tool.tool).join("、")], ok: "sessionApply", danger: true },
    () => { sessionApplyBytes = size; applySessions(picked.map((tool) => tool.tool), narrowed ? items.map((item) => item.path) : null); }));
  actions.append(apply);
  if (count) actions.append(el("span", "muted", t("sessionPicked", count, bytes(size))));
  box.append(actions);
}

// Where a session ran, home-relative.
function sessionProject(item) {
  return (item.project || "").replace(/^\/(?:Users|home)\/[^/]+(?=\/|$)/, "~");
}

// The cold sessions of one agent, each with its own tick box.
function sessionPlanList(tool, busy) {
  const list = el("ul", "session-plan-list");
  const all = tool.sessions || [];
  const head = el("li", "session-plan-item session-plan-bulk");
  for (const [key, include] of [["sessionPickAll", true], ["sessionPickNone", false]]) {
    const button = el("button", "btn quiet", t(key));
    button.type = "button";
    button.disabled = busy;
    button.addEventListener("click", () => {
      for (const item of all) { if (include) sessionExcluded.delete(item.path); else sessionExcluded.add(item.path); }
      if (include) sessionPick.add(tool.tool);
      renderSessionPlan();
    });
    head.append(button);
  }
  list.append(head);
  for (const item of all) {
    const row = el("li", "session-plan-item");
    const label = el("label");
    const tick = document.createElement("input");
    tick.type = "checkbox";
    tick.checked = sessionPick.has(tool.tool) && !sessionExcluded.has(item.path);
    tick.disabled = busy;
    tick.addEventListener("change", () => {
      if (tick.checked) { sessionExcluded.delete(item.path); sessionPick.add(tool.tool); } else sessionExcluded.add(item.path);
      renderSessionPlan();
    });
    const text = el("span", "session-main");
    const title = el("span", "session-title", item.title || t("sessionUntitled"));
    title.title = item.path || "";
    text.append(title);
    const project = sessionProject(item);
    if (project) text.append(el("span", "session-path mono", project));
    label.append(tick, text);
    const age = Math.max(0, Math.floor((Date.now() - (Date.parse(item.modified || "") || Date.now())) / 86400000));
    row.append(label, el("span", "muted", bytes(Number(item.bytes || 0))), el("span", "session-age", t("daysAgo", age)));
    list.append(row);
  }
  return list;
}

async function loadSessionPlan() {
  clearTimeout(sessionTimer);
  const before = sessionPlan && sessionPlan.task && sessionPlan.task.state;
  try {
    sessionPlan = await api("/api/sessions/plan");
  } catch (error) {
    if (error.code === "unauthorized") return;
    sessionPlan = null;
  }
  renderSessionPlan();
  const task = (sessionPlan && sessionPlan.task) || {};
  if (task.state === "running") { sessionTimer = setTimeout(loadSessionPlan, 2000); return; }
  if (before === "running") sessionTaskFinished(task);
}

function sessionTaskFinished(task) {
  if (task.state === "failed") {
    toast({ title: bi(task.action === "sessions-restore" ? "sessionRestoreFailed" : "sessionFailed"), error: { code: "failed", message: task.message || "" }, tone: "error" });
  } else if (task.action === "sessions-restore") {
    toast({ title: bi("sessionRestored", task.path || ""), tone: "ok" });
  } else {
    const moved = Math.max(0, (task.cold || []).length - (task.keptLocal || []).length);
    toast({ title: bi("sessionApplied", moved, bytes(sessionApplyBytes)), tone: "ok" });
  }
  refresh();
}

async function applySessions(tools, paths) {
  try {
    const payload = paths ? { tools, paths } : { tools };
    const started = await api("/api/sessions/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    sessionPlan = Object.assign({}, sessionPlan, { task: started.task });
    renderSessionPlan();
    sessionTimer = setTimeout(loadSessionPlan, 1500);
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("sessionFailed"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

async function restoreSession(entry) {
  try {
    const started = await api("/api/sessions/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry.id }) });
    sessionPlan = Object.assign({}, sessionPlan, { task: started.task });
    renderSessionPlan();
    sessionTimer = setTimeout(loadSessionPlan, 1500);
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("sessionRestoreFailed"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

async function toggleSessionDigest(id, sessions) {
  if (sessionDigestOpen.has(id)) { sessionDigestOpen.delete(id); renderSessions(sessions); return; }
  sessionDigestOpen.set(id, "");
  renderSessions(sessions);
  try {
    const result = await api(`/api/sessions/digest?id=${encodeURIComponent(id)}`);
    sessionDigestOpen.set(id, result.digest || "");
  } catch (error) {
    if (error.code === "unauthorized") return;
    sessionDigestOpen.set(id, error.message || "");
  }
  renderSessions(sessions);
}

// ---- recommendations ------------------------------------------------------

// Warnings that are only said, not a reason to hold an app back (see RecommendRanking.noteOnlyWarnings).
const NOTE_ONLY_WARNINGS = new Set(["loginItem", "menuBarAgent"]);

/// The offload button for a recommendation row. An app whose helper is running gets
/// "Stop and offload": the pack job quits the app's own processes first.
function recommendActions(app) {
  const actions = el("div", "actions");
  const job = pending.get(app.name);
  const packing = Boolean(job && job.kind === "pack");
  const stop = (app.warnings || []).includes("backgroundHelper");
  actions.append(actionButton({
    labelKey: packing ? "offloading" : stop ? "stopAndOffload" : "offloadNow",
    name: both(stop ? "stopAndOffloadFor" : "offloadNowFor", app.name),
    icon: iconTray,
    className: "primary",
    busy: packing,
    disabled: Boolean(job),
    onClick: () => confirmAction("pack", { name: app.name, path: app.path, cachedBytes: app.sizeBytes, stopFirst: stop }),
  }));
  if ((app.warnings || []).includes("loginItem")) {
    actions.append(actionButton({
      labelKey: "loginItemsSettings",
      name: both("loginItemsSettings"),
      icon: iconOpen,
      className: "outline",
      onClick: async () => {
        try { await api("/api/loginitems/open", { method: "POST" }); }
        catch (error) { toast({ title: bi("loginItemsSettings"), error, tone: "error" }); }
      },
    }));
  }
  return actions;
}

function recommendReason(app, language) {
  const say = (key, ...args) => tl(language || primary, key, ...args);
  const warnings = app.warnings || [];
  const warnText = (code) => (has("warn" + code) ? say("warn" + code) : code);
  if (warnings.some((code) => !NOTE_ONLY_WARNINGS.has(code))) return warnings.map(warnText).join("; ");
  const parts = [];
  if (app.neverUsed) parts.push(say("neverUsed"));
  else if (app.daysIdle != null) parts.push(say("idleDays", Number(app.daysIdle)));
  if (app.macAppStore) parts.push(say("restoreNeeded"));
  if (app.sizeIncomplete) parts.push(say("sizeBound"));
  if (app.alreadyInRepo) {
    const devices = app.otherDevices || [];
    parts.push(say("alreadyInRepo") + (devices.length ? ` (${devices.join(", ")})` : ""));
  }
  for (const code of warnings) parts.push(warnText(code));
  return parts.join("; ");
}

function modeKeyFor(mode) {
  const key = "mode" + (mode || "mount");
  return has(key) ? key : "modemount";
}

function packCommand(path) {
  const escaped = String(path || "").replace(/(["\\$`])/g, "\\$1");
  return `disklessly pack "${escaped}"`;
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {}
  const area = el("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  area.remove();
  return ok;
}

function renderLeftovers(report) {
  const line = document.querySelector("#recommend-leftovers");
  const paths = document.querySelector("#recommend-leftover-paths");
  line.replaceChildren();
  paths.replaceChildren();
  const items = (report && report.leftoverBackups) || [];
  line.hidden = !items.length;
  paths.hidden = !items.length;
  if (!items.length) return;
  const total = bytes(items.reduce((sum, item) => sum + Number(item.sizeBytes || 0), 0));
  line.append(biPair(`${tl(primary, "leftoverBackups", items.length, total)} ${tl(primary, "leftoverAdmin")}`));
  const button = el("button", "btn quiet");
  button.id = "leftover-clean";
  button.type = "button";
  button.append(bi("leftoverClean"));
  button.addEventListener("click", () => confirmLeftoverCleanup(total));
  line.append(" ", button);
  for (const item of items) paths.append(el("li", "mono path", item.path || ""));
}

/// Leftover backups go through one administrator prompt on the server; the page confirms first.
function confirmLeftoverCleanup(total) {
  const items = (lastRecommend && lastRecommend.leftoverBackups) || [];
  if (!items.length || pending.has(LEFTOVER_JOB)) return;
  askConfirm({ title: ["leftoverCleanTitle", items.length, total], body: ["leftoverCleanBody"], ok: "leftoverCleanOk", danger: true }, cleanupLeftovers);
}

async function cleanupLeftovers() {
  if (pending.has(LEFTOVER_JOB)) return;
  const button = document.querySelector("#leftover-clean");
  if (button) button.disabled = true;
  pending.set(LEFTOVER_JOB, { kind: "backups/cleanup", jobId: "", phase: "queued" });
  let failure = null;
  try {
    const started = await api("/api/backups/cleanup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app: LEFTOVER_JOB }) });
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, JOB_POLL_MS));
      const job = await api(`/api/jobs/${encodeURIComponent(started.jobId)}`);
      if (job.state === "running") continue;
      if (job.state !== "done") failure = job.error || { code: "failed", message: "" };
      break;
    }
  } catch (error) {
    if (error.code === "unauthorized") return;
    failure = { code: error.code, message: error.message };
  } finally {
    pending.delete(LEFTOVER_JOB);
    if (button) button.disabled = false;
  }
  if (failure) toast({ title: bi("leftoverCleanFailed"), error: failure, tone: "error" });
  else toast({ title: bi("leftoverCleanDone"), tone: "ok" });
  loadRecommendations(true);
  loadUsage();
}

function renderScanLine() {
  const scanned = document.querySelector("#recommend-scanned");
  const rescan = document.querySelector("#rescan");
  scanned.replaceChildren();
  if (recommendLoading) {
    scanned.append(bi("recommendScanning"));
    rescan.setAttribute("aria-busy", "true");
    rescan.disabled = true;
  } else {
    if (lastRecommend && lastRecommend.scannedAt) scanned.append(bi("scannedAgo", lastRecommend.scannedAt));
    rescan.removeAttribute("aria-busy");
    rescan.disabled = false;
  }
}

function recommendRow(app) {
  const row = el("article", "rec-row");
  const who = el("div", "app-cell");
  who.append(appIcon(app.name));
  const words = el("div", "app-words");
  const nameLine = el("div", "rec-name");
  nameLine.append(el("h3", "app-name", app.name || ""), pill(app.macAppStore ? "amber" : "blue", modeKeyFor(app.suggestedMode)));
  words.append(nameLine, el("div", "app-meta", [bytes(app.sizeBytes), app.bundleId || ""].filter(Boolean).join(" · ")));
  const reason = recommendReason(app, primary);
  if (reason) words.append(biPair(reason, "", "rec-reason"));
  const command = packCommand(app.path);
  words.append(el("code", "inline-command", command));
  who.append(words);
  const actions = recommendActions(app);
  actions.append(actionButton({
    labelKey: "copyCommand",
    name: both("copyCommandFor", app.name),
    icon: iconCopy,
    className: "outline",
    onClick: async () => {
      if (await copyText(command)) toast({ title: bi("copied", app.name), tone: "ok" });
      else toast({ title: bi("copyFailed"), tone: "error" });
    },
  }));
  row.append(who, actions);
  return row;
}

function renderRecommend(report, failure) {
  const summary = document.querySelector("#recommend-summary");
  const total = document.querySelector("#recommend-total");
  const list = document.querySelector("#recommend-list");
  const warnTitle = document.querySelector("#recommend-warn-title");
  const warnings = document.querySelector("#recommend-warnings");
  list.replaceChildren();
  warnings.replaceChildren();
  summary.replaceChildren();
  list.removeAttribute("aria-busy");
  renderScanLine();
  if (!report) {
    total.hidden = true;
    const empty = el("div", "state-note");
    empty.append(bi("recommendFailed"));
    if (failure) empty.append(errorBlock(failure.code, failure.message));
    list.append(empty);
    warnTitle.hidden = true;
    renderLeftovers(null);
    return;
  }
  const apps = report.recommendations || [];
  if (report.scan === "unavailable") {
    total.hidden = true;
    summary.append(bi("recommendUnavailable"));
  } else {
    total.hidden = !apps.length;
    total.replaceChildren(biValue("couldFree", bytes(report.estimatedFreedBytes || 0)));
    summary.append(one("recommendSummary", apps.length, bytes(report.minSizeBytes || 0)));
  }
  if (!apps.length && report.scan !== "unavailable") {
    const empty = el("div", "state-note");
    empty.append(bi("recommendEmpty"), el("br"), bi("recommendEmptyHint"));
    list.append(empty);
  }
  for (const app of apps) list.append(recommendRow(app));
  const folded = report.folded || [];
  if (folded.length) {
    // Below the threshold: still listed, folded, ordered by use count and size together.
    const details = el("details", "rec-folded");
    details.open = recommendFoldedOpen;
    details.addEventListener("toggle", () => { recommendFoldedOpen = details.open; });
    details.append(el("summary", "rec-folded-title", t("foldedTitle", folded.length)));
    details.append(el("p", "muted small", t("foldedHint")));
    for (const app of folded) details.append(recommendRow(app));
    list.append(details);
  }
  const poor = report.warnings || [];
  warnTitle.hidden = poor.length === 0;
  for (const app of poor) {
    const item = el("li", "poor-row");
    const top = el("div", "rec-name");
    top.append(el("span", "app-name", app.name || ""), pill("grey", modeKeyFor(app.suggestedMode)));
    const words = el("div", "app-words");
    words.append(top, el("div", "mono path", app.path || ""), biPair(recommendReason(app, primary), "", "rec-reason"));
    item.append(words);
    // Only what cannot work is held back: the toolchain, extensions, and apps already packed.
    const blocked = app.suggestedMode === "unsupported" || (app.warnings || []).includes("alreadyPacked");
    if (!blocked) {
      item.classList.add("poor-row-actionable");
      item.append(recommendActions(app));
    }
    warnings.append(item);
  }
  renderLeftovers(report);
}

// ---- devices, onboarding --------------------------------------------------

function setFold(id, countId, count) {
  const fold = document.querySelector(id);
  const counter = document.querySelector(countId);
  counter.replaceChildren(count ? document.createTextNode(String(count)) : bi("countNone"));
  fold.classList.toggle("is-empty", !count);
  // Open the section the first time it has content; afterwards respect the user's toggle.
  const had = folds[id];
  if (had === undefined || (had === 0 && count > 0)) fold.open = count > 0;
  folds[id] = count;
}

function renderDevices(status) {
  const summary = document.querySelector("#devices-summary");
  const list = document.querySelector("#devices");
  list.replaceChildren();
  summary.replaceChildren();
  const devices = (status && status.devices) || [];
  const conflicts = (status && status.deviceConflicts) || [];
  const placeholders = (status && status.devicePlaceholders) || [];
  const notes = [];
  if (status && devices.length) notes.push(["devicesSummary", devices.length]);
  if (conflicts.length) notes.push(["conflictCopies", conflicts.length]);
  if (placeholders.length) notes.push(["placeholders", placeholders.length]);
  notes.forEach(([key, n], index) => {
    if (index) summary.append(document.createTextNode(" · "));
    summary.append(bi(key, n));
  });
  summary.hidden = !notes.length;
  setFold("#devices-section", "#devices-count", devices.length);
  if (!devices.length) {
    const empty = el("li", "state-note");
    empty.append(bi(status ? "devicesEmpty" : "loadFailed"));
    list.append(empty);
    return;
  }
  for (const device of devices) {
    const item = el("li", "device-row");
    const top = el("div", "rec-name");
    top.append(el("span", "app-name", device.displayName || device.hostname || device.deviceId || ""));
    if (device.self) top.append(pill("blue", "thisMac"));
    item.append(top);
    item.append(el("div", "mono path", [device.hostname, device.arch, device.osVersion].filter(Boolean).join(" · ")));
    const images = device.images || [];
    const detail = images.map((image) => `${image.bundleId || image.imageId} ${image.version || ""}`.trim()).join(", ");
    if (detail) item.append(el("p", "muted small", detail));
    list.append(item);
  }
}

let appManagementConfirmed = localStorage.getItem("disklessly.appManagementConfirmed") === "1";

async function loadPermissions() {
  const card = document.querySelector("#permissions");
  try {
    const perms = await api("/api/permissions");
    const fdaOk = perms.fullDiskAccess === "granted";
    card.hidden = fdaOk && appManagementConfirmed;
    document.querySelector("#perm-fda-state").replaceChildren(bi(fdaOk ? "permGranted" : "permMissing"));
    document.querySelector("#perm-app-ok").hidden = appManagementConfirmed;
  } catch (error) {
    if (error.code !== "unauthorized") card.hidden = true;
  }
}

async function openPermission(which) {
  try {
    await api("/api/permissions/open", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ which }) });
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("usageFailed"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

function renderOnboarding(status) {
  const hero = document.querySelector("#onboarding");
  const show = Boolean(status) && !status.appsError && !((status.apps || []).length);
  hero.hidden = !show;
  const repo = status && status.backend && status.backend.repoPath;
  const slot = document.querySelector("#hero-repo");
  slot.replaceChildren(repo ? bi("heroRepo", repo) : document.createTextNode(""));
}

// ---- load -----------------------------------------------------------------

/// A Linux build cannot offload apps: hide the app list, onboarding, and recommendations.
function appsSupported() {
  return !lastStatus || lastStatus.platform !== "linux";
}

function applyPlatform() {
  const off = !appsSupported();
  for (const id of ["#apps", "#recommend-section", "#cache-card"]) document.querySelector(id).hidden = off;
  if (off) document.querySelector("#onboarding").hidden = true;
  document.querySelector("#skip").setAttribute("href", off ? "#sessions-section" : "#apps");
}

function render(status) {
  lastStatus = status;
  applyChrome();
  renderOnboarding(status);
  loadPermissions();
  renderBackend(status.backend || null);
  renderCache(status.cache || null);
  if (status.appsError) showBanner(appsErrorCode(status), status.appsError);
  rerenderApps();
  renderDevices(status);
  renderSessions(status.sessions || null);
  applyPlatform();
}

function renderFailure() {
  applyChrome();
  renderOnboarding(null);
  renderBackend(null);
  renderCache(null);
  renderApps([], loadError || { code: "offline", message: "" });
  renderDevices(null);
  renderSessions(null);
  applyPlatform();
}

// ---- license --------------------------------------------------------------

let licenseState = null;

function renderLicense(info) {
  licenseState = info;
  const summary = document.querySelector("#license-summary");
  const detail = document.querySelector("#license-detail");
  const remove = document.querySelector("#license-remove");
  const buy = document.querySelector("#license-buy");
  const input = document.querySelector("#license-code");
  input.setAttribute("aria-label", both("licenseCode"));
  if (!info) { summary.replaceChildren(); detail.replaceChildren(); remove.hidden = true; buy.hidden = true; return; }
  // The link comes from the engine; only a secure web address is shown. The window opens it in the browser.
  const store = typeof info.purchaseURL === "string" && info.purchaseURL.startsWith("https:") ? info.purchaseURL : "";
  if (store) buy.href = store; else buy.removeAttribute("href");
  buy.hidden = !store || info.state === "licensed";
  const lines = [];
  if (info.state === "licensed") {
    summary.replaceChildren(bi("licenseFull"));
    if (info.expires) lines.push(one("licenseUntil", info.expires));
    if (info.updatesUntil) lines.push(one("licenseUpdates", info.updatesUntil));
  } else if (info.state === "expired") {
    summary.replaceChildren(bi("licenseFree", info.offloaded, info.freeLimit));
    lines.push(one("licenseExpired", info.expires || "?"));
  } else if (info.state === "invalid") {
    summary.replaceChildren(bi("licenseFree", info.offloaded, info.freeLimit));
    lines.push(one("licenseInvalid"));
  } else {
    summary.replaceChildren(bi("licenseFree", info.offloaded, info.freeLimit));
    lines.push(bi("licenseFreeBody"));
  }
  detail.replaceChildren(...lines.flatMap((node, i) => (i ? [document.createElement("br"), node] : [node])));
  remove.hidden = info.state === "free";
}

async function loadLicense() {
  try { renderLicense(await api("/api/license")); } catch (error) { if (error.code !== "unauthorized") renderLicense(null); }
}

async function submitLicense(event) {
  event.preventDefault();
  const input = document.querySelector("#license-code");
  const code = input.value.trim();
  if (!code) return;
  try {
    renderLicense(await api("/api/license/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }));
    input.value = "";
    toast({ title: bi("licenseOk"), tone: "ok" });
  } catch (error) {
    toast({ title: bi("licenseActivate"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

async function removeLicense() {
  try {
    renderLicense(await api("/api/license/deactivate", { method: "POST" }));
    toast({ title: bi("licenseRemoved"), tone: "ok" });
  } catch (error) {
    toast({ title: bi("licenseRemove"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}


async function loadRecommendations(rescan) {
  if (recommendLoading) return;
  recommendLoading = true;
  renderScanLine();
  try {
    lastRecommend = await api(rescan ? "/api/recommend?rescan=1" : "/api/recommend");
    recommendError = null;
  } catch (error) {
    if (error.code === "unauthorized") return;
    recommendError = { code: error.code, message: error.message };
  } finally {
    recommendLoading = false;
  }
  if (lastRecommend) renderRecommend(lastRecommend, null);
  else renderRecommend(null, recommendError);
}

// ---- large files ----------------------------------------------------------

let filesData = null;
let filesTimer = null;
let filesAutoStarted = false;

function fileReason(item, language) {
  if (item.daysIdle == null) return tl(language, "filesNever");
  return tl(language, "filesIdle", Number(item.daysIdle));
}

function renderFiles() {
  const scanned = document.querySelector("#files-scanned");
  const button = document.querySelector("#files-scan");
  const summary = document.querySelector("#files-summary");
  const list = document.querySelector("#files-list");
  scanned.replaceChildren();
  summary.replaceChildren();
  list.replaceChildren();
  const data = filesData || {};
  const scanning = data.state === "scanning";
  button.disabled = scanning;
  if (scanning) button.setAttribute("aria-busy", "true");
  else button.removeAttribute("aria-busy");
  if (scanning) scanned.append(bi("filesScanning"));
  else if (data.scannedAt) scanned.append(bi("scannedAgo", data.scannedAt));
  const items = data.items || [];
  if (data.state === "ready") {
    const days = Number(data.minIdleDays || 0);
    summary.append(one("filesSummary", items.length, bytes(data.minSizeBytes || 0), days));
    if (data.partial) summary.append(document.createTextNode(" · "), bi("filesPartial"));
    if (!items.length) {
      const empty = el("div", "state-note");
      empty.append(bi("filesEmpty"));
      list.append(empty);
    }
  }
  for (const item of items) {
    const row = el("article", "rec-row");
    const who = el("div", "app-cell");
    who.append(letterIcon(item.name || "?"));
    const words = el("div", "app-words");
    const nameLine = el("div", "rec-name");
    nameLine.append(el("h3", "app-name", item.name || ""), pill("grey", item.kind === "folder" ? "filesFolder" : "filesFile"));
    words.append(nameLine, el("div", "app-meta", bytes(item.sizeBytes)), biPair(fileReason(item, primary), null, "rec-reason"), el("div", "mono path", item.path || ""));
    who.append(words);
    const actions = el("div", "actions");
    const job = pending.get(item.path);
    const busy = Boolean(job && job.kind === "offloadfile");
    actions.append(actionButton({
      labelKey: busy ? "offloading" : "offloadNow",
      name: both("offloadNowFor", item.name),
      icon: iconTray,
      className: "primary",
      busy,
      disabled: Boolean(job),
      onClick: () => confirmAction("offloadfile", { name: item.path, label: item.name, path: item.path, cachedBytes: item.sizeBytes }),
    }));
    row.append(who, actions);
    list.append(row);
  }
}

async function loadFiles() {
  clearTimeout(filesTimer);
  try {
    filesData = await api("/api/files");
  } catch (error) {
    if (error.code === "unauthorized") return;
    return;
  }
  // The first view scans once; it only reads sizes and dates.
  if (filesData.state === "idle" && !filesAutoStarted) {
    filesAutoStarted = true;
    return startFilesScan();
  }
  renderFiles();
  if (filesData.state === "scanning" && !expired) filesTimer = setTimeout(loadFiles, 3000);
}

async function startFilesScan() {
  try {
    filesData = await api("/api/files/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    renderFiles();
    clearTimeout(filesTimer);
    filesTimer = setTimeout(loadFiles, 2000);
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("filesTitle"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

// ---- Xcode simulators -----------------------------------------------------

let devData = null;
const devBusy = new Map(); // item id -> job kind

const devConfirms = {
  "dev/offload-runtime": (item) => ({ title: ["devConfirmRuntimeTitle", item.title], body: ["devConfirmRuntimeBody", bytes(item.bytes)], ok: "devConfirmOk", danger: false }),
  "dev/offload-simulator": (item) => ({ title: ["devConfirmSimTitle", item.name], body: ["devConfirmSimBody", bytes(item.bytes)], ok: "devConfirmOk", danger: false }),
  "dev/shutdown-simulator": (item) => ({ title: ["devConfirmShutdownTitle", item.name], body: ["devConfirmShutdownBody"], ok: "devShutdown", danger: true }),
  "dev/forget": (item) => ({ title: ["devConfirmForgetTitle", item.title], body: ["devConfirmForgetBody", bytes(item.bytes)], ok: "devForget", danger: true }),
  "dev/clean-derived-data": () => ({ title: ["devConfirmCleanTitle"], body: ["devConfirmCleanBody"], ok: "devConfirmOk", danger: false }),
};

function devAction(kind, id, label, item) {
  const confirm = devConfirms[kind];
  if (confirm) askConfirm(confirm(item), () => devJob(kind, id, label));
  else devJob(kind, id, label);
}

async function devJob(kind, id, label) {
  if (devBusy.has(id)) return;
  devBusy.set(id, kind);
  renderDev();
  let failure = null;
  try {
    const started = await api(`/api/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app: id }) });
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, JOB_POLL_MS));
      const job = await api(`/api/jobs/${encodeURIComponent(started.jobId)}`);
      if (job.state === "running") continue;
      if (job.state !== "done") failure = job.error || { code: "failed", message: "" };
      break;
    }
  } catch (error) {
    if (error.code === "unauthorized") return;
    failure = { code: error.code, message: error.message };
  }
  devBusy.delete(id);
  if (failure) toast({ title: biPair(tl(primary, "devJobFailed", label), null), error: failure, tone: "error" });
  else toast({ title: biPair(tl(primary, "devJobDone", label), null), tone: "ok" });
  await loadDev();
}

function devRow(name, detail, size, buttons) {
  const row = el("div", "rec-row");
  const who = el("div");
  const title = el("div", "rec-name");
  title.append(el("strong", null, name));
  who.append(title);
  if (detail) {
    const reason = el("span", "rec-reason");
    reason.append(detail);
    who.append(reason);
  }
  const actions = el("div", "actions");
  actions.append(el("span", "muted small", size), ...buttons);
  row.append(who, actions);
  return row;
}

function devGroup(titleKey, rows) {
  const box = el("div", "dev-group");
  const head = el("h3", "dev-group-title");
  head.append(bi(titleKey));
  box.append(head);
  if (rows.length) box.append(...rows);
  else box.append(el("p", "muted small", t("devNone")));
  return box;
}

function renderDev() {
  const list = document.querySelector("#dev-list");
  if (!list) return;
  list.removeAttribute("aria-busy");
  list.replaceChildren();
  if (!devData) return;
  if (devData.unavailable) {
    list.append(el("p", "muted", t("devUnavailable")));
  }
  const button = (labelKey, icon, kind, id, label, item, blocked, className) =>
    actionButton({ labelKey, icon, className: className || "outline", busy: devBusy.get(id) === kind, disabled: devBusy.has(id), blocked: blocked || undefined, onClick: () => devAction(kind, id, label, item) });
  // A blocked row says why in its detail line, not only in the button's tooltip.
  const withNote = (text, note) => {
    if (!note) return text;
    const node = el("span");
    if (text) node.append(text, " · ");
    node.append(el("span", "warn-text", note));
    return node;
  };
  const runtimes = (devData.runtimes || []).map((r) => {
    const inUse = (r.inUseBy || []).join(", ");
    const note = inUse ? t("devInUseBy", inUse) : r.blocked || "";
    return devRow(r.title, withNote(r.runtimeIdentifier.replace("com.apple.CoreSimulator.SimRuntime.", ""), note), bytes(r.bytes), r.deletable ? [button("devOffload", iconTray, "dev/offload-runtime", r.id, r.title, r, r.blocked)] : []);
  });
  const simulators = (devData.simulators || []).filter((d) => d.bytes >= 50 * 1024 * 1024).map((d) => {
    const booted = d.state === "Booted";
    const buttons = booted
      ? [button("devShutdown", iconPower, "dev/shutdown-simulator", d.udid, d.name, d)]
      : [button("devOffload", iconTray, "dev/offload-simulator", d.udid, d.name, d, d.blocked)];
    return devRow(d.name, withNote("", booted ? t("devRunning") : d.blocked), bytes(d.bytes), buttons);
  });
  const offloaded = (devData.offloaded || []).map((o) => {
    const detail = el("span");
    detail.append(t(o.kind === "runtime" ? "devRuntimes" : "devSimulators"), " · ", t("devFrom", o.host));
    if (o.present) detail.append(" · ", t("devInstalledHere"));
    const restoreKind = o.kind === "runtime" ? "dev/restore-runtime" : "dev/restore-simulator";
    const buttons = [];
    if (!o.present) buttons.push(button("devRestore", iconDownload, restoreKind, o.id, o.title, o));
    buttons.push(button("devForget", iconTrash, "dev/forget", o.id, o.title, o, null, "danger-outline"));
    return devRow(o.title, detail, bytes(o.bytes), buttons);
  });
  list.append(devGroup("devRuntimes", runtimes), devGroup("devSimulators", simulators), devGroup("devOffloaded", offloaded));
  const clean = el("p", "dev-clean");
  clean.append(button("devCleanDerived", iconTrash, "dev/clean-derived-data", "derived-data", "DerivedData", {}, null, "quiet"));
  list.append(clean);
}

async function loadDev() {
  try {
    devData = await api("/api/dev");
  } catch (error) {
    if (error.code === "unauthorized") return;
    document.querySelector("#dev-list").replaceChildren(errorBlock(error.code, error.message));
    return;
  }
  renderDev();
}

// ---- disk usage -----------------------------------------------------------

let usageData = null;
let usageFocus = []; // child indexes from the root
let usageTimer = null;
let usageAutoStarted = false;

const USAGE_LEGEND = ["bundle", "cache", "data", "offloaded", "personal", "library", "system", "free"];
const usageKindText = { bundle: "usage_bundle", cache: "usage_cache", data: "usage_data", offloaded: "usage_disklessly", personal: "usage_personal", library: "usage_library", system: "usage_system", free: "usage_free" };

function usageLabel(node, parent) {
  const key = node.key;
  if (key === "rest") return t("usage_rest", node.name);
  if (["bundle", "cache", "data"].includes(key) && (!parent || parent.key !== "disklessly")) return t("usage_" + key);
  if (key && has("usage_" + key) && !["cache"].includes(key)) return t("usage_" + key);
  return node.name;
}

function usageLabelBoth(node, parent) {
  const key = node.key;
  const keyed = (k, ...a) => both("usage_" + k, ...a);
  if (key === "rest") return keyed("rest", node.name);
  if (["bundle", "cache", "data"].includes(key) && (!parent || parent.key !== "disklessly")) return keyed(key);
  if (key && has("usage_" + key) && key !== "cache") return keyed(key);
  return node.name;
}

function usageNodeAt(path) {
  let node = usageData.tree;
  const trail = [{ node, parent: null }];
  for (const index of path) {
    const child = node.children && node.children[index];
    if (!child) break;
    trail.push({ node: child, parent: node });
    node = child;
  }
  return trail;
}

function renderUsage() {
  const chart = document.querySelector("#usage-chart");
  const crumbs = document.querySelector("#usage-crumbs");
  const legend = document.querySelector("#usage-legend");
  const summary = document.querySelector("#usage-summary");
  const scanned = document.querySelector("#usage-scanned");
  const button = document.querySelector("#usage-scan");
  const tip = document.querySelector("#usage-tip");
  summary.replaceChildren();
  scanned.replaceChildren();
  const scanning = usageData && usageData.state === "scanning";
  button.disabled = Boolean(scanning);
  button.firstElementChild.replaceChildren(bi(usageData && usageData.tree ? "usageRescan" : "usageScan"));
  if (scanning) button.setAttribute("aria-busy", "true"); else button.removeAttribute("aria-busy");
  if (!usageData || !usageData.tree) {
    chart.hidden = crumbs.hidden = legend.hidden = tip.hidden = document.querySelector("#usage-tips").hidden = true;
    summary.append(bi(scanning ? "usageScanning" : "usageIntro"));
    return;
  }
  if (usageData.scannedAt) scanned.append(bi("scannedAgo", usageData.scannedAt));
  const root = usageData.tree;
  const free = (root.children.find((c) => c.key === "free") || {}).bytes || 0;
  summary.append(one("usageTotal", bytes(root.bytes - free), bytes(free), bytes(root.bytes)));
  if (usageData.partial) summary.append(el("br"), bi("usagePartial"));
  if (scanning) summary.append(el("br"), bi("usageScanning"));
  summary.append(el("br"), bi("usageHint"));

  const trail = usageNodeAt(usageFocus);
  crumbs.hidden = false;
  crumbs.replaceChildren();
  trail.forEach((step, depth) => {
    if (depth) crumbs.append(el("span", "usage-sep", "›"));
    const last = depth === trail.length - 1;
    const label = depth === 0 ? usageLabel(step.node, null) : usageLabel(step.node, step.parent);
    const item = el(last ? "span" : "button", last ? "usage-crumb current" : "usage-crumb", label);
    if (!last) {
      item.type = "button";
      item.addEventListener("click", () => { usageFocus = usageFocus.slice(0, depth); renderUsage(); });
    }
    crumbs.append(item);
  });

  const focus = trail[trail.length - 1].node;
  chart.hidden = false;
  drawUsageMap();

  renderUsageTips(focus, trail.length === 1);

  legend.hidden = false;
  legend.replaceChildren();
  for (const kind of USAGE_LEGEND) {
    const item = el("li", "usage-legend-item");
    // Linux names the "library" box App data (the dot folders under ~).
    const text = kind === "library" && !appsSupported() ? "usage_appdata" : usageKindText[kind];
    item.append(el("span", `usage-swatch u-${kind}`), bi(text));
    legend.append(item);
  }
  renderCleanups(root);
}

// Squarified treemap (Bruls, Huizing, van Wijk): lays the children of one node into a rectangle so that
// each child's area matches its share of the bytes and the boxes stay as close to square as they can.
// Returns [{ child, index, x, y, w, h }] in pixels; children with no bytes get no box.
function usageSquarify(children, x, y, w, h) {
  const items = children.map((child, index) => ({ child, index, bytes: child.bytes || 0 })).filter((item) => item.bytes > 0);
  items.sort((a, b) => b.bytes - a.bytes);
  const total = items.reduce((sum, item) => sum + item.bytes, 0);
  const out = [];
  if (!total || w <= 0 || h <= 0) return out;
  const scale = (w * h) / total;
  for (const item of items) item.area = item.bytes * scale;
  const worst = (row, side) => {
    const sum = row.reduce((s, r) => s + r.area, 0);
    let max = 0;
    let min = Infinity;
    for (const r of row) { max = Math.max(max, r.area); min = Math.min(min, r.area); }
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };
  const place = (row) => {
    const sum = row.reduce((s, r) => s + r.area, 0);
    if (w >= h) {
      // A column on the left, as wide as the row's share.
      const cw = sum / h;
      let cy = y;
      for (const r of row) { const rh = r.area / cw; out.push({ child: r.child, index: r.index, x, y: cy, w: cw, h: rh }); cy += rh; }
      x += cw; w -= cw;
    } else {
      const rh = sum / w;
      let cx = x;
      for (const r of row) { const cw = r.area / rh; out.push({ child: r.child, index: r.index, x: cx, y, w: cw, h: rh }); cx += cw; }
      y += rh; h -= rh;
    }
  };
  let row = [];
  for (const item of items) {
    const side = Math.min(w, h);
    if (row.length && worst([...row, item], side) > worst(row, side)) { place(row); row = []; }
    row.push(item);
  }
  if (row.length) place(row);
  return out;
}

const USAGE_MAP_DEPTH = 3; // nested levels drawn below the focused node
const USAGE_HEADER = 18; // title strip of a box whose children are drawn inside it

/// Draws the focused node as a nested treemap: each box's area is its size, boxes with room show their
/// children inside under a title strip, and a box with children zooms in when clicked.
function drawUsageMap() {
  const chart = document.querySelector("#usage-chart");
  const tip = document.querySelector("#usage-tip");
  if (!usageData || !usageData.tree || chart.hidden) return;
  const trail = usageNodeAt(usageFocus);
  const focus = trail[trail.length - 1].node;
  const width = Math.floor(chart.getBoundingClientRect().width) || 640;
  const height = Math.round(Math.min(520, Math.max(220, (width * 9) / 16)));
  chart.style.height = `${height}px`;
  chart.replaceChildren();
  const box = (node, parent, rect, path, depth) => {
    // A 1px gap between neighbours keeps the edges readable; nested boxes add their parent's frame.
    const x = rect.x + 1;
    const y = rect.y + 1;
    const w = rect.w - 2;
    const h = rect.h - 2;
    if (w < 2 || h < 2) return;
    const kids = node.children && node.children.length ? node.children : null;
    const nested = Boolean(kids) && depth < USAGE_MAP_DEPTH && w >= 64 && h >= USAGE_HEADER + 30;
    const item = el("button", `usage-box u-${node.kind}${nested ? " frame" : ""}`);
    item.type = "button";
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    item.style.width = `${w}px`;
    item.style.height = `${h}px`;
    const label = usageLabel(node, parent);
    const share = focus.bytes ? node.bytes / focus.bytes : 0;
    const pct = focus.bytes ? `${(share * 100).toFixed(share < 0.1 ? 1 : 0)}%` : "";
    if (nested ? w >= 40 : w >= 44 && h >= 16) {
      item.append(el("span", "usage-name", label));
      // The size goes beside a title, or under a leaf's name when the leaf is tall enough.
      if (nested ? w >= 120 : h >= 34) item.append(el("span", "usage-size", bytes(node.bytes)));
    }
    const full = usageLabelBoth(node, parent);
    const named = node.key && ["bundle", "cache", "data"].includes(node.key) && parent && parent.name && parent.key == null ? `${parent.name} · ${full}` : full;
    item.title = `${named} · ${bytes(node.bytes)} · ${pct}`;
    item.setAttribute("aria-label", item.title);
    if (kids) {
      item.classList.add("zoomable");
      item.addEventListener("click", () => { usageFocus = path; renderUsage(); });
    }
    const show = () => { tip.hidden = false; tip.textContent = item.title; };
    item.addEventListener("mouseenter", show);
    item.addEventListener("focus", show);
    if (node.path) item.addEventListener("contextmenu", (event) => { event.preventDefault(); usageContextMenu(event, node, label); });
    chart.append(item);
    // Children are later siblings in the DOM, so they sit on top of the frame and take their own clicks.
    if (nested) {
      for (const cell of usageSquarify(kids, x + 2, y + USAGE_HEADER, w - 4, h - USAGE_HEADER - 2)) {
        box(cell.child, node, cell, [...path, cell.index], depth + 1);
      }
    }
  };
  // The focused node fills the whole map (the path above names it); its children are the top boxes.
  const parent = trail.length > 1 ? trail[trail.length - 2].node : null;
  if (focus.children && focus.children.length) {
    for (const cell of usageSquarify(focus.children, 0, 0, width, height)) box(cell.child, focus, cell, [...usageFocus, cell.index], 1);
  } else {
    box(focus, parent, { x: 0, y: 0, w: width, h: height }, usageFocus, USAGE_MAP_DEPTH);
  }
}

let usageResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(usageResizeTimer);
  usageResizeTimer = setTimeout(drawUsageMap, 120);
});

/// Right-click on a box that is one folder: offload it (a cloud-badged link stays) or move it to the Trash.
/// The server applies the same safety rules again; here a refused folder shows why instead.
function usageContextMenu(event, node, label) {
  closeUsageMenu();
  const menu = el("div", "menu usage-menu");
  menu.setAttribute("role", "menu");
  const head = el("div", "usage-menu-head");
  head.append(el("strong", "", label), el("span", "mono small muted", node.path));
  menu.append(head);
  const target = { name: node.path, label, path: node.path, cachedBytes: node.bytes };
  const busy = Boolean(pending.get(node.path));
  const entries = [
    ["revealInFinder", () => revealInFinder(node.path), true],
    ["bigUpload", () => confirmAction("offloadfile", target), false],
    ["bigDelete", () => confirmAction("trashpath", target), false],
  ];
  for (const [key, run, always] of entries) {
    const item = el("button", "menuitem", t(key));
    item.type = "button";
    item.setAttribute("role", "menuitem");
    // Showing it in Finder changes nothing, so the safety rules do not apply to it.
    item.disabled = !always && (Boolean(node.refusal) || busy);
    item.addEventListener("click", () => { closeUsageMenu(); run(); });
    menu.append(item);
  }
  if (node.refusal) menu.append(el("div", "usage-menu-note small muted", t("usageMenuRefused", node.refusal)));
  menu.style.left = `${Math.min(event.clientX, window.innerWidth - 280)}px`;
  menu.style.top = `${Math.min(event.clientY, window.innerHeight - 180)}px`;
  document.body.append(menu);
  const first = menu.querySelector(".menuitem:not([disabled])");
  if (first) first.focus();
  menu.addEventListener("keydown", (e) => { if (e.key === "Escape") closeUsageMenu(); });
  setTimeout(() => document.addEventListener("click", closeUsageMenu, { once: true }), 0);
}

async function revealInFinder(path) {
  try {
    await api("/api/reveal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }) });
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("revealFailed"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

function closeUsageMenu() {
  for (const menu of document.querySelectorAll(".usage-menu")) menu.remove();
}

/// Boxes with a cleanup, anywhere in the tree, largest first.
function usageActions(node, parent, out = []) {
  if (node.action && node.bytes > 0) out.push({ node, parent });
  for (const child of node.children || []) usageActions(child, node, out);
  return out.sort((a, b) => b.node.bytes - a.node.bytes);
}

function renderCleanups(root) {
  const box = document.querySelector("#usage-clean");
  const found = usageActions(root);
  box.hidden = !found.length;
  box.replaceChildren();
  if (!found.length) return;
  box.append(el("h3", "usage-clean-title", t("cleanTitle")));
  const cleanup = (usageData && usageData.cleanup) || {};
  const list = el("ul", "usage-clean-list");
  for (const { node, parent } of found) {
    const name = usageLabel(node, parent);
    const item = el("li", "usage-clean-item");
    const words = el("div", "usage-clean-words");
    words.append(el("strong", "", `${name} · ${bytes(node.bytes)}`), el("span", "muted", t("cleanWhat_" + node.action.replace(/-/g, "_"))));
    const running = cleanup.state === "running" && cleanup.action === node.action;
    const button = el("button", "btn outline", t(running ? "cleanRunning" : "cleanRun"));
    button.type = "button";
    button.disabled = cleanup.state === "running";
    if (running) button.setAttribute("aria-busy", "true");
    button.addEventListener("click", () => {
      if (window.confirm(`${t("cleanConfirm", name)}\n\n${t("cleanWhat_" + node.action.replace(/-/g, "_"))}`)) runCleanup(node.action, name);
    });
    item.append(words, button);
    list.append(item);
  }
  box.append(list, el("p", "muted small", t("cleanNote")));
}

let cleanupName = "";

async function runCleanup(action, name) {
  cleanupName = name;
  try {
    const started = await api("/api/usage/clean", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    usageData = Object.assign({}, usageData, { cleanup: started.cleanup });
    renderUsage();
    clearTimeout(usageTimer);
    usageTimer = setTimeout(loadUsage, 1500);
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("cleanFailed", name), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

// Caches of offloaded apps, measured after a usage scan and cleared on request.
let cachesData = null;
let cachesScannedAt = null;

function renderCaches() {
  const line = document.querySelector("#usage-caches");
  const text = document.querySelector("#usage-caches-text");
  const button = document.querySelector("#usage-caches-clear");
  if (!cachesData) { line.hidden = true; return; }
  const apps = (cachesData.apps || []).filter((a) => a.bytes > 0);
  const clearable = apps.filter((a) => !a.refused);
  const running = apps.filter((a) => a.refused).map((a) => a.name);
  line.hidden = false;
  text.replaceChildren(clearable.length ? one("cachesLine", bytes(cachesData.freedBytes), clearable.length) : bi("cachesNone"));
  if (running.length) text.append(el("br"), one("cachesRunning", running.join(", ")));
  button.hidden = !clearable.length;
}

async function loadCaches() {
  try {
    cachesData = await api("/api/caches");
  } catch (error) {
    if (error.code === "unauthorized") return;
    cachesData = null;
  }
  renderCaches();
}

function clearCaches() {
  if (!cachesData || !cachesData.freedBytes) return;
  const size = bytes(cachesData.freedBytes);
  askConfirm({ title: ["cachesConfirmTitle", size], body: ["cachesConfirmBody"], ok: "cachesClear", danger: true }, async () => {
    const button = document.querySelector("#usage-caches-clear");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    try {
      const report = await api("/api/caches/clear", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      cachesData = report;
      startUsageScan();
      const failed = report.failed || [];
      if (failed.length) toast({ title: bi("cachesFailed"), error: { code: "failed", message: failed.join("; ") }, tone: "error" });
      else toast({ title: one("cachesDone", bytes(report.freedBytes)) });
      await loadCaches();
    } catch (error) {
      if (error.code !== "unauthorized") toast({ title: bi("cachesFailed"), error: { code: error.code, message: error.message }, tone: "error" });
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
}

/// Tools outside Disklessly that free space Disklessly can't, shown for the
/// whole disk and for the part of it they act on.
const USAGE_TIPS = [
  { id: "RemoveMacAI", kind: "system", url: "https://github.com/omlahore/RemoveMacAI" },
  { id: "DevOffload", kind: "library", url: "#dev-section" },
  { id: "Pack", kind: "system", url: "#recommend-section" },
  { id: "Simslim", kind: "library", url: "https://github.com/MobAI-App/simslim" },
];

function renderUsageTips(focus, atRoot) {
  const list = document.querySelector("#usage-tips");
  const tips = USAGE_TIPS.filter((tip) => atRoot || focus.kind === tip.kind || focus.key === tip.kind);
  list.hidden = !tips.length;
  list.replaceChildren();
  if (!tips.length) return;
  list.append(el("h3", "usage-tips-title"));
  list.firstChild.append(bi("usageTips"));
  for (const tip of tips) {
    const item = el("div", `usage-tip-item`);
    const title = el("div", "usage-tip-head");
    title.append(el("span", `usage-swatch u-${tip.kind}`), bi(`tip${tip.id}Title`));
    const body = el("p", "muted small");
    body.append(bi(`tip${tip.id}Body`));
    const link = el("a", "link");
    link.href = tip.url;
    if (!tip.url.startsWith("#")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.append(bi(`tip${tip.id}Link`));
    if (!tip.url.startsWith("#")) link.append(document.createTextNode(" ↗"));
    item.append(title, body, link);
    list.append(item);
  }
}

async function loadUsage() {
  clearTimeout(usageTimer);
  try {
    usageData = await api("/api/usage");
  } catch (error) {
    if (error.code === "unauthorized") return;
    document.querySelector("#usage-summary").replaceChildren(bi("usageFailed"), errorBlock(error.code, error.message));
    return;
  }
  // Nothing measured since the app started: analyze right away, it only reads sizes.
  if (usageData.state === "idle" && !usageAutoStarted) {
    usageAutoStarted = true;
    return startUsageScan();
  }
  renderUsage();
  const cleanup = usageData.cleanup || {};
  if (cleanupName && cleanup.state && cleanup.state !== "running") {
    const name = cleanupName;
    cleanupName = "";
    if (cleanup.state === "done") toast({ title: bi("cleanDone", name, bytes(cleanup.freedBytes || 0)), tone: "ok" });
    else toast({ title: bi("cleanFailed", name), error: { code: "failed", message: cleanup.message || "" }, tone: "error" });
  }
  if ((usageData.state === "scanning" || cleanup.state === "running") && !expired) usageTimer = setTimeout(loadUsage, 2000);
  // Measured once a scan finished, and again after the next one.
  else if (usageData.tree && usageData.scannedAt !== cachesScannedAt) { cachesScannedAt = usageData.scannedAt; loadCaches(); }
}

async function startUsageScan() {
  try {
    usageData = await api("/api/usage/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    usageFocus = [];
    renderUsage();
    clearTimeout(usageTimer);
    usageTimer = setTimeout(loadUsage, 1500);
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("usageFailed"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

async function load() {
  if (expired) return;
  appsLoading = true;
  // Keep the last rows (dimmed) while the request runs; with no rows yet, show the loading row.
  if (lastStatus) renderApps(lastStatus.apps || [], lastStatus.appsError ? { code: appsErrorCode(lastStatus), message: lastStatus.appsError } : null);
  else renderApps(null, null);
  let status;
  try {
    status = await api("/api/status");
  } catch (error) {
    appsLoading = false;
    if (error.code === "unauthorized") {
      // Not a finished load: an unauthorized answer does not mean the list is empty.
      renderApps(lastStatus ? lastStatus.apps || [] : null, null);
      return;
    }
    appsSettled = true;
    loadError = { code: error.code, message: error.message };
    showBanner(error.code, error.message);
    if (!lastStatus) renderFailure();
    else {
      renderBackend(Object.assign({}, lastStatus.backend, { health: "offline", latencyMs: null }));
      renderApps(lastStatus.apps || [], lastStatus.appsError ? { code: appsErrorCode(lastStatus), message: lastStatus.appsError } : null);
    }
    return;
  }
  appsLoading = false;
  appsSettled = true;
  loadError = null;
  updatedAt = Date.now();
  if (!status.appsError) hideBanner();
  adoptServerJobs(status);
  render(status);
  loadLicense();
  loadUsage();
  if (!filesData || filesData.state !== "scanning") loadFiles();
  loadDev();
  if (!sessionBusy()) loadSessionPlan();
  if (appsSupported() && (!bigData || bigData.state !== "scanning")) loadBig();
  if (!ctrData || ctrData.state !== "scanning") loadContainers();
  if (!machinesData || !machinesData.scanning) loadMachines();
}

/// The disk map is measured again when it was never measured or is older than USAGE_STALE_MS.
function usageStale() {
  if (usageData && usageData.state === "scanning") return false;
  if (!usageData || !usageData.scannedAt) return true;
  const measured = Date.parse(usageData.scannedAt);
  return !(measured > 0) || Date.now() - measured > USAGE_STALE_MS;
}

function refresh() {
  // Coalesce overlapping refreshes instead of a page-wide busy flag; actions run independently.
  if (!refreshing) {
    const button = document.querySelector("#refresh");
    button.setAttribute("aria-busy", "true");
    // The first status says whether this build offloads apps; after that both load together.
    const recommend = () => (appsSupported() ? loadRecommendations(false) : null);
    if (usageStale()) startUsageScan();
    refreshing = Promise.all(lastStatus ? [load(), recommend()] : [load().then(recommend)]).finally(() => {
      refreshing = null;
      button.removeAttribute("aria-busy");
    });
  }
  return refreshing;
}

/// Retry asks for a fresh backend probe first, so a recovered backend shows at once.
async function retryNow() {
  try { await api("/api/health?fresh=1"); } catch (e) {}
  return refresh();
}

// ---- cloud drives -----------------------------------------------------------

let cloudState = null;
let cloudPoll = null;

function cloudButton(key, args, onClick, className) {
  const button = el("button", `btn ${className || "outline"}`, t(key, ...(args || [])));
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function renderCloud(info) {
  cloudState = info;
  const summary = document.querySelector("#cloud-summary");
  const repo = document.querySelector("#cloud-repo");
  const task = document.querySelector("#cloud-task");
  const list = document.querySelector("#cloud-remotes");
  const connect = document.querySelector("#cloud-connect");
  const openlist = document.querySelector("#cloud-openlist");
  if (!info) { [summary, repo, list, connect, openlist].forEach((n) => n.replaceChildren()); task.hidden = true; return; }
  const remotes = info.remotes || [];
  const active = info.activeBackendId || "";
  const mirrors = info.mirrors || [];
  const mirrorIds = new Set(mirrors.map((m) => m.id));
  summary.textContent = t("cloudSummary", remotes.length);
  repo.replaceChildren(document.createTextNode(active ? t("cloudRepoBackend", active) : t("cloudRepoDefault", info.defaultKind)));
  if (active) {
    repo.append(" ", cloudButton("cloudBackDefault", [info.defaultKind], () => useRepo({ id: "default" }, t("cloudDefaultName", info.defaultKind)), "quiet"));
  }
  const running = info.task && info.task.state === "running";
  if (mirrors.length) {
    const line = el("p", "muted");
    const last = mirrors.map((m) => m.lastSync).filter(Boolean).sort((a, b) => String(b.lastSyncAt).localeCompare(String(a.lastSyncAt)))[0];
    line.append(t("cloudMirrorsLine", mirrors.length), " ",
      last ? t("cloudMirrorLast", new Date(last.lastSyncAt).toLocaleString(), last.ok) : t("cloudMirrorNever"), " ");
    const sync = cloudButton("cloudMirrorSync", [], () => cloudPost("/api/cloud/mirrors/sync"), "quiet");
    sync.disabled = running;
    line.append(sync);
    repo.append(line);
  }
  if (info.task && info.task.state) {
    task.hidden = false;
    task.dataset.state = info.task.state;
    const p = info.task.progress;
    const progress = p && p.filesTotal ? t("cloudProgress", p.filesDone || 0, p.filesTotal, bytes(p.bytesDone || 0), bytes(p.bytesTotal || 0)) : "";
    task.textContent = info.task.state === "running" ? t(`cloudTask${info.task.action}`, info.task.phase, progress)
      : info.task.state === "failed" ? t("cloudTaskFailed", info.task.message || "") : t("cloudTaskDone");
  } else {
    task.hidden = true;
  }
  list.replaceChildren(...(remotes.length ? remotes.map((remote) => {
    const row = el("li", "cloud-row");
    const name = el("span", "grow", `${remote.name}`);
    if (remote.type) name.append(el("span", "muted", `  ${remote.type}`));
    row.append(name);
    const mirrored = remote.backendId && mirrorIds.has(remote.backendId);
    if (mirrored) row.append(el("span", "pill grey", t("cloudMirror")));
    if (remote.active) {
      row.append(el("span", "pill green", t("cloudActive")));
    } else {
      const use = cloudButton("cloudUse", [], () => useRepo(remote.backendId ? { id: remote.backendId } : { remote: remote.name }, remote.name), "tint");
      use.disabled = running;
      row.append(use);
      if (remote.backendId) {
        const mirror = cloudButton(mirrored ? "cloudMirrorRemove" : "cloudMirrorAdd", [], () => cloudPost("/api/cloud/mirrors", { action: mirrored ? "remove" : "add", id: remote.backendId }), "quiet");
        mirror.disabled = running;
        row.append(mirror);
      }
      row.append(cloudButton("cloudDisconnect", [], () => disconnectRemote(remote.name), "quiet"));
    }
    return row;
  }) : [el("li", "muted", t("cloudNoRemotes"))]));
  if (!info.rclone) {
    connect.replaceChildren(el("span", "muted", t("cloudNoRclone")));
  } else {
    connect.replaceChildren(...(info.providers || []).map((p) => {
      const button = cloudButton("cloudConnect", [p.name], () => connectDrive(p.id));
      button.disabled = running;
      return button;
    }));
  }
  const ol = info.openlist || {};
  if (!ol.installed) {
    const button = cloudButton("openlistInstall", [], installOpenList, "outline");
    button.disabled = running;
    openlist.replaceChildren(button);
  } else {
    const nodes = [el("span", "grow", ol.running ? t("openlistRunning", ol.url) : t("openlistStopped"))];
    if (ol.running) {
      const link = el("a", "btn outline", t("openlistOpen"));
      link.href = ol.url;
      link.target = "_blank";
      link.rel = "noopener";
      nodes.push(link);
      nodes.push(cloudButton("openlistPassword", [], showOpenListPassword, "quiet"));
      nodes.push(cloudButton("openlistStop", [], () => openListPower("stop"), "quiet"));
    } else {
      nodes.push(cloudButton("openlistStart", [], () => openListPower("start"), "outline"));
    }
    if (active === ol.backendId) nodes.push(el("span", "pill green", t("cloudActive")));
    else nodes.push(cloudButton("cloudUse", [], () => useRepo({ id: ol.backendId }, "OpenList"), "tint"));
    openlist.replaceChildren(...nodes, el("p", "muted", t("openlistHint")));
  }
  clearTimeout(cloudPoll);
  if (running) cloudPoll = setTimeout(loadCloud, 2000);
}

async function loadCloud() {
  const wasRunning = cloudState && cloudState.task && cloudState.task.state === "running";
  try {
    const info = await api("/api/cloud");
    renderCloud(info);
    if (wasRunning && info.task && info.task.state === "failed") toast({ title: t("cloudTitle"), error: { code: "failed", message: info.task.message || "" }, tone: "error" });
    else if (wasRunning && info.task && info.task.state === "done" && info.task.action === "migrate") {
      toast({ title: info.task.migrated ? t("cloudMigrated", migratingTo || info.task.backendId || "", info.task.copied || 0) : t("cloudSwitched", migratingTo || info.task.backendId || ""), tone: "ok" });
      migratingTo = null;
      refresh();
    } else if (wasRunning && info.task && info.task.state === "done") toast({ title: t("cloudTaskDone"), tone: "ok" });
    if (wasRunning && info.task && info.task.state !== "running") migratingTo = null;
  } catch (error) {
    if (error.code !== "unauthorized") renderCloud(null);
  }
}

async function cloudPost(path, body) {
  try {
    const result = await api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
    if (result.cloud) renderCloud(result.cloud);
    return result;
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: t("cloudTitle"), error: { code: error.code, message: error.message }, tone: "error" });
    return null;
  }
}

function connectDrive(provider) { return cloudPost("/api/cloud/connect", { provider }); }
function installOpenList() { return cloudPost("/api/openlist/install"); }
function openListPower(which) { return cloudPost(`/api/openlist/${which}`); }

async function disconnectRemote(name) {
  if (!confirm(t("cloudDisconnectConfirm", name))) return;
  await cloudPost("/api/cloud/disconnect", { remote: name });
}

async function useRepo(target, label) {
  if (!confirm(t("cloudUseConfirm", label, (cloudState && cloudState.appsHere) || 0))) return;
  // Always move the repo's contents first; the server switches only after every copy checks out,
  // and keeps the old repo as a backup.
  migratingTo = label;
  const result = await cloudPost("/api/cloud/use", Object.assign({}, target, { migrate: true, keepOldAsMirror: true }));
  if (!result) { migratingTo = null; return; }
  clearTimeout(cloudPoll);
  cloudPoll = setTimeout(loadCloud, 1000);
}

let migratingTo = null;

async function showOpenListPassword(event) {
  const button = event.currentTarget;
  try {
    const result = await api("/api/openlist/password");
    const secret = el("span", "cloud-secret", t("openlistPasswordIs", result.password));
    button.replaceWith(secret);
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: t("openlistPassword"), error: { code: error.code, message: error.message }, tone: "error" });
  }
}

// ---- other big items --------------------------------------------------------

let bigData = null;
let bigTimer = null;

function renderBig() {
  const list = document.querySelector("#big-list");
  const summary = document.querySelector("#big-summary");
  const scanned = document.querySelector("#big-scanned");
  if (!list) return;
  list.replaceChildren();
  if (!bigData || bigData.state === "scanning" && !bigData.items) {
    summary.textContent = t("bigScanning");
    scanned.textContent = "";
    return;
  }
  const items = bigData.items || [];
  summary.textContent = items.length ? t("bigSummary", items.length, bytes(bigData.bytes || 0)) : t("bigNone");
  scanned.textContent = bigData.state === "scanning" ? t("bigScanning") : "";
  const cleanup = bigData.cleanup || {};
  for (const item of items) {
    const buttons = [];
    if (item.action === "dev-offload") {
      buttons.push(actionButton({ labelKey: "bigGoDev", icon: iconTray, className: "outline", onClick: () => document.querySelector("#dev-section").scrollIntoView({ behavior: "smooth" }) }));
    } else if (item.action === "clean") {
      const running = cleanup.state === "running" && cleanup.action === item.target;
      buttons.push(actionButton({ labelKey: running ? "bigCleaning" : (item.reason === "adviceSipOff" ? "bigDelete" : "bigClean"), icon: iconTrash, className: "outline", busy: running, disabled: cleanup.state === "running",
        onClick: () => askConfirm({ title: ["bigConfirmTitle", bigTitle(item)], body: [item.reason === "adviceSipOff" ? "bigConfirmBodySip" : "bigConfirmBody", bytes(item.bytes)], ok: "bigClean", danger: true }, () => runBigCleanup(item)) }));
    } else {
      // The data folder of an app offloaded here can follow that app into the repo.
      const owner = item.kind === "appData" && ((lastStatus && lastStatus.apps) || []).find((app) =>
        (app.name === item.title || app.bundleId === item.title) && isOnThisMac(app) && !fullAppHere(app));
      if (owner && !(owner.data && owner.data.enabled && owner.data.state !== "local")) {
        // Not on yet, or on but the data is still here (it moves after the app quits): enabling again moves it now.
        const waiting = Boolean(owner.data && owner.data.enabled);
        const job = pending.get(owner.name);
        buttons.push(actionButton({ labelKey: waiting ? "dataOffloadNow" : "dataEnable", icon: iconTray, className: "outline", busy: Boolean(job && job.kind === "data/enable"), disabled: Boolean(job),
          onClick: () => confirmAction("data/enable", owner) }));
      }
      if (item.fileActions) {
        const target = { name: item.path, label: bigTitle(item), path: item.path, cachedBytes: item.bytes };
        const job = pending.get(item.path);
        buttons.push(actionButton({ labelKey: "bigUpload", icon: iconTray, className: "outline", busy: Boolean(job && job.kind === "offloadfile"), disabled: Boolean(job),
          onClick: () => confirmAction("offloadfile", target) }));
        buttons.push(actionButton({ labelKey: "bigDelete", icon: iconTrash, className: "danger-outline", busy: Boolean(job && job.kind === "trashpath"), disabled: Boolean(job),
          onClick: () => confirmAction("trashpath", target) }));
      }
      buttons.push(actionButton({ labelKey: "revealInFinder", icon: iconMore, className: "quiet", onClick: () => revealInFinder(item.path) }));
      buttons.push(actionButton({ labelKey: "bigShowUsage", icon: iconMore, className: "quiet", onClick: () => document.querySelector("#usage-section").scrollIntoView({ behavior: "smooth" }) }));
    }
    const detail = el("span");
    const dataOwner = item.kind === "appData" && ((lastStatus && lastStatus.apps) || []).find((app) =>
      (app.name === item.title || app.bundleId === item.title) && isOnThisMac(app) && !fullAppHere(app));
    if (dataOwner && dataOwner.data && dataOwner.data.enabled && dataOwner.data.state === "local") {
      detail.append(t("bigDataWaiting"));
      if (dataOwner.data.lastError) detail.append(el("br"), el("span", "small", dataOwner.data.lastError));
    } else if (dataOwner) {
      detail.append(t("bigReason_appDataOwned", dataOwner.name));
    } else {
      detail.append(t("bigReason_" + item.reason));
    }
    detail.append(el("br"), el("span", "mono small", item.path));
    list.append(devRow(bigTitle(item), detail, bytes(item.bytes), buttons));
  }
}

/// A big item's title in the page language: rows Disklessly names itself carry a string key.
function bigTitle(item) {
  if (!item.titleKey) return item.title;
  const name = t(item.titleKey);
  return item.id.startsWith("advice:sip-") ? name + t("sipSuffix") : name;
}

async function loadBig() {
  clearTimeout(bigTimer);
  try {
    bigData = await api("/api/bigitems");
  } catch (error) {
    if (error.code === "unauthorized") return;
    bigData = { state: "ready", items: [] };
  }
  renderBig();
  const cleaning = bigData.cleanup && bigData.cleanup.state === "running";
  if (bigData.state === "scanning" || cleaning) bigTimer = setTimeout(loadBig, 2000);
}

async function runBigCleanup(item) {
  try {
    await api("/api/usage/clean", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: item.target }) });
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("cleanFailed", bigTitle(item)), error: { code: error.code, message: error.message }, tone: "error" });
  }
  loadBig();
}

async function rescanBig() {
  try { await api("/api/bigitems/scan", { method: "POST" }); } catch (error) { if (error.code === "unauthorized") return; }
  bigData = Object.assign({}, bigData, { state: "scanning" });
  renderBig();
  bigTimer = setTimeout(loadBig, 2000);
}

// ---- container images -------------------------------------------------------

let ctrData = null;
let ctrTimer = null;
const ctrBusy = new Map(); // key or record id -> job kind

const engineTitle = (id) => ({ apple: "Apple container", "docker-desktop": "Docker Desktop", orbstack: "OrbStack", colima: "Colima", dory: "Dory" }[id] || id);
const daysSince = (iso) => (iso ? Math.floor((Date.now() - Date.parse(iso)) / 86400000) : null);

function ctrUseText(image) {
  const names = (image.containers || []).join(", ");
  if (image.use === "running" || image.use === "stopped") return t("ctrUse_" + image.use, names);
  if (image.use === "recent") return t("ctrUse_recent", ctrData.recentDays || 30);
  return t("ctrUse_" + image.use);
}

const ctrConfirms = {
  "containers/offload": (item) => ({ title: ["ctrConfirmOffloadTitle", item.title], body: ["ctrConfirmOffloadBody", bytes(item.bytes), engineTitle(item.engine), item.use === "recent"], ok: "ctrOffload", danger: false }),
  "containers/clean": (item) => ({ title: ["ctrConfirmCleanTitle", item.title], body: ["ctrConfirmCleanBody", bytes(item.bytes)], ok: "ctrClean", danger: true }),
  "containers/forget": (item) => ({ title: ["ctrConfirmForgetTitle", item.title], body: ["ctrConfirmForgetBody", bytes(item.bytes)], ok: "ctrForget", danger: true }),
};

function ctrAction(kind, id, item) {
  const confirm = ctrConfirms[kind];
  if (confirm) askConfirm(confirm(item), () => ctrJob(kind, id, item.title));
  else ctrJob(kind, id, item.title);
}

async function ctrJob(kind, id, label) {
  if (ctrBusy.has(id)) return;
  ctrBusy.set(id, kind);
  renderContainers();
  let failure = null;
  try {
    const started = await api(`/api/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app: id }) });
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, JOB_POLL_MS));
      const job = await api(`/api/jobs/${encodeURIComponent(started.jobId)}`);
      if (job.state === "running") continue;
      if (job.state !== "done") failure = job.error || { code: "failed", message: "" };
      break;
    }
  } catch (error) {
    if (error.code === "unauthorized") return;
    failure = { code: error.code, message: error.message };
  }
  ctrBusy.delete(id);
  if (failure) toast({ title: biPair(t("ctrJobFailed", label), null), error: failure, tone: "error" });
  else toast({ title: biPair(t("ctrJobDone", label, null), null), tone: "ok" });
  rescanContainers();
}

function renderContainers() {
  const list = document.querySelector("#ctr-list");
  const summary = document.querySelector("#ctr-summary");
  if (!list) return;
  list.replaceChildren();
  if (!ctrData || (ctrData.state === "scanning" && !ctrData.engines)) {
    summary.textContent = t("ctrScanning");
    return;
  }
  const engines = ctrData.engines || [];
  const images = ctrData.images || [];
  const offloaded = ctrData.offloaded || [];
  if (!engines.length && !offloaded.length) {
    summary.textContent = t("ctrNone");
    return;
  }
  summary.textContent = t("ctrSummary", images.length, bytes(ctrData.bytes || 0), bytes(ctrData.reclaimableBytes || 0)) + (ctrData.state === "scanning" ? " " + t("ctrScanning") : "");
  const button = (labelKey, icon, kind, id, item, className, blocked) =>
    actionButton({ labelKey, icon, className: className || "outline", busy: ctrBusy.get(id) === kind, disabled: ctrBusy.has(id) || !!blocked, blocked: blocked || undefined, onClick: () => ctrAction(kind, id, item) });
  for (const engine of engines) {
    const rows = [];
    const engineNote = el("span");
    engineNote.append(t("ctrEngine_" + engine.status));
    if (engine.note && engine.status !== "running") engineNote.append(" · ", el("span", "muted small", engine.note));
    if (engine.vmDisk) engineNote.append(el("br"), el("span", "muted small", t("ctrVMNote")));
    for (const image of images.filter((i) => i.engine === engine.engine)) {
      const detail = el("span");
      const use = el("span", image.inUse ? "warn-text" : null, ctrUseText(image));
      detail.append(use);
      const days = daysSince(image.lastUsed);
      if (days !== null) detail.append(" · ", t("ctrLastUsed", days));
      detail.append(el("br"), el("span", "mono small", image.shortId));
      const blocked = image.inUse ? ctrUseText(image) : null;
      const buttons = [
        button("ctrOffload", iconTray, "containers/offload", image.key, image, "outline", blocked),
        button("ctrClean", iconTrash, "containers/clean", image.key, image, "danger-outline", blocked),
      ];
      rows.push(devRow(image.title, detail, bytes(image.bytes), buttons));
    }
    const volumes = (ctrData.volumes || []).filter((v) => v.engine === engine.engine);
    for (const volume of volumes) {
      const detail = el("span");
      detail.append(t("ctrVolumes"));
      if (volume.inUse) detail.append(" · ", t("ctrVolumeInUse"));
      detail.append(" · ", el("span", "muted small", t("ctrVolumeNote")));
      rows.push(devRow(volume.name, detail, volume.bytes != null ? bytes(volume.bytes) : "", []));
    }
    const box = el("div", "dev-group");
    const head = el("h3", "dev-group-title");
    head.append(t("ctrEngine", engine.title, bytes(engine.dataBytes || 0)));
    box.append(head, el("p", "muted small", ""));
    box.lastChild.append(engineNote);
    if (rows.length) box.append(...rows);
    list.append(box);
  }
  if (offloaded.length) {
    const rows = offloaded.map((o) => {
      const detail = el("span");
      detail.append(engineTitle(o.engine), " · ", t("devFrom", o.host));
      if (o.present) detail.append(" · ", t("ctrInstalledHere"));
      const buttons = [];
      if (!o.present) buttons.push(button("ctrRestore", iconDownload, "containers/restore", o.id, o));
      buttons.push(button("ctrForget", iconTrash, "containers/forget", o.id, o, "danger-outline"));
      return devRow(o.title, detail, bytes(o.bytes), buttons);
    });
    list.append(devGroup("ctrOffloaded", rows));
  }
}

async function loadContainers() {
  clearTimeout(ctrTimer);
  try {
    ctrData = await api("/api/containers");
  } catch (error) {
    if (error.code === "unauthorized") return;
    ctrData = { state: "ready", engines: [], images: [] };
  }
  renderContainers();
  if (ctrData.state === "scanning") ctrTimer = setTimeout(loadContainers, 2000);
}

async function rescanContainers() {
  try { await api("/api/containers/scan", { method: "POST" }); } catch (error) { if (error.code === "unauthorized") return; }
  ctrData = Object.assign({}, ctrData, { state: "scanning" });
  renderContainers();
  ctrTimer = setTimeout(loadContainers, 1500);
}

// ---- remote ssh machines ----------------------------------------------------

let machinesData = null;
let machinesTimer = null;
let selectedMachineHost = null;
let selectedMachineDetail = null;
const machineBusy = new Set();

function machineLevelPillKind(level) {
  if (level === "offline" || level === "critical") return "red";
  if (level === "warning") return "amber";
  return "green";
}

function renderMachines() {
  const cardsNode = document.querySelector("#machines-cards");
  const summaryNode = document.querySelector("#machines-summary");
  const detailNode = document.querySelector("#machines-detail");
  if (!cardsNode || !summaryNode) return;
  cardsNode.replaceChildren();
  if (!machinesData) {
    summaryNode.textContent = t("loading");
    return;
  }
  const list = machinesData.machines || [];
  const remoteCount = list.filter((m) => !m.isLocal).length;
  summaryNode.textContent = t("machinesSummary", list.length, remoteCount) + (machinesData.scanning ? " · " + t("machinesScanning") : "");

  for (const m of list) {
    const detail = el("span");
    detail.append(
      pill(m.isLocal ? "blue" : "grey", m.isLocal ? "machinesLocalBadge" : "machinesRemoteBadge"),
      " ",
      pill(machineLevelPillKind(m.level), "machinesLevel_" + (m.level || "ok"))
    );
    if (m.platform) detail.append(" · ", el("span", "mono small", m.platform));
    if (m.scanMode && !m.isLocal) detail.append(" · ", el("span", "muted small", m.scanMode));
    detail.append(el("br"));
    if (m.totalBytes > 0) {
      const reclaim = (m.reclaimableBytes || 0) + (m.offloadableBytes || 0);
      detail.append(t("machinesDiskLine", bytes(m.usedBytes || 0), bytes(m.totalBytes || 0), bytes(reclaim)));
    } else if (!m.isLocal) {
      detail.append(el("span", "muted small", m.lastError || t("machinesNotScanned")));
    }

    const buttons = [];
    if (!m.isLocal) {
      const scanning = Boolean(m.scanning) || machineBusy.has("scan:" + m.host);
      buttons.push(actionButton({
        labelKey: scanning ? "machinesScanning" : "machinesScan",
        icon: iconRefresh,
        className: "outline",
        busy: scanning,
        disabled: scanning,
        onClick: () => triggerMachineScan(m.host),
      }));
      buttons.push(actionButton({
        labelKey: "machinesInspect",
        icon: iconMore,
        className: selectedMachineHost === m.host ? "primary" : "outline",
        onClick: () => selectMachineDetail(m.host),
      }));
      buttons.push(actionButton({
        labelKey: "machinesRemove",
        icon: iconTrash,
        className: "quiet",
        onClick: () => removeMachineHost(m.host),
      }));
    }
    const sizeLabel = m.totalBytes > 0 ? bytes(m.usedBytes || 0) : "";
    const row = devRow(m.displayName || m.host, detail, sizeLabel, buttons);
    row.dataset.level = m.level || "ok";
    row.dataset.host = m.host;
    cardsNode.append(row);
  }

  renderMachineDetail(detailNode);
}

function renderMachineDetail(detailNode) {
  if (!detailNode) return;
  detailNode.replaceChildren();
  if (!selectedMachineHost || !selectedMachineDetail) {
    detailNode.hidden = true;
    return;
  }
  detailNode.hidden = false;
  const host = selectedMachineHost;
  const d = selectedMachineDetail;
  const head = el("h3", "dev-group-title", t("machinesDetailTitle", host, d.scanMode || "fallback-sh"));
  detailNode.append(head);

  if (d.lastError) {
    detailNode.append(el("p", "warn-text small", d.lastError));
  }

  const mounts = d.mounts || [];
  if (mounts.length) {
    const mGroup = el("div", "dev-group");
    mGroup.append(el("h4", "dev-group-title", t("machinesMountsTitle")));
    for (const m of mounts) {
      const sub = el("span", "mono small", t("machinesMountFree", m.device, m.fsType, bytes(m.availableBytes || 0)));
      mGroup.append(devRow(m.mountPoint, sub, `${bytes(m.usedBytes || 0)} / ${bytes(m.totalBytes || 0)}`, []));
    }
    detailNode.append(mGroup);
  }

  const items = d.items || [];
  const iGroup = el("div", "dev-group");
  iGroup.append(el("h4", "dev-group-title", t("machinesItemsTitle")));
  if (!items.length) {
    iGroup.append(el("p", "muted small", t("machinesNoItems")));
  } else {
    for (const item of items) {
      const sub = el("span");
      sub.append(item.reason || item.category || "");
      sub.append(el("br"), el("span", "mono small", item.path));
      const busyKey = `${host}:${item.id}`;
      const busy = machineBusy.has(busyKey);
      const isOffload = item.action === "offload";
      const btn = actionButton({
        labelKey: isOffload ? "machinesOffloadBtn" : "machinesCleanBtn",
        icon: isOffload ? iconTray : iconTrash,
        className: isOffload ? "outline" : "danger-outline",
        busy,
        disabled: busy,
        onClick: () => planAndConfirmRemoteItem(host, item),
      });
      iGroup.append(devRow(item.title, sub, bytes(item.bytes || 0), [btn]));
    }
  }
  detailNode.append(iGroup);

  const offloaded = d.offloaded || [];
  if (offloaded.length) {
    const oGroup = el("div", "dev-group");
    oGroup.append(el("h4", "dev-group-title", t("machinesOffloadedTitle")));
    for (const rec of offloaded) {
      const sub = el("span");
      sub.append(el("span", "mono small", rec.originalPath));
      const busyKey = `${host}:restore:${rec.id}`;
      const busy = machineBusy.has(busyKey);
      const btn = actionButton({
        labelKey: "machinesRestoreBtn",
        icon: iconDownload,
        className: "outline",
        busy,
        disabled: busy,
        onClick: () => confirmRestoreRemoteItem(host, rec),
      });
      oGroup.append(devRow(rec.title, sub, bytes(rec.logicalBytes || rec.storedBytes || 0), [btn]));
    }
    detailNode.append(oGroup);
  }
}

async function loadMachines() {
  clearTimeout(machinesTimer);
  try {
    machinesData = await api("/api/machines");
  } catch (error) {
    if (error.code === "unauthorized") return;
    machinesData = { machines: [], scanning: false };
  }
  if (!selectedMachineHost && machinesData.machines) {
    const firstRemote = machinesData.machines.find((m) => !m.isLocal);
    if (firstRemote && firstRemote.totalBytes > 0) {
      selectedMachineHost = firstRemote.host;
    }
  }
  if (selectedMachineHost) {
    try {
      selectedMachineDetail = await api(`/api/machines/detail?host=${encodeURIComponent(selectedMachineHost)}`);
    } catch (e) {
      selectedMachineDetail = null;
    }
  }
  renderMachines();
  if (machinesData && machinesData.scanning) {
    machinesTimer = setTimeout(loadMachines, 1500);
  }
}

async function selectMachineDetail(host) {
  selectedMachineHost = host;
  try {
    selectedMachineDetail = await api(`/api/machines/detail?host=${encodeURIComponent(host)}`);
  } catch (error) {
    if (error.code === "unauthorized") return;
    selectedMachineDetail = null;
  }
  renderMachines();
}

async function triggerMachineScan(host) {
  const key = "scan:" + host;
  if (machineBusy.has(key)) return;
  machineBusy.add(key);
  selectedMachineHost = host;
  renderMachines();
  try {
    await api("/api/machines/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, sync: true }),
    });
  } catch (error) {
    if (error.code !== "unauthorized") {
      toast({ title: biPair(t("machinesActionFailed", host, t("machinesScan")), null), error: { code: error.code, message: error.message }, tone: "error" });
    }
  } finally {
    machineBusy.delete(key);
  }
  await loadMachines();
}

async function addMachineFromInput() {
  const input = document.querySelector("#machines-host-input");
  if (!input) return;
  const host = input.value.trim();
  if (!host) return;
  try {
    machinesData = await api("/api/machines/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host }),
    });
    input.value = "";
    selectedMachineHost = host;
    await triggerMachineScan(host);
  } catch (error) {
    if (error.code !== "unauthorized") {
      toast({ title: biPair(t("machinesActionFailed", host, t("machinesAdd")), null), error: { code: error.code, message: error.message }, tone: "error" });
    }
  }
}

async function removeMachineHost(host) {
  try {
    machinesData = await api("/api/machines/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host }),
    });
    if (selectedMachineHost === host) {
      selectedMachineHost = null;
      selectedMachineDetail = null;
    }
    renderMachines();
  } catch (error) {
    if (error.code !== "unauthorized") {
      toast({ title: biPair(t("machinesActionFailed", host, t("machinesRemove")), null), error: { code: error.code, message: error.message }, tone: "error" });
    }
  }
}

async function planAndConfirmRemoteItem(host, item) {
  let planItem = item;
  try {
    const plan = await api("/api/machines/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, action: item.action, target: item.id }),
    });
    if (plan.items && plan.items.length) planItem = plan.items[0];
  } catch (error) {
    if (error.code !== "unauthorized") {
      toast({ title: biPair(t("machinesActionFailed", host, item.title), null), error: { code: error.code, message: error.message }, tone: "error" });
    }
    return;
  }
  const isOffload = item.action === "offload";
  const actLabel = t(isOffload ? "machinesOffloadBtn" : "machinesCleanBtn");
  askConfirm(
    {
      title: ["machinesPlanConfirmTitle", actLabel, planItem.title || item.title, host],
      body: ["machinesPlanConfirmBody", planItem.path || item.path, bytes(planItem.bytes || item.bytes || 0), Boolean(planItem.recoverable)],
      ok: isOffload ? "machinesOffloadBtn" : "machinesCleanBtn",
      danger: !isOffload,
    },
    () => executeRemoteItemAction(host, item)
  );
}

async function executeRemoteItemAction(host, item) {
  const busyKey = `${host}:${item.id}`;
  if (machineBusy.has(busyKey)) return;
  machineBusy.add(busyKey);
  renderMachines();
  const endpoint = item.action === "offload" ? "/api/machines/offload" : "/api/machines/clean";
  try {
    await api(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, target: item.id }),
    });
    toast({ title: biPair(t("machinesActionDone", host, item.title), null), tone: "ok" });
  } catch (error) {
    if (error.code !== "unauthorized") {
      toast({ title: biPair(t("machinesActionFailed", host, item.title), null), error: { code: error.code, message: error.message }, tone: "error" });
    }
  } finally {
    machineBusy.delete(busyKey);
  }
  await loadMachines();
}

function confirmRestoreRemoteItem(host, rec) {
  askConfirm(
    {
      title: ["machinesRestoreConfirmTitle", rec.title, host],
      body: ["machinesRestoreConfirmBody", rec.originalPath, bytes(rec.logicalBytes || rec.storedBytes || 0)],
      ok: "machinesRestoreBtn",
      danger: false,
    },
    () => executeRestoreRemoteItem(host, rec)
  );
}

async function executeRestoreRemoteItem(host, rec) {
  const busyKey = `${host}:restore:${rec.id}`;
  if (machineBusy.has(busyKey)) return;
  machineBusy.add(busyKey);
  renderMachines();
  try {
    await api("/api/machines/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, id: rec.id }),
    });
    toast({ title: biPair(t("machinesActionDone", host, rec.title), null), tone: "ok" });
  } catch (error) {
    if (error.code !== "unauthorized") {
      toast({ title: biPair(t("machinesActionFailed", host, rec.title), null), error: { code: error.code, message: error.message }, tone: "error" });
    }
  } finally {
    machineBusy.delete(busyKey);
  }
  await loadMachines();
}

// ---- wiring ---------------------------------------------------------------

document.querySelector("#refresh").addEventListener("click", refresh);
document.querySelector("#retry").addEventListener("click", retryNow);
document.querySelector("#rescan").addEventListener("click", () => loadRecommendations(true));
document.querySelector("#usage-scan").addEventListener("click", startUsageScan);
document.querySelector("#perm-fda").addEventListener("click", () => openPermission("fullDisk"));
document.querySelector("#perm-app").addEventListener("click", () => openPermission("appManagement"));
document.querySelector("#perm-app-ok").addEventListener("click", () => {
  localStorage.setItem("disklessly.appManagementConfirmed", "1");
  appManagementConfirmed = true;
  loadPermissions();
});
document.querySelector("#files-scan").addEventListener("click", startFilesScan);
document.querySelector("#big-scan").addEventListener("click", rescanBig);
document.querySelector("#ctr-scan").addEventListener("click", rescanContainers);
document.querySelector("#machines-refresh")?.addEventListener("click", loadMachines);
document.querySelector("#machines-add-btn")?.addEventListener("click", addMachineFromInput);
document.querySelector("#machines-host-input")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addMachineFromInput();
  }
});
document.querySelector("#usage-caches-clear").addEventListener("click", clearCaches);
document.querySelector("#license-form").addEventListener("submit", submitLicense);
document.querySelector("#license-remove").addEventListener("click", removeLicense);
document.querySelector("#icon-backfill").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  if (button.getAttribute("aria-busy") === "true") return;
  button.setAttribute("aria-busy", "true");
  button.disabled = true;
  try {
    const report = await api("/api/icons/backfill", { method: "POST" });
    const warnings = report.warnings || [];
    if (warnings.length) toast({ title: bi("backfillIcons"), error: { code: "failed", message: warnings.join("; ") }, tone: "error" });
    await load();
  } catch (error) {
    if (error.code !== "unauthorized") toast({ title: bi("backfillIcons"), error: { code: error.code, message: error.message }, tone: "error" });
  } finally {
    button.removeAttribute("aria-busy");
    button.disabled = false;
  }
});
document.querySelector("#search").addEventListener("input", (event) => {
  view.search = event.target.value;
  rerenderApps();
});
document.querySelector("#sort").addEventListener("change", (event) => {
  view.sort = event.target.value;
  rerenderApps();
});
document.querySelector("#filter").addEventListener("change", (event) => {
  view.filter = event.target.value;
  rerenderApps();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".more")) closeMenus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenus();
});
setInterval(() => {
  if (document.visibilityState === "visible" && !expired) refresh();
}, REFRESH_MS);
setInterval(renderUpdated, TICK_MS);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !expired) refresh();
});

applyChrome();
setupLanguageToggle();
document.querySelector("#app-list").replaceChildren(skeleton(3));
refresh();
loadCloud();
