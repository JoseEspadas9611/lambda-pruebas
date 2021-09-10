/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (subcategory_id) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    let data = [];
    const results = await client
      .db("Farmazone")
      .collection("odooCatalog")
      .find({'subcategory.id': parseInt(subcategory_id)})
      .forEach((x) => data.push(x)); // necesita el forEach para terminar de esperar a la base de datos de lo contrario envía un cursor de Mongo
    return data;
  } catch (err) {
    console.log(err); // output to netlify function log
  } finally {
    await client.close();
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod == "GET") {
    let subcategory_id = event.queryStringParameters.subcategory_id
    try {
      if (subcategory_id != undefined){
          const data = await getData(subcategory_id);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: data}),
          };
      }else{
        let body = { 
          error_code:1,
          msg: 'Ese param no es valido'}; 
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify(body),
        };
      }
      //   console.log("================");
      
    } catch (err) {
      console.log(err); // output to netlify function log
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ msg: err.message }),
      };
    }
  }
};