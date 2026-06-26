import "dotenv/config";
import app from "../src/app.js";

const { PORT = 4000 } = process.env;
app.listen(PORT, () => console.log(`API local en http://localhost:${PORT}`));