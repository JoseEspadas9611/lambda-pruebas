/* eslint-disable */
const QRCode = require("qrcode");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

exports.handler = async function (event, context, callback) {
  if (event.httpMethod == "POST") {
    const {
      category_id,business_id
    } = JSON.parse(event.body);

    try {
    
    if(typeof business_id == 'string'){
      if(typeof category_id == 'number'){
        const data = await getData(business_id,category_id);
        if (data.result.ok == 1) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              error_code:0,
              msg: "registros eliminados correctamente",
            }),
          };
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error_code:1,
              msg: "Los datos no se eliminaron",
            }),
          };
        }
      }else{
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error_code:2,
            msg: "El category_id tiene que ser tipo number",
          }),
        };
      }
    }else{
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error_code:3,
              msg: "El business_id tiene que ser tipo string",
            }),
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

const getData = async (
  business_id,category_id
) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    d = new Date();
    const results = await client
      .db("MenusDigitalesCateogorias")
      .collection(business_id)
      .deleteOne({"id": category_id});
    return results;
  } catch (err) {
    //console.log(err); // output to netlify function log
    return err;
  } finally {
    await client.close();
  }
};
