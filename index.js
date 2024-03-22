const cors = require("cors");

const sql = require("mssql");
const express = require("express");
const app = express();
app.use(express.json());

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Server is running");
});
const config = {
  user: "Abdullah1904",
  password: "Abdullah.1904",
  database: "F1_event",
  server: "myfreesqldbserver1904.database.windows.net",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // Necessary for Azure SQL Database
    trustServerCertificate: false, // If true, it bypasses the SSL certificate validation
  },
};

app.get("/test", (req, res) => {
  res.send("Server is running");
});

app.post("/submit", async (req, res) => {
  const { hexCode, name, eMail, address } = req.body;

  try {
    await sql.connect(config);
    // Query to check if a record with the same hexCode and complete details exists
    const result =
      await sql.query`SELECT * FROM dbo.GlynH WHERE hexCode = ${hexCode}`;

    if (result.recordset.length > 0) {
      // Check if the existing record has a name, email, and address
      const existingDetails = result.recordset[0];
      if (
        existingDetails.name &&
        existingDetails.eMail &&
        existingDetails.address
      ) {
        // If all details are present, send an error response
        res.status(400).send("Invalid code: Hexcode is already used.");
      } else {
        // Update the existing record only if not all details are present
        await sql.query`UPDATE dbo.GlynH SET name = ${name}, eMail = ${eMail}, address = ${address} WHERE hexCode = ${hexCode}`;
        res.status(200).send("Record updated");
      }
    } else {
      // Insert new record if not exists
      await sql.query`INSERT INTO dbo.GlynH (hexCode, name, eMail, address) VALUES (${hexCode}, ${name}, ${eMail}, ${address})`;
      res.status(200).send("New record inserted successfully.");
    }
  } catch (err) {
    console.error("SQL error:", err);
    res.status(500).send("An error occurred on the server.");
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
