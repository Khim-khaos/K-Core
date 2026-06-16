let installerConsoleModals = {};

const INSTALLER_CONSOLE_HTML =
    '<div class="installer-console-modal modal-bg" id="icm-$id$">' +
    '  <div class="installer-console-window">' +
    '    <div class="installer-console-header">' +
    '      <span class="installer-console-title">$title$</span>' +
    '      <span class="installer-console-status" id="ic-status-$id$">$status$</span>' +
    '      <button class="dark-btn installer-console-close" onclick="KubekInstallerConsole.close(\'$id$\')">' +
    '        <span class="material-symbols-rounded">close</span>' +
    '      </button>' +
    '    </div>' +
    '    <div class="installer-console-body" id="ic-body-$id$">' +
    '      <div class="installer-console-output" id="ic-output-$id$"></div>' +
    '    </div>' +
    '  </div>' +
    '</div>';

class KubekInstallerConsole {
    static open(taskID, serverName) {
        if (installerConsoleModals[taskID]) return;
        installerConsoleModals[taskID] = true;

        let html = INSTALLER_CONSOLE_HTML
            .replaceAll('$id$', taskID)
            .replace('$title$', serverName)
            .replace('$status$', '{{serverCreationSteps.installing}}');

        $(".blurScreen").show();
        $("body").append(html);

        KubekInstallerConsole.startPolling(taskID);
    }

    static close(taskID) {
        if (installerConsoleModals[taskID]) {
            installerConsoleModals[taskID] = false;
        }
        $("#icm-" + taskID).remove();
        if (Object.values(installerConsoleModals).every(v => !v)) {
            $(".blurScreen").hide();
        }
    }

    static closeAll() {
        for (const id of Object.keys(installerConsoleModals)) {
            installerConsoleModals[id] = false;
            $("#icm-" + id).remove();
        }
        $(".blurScreen").hide();
    }

    static startPolling(taskID) {
        if (!installerConsoleModals[taskID]) return;

        $.ajax({
            url: KubekPredefined.API_ENDPOINT + "/tasks/" + taskID + "/log",
            success: (data) => {
                if (!installerConsoleModals[taskID]) return;
                const outputEl = $("#ic-output-" + taskID);
                const bodyEl = $("#ic-body-" + taskID);
                if (data && data.log && data.log.length > 0) {
                    let currentCount = outputEl.data("lineCount") || 0;
                    if (data.log.length > currentCount) {
                        for (let i = currentCount; i < data.log.length; i++) {
                            outputEl.append("<div>" + KubekInstallerConsole.escapeHtml(data.log[i]) + "</div>");
                        }
                        outputEl.data("lineCount", data.log.length);
                        bodyEl.scrollTop(bodyEl[0].scrollHeight);
                    }
                }

                $.ajax({
                    url: KubekPredefined.API_ENDPOINT + "/tasks/" + taskID,
                    success: (task) => {
                        if (!installerConsoleModals[taskID]) return;
                        const statusEl = $("#ic-status-" + taskID);
                        if (task.currentStep === KubekPredefined.SERVER_CREATION_STEPS.COMPLETED) {
                            statusEl.text("{{serverCreationSteps.completed}}").addClass("status-success");
                            KubekInstallerConsole.stopPolling(taskID);
                        } else if (task.currentStep === KubekPredefined.SERVER_CREATION_STEPS.FAILED) {
                            statusEl.text("{{serverCreationSteps.failed}}").addClass("status-error");
                            KubekInstallerConsole.stopPolling(taskID);
                        }
                    }
                });

                setTimeout(() => KubekInstallerConsole.startPolling(taskID), 1000);
            },
            error: () => {
                if (!installerConsoleModals[taskID]) return;
                setTimeout(() => KubekInstallerConsole.startPolling(taskID), 2000);
            }
        });
    }

    static stopPolling(taskID) {
        installerConsoleModals[taskID] = false;
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }
}