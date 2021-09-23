const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// 5. Cada correo debe ser almacenado como un archivo con un nombre identificador
// único en una carpeta “correos”. Usar el paquete UUID para esto.

function escribeArchivo(data, textoSalida) {
  fs.writeFile("correos/" + uuidv4().slice(30), textoSalida, "utf8", () => {
    console.log("archivo creado");
  });
}

module.exports = escribeArchivo;
