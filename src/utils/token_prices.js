const request = require("request");

const get_token_details = async (tokenAddress, callback) => {
    const url =
        "https://deep-index.moralis.io/api/token/ERC20/" +
        tokenAddress +
        "/price?chain=eth&chain_name=mainnet";

    request(
        {
            url,
            json: true,
            headers: {
                "X-API-Key": process.env.WEB3_API_KEY,
            },
        },
        (error, token) => {
            if (error) {
                callback("Unable to connect to the Web3 API!", undefined);
            } else {
                callback(undefined, token.body);
            }
        }
    );
};

module.exports = get_token_details;
