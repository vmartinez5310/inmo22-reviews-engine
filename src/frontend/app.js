// 1. CONFIGURACIÓN
import { CONFIG } from "./config.js";
const API_URL = CONFIG.API_URL;
const { GAP } = CONFIG.SETTINGS;
const skeletonCount = CONFIG.SETTINGS.SKELETON_COUNT;

const carousel = document.getElementById("reviews-carousel");
const dotsContainer = document.getElementById("dots-container");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentIndex = 0;
let reviewsData = [];

// 2. INICIO
async function initReviews() {
    // Estado de carga inicial
    prevBtn.classList.add('loading-nav');
    nextBtn.classList.add('loading-nav');
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        reviewsData = data.reviews || [];
        const schemaJSON = data.schema;

        if (reviewsData.length === 0) {
            document.querySelector(".inmo-reviews-section").style.display = "none";
            return;
        }

        renderCards();
        setupPagination();

        // SEO/IA Injection
        const schemaScript = document.createElement("script");
        schemaScript.type = "application/ld+json";
        schemaScript.text = JSON.stringify(schemaJSON);
        document.head.appendChild(schemaScript);

        // Quitar estado de carga
        prevBtn.classList.remove('loading-nav');
        nextBtn.classList.remove('loading-nav');

    } catch (error) {
        console.error("Error al conectar con Inmobiliarte Data:", error);
    }
}

// 3. RENDERIZADO
function renderCards() {
    carousel.innerHTML = ''; // Borra Skeletons
    reviewsData.forEach((item) => {
        const initial = item.nombre ? item.nombre.charAt(0).toUpperCase() : "I";
        const fecha = new Date(item.timestamp);
        const hoy = new Date();
        const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
        const tiempoTxt = dias === 0 ? "Hoy" : (dias === 1 ? "Ayer" : `Hace ${dias} días`);

        const card = document.createElement("div");
        card.className = "inmo-card";
        card.innerHTML = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div class="inmo-stars">${"★".repeat(item.estrellas)}${"☆".repeat(5 - item.estrellas)}</div>
                    <span style="font-size:10px; color:#aaa;">${tiempoTxt}</span>
                </div>
                <span style="background:#eee; padding:2px 8px; border-radius:10px; font-size:10px; color:var(--inmo-magenta); font-weight:bold;">
                    ${item.servicio || "Asesoría"}
                </span>
                <p class="inmo-comment">"${item.comentario}"</p>
                ${item.respuesta ? `
                    <div style="background:var(--inmo-light-gray); padding:10px; border-radius:8px; margin-top:10px; border-left:3px solid var(--inmo-magenta);">
                        <p style="font-size:11px; margin:0; font-weight:bold; color:var(--inmo-dark);">Respuesta de Inmobiliarte 22:</p>
                        <p style="font-size:11px; margin:0; color:var(--inmo-gray);">${item.respuesta}</p>
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

// 4. PAGINACIÓN
function setupPagination() {
    const windowWidth = window.innerWidth;
    const visibleCards = windowWidth > 992 ? 3 : (windowWidth > 600 ? 2 : 1);
    const totalPages = Math.ceil(reviewsData.length / visibleCards);

    // Reset de índice si el cambio de pantalla desborda las páginas
    if (currentIndex >= totalPages) currentIndex = totalPages - 1;

    const shouldShowNav = reviewsData.length > visibleCards;
    prevBtn.style.display = shouldShowNav ? "flex" : "none";
    nextBtn.style.display = shouldShowNav ? "flex" : "none";

    dotsContainer.innerHTML = "";
    if (shouldShowNav) {
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("div");
            dot.className = `inmo-dot ${i === currentIndex ? "active" : ""}`;
            dot.onclick = () => goToPage(i, visibleCards);
            dotsContainer.appendChild(dot);
        }
    }
    updateCarousel(visibleCards);
}

function goToPage(pageIndex, visibleCards) {
    currentIndex = pageIndex;
    updateCarousel(visibleCards);
}

function updateCarousel(visibleCards) {
    const cardElement = document.querySelector(".inmo-card");
    if (!cardElement) return;

    const gap = 20;
    const cardWidth = cardElement.offsetWidth;
    // Mueve exactamente el bloque de tarjetas visibles
    const moveAmount = (cardWidth + gap) * (currentIndex * visibleCards);

    carousel.style.transform = `translateX(-${moveAmount}px)`;

    const dots = document.querySelectorAll(".inmo-dot");
    dots.forEach((dot, index) => dot.classList.toggle("active", index === currentIndex));

    const totalPages = Math.ceil(reviewsData.length / visibleCards);
    prevBtn.style.opacity = currentIndex === 0 ? "0.3" : "1";
    prevBtn.style.pointerEvents = currentIndex === 0 ? "none" : "auto";
    nextBtn.style.opacity = currentIndex >= totalPages - 1 ? "0.3" : "1";
    nextBtn.style.pointerEvents = currentIndex >= totalPages - 1 ? "none" : "auto";
}

// 5. NAVEGACIÓN
prevBtn.onclick = () => {
    const visibleCards = window.innerWidth > 992 ? 3 : (window.innerWidth > 600 ? 2 : 1);
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel(visibleCards);
    }
};

nextBtn.onclick = () => {
    const visibleCards = window.innerWidth > 992 ? 3 : (window.innerWidth > 600 ? 2 : 1);
    const totalPages = Math.ceil(reviewsData.length / visibleCards);
    if (currentIndex < totalPages - 1) {
        currentIndex++;
        updateCarousel(visibleCards);
    }
};

window.onresize = () => {
    setupPagination();
};

initReviews();