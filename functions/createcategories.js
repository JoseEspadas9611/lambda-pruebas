/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (business_id,category) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    let data = [];
    d = new Date()
    const results = await client
      .db("MenusDigitalesCateogorias")
      .collection(business_id)
      .insert(category)
      
    return results;
  } catch (err) {
    console.log(err); // output to netlify function log
  } finally {
    await client.close();
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod == "POST") {
    const { business_id,category } = JSON.parse(event.body);
    try {
      if (typeof business_id == "string"){
        const data = await getData(business_id,category);
        if(data.result.ok == 1){
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