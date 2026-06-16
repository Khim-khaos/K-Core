$(function () {
    KubekUI.setTitle("Kubek | {{sections.systemMonitor}}");

    let cpuCircle = new KubekCircleProgress("#cpu-usage-circle", 0, 100, "var(--bg-dark-accent)", "var(--bg-dark-accent-light)", "var(--bg-primary-500)");
    let ramCircle = new KubekCircleProgress("#ram-usage-circle", 0, 100, "var(--bg-dark-accent)", "var(--bg-dark-accent-light)", "var(--success)");

    cpuCircle.create();
    ramCircle.create();

    const refreshUsage = () => {
        KubekHardware.getUsage((usage) => {
            if (!usage) return;
            cpuCircle.setValue(Math.round(usage.cpu));
            ramCircle.setValue(Math.round(usage.ram.percent));
        });
    };

    refreshUsage();
    let usageInterval = setInterval(refreshUsage, 3000);

    const pageCheckInterval = setInterval(() => {
        if ($("#cpu-usage-circle").length === 0) {
            clearInterval(usageInterval);
            clearInterval(pageCheckInterval);
        }
    }, 1000);

    KubekHardware.getSummary((data) => {
        if (!data) return;

        if (data.enviroment && typeof data.enviroment === "object") {
            for (const [key, value] of Object.entries(data.enviroment)) {
                $("#enviroment-table").append(
                    '<tr><th>' + key + '</th><td>' + String(value) + '</td></tr>'
                );
            }
        }

        if (data.networkInterfaces && typeof data.networkInterfaces === "object") {
            for (const [key, value] of Object.entries(data.networkInterfaces)) {
                let ips = "";
                if (Array.isArray(value)) {
                    value.forEach(function (inner) {
                        ips = ips + "<span>" + inner.address + " <sup>" + inner.family + "</sup></span><br>";
                    });
                }
                $("#networks-table").append(
                    '<tr><th>' + key + '</th><td>' + ips + '</td></tr>'
                );
            }
        }

        if (Array.isArray(data.disks)) {
            data.disks.forEach((disk) => {
                let letter = disk["_mounted"];
                let total = disk["_blocks"];
                let used = disk["_used"];
                let free = disk["_available"];

                if (data.platform && data.platform.name === "Linux") {
                    total = total * 1024;
                    used = used * 1024;
                    free = free * 1024;
                }
                total = KubekUtils.humanizeFileSize(total);
                used = KubekUtils.humanizeFileSize(used);
                free = KubekUtils.humanizeFileSize(free);
                let percent = disk["_capacity"];
                $("#disks-table").append(
                    '<tr><th>' + letter + '</th><td>' + used + '</td><td>' + free + '</td><td>' + total + '</td><td>' + percent + '</td></tr>'
                );
            });
        }

        if (data.platform) {
            $("#os-name").html(data.platform.version + " <sup>" + data.platform.arch + "</sup>");
            $("#os-build").text(data.platform.release);
        }
        if (data.totalmem) $("#total-ram").text(data.totalmem + " Mb");
        if (data.uptime) $("#kubek-uptime").text(KubekUtils.humanizeSeconds(data.uptime));
        if (data.systemUptime) $("#system-uptime").text(KubekUtils.humanizeSeconds(data.systemUptime));
        if (data.cpu) {
            $("#cpu-model").text(data.cpu.model + " (" + data.cpu.cores + " cores)");
            $("#cpu-speed").text(data.cpu.speed + " MHz");
        }
    });
});
