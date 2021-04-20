const http = require("http");
const fs = require("fs");
const url = require("url");
const services = require("./services");
const jsonBody = require("body/json");
const formidable = require("formidable");

const server = http.createServer();

server.on("request", (request, response) => {
  // handling errors
  request.on("error", (err) => {
    console.error("request error");
  });
  response.on("error", (err) => {
    console.error("response error");
  });

  const parsedUrl = url.parse(request.url, true);
  if (request.method === "GET" && parsedUrl.pathname === "/metadata") {
    const { id } = parsedUrl.query;
    const metadata = services.fetchImageMetadata(id);
    response.setHeader("Content-Type", "application/json");
    response.statusCode = 200;
    const serializedJSON = JSON.stringify(metadata);
    response.write(serializedJSON);
    response.end();
  } else if (request.method === "POST" && parsedUrl.pathname === "/users") {
    jsonBody(request, response, (err, body) => {
      if (err) {
        console.log(err);
      } else {
        services.createUser(body["userName"]);
      }
    });
  } else if (request.method === "POST" && parsedUrl.pathname === "/upload") {
    const form = new formidable.IncomingForm({
      uploadDir: __dirname,
      keepExtensions: true,
      multiples: true,
      maxFileSize: 5 * 1024 * 1024,
      encoding: "utf-8",
      maxFields: 20,
    });
    form
      .parse(request)
      .on("fileBegin", (name, file) => {
        console.log("Our upload has started!");
      })
      .on("file", (name, file) => {
        console.log("Field + file pair has been received");
      })
      .on("field", (name, value) => {
        console.log("Field received: ");
        console.log(name, value);
      })
      .on("progress", (bytesReceived, bytesExpected) => {
        console.log(
          `${bytesReceived} / ${bytesExpected} (${Math.floor(
            (bytesReceived / bytesExpected) * 100
          )}%)`
        );
      })
      .on("error", (err) => {
        console.error(err);
        request.resume();
      })
      .on("aborted", () => {
        console.error("Request aborted by the user!");
      })
      .on("end", () => {
        console.log("Done - request fully received!");
        response.end("Success!");
      });
  } else {
    fs.createReadStream("./index.html").pipe(response);
  }
});

server.listen(8080);
