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
      business_id,
      table_fields
    } = JSON.parse(event.body);

    try {
    
    if(typeof business_id == 'string'){
      const data = await getData(
        business_id, table_fields
      );
      if (data.code == 11000) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            err: 1,
            msg: `El identificador de mesa -> ${table_id} <- ya existe`,
          }),
        };
      } 
      if (data.insertedCount == 1) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            err: 0,
            msg: "Los Datos se agregaron correctamente",
          }),
        };
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            err: 3,
            msg: "No se pudo crear mesa",
          }),
        };
      }
    }else{
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
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

const getData = async (
  business_id, table_fields
) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let qrBase64 = "";
  let qrURL = table_fields.business_url + `?table_id=${table_fields.table_id}`;

  setTimeout(() => {
    QRCode.toDataURL(qrURL)
      .then((url) => {
        qrBase64 = url;
        // console.log("typeof ", typeof qrBase64);
        // console.log(qrBase64);
        // console.log("typeof ", typeof qrURL);
        // console.log(qrURL);
      })
      .catch((err) => {
        console.error(err);
      });
  }, 100);

  try {
    await client.connect();

    d = new Date();
    table_fields.qr = qrBase64
    const results = await client
      .db("MenusDigitales")
      .collection(business_id)
      .insertOne(table_fields);

    return results;
  } catch (err) {
    //console.log(err); // output to netlify function log
    return err;
  } finally {
    await client.close();
  }
};
