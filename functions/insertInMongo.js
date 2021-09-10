/* eslint-disable */
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const headers = {
  "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Origin": "*",
};

const getData = async (userId,address) => {
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
      .db("Farmazone")
      .collection("user_addresses")
      .update({ user_id: userId },{$push: {"addresses":{"address":address, "date":new Date()}}})
      
    return results;
  } catch (err) {
    console.log(err); // output to netlify function log
  } finally {
    await client.close();
  }
};

exports.handler = async function (event, context) {
  if (event.httpMethod == "POST") {
    const { user_id } = JSON.parse(event.body);
    const { address } = JSON.parse(event.body);
    //console.log("=====user_id=======");
    //console.log(address);
    // console.log(typeof user_id);
    // console.log("================");

    try {
      const data = await getData(user_id,address);
      //   console.log("=====DATA=======");
      //   console.log(data);
      //   console.log("================");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: data[0] }),
      };
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