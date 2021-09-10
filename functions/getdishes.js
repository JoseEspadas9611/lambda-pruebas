/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (business_id,category_id) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    let data = [];
    const results = await client
      .db("MenusDigitalesProductos")
      .collection(business_id)
      .find({"category.id":category_id})
      .forEach((x) => data.push({
        "id":x.id,
        "name":x.name,
        "description":x.description,
        "category_id":x.category.id,
        "ingredient":x.ingredients,
        "extras":x.extras,
        "price":x.price,
        "in_offer":x.in_offer,
        "offer_price":x.offer_price,
        "images":x.images
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
    let category_id = event.queryStringParameters.category_id 
    try {
      if (business_id != undefined){
        if (typeof business_id == "string"){
          const data = await getData(business_id,category_id);
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