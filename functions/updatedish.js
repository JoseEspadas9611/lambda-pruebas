/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (business_id,product_id,product_fields) => {
  const { MONGO_URI } = process.env;
  const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    d = new Date()
    product_fields.ingredients = product_fields.ingredients.length == 0 ? [] :product_fields.ingredients.map(ingredient => ({id: Math.floor(Math.random() * 999) , name:ingredient.name}))
    product_fields.extras = product_fields.extras.length == 0 ? [] :product_fields.extras.map(extra =>({id: Math.floor(Math.random() * 999), name:extra.name, price: parseInt(extra.price)}))
    const results = await client
      .db("MenusDigitalesProductos")
      .collection(business_id)
      .updateOne({ id: product_id },{$set:product_fields});
    return results;
  } catch (err) {
    console.log(err); // output to netlify function log
  } finally {
    await client.close();
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod == "POST") {
    const { business_id,product_id,product_fields} = JSON.parse(event.body);
    try {
      if(typeof business_id == "string"){
        if (typeof product_id == "number"){
            const data = await getData(business_id,product_id,product_fields);
            //console.log(data);
            const { modifiedCount } = data;
            if(modifiedCount){
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
                error_code:2,
                msg: 'El product_id debe ser un number'}; 
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