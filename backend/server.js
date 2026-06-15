const dotenv = require("dotenv");
dotenv.config();

console.log("MONGO_URI =", process.env.MONGO_URI);
console.log("PORT =", process.env.PORT);

const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});