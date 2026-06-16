const PREDEFINED = require("./../modules/predefined");
const ACCOUNTS_MANAGER = require("./../modules/accountsManager");
const COMMONS = require("./../modules/commons");

const express = require("express");
const SHA256 = require("crypto-js/sha256");
const router = express.Router();

// Endpoint для получения списка аккаунтов
router.get("/", function (req, res) {
    res.send(ACCOUNTS_MANAGER.getUsersList());
});

// Endpoint для получения информации об аккаунте
router.get("/:login", function (req, res) {
    let q = req.params;
    if (COMMONS.isObjectsValid(q.login)) {
        return res.send(ACCOUNTS_MANAGER.getUserData(q.login));
    }
    res.sendStatus(400);
});

// Endpoint для удаления аккаунта
router.delete("/:login", function (req, res) {
    let q = req.params;
    if (COMMONS.isObjectsValid(q.login)) {
        return res.send(ACCOUNTS_MANAGER.deleteUser(q.login));
    }
    res.sendStatus(400);
});

// Endpoint для регенерации хеша
router.get("/:login/regenHash", function (req, res) {
    let q = req.params;
    if (COMMONS.isObjectsValid(q.login)) {
        return res.send(ACCOUNTS_MANAGER.regenUserHash(q.login));
    }
    res.sendStatus(400);
});

// Endpoint для смены пользовательского пароля
router.put("/:login/password", function (req, res) {
    let q = req.params;
    let body = req.body;

    if (q.login !== "kubek") {
        if (COMMONS.isObjectsValid(q.login, body.newPassword)) {
            return res.send(ACCOUNTS_MANAGER.changePassword(q.login, body.newPassword));
        }
    } else {
        if (COMMONS.isObjectsValid(q.login, body.oldPassword, body.newPassword)) {
            let getKubekPwd = ACCOUNTS_MANAGER.getUserData("kubek").password;
            if (getKubekPwd === SHA256(body.oldPassword).toString()) {
                return res.send(ACCOUNTS_MANAGER.changePassword(q.login, body.newPassword));
            } else {
                return res.send(false);
            }
        }
    }
    res.sendStatus(400);
});

// Endpoint для создания пользователя
router.put("/", function (req, res) {
    let body = req.body;
    let permSplit = [];
    let serversAllowed = [];
    if (COMMONS.isObjectsValid(body.login, body.password, body.permissions)) {
        permSplit = body.permissions.split(",");
        if (COMMONS.isObjectsValid(body.servers)) {
            serversAllowed = body.servers.split(",");
        }
        let email = COMMONS.isObjectsValid(body.email) ? body.email : "";
        return res.send(ACCOUNTS_MANAGER.createNewAccount(body.login, body.password, permSplit, email, serversAllowed));
    }
    res.sendStatus(400);
});

// Endpoint для изменения пользователя
router.put("/:login", function (req, res) {
    let q = req.params;
    let body = req.body;
    let permSplit = [];
    let serversAllowed = [];
    if (COMMONS.isObjectsValid(q.login, body.permissions)) {
        permSplit = body.permissions.split(",");
        if (COMMONS.isObjectsValid(body.servers)) {
            serversAllowed = body.servers.split(",");
        }
        let email = COMMONS.isObjectsValid(body.email) ? body.email : "";
        let password = COMMONS.isObjectsValid(body.password) ? body.password : "";
        return res.send(ACCOUNTS_MANAGER.updateAccount(q.login, password, permSplit, email, serversAllowed));
    }
    res.sendStatus(400);
});

module.exports.router = router;