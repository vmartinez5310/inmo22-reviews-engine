function doGet() {
  const cache = CacheService.getScriptCache();
  const cachedResponse = cache.get('ier_api_v3');
  
  // 1. Retorno ultra-rápido si existe caché
  if (cachedResponse) {
    return ContentService.createTextOutput(cachedResponse)
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  rows.shift(); // Removemos encabezados
  
  const reviews = [];
  const schemaReviews = [];

  // 2. Procesamiento y filtrado en un solo ciclo
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    const isAutorizado = (row[10] === true || String(row[10]).toUpperCase().trim() === "TRUE");
    const isAprobado = (String(row[11]).toUpperCase().trim() === "SI");

    if (isAutorizado && isAprobado) {
      // Objeto ligero solo con lo que consume el frontend
      const review = {
        timestamp: row[2],   
        estrellas: row[3],   
        nombre: row[4],      
        zona: row[5],        
        comentario: row[6],  
        respuesta: row[13],  
        servicio: row[14] || "Asesoría"
      };
      
      reviews.push(review);

      // Objeto paralelo para SEO
      schemaReviews.push({
        "@type": "Review",
        "reviewRating": { "@type": "Rating", "ratingValue": review.estrellas },
        "author": { "@type": "Person", "name": review.nombre },
        "reviewBody": review.comentario,
        ...(review.respuesta && { "reviewAnswer": { "@type": "Answer", "text": review.respuesta } })
      });
    }
  }

  // 3. Empaquetado de la respuesta con Schema unificado
  const response = JSON.stringify({
    reviews: reviews,
    schema: {
      "@context": "https://schema.org/",
      "@type": "RealEstateAgent", 
      "name": "Inmobiliarte 22", 
      "image": "URL_LOGO_AQUI", // TODO: Actualizar
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "CDMX",
        "addressCountry": "MX"
      },
      "review": schemaReviews
    }
  });

  // Guardamos en caché por 15 minutos
  cache.put('ier_api_v3', response, 900);
  return ContentService.createTextOutput(response)
  
    .setMimeType(ContentService.MimeType.JSON);
}
// 🧪 HERRAMIENTA 1: Ver el JSON final que entregará la API
function testearAPI() {
  const respuesta = doGet();
  const jsonString = respuesta.getContent();
  const data = JSON.parse(jsonString);
  
  console.log("=== JSON FINAL DE LA API ===");
  console.log(data);
}

// 🔍 HERRAMIENTA 2: Rayos X a tus columnas K y L (Para ver por qué filtra)
function depurarFiltros() {
  // 🚨 TIP: Si tienes varias pestañas, cambia .getActiveSheet() por .getSheetByName("NombreDeTuPestaña")
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  
  console.log(`Total de filas encontradas (incluyendo encabezados): ${rows.length}`);
  rows.shift(); // Quitamos los encabezados
  
  rows.forEach((row, index) => {
    const filaReal = index + 2; // +2 porque el array empieza en 0 y quitamos 1 de encabezados
    const autorizoRaw = row[10]; // Columna K
    const aprobadoRaw = row[11]; // Columna L
    
    const isAutorizado = (autorizoRaw === true || String(autorizoRaw).toUpperCase().trim() === "TRUE");
    // Agregamos la validación de la tilde por si acaso
    const isAprobado = (String(aprobadoRaw).toUpperCase().trim().replace('Í', 'I') === "SI");
    
    console.log(`--- Fila ${filaReal} ---`);
    console.log(`Col K (Autorizo): "${autorizoRaw}" -> Evaluación: ${isAutorizado ? "✅ PASA" : "❌ FALLA"}`);
    console.log(`Col L (Aprobado): "${aprobadoRaw}" -> Evaluación: ${isAprobado ? "✅ PASA" : "❌ FALLA"}`);
    
    if (isAutorizado && isAprobado) {
      console.log(`🎉 La fila ${filaReal} pasará al JSON final.`);
    }
  });
}