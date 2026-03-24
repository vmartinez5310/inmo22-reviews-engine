/**
 * IER - Inmo22 Engine Reviews
 * Arquitectura de Micro-Frontend
 */

let reviewsData = [];
let currentIndex = 0;

export async function initIER(config) {
    const root = document.querySelector(config.target || '#ier-app-root');
    if (!root) return;

    // ESTRUCTURA CORREGIDA: Botones al lado del Viewport
    root.innerHTML = `
        <section class="inmo-reviews-section">
            <h2 class="inmo-title">Lo que dicen nuestros clientes</h2>
            
            <div class="inmo-carousel-container">
                <button id="prevBtn" class="nav-btn inmo-prev loading-nav">&#10094;</button>
                
                <div class="inmo-carousel-viewport">
                    <div id="reviews-carousel" class="inmo-carousel loading-state"></div>
                </div>
                
                <button id="nextBtn" class="nav-btn inmo-next loading-nav">&#10095;</button>
            </div>

            <div id="dots-container" class="inmo-dots-container"></div>
        </section>
    `;

    const carousel = document.getElementById("reviews-carousel");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    // Skeletons inyectados
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

        if (data.schema) {
            const schemaScript = document.createElement("script");
            schemaScript.type = "application/ld+json";
            schemaScript.text = JSON.stringify(data.schema);
            document.head.appendChild(schemaScript);
        }

        renderCards(carousel);
        setupPagination(carousel, prevBtn, nextBtn);

        prevBtn.onclick = () => move(carousel, -1, prevBtn, nextBtn);
        nextBtn.onclick = () => move(carousel, 1, prevBtn, nextBtn);
        window.onresize = () => setupPagination(carousel, prevBtn, nextBtn);

        carousel.classList.remove('loading-state');
        prevBtn.classList.remove('loading-nav');
        nextBtn.classList.remove('loading-nav');

    } catch (error) {
        console.error("IER Error:", error);
        root.style.display = "none";
    }
}

// 4. CREACIÓN DE TARJETAS (Sin clase de tema invasiva)
function renderCards(carousel) {
    carousel.innerHTML = ''; 
    
    reviewsData.forEach((item) => {
        const initial = item.nombre ? item.nombre.charAt(0).toUpperCase() : "I";
        const dias = Math.floor((new Date() - new Date(item.timestamp)) / (1000 * 60 * 60 * 24));
        const tiempoTxt = dias === 0 ? "Hoy" : (dias === 1 ? "Ayer" : `Hace ${dias} días`);

        const card = document.createElement("div");
        card.className = `inmo-card`;
        card.innerHTML = `
            <div class="card-content">
                <div class="card-header">
                    <div class="inmo-stars">${"★".repeat(item.estrellas)}${"☆".repeat(5 - item.estrellas)}</div>
                    <span class="time-stamp">${tiempoTxt}</span>
                </div>
                <span class="service-tag">${item.servicio || "Asesoría"}</span>
                <p class="inmo-comment">"${item.comentario}"</p>
                ${item.respuesta ? `
                    <div class="inmo-reply">
                        <p style="font-size:11px; margin:0; font-weight:bold; color: var(--inmo-dark);">Respuesta de Inmobiliarte 22:</p>
                        <p style="font-size:11px; margin:0; color: var(--inmo-gray);">${item.respuesta}</p>
                    </div>
                ` : ""}
            </div>
            <div class="inmo-footer">
                <div class="inmo-avatar">${initial}</div>
                <div class="inmo-user-details">
                    <span class="inmo-name">${item.nombre}</span>
                    <span class="inmo-property">${item.zona}</span>
                </div>
            </div>
        `;
        carousel.appendChild(card);
    });
}

function getVisibleCards() {
    return window.innerWidth > 992 ? 3 : (window.innerWidth > 600 ? 2 : 1);
}

function setupPagination(carousel, prevBtn, nextBtn) {
    const visible = getVisibleCards();
    const dotsContainer = document.getElementById("dots-container");
    const totalPages = Math.ceil(reviewsData.length / visible);
    
    if (currentIndex >= totalPages) currentIndex = totalPages - 1;
    
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
    const gap = 20; 
    const cardWidth = carousel.querySelector('.inmo-card')?.offsetWidth || 0;
    const offset = (cardWidth + gap) * (currentIndex * visible);
    
    carousel.style.transform = `translateX(-${offset}px)`;
    
    document.querySelectorAll(".inmo-dot").forEach((d, i) => d.classList.toggle("active", i === currentIndex));
    
    const totalPages = Math.ceil(reviewsData.length / visible);
    prevBtn.disabled = currentIndex === 0;
    prevBtn.style.opacity = currentIndex === 0 ? "0.3" : "1";
    
    nextBtn.disabled = currentIndex >= totalPages - 1;
    nextBtn.style.opacity = currentIndex >= totalPages - 1 ? "0.3" : "1";
}