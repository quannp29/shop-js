const express = require("express");
const app = express();
const dotenv = require("dotenv");
const database = require("./config/database");
const systemConfig = require("./config/system");
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const moment = require("moment");
const path = require('path');

dotenv.config();

database.connect();

const port = process.env.PORT;

const routeAdmin = require("./routes/admin/index.route");
const routeClient = require("./routes/client/index.route");

// Flash
app.use(cookieParser('UNIQUERANDOMKEY'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());
// End Flash

app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.static("public"));

app.use(methodOverride('_method'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// App Locals Variable
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;

/* New Route to the TinyMCE Node module */
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// Routes
routeAdmin(app);
routeClient(app);

app.get("*", (req, res) => {
  res.render("client/pages/errors/404", {
    pageTitle: "404 Not Found",
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});