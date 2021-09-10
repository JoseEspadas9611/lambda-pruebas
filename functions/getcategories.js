/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (business_id) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    let data = [];
    const results = await client
      .db("MenusDigitalesCateogorias")
      .collection(business_id)
      .find()
      .forEach((x) => data.push({
        "id":x.id,
        "categoria":x.categoria,
        "enabled":x.enabled,
        "image":x.image
      })); // necesita el forEach para terminar de esperar a la base de datos de lo contrario envía un cursor de Mongo
    return data;
  } catch (err) {
    console.log(err); // output to netlify function log
  } finally {
    await client.close();
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod == "GET") {
    let business_id = event.queryStringParameters.business_id
    try {
      if (business_id != undefined){
        if (typeof business_id == "string"){
          const data = await getData(business_id);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: data}),
          };
        }else{
          let body = { 
            error_code:2,
            msg: 'El business_id debe ser un string'}; 
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify(body),
          };
        }
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