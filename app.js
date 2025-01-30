// Using Node.js `require()`
require('dotenv').config()
const Raqueta = require("./entities/Raquetas.js")
const express = require('express')
const app = express()
const port = 3000
app.use(express.static('public'));

// Obtener todos los ítems
app.get("/raquetas", (req, res) => {
    Raqueta.buscarTodas()
    .then(raquetas => {
      res.json(raquetas);
    })
    .catch(err => {
      res.status("500").json({"error": err});
    })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})