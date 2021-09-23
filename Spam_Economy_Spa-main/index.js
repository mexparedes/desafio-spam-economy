const enviar = require("./mailer");
const url = require("url");
const http = require("http");
const fs = require("fs");
const axios = require("axios");
const escribeArchivo = require("./respaldo.js");
let textoSalida = "";

http
  .createServer(function (req, res) {
    // 2. Crear una función que reciba la lista de correos, asunto y contenido a enviar. Esta
    // función debe retornar una promesa

    async function getCorreosAsuntoContenido() {
      let { correos, asunto, contenido } = url.parse(req.url, true).query;
      //   3. Realizar una petición a la api de mindicador.cl y preparar un template que incluya los
      //   valores del dólar, euro, uf y utm. Este template debe ser concatenado al mensaje
      //   descrito por el usuario en el formulario HTML.
      const { data } = await axios.get("https://mindicador.cl/api");
      textoSalida = ` ${contenido}\n \n
                        Hola! Los indicadores económicos de hoy son los siguientes:\n \n
                        El valor del dolar el dia de hoy es:${data.dolar.valor} \n \n
                        El valor del euro el dia de hoy es:${data.euro.valor} \n \n
                        El valor del uf el dia de hoy es:${data.uf.valor} \n \n
                        El valor del utm el dia de hoy es:${data.utm.valor}`;

      return { correos, asunto, textoSalida };
    }

    if (req.url.startsWith("/")) {
      res.setHeader("content-type", "text/html");
      fs.readFile("index.html", "utf8", (err, data) => {
        res.write(data);
      });
    }
    if (req.url.startsWith("/mailing")) {
      getCorreosAsuntoContenido().then((data) => {
        const { correos, asunto, textoSalida } = data;
        if (correos !== "" && asunto !== "" && textoSalida !== "" && correos.includes(",")) {
          escribeArchivo(data, textoSalida);
          enviar(correos.split(","), asunto, textoSalida);
          // 4. Enviar un mensaje de éxito o error por cada intento de envío de correos electrónicos
          fs.readFile("index.html", "utf8", (err, data) => {
            res.write(`<p class='alert alert-info w-25 m-auto text-center'>Correo enviado con éxito</p>`);
            res.end();
          });
        } else {
          res.write(`<p class='alert alert-info w-25 m-auto text-danger text-center'>Faltan datos por llenar o intenta enviar solo un (1) correo</p>`);
          res.end();
        }
      });
    }
  })
  .listen(3000, () => console.log("Sirviendo en el puerto 3000"));
