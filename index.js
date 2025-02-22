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
    const usersCollection = db.collection("users");
    // post user
    app.post("/users", async (req, res) => {
      const { uid, email, displayName } = req.body;

      if (!uid || !email || !displayName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      try {
        const usersCollection = client.db("taskManager").collection("users");

        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ uid });
        if (existingUser) {
          return res
            .status(200)
            .json({ message: "User already exists", user: existingUser });
        }

        // Insert new user
        const newUser = { uid, email, displayName, createdAt: new Date() };
        const result = await usersCollection.insertOne(newUser);

        res
          .status(201)
          .json({ message: "User saved successfully", user: newUser });
      } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    //second time
    // get task
    app.get("/tasks", async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });

    app.post("/api/tasks", async (req, res) => {
      const { title, description, category } = req.body;

      if (!title || title.length > 50) {
        return res
          .status(400)
          .json({ message: "Title is required (max 50 chars)" });
      }
      if (description && description.length > 200) {
        return res.status(400).json({ message: "Description max 200 chars" });
      }

      const newTask = {
        title,
        description,
        category: category || "To-Do",
        timestamp: new Date(),
      };

      const result = await tasksCollection.insertOne(newTask);

      res.send(result);
    });

    //updata a tasks positin and cat
    // app.put("/api/tasks/:id", async (req, res) => {
    //   try {
    //     const { category, order } = req.body;
    //     const taskId = req.params.id;
    //     if (!category || typeof order !== "number") {
    //       return res
    //         .status(400)
    //         .json({ message: "Category and order are required" });
    //     }

    //     const result = await tasksCollection.updateOne(
    //       { _id: new ObjectId(taskId) },
    //       { $set: { category, order } }
    //     );

    //     res.json({ message: "Task updated", result });
    //   } catch (error) {
    //     console.error("Error updating task:", error);
    //     res.status(500).json({ message: error.message });
    //   }
    // });
    app.put("/api/tasks/:id", async (req, res) => {
      try {
        const { category, order } = req.body;
        const taskId = req.params.id;
        if (!category || typeof order !== "number") {
          return res
            .status(400)
            .json({ message: "Category and order are required" });
        }

        // Update task category and order
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { category, order } }
        );

        res.json({ message: "Task updated", result });
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: error.message });
      }
    });

    const express = require("express");
    // delete method
    app.delete("/task/delete/:id", async (req, res) => {
      try {
        const taskId = req.params.id;
        console.log(taskId);
        const result = await tasksCollection.deleteOne({
          _id: new ObjectId(taskId),
        });

        res.send(result);
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // put for desc and title
    app.put("/task/update/:id", async (req, res) => {
      try {
        const taskId = req.params.id;
        const { title, description, category, order } = req.body;

        // Find the task by ID and update it
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          {
            $set: {
              title,
              description,
              category,
              order,
            },
          }
        );

        res.send(result);
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

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
