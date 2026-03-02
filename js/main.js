(function () {
    "use strict";

    // ---------- 状态 ----------
    var assets = [];
    var currentTime = 0;
    var totalDuration = 0;
    var isPlaying = false;
    var playTimer = null;

    // ---------- DOM ----------
    var assetDropzone = document.getElementById("assetDropzone");
    var assetList = document.getElementById("assetList");
    var assetTags = document.querySelectorAll(".asset-tags .tag");
    var previewPlaceholder = document.getElementById("previewPlaceholder");
    var analysisDesc = document.getElementById("analysisDesc");
    var timeDisplay = document.getElementById("timeDisplay");
    var progressFill = document.getElementById("progressFill");
    var progressText = document.getElementById("progressText");
    var panelSmart = document.getElementById("panelSmart");
    var smartPanelToggle = document.getElementById("smartPanelToggle");
    var smartPanelToggleIcon = document.getElementById("smartPanelToggleIcon");
    var paramDuration = document.getElementById("paramDuration");
    var paramDurationValue = document.getElementById("paramDurationValue");
    var indexTime = document.getElementById("indexTime");
    var indexBar = document.getElementById("indexBar");

    // ---------- 工具 ----------
    function formatTime(sec) {
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }

    function getTemplateLabel(value) {
        var map = { beat: "自动卡点 BGM 节奏", subtitle: "自动字幕", watermark: "去水印" };
        return map[value] || value;
    }

    // ---------- 左侧：素材区 ----------
    function renderAssetList(filter) {
        filter = filter || "all";
        var list = filter === "all" ? assets : assets.filter(function (a) { return a.type === filter; });
        assetList.innerHTML = "";
        list.forEach(function (item) {
            var li = document.createElement("li");
            li.className = "asset-item";
            li.dataset.id = item.id;
            var icon = item.type === "video" ? "🎬" : item.type === "audio" ? "🎵" : "🖼";
            li.innerHTML = "<span class=\"icon\">" + icon + "</span><span class=\"name\">" + item.name + "</span><span class=\"meta\">" + (item.duration ? formatTime(item.duration) : "") + "</span>";
            li.onclick = function () { selectAsset(item); };
            assetList.appendChild(li);
        });
    }

    function selectAsset(item) {
        totalDuration = item.duration || 0;
        currentTime = 0;
        previewPlaceholder.textContent = item.name;
        updateTimeDisplay();
    }

    function addAsset(name, type, duration) {
        var id = "a" + Date.now();
        assets.push({ id: id, name: name, type: type || "video", duration: duration || 0 });
        renderAssetList(document.querySelector(".asset-tags .tag.active").dataset.type);
    }

    assetDropzone.addEventListener("click", function () {
        document.getElementById("btnImport").click();
    });
    assetDropzone.addEventListener("dragover", function (e) {
        e.preventDefault();
        assetDropzone.style.borderColor = "var(--primary)";
    });
    assetDropzone.addEventListener("dragleave", function () {
        assetDropzone.style.borderColor = "";
    });
    assetDropzone.addEventListener("drop", function (e) {
        e.preventDefault();
        assetDropzone.style.borderColor = "";
        var files = e.dataTransfer.files;
        for (var i = 0; i < Math.min(files.length, 5); i++) {
            var f = files[i];
            var type = (f.type || "").indexOf("video") >= 0 ? "video" : (f.type || "").indexOf("audio") >= 0 ? "audio" : "image";
            addAsset(f.name, type, 0);
        }
    });

    assetTags.forEach(function (tag) {
        tag.addEventListener("click", function () {
            assetTags.forEach(function (t) { t.classList.remove("active"); });
            tag.classList.add("active");
            renderAssetList(tag.dataset.type);
        });
    });

    // 模拟初始素材
    addAsset("示例视频.mp4", "video", 120);
    addAsset("背景音乐.mp3", "audio", 180);

    // ---------- 顶栏：导入 / 导出 / 设置 ----------
    document.getElementById("btnImport").addEventListener("click", function () {
        addAsset("新素材 " + (assets.length + 1) + ".mp4", "video", 60);
    });
    document.getElementById("btnExport").addEventListener("click", function () {
        progressText.textContent = "导出中…";
        progressFill.style.width = "100%";
        setTimeout(function () {
            progressText.textContent = "导出完成";
            progressFill.style.width = "0%";
        }, 1500);
    });
    document.getElementById("btnSettings").addEventListener("click", function () {
        alert("设置（预留）");
    });

    // ---------- 智能剪辑：模板 + 生成 ----------
    document.getElementById("btnSmartClip").addEventListener("click", function () {
        panelSmart.classList.remove("collapsed");
        smartPanelToggleIcon.textContent = "−";
    });

    paramDuration.addEventListener("input", function () {
        paramDurationValue.textContent = paramDuration.value;
    });

    document.getElementById("btnGenerate").addEventListener("click", function () {
        var templateSelect = document.getElementById("paramTemplate");
        var tpl = templateSelect ? templateSelect.value : "beat";
        progressText.textContent = "AI 分析中…";
        progressFill.style.width = "30%";
        setTimeout(function () {
            progressFill.style.width = "70%";
            progressText.textContent = "生成初稿中…";
        }, 800);
        setTimeout(function () {
            progressFill.style.width = "100%";
            progressText.textContent = "完成";
            analysisDesc.textContent = "已应用「" + getTemplateLabel(tpl) + "」模板，可在预览区微调。";
            setTimeout(function () {
                progressFill.style.width = "0%";
                progressText.textContent = "就绪";
            }, 1000);
        }, 1800);
    });

    // ---------- 右侧面板折叠 ----------
    smartPanelToggle.addEventListener("click", function () {
        panelSmart.classList.toggle("collapsed");
        smartPanelToggleIcon.textContent = panelSmart.classList.contains("collapsed") ? "+" : "−";
    });

    // ---------- 预览与时间 ----------
    function updateTimeDisplay() {
        var txt = formatTime(currentTime) + " / " + formatTime(totalDuration || 0);
        timeDisplay.textContent = txt;
        if (indexTime) indexTime.textContent = txt;
    }

    document.getElementById("btnPlay").addEventListener("click", function () {
        if (!totalDuration) return;
        if (isPlaying) {
            clearInterval(playTimer);
            isPlaying = false;
            document.getElementById("btnPlay").textContent = "▶ 预览";
            return;
        }
        isPlaying = true;
        document.getElementById("btnPlay").textContent = "⏸ 暂停";
        playTimer = setInterval(function () {
            currentTime += 1;
            if (currentTime >= totalDuration) {
                clearInterval(playTimer);
                isPlaying = false;
                currentTime = 0;
                document.getElementById("btnPlay").textContent = "▶ 预览";
            }
            updateTimeDisplay();
        }, 1000);
    });

    // ---------- 快捷键 ----------
    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key === "i") {
            e.preventDefault();
            document.getElementById("btnImport").click();
        }
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            document.getElementById("btnExport").click();
        }
        if (e.code === "Space") {
            var target = e.target;
            if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
                e.preventDefault();
                document.getElementById("btnPlay").click();
            }
        }
    });

    // ---------- 顶部导航：视图切换 ----------
    var navTabs = document.querySelectorAll(".nav-tab");
    var views = document.querySelectorAll(".view");
    navTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            var viewName = tab.getAttribute("data-view");
            navTabs.forEach(function (t) { t.classList.remove("active"); });
            tab.classList.add("active");
            views.forEach(function (v) {
                v.classList.toggle("view-active", v.classList.contains("view-" + viewName));
            });
        });
    });

    // 初始化简单索引条示例片段
    if (indexBar) {
        var seg1 = document.createElement("div");
        seg1.className = "index-segment";
        seg1.style.left = "0%";
        seg1.style.width = "25%";
        var seg2 = document.createElement("div");
        seg2.className = "index-segment alt";
        seg2.style.left = "25%";
        seg2.style.width = "30%";
        var seg3 = document.createElement("div");
        seg3.className = "index-segment";
        seg3.style.left = "60%";
        seg3.style.width = "20%";
        indexBar.appendChild(seg1);
        indexBar.appendChild(seg2);
        indexBar.appendChild(seg3);
    }

    updateTimeDisplay();
})();
