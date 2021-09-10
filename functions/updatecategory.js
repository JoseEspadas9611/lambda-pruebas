/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (business_id,category_id,category_fields) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    d = new Date()
    const results = await client
      .db("MenusDigitalesCateogorias")
      .collection(business_id)
      .updateOne({ id: category_id },{$set:category_fields})
      
    return results;
  } catch (err) {
    console.log(err); // output to netlify function log
  } finally {
    await client.close();
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod == "POST") {
    const { business_id,category_id,category_fields} = JSON.parse(event.body);

    try {
      if(typeof business_id == "string"){
      const data = await getData(business_id,category_id,category_fields);
        if (typeof category_id == "number"){
            if(data.result.ok == 1){
                let body = { 
                error_code:0,
                msg: 'Los datos se modificaron correctamente'}; 
                return {
                statusCode: 200,
                headers,
                body: JSON.stringify(body),
                };
            }else{
                let body = { 
                error_code:3,
                msg: 'Los datos no se modificaron, revisalos'}; 
                return {
                statusCode: 400,
                headers,
                body: JSON.stringify(body),
                };
            }
        }else{
            let body = { 
                error_code:1,
                msg: 'El category_id debe ser un number'}; 
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