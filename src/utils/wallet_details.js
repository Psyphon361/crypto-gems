const request = require("request");

const get_tokens = (ethAddress, callback) => {
    const url =
        "https://deep-index.moralis.io/api/account/erc20/balances?chain=eth&chain_name=mainnet&address=" +
        ethAddress;

    request(
        {
            url,
            json: true,
            headers: {
                "X-API-Key": process.env.WEB3_API_KEY,
            },
        },
        (error, { body }) => {
            if (error) {
                callback("Unable to connect to the Web3 API!", undefined);
            } else {
                callback(undefined, body);
            }
        }
    );
};

module.exports = get_tokens;
