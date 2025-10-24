require("dotenv").config();
const App = require("./src/app");

(async () => {
	const app = new App();
	await app.connectDB();
	app.start(3001);
})();
