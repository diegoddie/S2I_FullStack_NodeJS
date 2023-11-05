const connectDB = require('./db');
const app = require('./index');
const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(`Error during connection to the DB: ${err.message}`);
  });