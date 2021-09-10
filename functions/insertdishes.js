/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (business_id,product) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    let data = [];
    d = new Date()
    const result_query = await client.db("MenusDigitalesProductos").collection(business_id).find().forEach((x) => data.push({x}));
    product.id = parseInt(data.length + Math.floor(Math.random() * 9999))
    product.ingredients = product.ingredients.length == 0 ? [] :product.ingredients.map(name => ({id: Math.floor(Math.random() * 999) , name:name}))
    product.extras = product.extras.length == 0 ? [] :product.extras.map(name =>({id: Math.floor(Math.random() * 999), name:name}))
    const results = await client
      .db("MenusDigitalesProductos")
      .collection(business_id)
      .insertOne(product)
    return results;
  } catch (err) {
    console.log(err); // output to netlify function log
  } finally {
    await client.close();
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod == "POST") {
    const { business_id,product } = JSON.parse(event.body);
    try {
      if (typeof business_id == "string"){
        const data = await getData(business_id,product);
        console.log(data);
        if(data.insertedCount >= 1){
          let body = { 
            error_code:0,
            msg: 'Los datos se agregaron correctamente'}; 
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(body),
          };
        }else{
          let body = { 
            error_code:2,
            msg: 'Los datos no se agregaron, revisalos'}; 
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify(body),
          };
        }
      }else{
        let body = { 
          error_code:1,
          msg: 'El business_id debe ser un string'}; 
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify(body),
        };
      }
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