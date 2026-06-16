$(function () {
    loadDashboardStats();
    loadServersGrid();

    const dashboardInterval = setInterval(() => {
        if (KubekPageManager.currentPage !== "dashboard") {
            clearInterval(dashboardInterval);
            return;
        }
        loadDashboardStats();
        updateServersStatus();
    }, 3000);
});

function loadDashboardStats() {
    KubekRequests.get("/api/health", (data) => {
        if (!data) return;
        const cpu = data.cpu || 0;
        const ramPercent = data.ram ? data.ram.percent : 0;

        const updateBar = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.style.width = val + "%";
        };
        const updateText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        updateBar("total-cpu-bar", cpu);
        updateText("total-cpu-val", Math.round(cpu) + "%");
        updateBar("total-ram-bar", ramPercent);
        updateText("total-ram-val", Math.round(ramPercent) + "%");

        updateBar("sys-cpu-bar", cpu);
        updateText("sys-cpu-val", Math.round(cpu) + "%");
        updateBar("sys-ram-bar", ramPercent);
        updateText("sys-ram-val", Math.round(ramPercent) + "%");

        if (data.system?.uptime) {
            updateText("sys-uptime-val", KubekUtils.humanizeSeconds(data.system.uptime));
        }
    });
}

function loadServersGrid() {
    KubekServers.getServersList((servers) => {
        const totalEl = document.getElementById("total-servers-count");
        if (totalEl) totalEl.textContent = servers.length;

        const grid = $("#dashboard-servers-grid");
        grid.empty();

        let runningCount = 0;

        servers.forEach((server, i) => {
            const card = $(`
                <div class="server-card stagger-item" id="dash-server-${server}" style="animation-delay: ${i * 60}ms">
                    <div class="server-card-head">
                        <div class="server-icon">
                            <img src="/api/servers/${server}/icon" alt="${server}" loading="lazy">
                        </div>
                        <div class="server-info">
                            <h4>${server}</h4>
                            <div class="server-version">
                                <span class="material-symbols-rounded" style="font-size: 12px; vertical-align: middle">deployed_code</span>
                                {{commons.loading}}
                            </div>
                        </div>
                    </div>
                    <div class="server-card-body">
                        <div class="server-stats-row">
                            <span>
                                <span class="material-symbols-rounded">memory</span>
                                <span>CPU</span>
                                <span class="cpu-usage" style="margin-left: 4px; color: var(--text-main); font-weight: 700">-</span>
                            </span>
                            <span>
                                <span class="material-symbols-rounded">data_usage</span>
                                <span>RAM</span>
                                <span class="ram-usage" style="margin-left: 4px; color: var(--text-main); font-weight: 700">-</span>
                            </span>
                        </div>
                    </div>
                    <div class="server-card-footer">
                        <span class="status-pill stopped">
                            <span class="dot"></span>
                            <span class="status-text">—</span>
                        </span>
                        <div class="server-card-actions">
                            <button class="server-action-btn" data-action="console" title="Console">
                                <span class="material-symbols-rounded">terminal</span>
                            </button>
                            <button class="server-action-btn" data-action="files" title="Files">
                                <span class="material-symbols-rounded">folder</span>
                            </button>
                        </div>
                    </div>
                </div>
            `);

            card.on("click", (e) => {
                const action = $(e.target).closest("[data-action]").data("action");
                localStorage.setItem("selectedServer", server);
                KubekUI.loadSelectedServer();
                if (action === "files") {
                    KubekPageManager.gotoPage("fileManager");
                } else {
                    KubekPageManager.gotoPage("console");
                }
            });

            grid.append(card);

            KubekServers.getServerInfo(server, (info) => {
                if (!info) return;
                const cardEl = $(`#dash-server-${server}`);
                cardEl.find(".server-version").html(
                    `<span class="material-symbols-rounded" style="font-size: 12px; vertical-align: middle">deployed_code</span> ${info.core || ""} ${info.coreVersion || ""}`
                );
                if (info.status === "running" || info.status === "starting") {
                    cardEl.addClass(info.status);
                    cardEl.find(".status-pill")
                        .removeClass("stopped")
                        .addClass(info.status);
                    cardEl.find(".status-text").text(info.status);
                    if (info.status === "running") runningCount++;
                } else {
                    cardEl.addClass("stopped");
                    cardEl.find(".status-pill")
                        .removeClass("running starting")
                        .addClass("stopped");
                    cardEl.find(".status-text").text("Stopped");
                }
                updateStatusCounts(servers.length, runningCount);
            });
        });
    });
}

function updateServersStatus() {
    KubekServers.getServersStatuses((statuses) => {
        if (!statuses) return;
        let runningCount = 0;
        let stoppedCount = 0;

        Object.keys(statuses).forEach((server) => {
            const info = statuses[server];
            const card = $(`#dash-server-${server}`);
            if (!card.length) return;

            card.removeClass("running starting stopped");

            const pill = card.find(".status-pill");
            pill.removeClass("running starting stopped error");

            if (info.status === "running") {
                card.addClass("running");
                pill.addClass("running");
                card.find(".status-text").text("Running");
                runningCount++;
                if (info.usage) {
                    card.find(".cpu-usage").text(Math.round(info.usage.cpu) + "%");
                    card.find(".ram-usage").text(Math.round(info.usage.ram / 1024 / 1024) + "MB");
                }
            } else if (info.status === "starting") {
                card.addClass("starting");
                pill.addClass("starting");
                card.find(".status-text").text("Starting");
                runningCount++;
                card.find(".cpu-usage").text("…");
                card.find(".ram-usage").text("…");
            } else if (info.status === "error") {
                card.addClass("stopped");
                pill.addClass("error");
                card.find(".status-text").text("Error");
                stoppedCount++;
                card.find(".cpu-usage").text("-");
                card.find(".ram-usage").text("-");
            } else {
                card.addClass("stopped");
                pill.addClass("stopped");
                card.find(".status-text").text("Stopped");
                stoppedCount++;
                card.find(".cpu-usage").text("-");
                card.find(".ram-usage").text("-");
            }
        });

        const runEl = document.getElementById("running-servers-count");
        const stopEl = document.getElementById("stopped-servers-count");
        if (runEl) runEl.textContent = runningCount;
        if (stopEl) stopEl.textContent = stoppedCount;
    });
}

function updateStatusCounts(total, running) {
    const totalEl = document.getElementById("total-servers-count");
    const runEl = document.getElementById("running-servers-count");
    const stopEl = document.getElementById("stopped-servers-count");
    if (totalEl) totalEl.textContent = total;
    if (runEl) runEl.textContent = running;
    if (stopEl) stopEl.textContent = total - running;
}
