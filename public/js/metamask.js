async function login() {
    Moralis.initialize(
        "epu7L9g5fJwheDYe5XPKoZ0axcrXI4h380eF4m3e",
        "",
        "VhkXMnhcsU96T1ZT9j88c0S78gQh5aASwtoXHi7e"
    );
    Moralis.serverURL = "https://nugyjha7qsby.usemoralis.com:2053/server";

    console.log("login clicked");

    Moralis.Web3.authenticate().then(async function (user) {
        if (user) {
            // console.log(user);
            await user.save();
        }

        $.ajax({
            url: "/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                user,
            }),
            dataType: "json",
            success: function (response) {
                if (response.result == "redirect") {
                    //redirecting to dashboard from here.
                    window.location.replace(response.url);
                }
            },
        });
    });
}
