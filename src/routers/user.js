const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const shared_data = require("../shared-data/shared-vars");
const get_tokens = require("../utils/wallet_details");
const get_tokens_manually = require("../utils/manual_wallet_details");
const get_token_details = require("../utils/token_prices");

router.get("/", async (req, res) => {
    res.render("home", {
        title: "Home",
        shared_data,
        chain: "BEP-20",
    });
});

router.get("/home/:chain", async (req, res) => {
    res.render("home", {
        title: "Home",
        shared_data,
        chain: req.params.chain,
    });
});

router.get("/manual-login", async (req, res) => {
    res.redirect("dashboard");
});

router.post("/", async (req, res) => {
    if (req.body.user.ethAddress) {
        shared_data.user_is_authenticated = true;
        shared_data.ethAdd = req.body.user.ethAddress;

        const existing_user = await User.findOne({
            username: req.body.user.username,
        });

        if (existing_user) {
            const token = await existing_user.generateAuthToken();

            res.cookie("jwt", token, {
                httpOnly: true,
                secure: true,
            });

            shared_data.user_is_authenticated = true;
            shared_data.ethAdd = req.body.user.ethAddress;

            return res
                .status(200)
                .send({ result: "redirect", url: "/dashboard" });
        } else {
            const user = new User();

            user.username = req.body.user.username;
            user.ethAddress = req.body.user.ethAddress;

            try {
                await user.save();
                const token = await user.generateAuthToken();

                res.cookie("jwt", token, {
                    httpOnly: true,
                    secure: false,
                });

                shared_data.user_is_authenticated = true;

                return res
                    .status(200)
                    .send({ result: "redirect", url: "/dashboard" });
            } catch (e) {
                res.status(400);
            }
        }
    }
});

router.get("/dashboard", auth, async (req, res) => {
    if (shared_data.user_wallet.length > 0) {
        res.render("dashboard", {
            title: "Dashboard",
            shared_data,
        });
    } else {
        const user = req.user;

        let wallet;

        var async_wallet_details = new Promise((resolve, reject) => {
            get_tokens(user.ethAddress, async (error, wallet_details) => {
                if (error) {
                    console.log(error);
                } else {
                    wallet = wallet_details;

                    if (wallet.length === 0) {
                        res.render("dashboard", {
                            title: "Dashboard",
                            shared_data,
                            wallet,
                        });
                    } else {
                        resolve();
                    }
                }
            });
        });

        async_wallet_details.then(() => {
            var async_token_details = new Promise((resolve, reject) => {
                let i = 0;

                wallet.forEach(async function (token) {
                    get_token_details(
                        token.token_address,
                        (error, token_details) => {
                            if (error) {
                                console.log(error);
                            } else {
                                i++;
                                token.usdPrice = token_details.usdPrice;

                                if (i >= wallet.length) resolve();
                            }
                        }
                    );
                });
            });

            async_token_details.then(() => {
                var token_balance = wallet.map(function (a) {
                    return a.balance / Math.pow(10, a.decimals);
                });

                var token_name = wallet.map(function (a) {
                    return a.symbol;
                });

                var result = {};
                token_name.forEach(
                    (name, i) => (result[name] = token_balance[i])
                );
                console.log(result);

                const sorted_result = Object.entries(result)
                    .sort(([, a], [, b]) => b - a)
                    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

                shared_data.pie_chart = sorted_result;
                pie = sorted_result;

                shared_data.user_wallet = wallet;
                res.render("dashboard", {
                    title: "Dashboard",
                    shared_data,
                    wallet: shared_data.user_wallet,
                });

                return;
            });
        });
    }
});

router.get("/airdrop", async (req, res) => {
    res.render("airdrop", {
        title: "Airdrop",
    });
});

router.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        shared_data.user_is_authenticated = false;
        shared_data.ethAdd = "";
        shared_data.user_wallet = [];

        res.redirect("/");
    } catch (e) {
        res.status(500).send();
    }
});

router.get("/chart/:token_address", (req, res) => {
    res.render("chart", {
        title: "Crypto Gems | Charts",
        token_address: req.params.token_address,
    });
});

router.post("/manual-login/:chain", async (req, res) => {
    if (req.body.search_address == "") {
        res.redirect("/");
    } else {
        const existing_user = await User.findOne({
            ethAddress: req.body.search_address,
        });

        let user;

        if (existing_user) {
            user = existing_user;
            shared_data.ethAdd = req.body.search_address;
            const token = await user.generateAuthToken();

            res.cookie("jwt", token, {
                httpOnly: true,
                secure: false,
            });

            shared_data.user_is_authenticated = true;
        } else {
            user = new User();
            shared_data.ethAdd = req.body.search_address;
            user.ethAddress = req.body.search_address;
            const token = await user.generateAuthToken();

            res.cookie("jwt", token, {
                httpOnly: true,
                secure: false,
            });

            shared_data.user_is_authenticated = true;
        }

        let wallet;

        var async_wallet_details = new Promise((resolve, reject) => {
            get_tokens_manually(
                req.body.search_address,
                req.params.chain,
                async (error, wallet_details) => {
                    if (error) {
                        console.log(error);
                    } else {
                        wallet = wallet_details;

                        if (wallet.length === 0) {
                            res.render("dashboard", {
                                title: "Dashboard",
                                shared_data,
                                wallet,
                            });
                        } else {
                            resolve();
                        }
                    }
                }
            );
        });

        async_wallet_details.then(() => {
            var async_token_details = new Promise((resolve, reject) => {
                let i = 0;

                wallet.forEach(async function (token) {
                    get_token_details(
                        token.token_address,
                        (error, token_details) => {
                            if (error) {
                                console.log(error);
                            } else {
                                i++;
                                token.usdPrice = token_details.usdPrice;

                                if (i >= wallet.length) resolve();
                            }
                        }
                    );
                });
            });

            async_token_details.then(() => {
                var token_balance = wallet.map(function (a) {
                    return a.balance / Math.pow(10, a.decimals);
                });

                const balance_sum = token_balance.reduce(
                    (partial_sum, a) => partial_sum + a,
                    0
                );

                shared_data.balance_sum = balance_sum;   

                var token_name = wallet.map(function (a) {
                    return a.symbol;
                });

                var result = {};
                token_name.forEach(
                    (name, i) => (result[name] = token_balance[i])
                );

                const sorted_result = Object.entries(result)
                    .sort(([, a], [, b]) => b - a)
                    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

                shared_data.pie_chart = sorted_result;
                pie = sorted_result;

                shared_data.user_wallet = wallet;
                res.render("dashboard", {
                    title: "Dashboard",
                    shared_data,
                    wallet: shared_data.user_wallet,
                });
            });
        });
    }
});

module.exports = router;
