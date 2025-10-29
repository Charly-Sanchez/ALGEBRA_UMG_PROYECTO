// JavaScript para documentación - documentation.js

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades
    initFAQ();
    initSmoothScrolling();
    initAnimations();
    initCodeHighlighting();
    initTechnicalFeatures();
    
    console.log('Documentación inicializada correctamente');
});

/**
 * Funcionalidad FAQ - Acordeón
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Cerrar todos los demás items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle del item actual
            item.classList.toggle('active', !isActive);
        });
    });
}

/**
 * Navegación suave entre secciones
 */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Animaciones de entrada para elementos
 */
function initAnimations() {
    // Crear el observer para animaciones de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Elementos a animar
    const animatedElements = document.querySelectorAll(`
        .functionality-card,
        .step,
        .example-card,
        .component-card,
        .algorithm-card,
        .api-section,
        .install-section
    `);
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });
    
    // Añadir estilos de animación dinámicamente
    const style = document.createElement('style');
    style.textContent = `
        .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in-up.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .functionality-card:nth-child(2) { transition-delay: 0.1s; }
        .functionality-card:nth-child(3) { transition-delay: 0.2s; }
        .step:nth-child(2) { transition-delay: 0.1s; }
        .step:nth-child(3) { transition-delay: 0.2s; }
        .step:nth-child(4) { transition-delay: 0.3s; }
        .step:nth-child(5) { transition-delay: 0.4s; }
    `;
    document.head.appendChild(style);
}

/**
 * Resaltado de código mejorado
 */
function initCodeHighlighting() {
    // Si Prism.js está disponible, configurarlo
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
        
        // Añadir números de línea a bloques de código largos
        document.querySelectorAll('pre code').forEach(block => {
            const lines = block.textContent.split('\n').length;
            if (lines > 5) {
                block.classList.add('line-numbers');
            }
        });
    }
    
    // Funcionalidad de copia para bloques de código
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        const wrapper = block.closest('pre');
        if (!wrapper) return;
        
        // Crear botón de copia
        const copyButton = document.createElement('button');
        copyButton.textContent = '📋 Copiar';
        copyButton.className = 'copy-button';
        copyButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #4a5568;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Hacer el wrapper relativo para posicionar el botón
        wrapper.style.position = 'relative';
        
        // Mostrar botón al hacer hover
        wrapper.addEventListener('mouseenter', () => {
            copyButton.style.opacity = '1';
        });
        
        wrapper.addEventListener('mouseleave', () => {
            copyButton.style.opacity = '0';
        });
        
        // Funcionalidad de copia
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                copyButton.textContent = '✅ Copiado';
                setTimeout(() => {
                    copyButton.textContent = '📋 Copiar';
                }, 2000);
            } catch (err) {
                // Fallback para navegadores sin clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = block.textContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyButton.textContent = '✅ Copiado';
                setTimeout(() => {
                    copyButton.textContent = '📋 Copiar';
                }, 2000);
            }
        });
        
        wrapper.appendChild(copyButton);
    });
}

/**
 * Funcionalidades específicas para documentación técnica
 */
function initTechnicalFeatures() {
    // Solo para la página de documentación técnica
    if (!document.body.classList.contains('technical-doc')) return;
    
    // Índice de contenidos flotante
    createFloatingTOC();
    
    // Expandir/colapsar secciones de código
    initCodeSectionToggle();
    
    // Búsqueda en la documentación
    initDocumentationSearch();
}

/**
 * Crear tabla de contenidos flotante
 */
function createFloatingTOC() {
    const headings = document.querySelectorAll('h2, h3');
    if (headings.length < 3) return;
    
    const toc = document.createElement('div');
    toc.className = 'floating-toc';
    toc.innerHTML = '<h4>Contenidos</h4><ul></ul>';
    
    const tocList = toc.querySelector('ul');
    
    headings.forEach((heading, index) => {
        // Añadir ID si no tiene
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.className = heading.tagName.toLowerCase();
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
    
    // Estilos para la TOC flotante
    const tocStyles = `
        .floating-toc {
            position: fixed;
            top: 120px;
            right: 20px;
            width: 250px;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border-radius: 10px;
            padding: 1rem;
            max-height: 60vh;
            overflow-y: auto;
            z-index: 50;
            transform: translateX(280px);
            transition: transform 0.3s ease;
        }
        
        .floating-toc.visible {
            transform: translateX(0);
        }
        
        .floating-toc h4 {
            margin: 0 0 1rem 0;
            color: var(--primary-color);
            font-size: 1rem;
        }
        
        .floating-toc ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .floating-toc li {
            margin-bottom: 0.5rem;
        }
        
        .floating-toc a {
            text-decoration: none;
            color: var(--text-secondary);
            font-size: 0.9rem;
            transition: color 0.3s ease;
            display: block;
            padding: 0.25rem 0;
        }
        
        .floating-toc a:hover,
        .floating-toc a.active {
            color: var(--secondary-color);
        }
        
        .floating-toc a.h3 {
            padding-left: 1rem;
            font-size: 0.8rem;
        }
        
        @media (max-width: 1400px) {
            .floating-toc {
                display: none;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = tocStyles;
    document.head.appendChild(style);
    
    document.body.appendChild(toc);
    
    // Mostrar TOC después de un pequeño delay
    setTimeout(() => {
        toc.classList.add('visible');
    }, 1000);
    
    // Actualizar enlace activo según scroll
    const tocLinks = toc.querySelectorAll('a');
    
    window.addEventListener('scroll', () => {
        let currentHeading = null;
        
        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 150) {
                currentHeading = heading;
            }
        });
        
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (currentHeading && link.getAttribute('href') === `#${currentHeading.id}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Navegación suave para la TOC
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                window.scrollTo({
                    top: target.offsetTop - headerHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Toggle para secciones de código largas
 */
function initCodeSectionToggle() {
    const longCodeBlocks = document.querySelectorAll('pre code');
    
    longCodeBlocks.forEach(block => {
        const lines = block.textContent.split('\n').length;
        if (lines > 20) {
            const wrapper = block.closest('pre');
            wrapper.classList.add('collapsible-code');
            
            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'Ver código completo ▼';
            toggleButton.className = 'code-toggle';
            
            wrapper.parentNode.insertBefore(toggleButton, wrapper);
            
            toggleButton.addEventListener('click', () => {
                wrapper.classList.toggle('expanded');
                toggleButton.textContent = wrapper.classList.contains('expanded') 
                    ? 'Colapsar código ▲' 
                    : 'Ver código completo ▼';
            });
        }
    });
    
    // Estilos para código colapsable
    const style = document.createElement('style');
    style.textContent = `
        .collapsible-code {
            max-height: 300px;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .collapsible-code.expanded {
            max-height: none;
        }
        
        .code-toggle {
            background: var(--secondary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            transition: background-color 0.3s ease;
        }
        
        .code-toggle:hover {
            background: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Búsqueda simple en la documentación
 */
function initDocumentationSearch() {
    // Crear caja de búsqueda
    const searchContainer = document.createElement('div');
    searchContainer.className = 'doc-search';
    searchContainer.innerHTML = `
        <input type="text" placeholder="Buscar en la documentación..." />
        <div class="search-results"></div>
    `;
    
    const searchStyles = `
        .doc-search {
            position: fixed;
            top: 80px;
            left: 20px;
            width: 300px;
            z-index: 60;
        }
        
        .doc-search input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 0.9rem;
            background: white;
            box-shadow: var(--shadow);
        }
        
        .doc-search input:focus {
            outline: none;
            border-color: var(--secondary-color);
        }
        
        .search-results {
            background: white;
            border: 1px solid var(--border-color);
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            display: none;
            box-shadow: var(--shadow);
        }
        
        .search-result {
            padding: 0.75rem;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .search-result:hover {
            background: var(--bg-secondary);
        }
        
        .search-result:last-child {
            border-bottom: none;
        }
        
        .search-result-title {
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 0.25rem;
        }
        
        .search-result-snippet {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }
        
        @media (max-width: 1200px) {
            .doc-search {
                display: none;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.textContent = searchStyles;
    document.head.appendChild(style);
    
    document.body.appendChild(searchContainer);
    
    const searchInput = searchContainer.querySelector('input');
    const searchResults = searchContainer.querySelector('.search-results');
    
    // Indexar contenido para búsqueda
    const searchIndex = [];
    document.querySelectorAll('h2, h3, h4, p, li').forEach(element => {
        const text = element.textContent.trim();
        if (text.length > 10) {
            searchIndex.push({
                element: element,
                text: text.toLowerCase(),
                title: getElementTitle(element)
            });
        }
    });
    
    // Función de búsqueda
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            const results = searchIndex
                .filter(item => item.text.includes(query))
                .slice(0, 8);
            
            if (results.length > 0) {
                searchResults.innerHTML = results.map(result => `
                    <div class="search-result" data-element-id="${getElementId(result.element)}">
                        <div class="search-result-title">${result.title}</div>
                        <div class="search-result-snippet">${getSnippet(result.text, query)}</div>
                    </div>
                `).join('');
                
                searchResults.style.display = 'block';
                
                // Añadir event listeners a los resultados
                searchResults.querySelectorAll('.search-result').forEach(resultEl => {
                    resultEl.addEventListener('click', () => {
                        const elementId = resultEl.dataset.elementId;
                        const targetElement = document.getElementById(elementId);
                        if (targetElement) {
                            const headerHeight = document.querySelector('.header').offsetHeight;
                            window.scrollTo({
                                top: targetElement.offsetTop - headerHeight - 20,
                                behavior: 'smooth'
                            });
                            searchInput.value = '';
                            searchResults.style.display = 'none';
                        }
                    });
                });
            } else {
                searchResults.innerHTML = '<div class="search-result">No se encontraron resultados</div>';
                searchResults.style.display = 'block';
            }
        }, 300);
    });
    
    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

/**
 * Funciones auxiliares para búsqueda
 */
function getElementTitle(element) {
    if (element.tagName.match(/^H[2-6]$/)) {
        return element.textContent;
    }
    
    const nearestHeading = findNearestHeading(element);
    return nearestHeading ? nearestHeading.textContent : 'Contenido';
}

function findNearestHeading(element) {
    let current = element;
    while (current && current !== document.body) {
        const heading = current.querySelector('h2, h3, h4');
        if (heading) return heading;
        
        current = current.previousElementSibling;
        if (!current) {
            current = element.parentElement;
            if (current) {
                const prevHeading = Array.from(current.querySelectorAll('h2, h3, h4'))
                    .reverse()[0];
                if (prevHeading) return prevHeading;
            }
        }
    }
    return null;
}

function getElementId(element) {
    if (element.id) return element.id;
    
    const id = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    element.id = id;
    return id;
}

function getSnippet(text, query) {
    const index = text.indexOf(query);
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 50);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    // Resaltar el término de búsqueda
    const regex = new RegExp(`(${query})`, 'gi');
    snippet = snippet.replace(regex, '<strong>$1</strong>');
    
    return snippet;
}

// Funciones de utilidad adicionales
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
