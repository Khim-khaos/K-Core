let loadedScript;

class KubekPageManager {
    static currentPage = "";

    static gotoPage(page) {
        this.currentPage = page;
        this.loadPageContent(page);
    }

    static loadPageContent(page) {
        const $content = $("#content-place");
        $content.empty();
        $content.append('<div id="content-preloader"><div class="lds-spinner"><div></div><div></div><div></div></div></div>');

        if (typeof loadedScript !== "undefined") {
            document.head.removeChild(loadedScript);
            loadedScript = undefined;
        }

        $.ajax({
            url: "/pages/" + page + ".html",
            success: (result) => {
                this.setPageURL(page);
                KubekUI.setActiveItemByPage(page);

                setTimeout(() => {
                    $content.append(result);
                    $("#content-preloader").remove();

                    loadedScript = document.createElement("script");
                    loadedScript.setAttribute("src", "/pages/" + page + ".js?v=" + Date.now());
                    document.head.appendChild(loadedScript);
                }, 80);
            },
            error: () => {
                if (page !== "dashboard") {
                    this.gotoPage("dashboard");
                }
            },
        });
    }

    static updateURLParameter(url, param, paramVal) {
        const baseUrl = url.split("?")[0];
        const searchParams = new URLSearchParams(url.split("?")[1] || "");
        searchParams.set(param, paramVal);
        return baseUrl + "?" + searchParams.toString();
    }

    static setPageURL(page) {
        window.history.replaceState(
            { page },
            "",
            this.updateURLParameter(window.location.href, "act", page)
        );
    }
}

window.addEventListener("popstate", (e) => {
    if (e.state?.page) {
        KubekPageManager.gotoPage(e.state.page);
    }
});
