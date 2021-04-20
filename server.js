const http = require("http");
const fs = require("fs");
const url = require("url");
const services = require("./services");
const jsonBody = require("body/json");

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
  } else {
    response.statusCode = 500;
    response.write("An error has occurred");
    response.end();
  }
});

server.listen(8080);
