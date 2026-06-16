class KubekUI {
    static loadSection(name, container = "body", cb = () => {}) {
        $.get("/sections/" + name + ".html", (code) => {
            $(container).append(code);
            cb();
        });
    }

    static showPreloader() {
        const $preloader = $("body #main-preloader");
        $preloader.show();
        animateCSSJ($preloader, "fadeIn");
    }

    static hidePreloader() {
        const $preloader = $("body #main-preloader");
        animateCSSJ($preloader, "fadeOut").then(() => {
            $preloader.hide();
        });
    }

    static setAllSidebarItemsUnactive() {
        $("#main-menu-sidebar .sidebar-item").removeClass("active");
    }

    static setActiveItemByPage(page) {
        $("#main-menu-sidebar .sidebar-item").each(function () {
            $(this).toggleClass("active", $(this).data("page") === page);
        });
    }

    static changeItemByPage(page) {
        this.setAllSidebarItemsUnactive();
        this.setActiveItemByPage(page);
    }

    static toggleSidebar() {
        if (window.matchMedia("(max-width: 1360px)").matches) {
            const $sidebar = $("#sidebar-place");
            const $blur = $(".blurScreen");
            const isMinimized = $sidebar.hasClass("minimized");

            if (isMinimized) {
                $sidebar.removeClass("minimized");
                $blur.fadeIn(200);
                document.body.style.overflow = "hidden";
            } else {
                $sidebar.addClass("minimized");
                $blur.fadeOut(200);
                document.body.style.overflow = "";
            }
        }
    }

    static loadSelectedServer() {
        const selectServer = (name, cb) => {
            selectedServer = name;
            localStorage.setItem("selectedServer", name);
            KubekServerHeaderUI.loadServerByName(name, cb || (() => {}));
        };

        const tryFirstServer = () => {
            KubekServers.getServersList((list) => {
                if (list?.length > 0) {
                    selectServer(list[0]);
                } else {
                    localStorage.removeItem("selectedServer");
                    selectedServer = undefined;
                }
            });
        };

        const stored = localStorage.getItem("selectedServer");
        if (stored && stored !== "undefined") {
            selectedServer = stored;
            KubekServerHeaderUI.loadServerByName(stored, (ok) => {
                if (!ok) tryFirstServer();
            });
        } else {
            tryFirstServer();
        }
    }

    static initSwipeToOpenSidebar() {
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwiping = false;

        document.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            isSwiping = false;
        }, { passive: true });

        document.addEventListener("touchmove", (e) => {
            if (!isSwiping) {
                const dx = Math.abs(e.changedTouches[0].screenX - touchStartX);
                const dy = Math.abs(e.changedTouches[0].screenY - touchStartY);
                if (dx > dy && dx > 10) isSwiping = true;
            }
        }, { passive: true });

        document.addEventListener("touchend", (e) => {
            if (!isSwiping) return;
            const dx = e.changedTouches[0].screenX - touchStartX;
            const $sidebar = $("#sidebar-place");

            if (dx > 80 && touchStartX < 40 && $sidebar.hasClass("minimized")) {
                KubekUI.toggleSidebar();
            }
        }, { passive: true });
    }

    static loadServersList() {
        $("#servers-list-sidebar .server-item").remove();
        KubekServers.getServersList((servers) => {
            servers.forEach((name) => {
                const isActive = name === selectedServer ? " active" : "";
                $("#servers-list-sidebar").append(`
                    <div class="server-item sidebar-item${isActive}" data-server="${name}">
                        <div class="icon-circle-bg">
                            <img style="width:24px;height:24px" alt="${name}" src="/api/servers/${name}/icon">
                        </div>
                        <span class="server-name">${name}</span>
                        <div class="quick-actions">
                            <span class="material-symbols-rounded" data-action="start">play_arrow</span>
                            <span class="material-symbols-rounded" data-action="restart">refresh</span>
                            <span class="material-symbols-rounded" data-action="stop">stop</span>
                        </div>
                    </div>`);
            });

            $("#servers-list-sidebar").off("click", ".server-item").on("click", ".server-item", function (e) {
                if ($(e.target).closest(".quick-actions").length) return;
                const srv = $(this).data("server");
                if (srv) {
                    localStorage.setItem("selectedServer", srv);
                    window.location.reload();
                }
            });

            $("#servers-list-sidebar").off("click", ".quick-actions span").on("click", ".quick-actions span", function (e) {
                e.stopPropagation();
                const srv = $(this).closest(".server-item").data("server");
                const action = $(this).data("action");
                if (srv) {
                    if (action === "start") KubekServers.startServer(srv);
                    else if (action === "restart") KubekServers.restartServer(srv);
                    else if (action === "stop") KubekServers.stopServer(srv);
                }
            });
        });
    }

    static connectionLost() {
        KubekAlerts.addAlert("{{commons.connectionLost}}", "warning", KubekUI.formatTime(new Date()), 6000);
        KubekUI.showPreloader();
    }

    static connectionRestored() {
        KubekAlerts.addAlert("{{commons.connectionRestored}}", "check", KubekUI.formatTime(new Date()), 3000);
        setTimeout(() => window.location.reload(), 1000);
    }

    static setTitle(title) {
        document.title = title;
    }

    static formatTime(date) {
        const d = String(date.getDate()).padStart(2, "0");
        const mo = String(date.getMonth() + 1).padStart(2, "0");
        const h = String(date.getHours()).padStart(2, "0");
        const m = String(date.getMinutes()).padStart(2, "0");
        const s = String(date.getSeconds()).padStart(2, "0");
        return `${d}.${mo} / ${h}:${m}:${s}`;
    }
}

// Initialize mobile swipe-to-open sidebar on DOM ready
$(function () {
    if (window.matchMedia("(max-width: 1360px)").matches) {
        KubekUI.initSwipeToOpenSidebar();
    }
});

const animateCSSJ = (element, animation, fast = true, prefix = "animate__") =>
    new Promise((resolve) => {
        const animationName = prefix + animation;
        const $el = $(element);
        $el.addClass(`${prefix}animated ${animationName}${fast ? ` ${prefix}faster` : ""}`);

        $el[0].addEventListener("animationend", function handler(e) {
            e.stopPropagation();
            $el.removeClass(`${prefix}animated ${animationName}${fast ? ` ${prefix}faster` : ""}`);
            resolve("Animation ended");
        }, { once: true });
    });
