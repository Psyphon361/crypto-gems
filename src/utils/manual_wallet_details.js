const request = require("request");

const get_tokens_manually = (ethAddress, chain, callback) => {
    let url;

    if (chain == "ERC-20") {
        url =
            "https://deep-index.moralis.io/api/account/erc20/balances?chain=eth&chain_name=mainnet&address=" +
            ethAddress;
    } else if (chain == "BEP-20") {
        url =
        "https://deep-index.moralis.io/api/account/erc20/balances?chain=bsc&chain_name=mainnet&address=" +
        ethAddress;
    } else {
        url =
        "https://deep-index.moralis.io/api/account/erc20/balances?chain=polygon&chain_name=mainnet&address=" +
        ethAddress;
    }

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

module.exports = get_tokens_manually;
