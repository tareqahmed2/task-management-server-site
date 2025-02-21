const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0sbt0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB and start server
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Ping the deployment to ensure connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Specify the database and collection
    const db = client.db("taskManager");
    const tasksCollection = db.collection("tasks");

    // Test route
    app.get("/", (req, res) => {
      res.send("Task Manager API is running");
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Do not close the client to keep connection open for API usage
    // await client.close();
  } catch (err) {
    console.error(err);
  }
}
run().catch(console.dir);
