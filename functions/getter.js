require("dotenv").config();
/* Simulación de llamada a la base de datos */
const tasaConversion = (moneda, anio, password) => {
  if (password == "qwerty01234") {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(data[moneda][anio]), 400);
    });
  }
  return JSON.stringify({ error: "No tienes permiso" });
};

exports.handler = async function (event, context, callback) {
  // Tres parámetros que tiene la función: event, context, callback
  /*
    event:
        Nos trae todo lo que llegó del navegador o del endopoint final
        Incluye los headers
    context:
        Info o metadatos "extras" desde la llamada a la API
    callback:
        La función que se ejecuta después de realizar la lógica de la lambda
        Es la función que responde al que llamó a la API
    */

  //   const DB_URL = "http://mi-base-de-datos.com/api";
  const { MI_APPI_KEY } = process.env;
  const solicitudAMongo = "qwerty01234";
  console.log("Variable de entorno: ", MI_APPI_KEY);
  console.log("EVENT");
  //console.log(event);

  let cantidad = event.queryStringParameters.dolar * 20.69;
  
  let moneda =event.queryStringParameters['moneda'] 
  let year = event.queryStringParameters.year

  let monedasDelMundo = {
    euros: {
      2020: 23.51,
      2021: 25.63,
    },
    dolares: {
      2020: 19.51,
      2021: 20.63,
    },
  };
  // minimo requerido: enviar un 401 Unauthorize y un 200 OK status code
  // si quieres verte pro: 400 Bad request, 403 Forbidden
  if (MI_APPI_KEY == solicitudAMongo) {
    if (Object.keys(monedasDelMundo).includes(moneda)) {
      if(Object.keys(monedasDelMundo[moneda]).includes(year)){
        let body = {'Moneda':moneda,'Year':year};
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(body),
        });
      }else{  
        let body = { mensaje: 'Ese año no esta Parce' };
        callback(null, {
          statusCode: 400,
          body: JSON.stringify(body),
        });
      }
      
    }else{
      let body = { mensaje: 'Esta moneda no esta Carnal' };
      callback(null, {
        statusCode: 400,
        body: JSON.stringify(body),
      });
    }
  } else {
    let body = { mensaje: 'TSSSS.... la calabaceaste en los permisos compi' };
    callback(null, {
      statusCode: 401,
      body: JSON.stringify(body),
    });
  }

};
