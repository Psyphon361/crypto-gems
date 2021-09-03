const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            default: "NONAME",
            required: true,
        },

        ethAddress: {
            type: String,
        },

        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
    },

    {
        timestamps: true,
    }
);

// GENERATE AUTH TOKEN USING JWT
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, "cryptofiverrsecretkey");

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
