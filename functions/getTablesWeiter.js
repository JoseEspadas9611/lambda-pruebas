/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (business_id,waiter_id) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    let data = [];
    const results = await client
      .db("MenusDigitales")
      .collection(business_id)
      .find({"current_waiter.id": waiter_id})
      .forEach((x) => data.push({
        "table_id": x.table_id,
        "active": x.active,
        "capacity": x.capacity,
        "name": x.name,
        "reserved": x.reserved,
        "current_orders":x.current_orders
      })); // necesita el forEach para terminar de esperar a la base de datos de lo contrario envía un cursor de Mongo
    return data;
    return results;
  } catch (err) {
    console.log(err); // output to netlify function log
  } finally {
    await client.close();
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod == "POST") {
    const { 
        waiter_id,
        business_id } = JSON.parse(event.body)
    // console.log("=====user_id=======");
    // console.log(user_id);
    // console.log(typeof user_id);
    // console.log("================");

    try {
        if(typeof business_id == 'string'){
            if(typeof waiter_id == 'number'){
                const data = await getData(business_id,waiter_id);
                console.log(data);
                if (data.length !=0){    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ data: data }),
                    };
                }else{
                    return {
                        statusCode: 200,
                        headers,
                        body:JSON.stringify({
                            error_code:3,
                            msg: "No se encontraron datos con estos parametros",
                         }),
                    };
                }
            }else{      
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error_code:2,
                        msg: "El Business_Id tiene que ser tipo string",
                    }),
                };
            }
        }else{    
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error_code:2,
                    msg: "El business_id tiene que ser tipo string",
                }),
            };
        }
      //   console.log("=====DATA=======");
      //   console.log(data);
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