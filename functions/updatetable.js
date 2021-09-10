/* eslint-disable */
const QRCode = require("qrcode");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-Credentials": true,
};

exports.handler = async function (event, context, callback) {
  if (event.httpMethod == "POST") {
    const { table_id, business_id,inputdata } = JSON.parse(event.body);

    try {
      if (typeof business_id == "string") {
        if (typeof table_id == "number") {
          const data = await getData(table_id,business_id,inputdata);

          if (data.modifiedCount == 1) {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                error_code: 0,
                msg: "Los Datos se modificaron correctamente",
              }),
            };
          } else {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({
                error_code: 1,
                msg: "Los Datos NO se modificaron correctamente",
              }),
            };
          }
        } else {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error_code: 2,
              msg: "El table_id tiene que ser tipo numérico",
            }),
          };
        }
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error_code: 2,
            msg: "El Business_Id tiene que ser tipo string",
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

const getData = async (table_id,business_id,inputdata) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    d = new Date();
    const results = await client
      .db("MenusDigitales")
      .collection(business_id)
      .updateOne({ "table_id":table_id }, { $set: inputdata });

    return results;
  } catch (err) {
    //console.log(err); // output to netlify function log
    return err;
  } finally {
    await client.close();
  }
};
