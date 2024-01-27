const crypto = require("crypto");

const generateUniqeHash = (length)=>{
    return crypto.randomBytes(Math.ceil(length /2))
    .toString("hex")
    .slice(0,length);
}

console.log(generateUniqeHash(6).toUpperCase())

module.exports = generateUniqeHash;