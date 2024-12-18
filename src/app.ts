import express from "express";

const app = express();

app.get("/users", (req, res) => {});

app.get("/users/:id", (req, res) => {});

app.post("/users", (req, res) => {});

app.put("/users/:id", (req, res) => {});

app.delete("/users/:id", (req, res) => {});

export default app;
