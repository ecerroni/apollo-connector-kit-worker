const fetch = require("node-fetch");
const { introspectionQuery } = require("graphql");
const fs = require("fs");

fetch("https://graphql.fauna.com/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": `Bearer fnADflatjdACAPRlHz4zHFaRekRrcGVY6_LwzhBq` },
  body: JSON.stringify({ query: introspectionQuery })
})
  .then(res => res.json())
  .then(res => {
    // console.log(res);
    fs.writeFileSync("./src/remote-schema.json", JSON.stringify(res.data, null, 2))
  }
  );

// OR FROM THE CLI
// apollo schema:download --header "Authorization: Bearer fnADflatjdACAPRlHz4zHFaRekRrcGVY6_LwzhBq" --endpoint=https://graphql.fauna.com/graphql .src/remote-schema.json