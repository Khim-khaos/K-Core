class KubekUtils {
    // Конвертировать размер файлов в человеко-читаемый формат
    static humanizeFileSize(size) {
        if (size < 1024) {
            size = size + " B";
        } else if (size < 1024 * 1024) {
            size = Math.round((size / 1024) * 10) / 10 + " Kb";
        } else if (size >= 1024 * 1024 && size < 1024 * 1024 * 1024) {
            size = Math.round((size / 1024 / 1024) * 10) / 10 + " Mb";
        } else if (size >= 1024 * 1024 * 1024) {
            size = Math.round((size / 1024 / 1024 / 1024) * 10) / 10 + " Gb";
        } else {
            size = size + " ?";
        }
        return size;
    }

    // Конвертировать секунды в человеко-читаемый формат
    static humanizeSeconds(seconds) {
        let hours = Math.floor(seconds / (60 * 60));
        let minutes = Math.floor((seconds % (60 * 60)) / 60);
        seconds = Math.floor(seconds % 60);

        return this.padZero(hours) + "{{commons.h}} " + this.padZero(minutes) + "{{commons.m}} " + this.padZero(seconds) + "{{commons.s}}";
    }

    // Дополнить число нулём (для дат)
    static padZero(number) {
        return (number < 10 ? "0" : "") + number;
    }

    static pickGradientFadeColor(fraction, color1, color2, color3){
        let fade = fraction;

        fade = fade * 2;
        if (fade >= 1) {
            fade -= 1;
            color1 = color2;
            color2 = color3;
        }

        let diffRed = color2.red - color1.red;
        let diffGreen = color2.green - color1.green;
        let diffBlue = color2.blue - color1.blue;

        let gradient = {
            red: parseInt(Math.floor(color1.red + (diffRed * fade)), 10),
            green: parseInt(Math.floor(color1.green + (diffGreen * fade)), 10),
            blue: parseInt(Math.floor(color1.blue + (diffBlue * fade)), 10),
        };
        return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
    }

    static getProgressGradientColor(progress){
        let color1 = {
            red: 46, green: 204, blue: 113
        };
        let color2 = {
            red: 241, green: 196, blue: 15
        };
        let color3 = {
            red: 231, green: 76, blue: 60
        };
        return this.pickGradientFadeColor(progress / 100, color1, color2, color3);
    }

    // Генерация UUID v4
    static uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    // Получить имя файла из пути
    static pathFilename(path){
        let rgx = /\\|\//gm;
        let spl = path.split(rgx);
        return spl[spl.length - 1];
    }

    // Получить расширение файла
    static pathExt(path){
        let spl = path.split(".");
        return spl[spl.length - 1];
    }

    // Сделать ссылки в тексте кликабельными
    static linkify(inputText) {
        let replacedText, replacePattern1, replacePattern2, replacePattern3;

        replacePattern1 =
            /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(
            replacePattern1,
            '<a href="$1" target="_blank">$1</a>'
        );

        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(
            replacePattern2,
            '$1<a href="http://$2" target="_blank">$2</a>'
        );

        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(
            replacePattern3,
            '<a href="mailto:$1">$1</a>'
        );

        return replacedText;
    }

    // ── Toasts ────────────────────────────────────────────────────────────────
    static _ensureToastContainer() {
        let el = document.getElementById("kubek-toasts");
        if (!el) {
            el = document.createElement("div");
            el.id = "kubek-toasts";
            el.className = "kubek-toasts";
            document.body.appendChild(el);
        }
        return el;
    }

    static toast(message, type = "info", duration = 3500) {
        const container = this._ensureToastContainer();
        const icons = {
            success: "check_circle",
            error: "error",
            warning: "warning",
            info: "info"
        };
        const toast = document.createElement("div");
        toast.className = `kubek-toast kubek-toast-${type}`;
        toast.setAttribute("role", "status");
        toast.innerHTML = `
            <span class="kubek-toast-icon material-symbols-rounded">${icons[type] || icons.info}</span>
            <span class="kubek-toast-text"></span>
            <button class="kubek-toast-close" type="button" aria-label="Close">
                <span class="material-symbols-rounded">close</span>
            </button>
        `;
        toast.querySelector(".kubek-toast-text").textContent = message;
        toast.querySelector(".kubek-toast-close").addEventListener("click", () => this._dismissToast(toast));
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        if (duration > 0) {
            setTimeout(() => this._dismissToast(toast), duration);
        }
        return toast;
    }

    static _dismissToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.remove("show");
        toast.classList.add("hide");
        setTimeout(() => toast.parentNode && toast.parentNode.removeChild(toast), 300);
    }

    static success(message, duration) { return this.toast(message, "success", duration); }
    static error(message, duration) { return this.toast(message, "error", duration); }
    static warning(message, duration) { return this.toast(message, "warning", duration); }
    static info(message, duration) { return this.toast(message, "info", duration); }

    // ── Confirm dialog ────────────────────────────────────────────────────────
    static confirm(options) {
        const opts = Object.assign({
            title: "Confirm",
            message: "Are you sure?",
            confirmText: "Confirm",
            cancelText: "Cancel",
            danger: false
        }, options || {});

        return new Promise((resolve) => {
            const wrap = document.createElement("div");
            wrap.className = "kubek-modal-backdrop";
            wrap.innerHTML = `
                <div class="kubek-modal" role="dialog" aria-modal="true">
                    <div class="kubek-modal-header">
                        <h3 class="kubek-modal-title"></h3>
                    </div>
                    <div class="kubek-modal-body"></div>
                    <div class="kubek-modal-footer">
                        <button class="dark-btn kubek-modal-cancel" type="button"></button>
                        <button class="primary-btn kubek-modal-confirm" type="button"></button>
                    </div>
                </div>
            `;
            wrap.querySelector(".kubek-modal-title").textContent = opts.title;
            wrap.querySelector(".kubek-modal-body").textContent = opts.message;
            wrap.querySelector(".kubek-modal-cancel").textContent = opts.cancelText;
            const confirmBtn = wrap.querySelector(".kubek-modal-confirm");
            confirmBtn.textContent = opts.confirmText;
            if (opts.danger) {
                confirmBtn.classList.remove("primary-btn");
                confirmBtn.classList.add("danger-btn");
            }

            const close = (result) => {
                wrap.classList.add("hide");
                setTimeout(() => wrap.parentNode && wrap.parentNode.removeChild(wrap), 200);
                resolve(result);
            };

            confirmBtn.addEventListener("click", () => close(true));
            wrap.querySelector(".kubek-modal-cancel").addEventListener("click", () => close(false));
            wrap.addEventListener("click", (e) => { if (e.target === wrap) close(false); });

            document.body.appendChild(wrap);
            requestAnimationFrame(() => wrap.classList.add("show"));
            setTimeout(() => confirmBtn.focus(), 50);
        });
    }

    // ── Tooltips ──────────────────────────────────────────────────────────────
    static initTooltips(root = document.body) {
        const items = root.querySelectorAll("[data-tooltip]");
        items.forEach((el) => {
            if (el._tooltipInited) return;
            el._tooltipInited = true;
            const tip = document.createElement("span");
            tip.className = "kubek-tooltip";
            tip.textContent = el.getAttribute("data-tooltip");
            el.style.position = el.style.position || "relative";
            el.appendChild(tip);
        });
    }

    // ── Click ripple (init for current root) ──────────────────────────────────
    static initRipples(root = document.body) {
        const buttons = root.querySelectorAll("button:not(.no-ripple)");
        buttons.forEach((btn) => {
            if (btn._rippleInited) return;
            btn._rippleInited = true;
            btn.addEventListener("click", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                btn.style.setProperty("--mx", x + "%");
                btn.style.setProperty("--my", y + "%");
            }, { passive: true });
        });
    }

    static initAll(root) {
        this.initTooltips(root);
        this.initRipples(root);
    }

    // ── Format helpers ────────────────────────────────────────────────────────
    static formatPercent(value, decimals = 0) {
        if (typeof value !== "number" || isNaN(value)) return "0%";
        return value.toFixed(decimals) + "%";
    }

    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static debounce(fn, wait = 200) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    static copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        return Promise.resolve();
    }
}

if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        KubekUtils.initAll(document.body);
    });
}
