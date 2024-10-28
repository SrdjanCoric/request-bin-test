import express from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import {
  createAndAddNewBinId,
  addToMongo,
  addToPostgres,
  getRequestsFromPostgres,
  getRequestFromPostgres,
} from "./helpers";
// @ts-ignore
import fetchOpenAIOutput from "./ai";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "*", // In production, replace with your specific domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);

app.use(express.json());

// To serve public directory for the path '/public/bins/:bin_id'
app.use(
  "/public/bin/:bin_id",
  express.static(path.join(__dirname, "./public"))
);

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    next();
  } else {
    express.static(path.join(__dirname, "./public"))(req, res, next);
  }
});

// // Middleware to handle all request methods for the same path
app.all("/bin/:bin_id/webhook", async (req, res) => {
  const { method, url } = req;
  // console.log('error related to app.all route');
  const mongoRequestId = await addToMongo(req);
  const requestId = uuidv4();

  // console.log('bin_id = ', req.params.bin_id, ' ', typeof req.params.bin_id);
  await addToPostgres(
    method,
    url,
    mongoRequestId,
    req.params.bin_id,
    requestId
  );

  res.send(`Handled ${req.method} request`);
  return mongoRequestId;
});

app.post("/api/ai", async (req, res) => {
  try {
    const text = await fetchOpenAIOutput(req.body.prompt);
    res.json({ text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/create_new_bin", async (_, res) => {
  // create new bin id
  // add check to ensure not a duplicate
  // store bin id in postgres
  const binId = await createAndAddNewBinId();
  res.json(binId);
  // res.redirect(`/public/bin/${binId}`);
});

app.get("/api/:bin_id", async (req, res) => {
  // logic to get all requests for a specific binId
  // interacting with postgres to select all requests from request where requestbin_id == binId
  const requests = await getRequestsFromPostgres(req.params.bin_id);
  res.json(requests);
});

// API
// Get info about specific request
// user flow - when they click on a request within the full request table for a bin
// This route returns null if doesn't exist, else return obj with request info
app.get("/api/:bin_id/requests/:request_id", async (req, res) => {
  const request = await getRequestFromPostgres(
    req.params.bin_id,
    req.params.request_id
  );
  res.json(request);
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

// visit localhost:3000
// assuming you have done 1) npm init 2) npm install express

// https://7440-76-23-45-191.ngrok-free.app
// https://ecf6-76-23-45-191.ngrok-free.app/
