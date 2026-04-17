function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift(); 
  
  const reviews = rows.map(row => {
    return {
      timestamp: row[2],   // Columna C (Fecha de Tally)
      estrellas: row[3],   // Columna D
      nombre: row[4],      // Columna E
      zona: row[5],        // Columna F
      comentario: row[6],  // Columna G
      autorizo: row[10],   // Columna K (Cliente)
      aprobado: row[11],   // Columna L (BROKER - Nuevo)
      respuesta: row[12],  // Columna M (Nuevo)
      servicio: row[13]    // Columna N (Nuevo)
    };
  })
  // FILTRO DOBLE: Que el cliente autorice Y que el broker apruebe con un "SI"
  .filter(r => (r.autorizo === true || r.autorizo === "TRUE") && r.aprobado === "SI");

  // Generar Schema con Respuesta del Broker para la IA
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "RealEstateAgent", // Cambiamos a RealEstateAgent para mejor SEO
    "name": "Inmobiliaria", //Añade el nombre de la in
    "image": "logo_url_aqui", // URL del logo de la inmobiliaria
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "CDMX",
      "addressCountry": "MX"
    },
    "review": reviews.map(r => ({
      "@type": "Review",
      "reviewRating": { "@type": "Rating", "ratingValue": r.estrellas },
      "author": { "@type": "Person", "name": r.nombre },
      "reviewBody": r.comentario,
      "reviewAnswer": r.respuesta ? { "@type": "Answer", "text": r.respuesta } : undefined
    }))
  };

  return ContentService.createTextOutput(JSON.stringify({reviews, schema: schemaData}))
    .setMimeType(ContentService.MimeType.JSON);
}