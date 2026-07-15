/**
 * IER - Inmo22 Engine Reviews
 * Arquitectura de Micro-Frontend con SEO, Modal Fix y Responsividad Total
 */

let reviewsData = [];
let currentIndex = 0;

export async function initIER(config) {
    // Respetando tu ID original de target
    const root = document.querySelector(config.target || '#ier-app-root');
    if (!root) return;

    // 1. ESTRUCTURA HTML INICIAL (Respetando tus IDs originales)
    root.innerHTML = `
        <section class="inmo-reviews-section loading-state">
            <h2 class="inmo-title">Lo que dicen nuestros clientes</h2>
            
            <div class="inmo-carousel-container">
                <button id="prevBtn" class="nav-btn inmo-prev">&#10094;</button>
                
                <div class="inmo-carousel-viewport">
                    <div id="reviews-carousel" class="inmo-carousel"></div>
                </div>
                
                <button id="nextBtn" class="nav-btn inmo-next">&#10095;</button>
            </div>

            <div id="dots-container" class="inmo-dots-container"></div>
        </section>

        <div id="ier-modal" class="ier-modal">
            <div class="ier-modal-content">
                <span class="close-modal" id="closeModal">&times;</span>
                <div id="ier-modal-body"></div>
            </div>
        </div>
    `;

    const carousel = document.getElementById("reviews-carousel");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const rootSection = root.querySelector('.inmo-reviews-section');

    // 2. SKELETONS RESPONSIVE
    carousel.innerHTML = Array(3).fill(`
        <div class="inmo-card skeleton-card">
            <div class="skeleton-header"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-footer">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-details"></div>
            </div>
        </div>
    `).join('');

    try {
        const response = await fetch(config.endpoint);
        const data = await response.json();
        
        reviewsData = data.reviews || [];

        if (reviewsData.length === 0) {
            root.style.display = "none";
            return;
        }

        // SEO Schema Injection (Corregido para Inspector de Google)
        if (data.schema) {
            const oldSchema = document.getElementById('ier-schema-seo');
            if (oldSchema) oldSchema.remove();
            const schemaScript = document.createElement("script");
            schemaScript.id = 'ier-schema-seo';
            schemaScript.type = "application/ld+json";
            schemaScript.text = JSON.stringify(data.schema);
            document.head.appendChild(schemaScript);
        }

        // Render y Eventos
        renderCards(carousel, config);
        setupPagination(carousel, prevBtn, nextBtn);

        prevBtn.onclick = () => move(carousel, -1, prevBtn, nextBtn);
        nextBtn.onclick = () => move(carousel, 1, prevBtn, nextBtn);
        
        // Fix responsive en resize
        let resizeTimer;
        window.onresize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setupPagination(carousel, prevBtn, nextBtn);
                update(carousel, prevBtn, nextBtn);
            }, 100);
        };

        // Estado final: quitamos loading state
        rootSection.classList.remove('loading-state');

        // Lógica de cierre de Modal
        const modal = document.getElementById('ier-modal');
        document.getElementById('closeModal').onclick = () => modal.style.display = "none";
        window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

    } catch (error) {
        console.error("IER Error:", error);
        root.style.display = "none";
    }
}

const avatarClasses = ['avatar-magenta', 'avatar-blue', 'avatar-green', 'avatar-orange', 'avatar-purple'];

function renderCards(carousel, config) {
    carousel.innerHTML = ''; 
    
    reviewsData.forEach((item, index) => {
        const initial = item.nombre ? item.nombre.charAt(0).toUpperCase() : "I";
        const randomClass = avatarClasses[index % avatarClasses.length];
        
        // --- CORRECCIÓN DE FECHA DINÁMICA ---
       const tiempoTxt = obtenerTiempoRelativo(item.timestamp);

        const preguntaFinal = item.pregunta || config.question || "¿Qué destacarías de nuestro servicio?";

        const card = document.createElement("div");
        card.className = `inmo-card`;
        card.innerHTML = `
            <div class="card-content">
                <div class="card-header">
                    <div class="inmo-stars">${"★".repeat(item.estrellas)}${"☆".repeat(5 - item.estrellas)}</div>
                    <span class="time-stamp">${tiempoTxt}</span>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <span class="service-tag">${item.servicio || "Asesoría"}</span>
                </div>
                
                <div class="comment-wrapper">
                    <span class="review-question">${preguntaFinal}</span>
                    <p class="inmo-comment review-trigger" data-index="${index}">"${item.comentario}"</p>
                </div>

                ${item.respuesta ? `
                    <div class="inmo-reply">
                        <p style="font-size:11px; margin:0 0 5px 0; font-weight:bold; color: var(--inmo-dark);">Respuesta de Inmobiliarte 22:</p>
                        <p style="font-size:11px; margin:0; color: var(--inmo-gray); line-height:1.4;">${item.respuesta}</p>
                    </div>
                ` : ""}
            </div>
            <div class="inmo-footer">
                <div class="inmo-avatar ${randomClass}">${initial}</div>
                <div class="inmo-user-details">
                    <span class="inmo-name">${item.nombre}</span>
                    <span class="inmo-property">${item.zona || "CDMX"}</span>
                </div>
            </div>
        `;

        card.querySelector('.review-trigger').onclick = () => {
            // Lógica del modal (mantener igual a la versión anterior)
            openModal(reviewsData[index]);
        };

        carousel.appendChild(card);
    });
}

function openModal(data) {
    const modalBody = document.getElementById('ier-modal-body');
    const initial = data.nombre ? data.nombre.charAt(0).toUpperCase() : "I";
    
    // RE-CONSTRUCCIÓN DEL MODAL CON FORMATO CORPORATIVO (Soluciona image_9.png)
    modalBody.innerHTML = `
        <div style="margin-bottom: 25px; padding-right: 20px;">
            <div class="inmo-stars" style="color:#cfa15e; font-size:18px; margin-bottom:10px;">${"★".repeat(data.estrellas)}</div>
            <span class="service-tag" style="background:#f4eff2; padding:4px 8px; border-radius:4px; font-size:10px; color:#a31d5d; font-weight:800; text-transform:uppercase;">${data.servicio || "Asesoría"}</span>
        </div>
        
        <p class="inmo-comment" style="font-size:15px; font-style:italic; line-height:1.6; color:#333; -webkit-line-clamp: unset; overflow: visible; margin-bottom: 25px;">
            "${data.comentario}"
        </p>
        
        ${data.respuesta ? `
            <div class="inmo-reply" style="margin-bottom: 25px; padding:15px;">
                <strong style="font-size:12px; color:var(--inmo-magenta); text-transform:uppercase; display:block; margin-bottom:8px;">Respuesta de Inmobiliarte 22:</strong>
                <p style="font-size:13px; margin:0; color:#555; line-height:1.5;">${data.respuesta}</p>
            </div>
        ` : ""}
        
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 0;">
        
        <div class="inmo-footer" style="margin-top: 20px; border:none; padding:0;">
            <div class="inmo-avatar avatar-magenta">${initial}</div>
            <div class="inmo-user-details">
                <span class="inmo-name" style="font-size:14px;">${data.nombre}</span>
                <span class="inmo-property" style="font-size:12px;">${data.zona || "CDMX"}</span>
            </div>
        </div>
    `;
    document.getElementById('ier-modal').style.display = "flex";
}

// Lógica de Carrusel por Grupos (Tu original adaptada para responsive)
function getVisibleCards() {
    if (window.innerWidth > 992) return 3;
    if (window.innerWidth > 600) return 2;
    return 1; // Móvil: 1 tarjeta
}

function setupPagination(carousel, prevBtn, nextBtn) {
    const visible = getVisibleCards();
    const dotsContainer = document.getElementById("dots-container");
    const totalPages = Math.ceil(reviewsData.length / visible);
    
    if (currentIndex >= totalPages) currentIndex = totalPages > 0 ? totalPages - 1 : 0;
    
    dotsContainer.innerHTML = "";
    const shouldShowNav = reviewsData.length > visible;
    
    if (shouldShowNav) {
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("div");
            dot.className = `inmo-dot ${i === currentIndex ? "active" : ""}`;
            dot.onclick = () => { currentIndex = i; update(carousel, prevBtn, nextBtn); };
            dotsContainer.appendChild(dot);
        }
    }
    update(carousel, prevBtn, nextBtn);
}

function move(carousel, delta, prevBtn, nextBtn) {
    const visible = getVisibleCards();
    const totalPages = Math.ceil(reviewsData.length / visible);
    const newIndex = currentIndex + delta;
    
    if (newIndex >= 0 && newIndex < totalPages) {
        currentIndex = newIndex;
        update(carousel, prevBtn, nextBtn);
    }
}

function update(carousel, prevBtn, nextBtn) {
    const visible = getVisibleCards();
    
    // Fix para móvil: gap adaptable
    const gap = window.innerWidth > 768 ? 20 : 15; 
    
    const firstCard = carousel.querySelector('.inmo-card');
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const offset = (cardWidth + gap) * (currentIndex * visible);
    
    carousel.style.transform = `translateX(-${offset}px)`;
    
    document.querySelectorAll(".inmo-dot").forEach((d, i) => d.classList.toggle("active", i === currentIndex));
    
    const totalPages = Math.ceil(reviewsData.length / visible);
    prevBtn.disabled = currentIndex === 0;
    
    // Sutil en móvil
    const op = window.innerWidth > 768 ? "0.3" : "0.15";
    prevBtn.style.opacity = currentIndex === 0 ? op : "1";
    
    nextBtn.disabled = currentIndex >= totalPages - 1;
    nextBtn.style.opacity = currentIndex >= totalPages - 1 ? op : "1";
}

// --- NUEVO CALCULADOR DE TIEMPO RELATIVO ---
function obtenerTiempoRelativo(timestamp) {
    const fechaReview = new Date(timestamp);
    const hoy = new Date();
    
    // Calculamos la diferencia base en días
    const diferenciaDias = Math.floor((hoy - fechaReview) / (1000 * 60 * 60 * 24));

    if (diferenciaDias <= 0) return "Hoy";
    if (diferenciaDias === 1) return "Ayer";

    // Lógica de escalado (Años, Meses, Semanas, Días)
    if (diferenciaDias >= 365) {
        const anios = Math.floor(diferenciaDias / 365);
        return anios === 1 ? "Hace 1 año" : `Hace ${anios} años`;
    }
    
    if (diferenciaDias >= 30) {
        const meses = Math.floor(diferenciaDias / 30);
        return meses === 1 ? "Hace 1 mes" : `Hace ${meses} meses`;
    }
    
    if (diferenciaDias >= 7) {
        const semanas = Math.floor(diferenciaDias / 7);
        return semanas === 1 ? "Hace 1 semana" : `Hace ${semanas} semanas`;
    }

    return `Hace ${diferenciaDias} días`;
}