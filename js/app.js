/* ==========================================================================
   ATLAS OBSCURA GRAPHICA — INTERACTIVE APPLICATION CONTROLLER
   Manages Hero Stage, Multi-Mold Gallery Grid, Progressive Minimalism Views,
   Scholarly Exegesis Modal, Live SVG Apparatuses, and Chiasmic Collider.
   ========================================================================== */

let currentDiagramKey = 'spencer-brown';
let currentHeroKey = 'spencer-brown';
let currentTab = 'example';
let currentCategory = 'all';
let currentSearchQuery = '';
let currentViewMode = 'compendium'; // 'compendium' | 'minimalist' | 'ledger'

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    populateHeroSelector();
    renderHeroStage(currentHeroKey);
    updateCategoryCounts();
    renderGalleryAndLedger();
    initGlobalTooltips();
    initKeyboardShortcuts();
});

/* --- HERO STAGE CONTROLLER --- */
function populateHeroSelector() {
    const select = document.getElementById('hero-plate-select');
    if (!select) return;
    select.innerHTML = '';
    SPECIMEN_LIST.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.number}: ${item.title.split('(')[0].trim()} (${item.year})`;
        if (item.id === currentHeroKey) opt.selected = true;
        select.appendChild(opt);
    });
}

function renderHeroStage(key) {
    const data = DIAGRAM_DATA[key];
    if (!data) return;
    currentHeroKey = key;

    const select = document.getElementById('hero-plate-select');
    if (select && select.value !== key) select.value = key;

    document.getElementById('hero-ref-code').textContent = `${data.number} • ${data.refCode}`;
    document.getElementById('hero-meta').textContent = `${data.categoryLabel.toUpperCase()} • ${data.provenance.toUpperCase()}`;
    document.getElementById('hero-title').textContent = data.title;
    document.getElementById('hero-origin').textContent = `${data.thinker} (${data.year}) — ${data.subtitle}`;
    document.getElementById('hero-axiom').textContent = data.axiomQuote || '';
    document.getElementById('hero-blurb').textContent = data.blurb;
    document.getElementById('hero-use-case-label').textContent = `${data.useCaseLabel || 'Epistemic & Structural Resonance'}:`;
    document.getElementById('hero-use-case-text').textContent = data.useCase;

    const visualFrame = document.getElementById('hero-visual-frame');
    if (data.mold === 'nocturnal') {
        visualFrame.classList.add('nocturnal-stage');
    } else {
        visualFrame.classList.remove('nocturnal-stage');
    }

    document.getElementById('hero-svg-Mount').innerHTML = data.renderSvg();
    document.getElementById('hero-caption').textContent =
        `Figure ${data.number.replace('PLATE ', '')} — ${data.thinker}, ${data.subtitle}. Hover over diagrammatic elements to inspect formal annotations.`;

    // Update Hero Triad Buttons
    const labels = data.triadLabels || ['I. Visual Plate', 'II. Formal Script', 'III. Apparatus'];
    const triadContainer = document.getElementById('hero-action-triad');
    triadContainer.innerHTML = `
        <button class="btn-action" onclick="openModal('${data.id}', 'example')">
            <span>◈</span> ${labels[0]}
        </button>
        <button class="btn-action" onclick="openModal('${data.id}', 'script')">
            <span>§</span> ${labels[1]}
        </button>
        <button class="btn-action" onclick="openModal('${data.id}', 'builder')">
            <span>⚙</span> ${labels[2]}
        </button>
    `;
}

function stepHeroPlate(delta) {
    const idx = SPECIMEN_LIST.findIndex(s => s.id === currentHeroKey);
    const nextIdx = (idx + delta + SPECIMEN_LIST.length) % SPECIMEN_LIST.length;
    renderHeroStage(SPECIMEN_LIST[nextIdx].id);
}

function randomizeHeroPlate() {
    const candidates = SPECIMEN_LIST.filter(s => s.id !== currentHeroKey);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    renderHeroStage(pick.id);
}

function pinToHero(key) {
    renderHeroStage(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* --- CATEGORY COUNTS & FILTERING --- */
function updateCategoryCounts() {
    const counts = { all: SPECIMEN_LIST.length };
    SPECIMEN_LIST.forEach(s => {
        counts[s.category] = (counts[s.category] || 0) + 1;
    });

    document.querySelectorAll('.filter-chip[data-cat]').forEach(btn => {
        const cat = btn.getAttribute('data-cat');
        const baseLabel = btn.getAttribute('data-label');
        const c = counts[cat] || 0;
        btn.textContent = `${baseLabel} (${c})`;
    });
}

function getFilteredSpecimens() {
    return SPECIMEN_LIST.filter(item => {
        const matchesCat = (currentCategory === 'all') || (item.category === currentCategory);
        if (!matchesCat) return false;
        if (!currentSearchQuery) return true;
        const q = currentSearchQuery.toLowerCase();
        const haystack = [
            item.title,
            item.subtitle,
            item.thinker,
            item.year,
            item.provenance,
            item.categoryLabel,
            item.blurb,
            item.useCase,
            item.axiomQuote || '',
            (item.secondaryTags || []).join(' '),
            item.exegesis ? `${item.exegesis.stakes} ${item.exegesis.mechanics} ${item.exegesis.lineage}` : ''
        ].join(' ').toLowerCase();
        return haystack.includes(q);
    });
}

function filterGrid(category, btnElem) {
    currentCategory = category;
    document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');
    renderGalleryAndLedger();
}

function handleSearchInput(val) {
    currentSearchQuery = val.trim();
    renderGalleryAndLedger();
}

function setViewMode(mode, btnElem) {
    currentViewMode = mode;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');

    const gridEl = document.getElementById('gallery-grid');
    const ledgerEl = document.getElementById('ledger-view');

    if (mode === 'ledger') {
        gridEl.style.display = 'none';
        ledgerEl.classList.add('active');
    } else {
        ledgerEl.classList.remove('active');
        gridEl.style.display = 'grid';
        if (mode === 'minimalist') {
            gridEl.classList.add('view-minimalist');
        } else {
            gridEl.classList.remove('view-minimalist');
        }
    }
}

const FOLIO_CHAPTERS = [
    {
        cat: 'minimalist',
        numeral: 'FOLIO I • RADICAL REDUCTION',
        title: 'Progressively Minimalist & Ontological Calculi',
        epigraph: 'Where maximum deductive, temporal, and ontological complexity emerges from a single line, point, or cleavage.'
    },
    {
        cat: 'theoretical',
        numeral: 'FOLIO II • OPERATIVE TOPOLOGY',
        title: 'Theoretical & Philosophical Topologies',
        epigraph: 'Diagrams that do not merely illustrate philosophy, but operate as deductive engines of semiotics, folding, and desire.'
    },
    {
        cat: 'esoteric',
        numeral: 'FOLIO III • ARS COMBINATORIA',
        title: 'Esoteric, Hermetic & Metaphysical Machines',
        epigraph: 'Rotary parchment volvelles, interpenetrating pyramids, mnemonic shadow-wheels, dyadic hexagrams, and 4D tesseracts.'
    },
    {
        cat: 'experimental',
        numeral: 'FOLIO IV • SPATIAL POETICS',
        title: 'Experimental, Avant-Garde & Literary Chronotopes',
        epigraph: 'Shandean digression curves, polyphonic page constellations, Oulipian clinamen matrices, and stereometric stage lines.'
    },
    {
        cat: 'hypercomplex',
        numeral: 'FOLIO V • NON-EUCLIDEAN MANIFOLDS',
        title: 'Hyper-Complex & Nuanced Topologies',
        epigraph: 'Stochastic ruled surfaces, overlapping semi-lattices, hyperbolic geodesics, neurocybernetic recursion, and catastrophe folds.'
    },
    {
        cat: 'obscure',
        numeral: 'FOLIO VI • ARCHIVAL INSTRUMENTS',
        title: 'Rare & Obscure Historical Visual Schemas',
        epigraph: 'Chronographic train meshes, scale-preserving spirals, somatic attrition bands, and anti-taxonomic labyrinths.'
    }
];

/* --- RENDER GALLERY GRID (WITH MOLD VARIATIONS & FOLIO SALONS) & LEDGER --- */
function renderGalleryAndLedger() {
    const filtered = getFilteredSpecimens();
    const statusEl = document.getElementById('status-count-readout');
    if (statusEl) {
        statusEl.textContent = `Showing ${filtered.length} of ${SPECIMEN_LIST.length} curated epistemic schemas`;
    }

    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    const createCardElement = (item) => {
        const card = document.createElement('article');
        const moldClass = item.mold && item.mold !== 'standard' ? `mold-${item.mold}` : '';
        card.className = `editorial-card ${moldClass}`.trim();
        card.setAttribute('data-category', item.category);

        const labels = item.triadLabels || ['I. Plate', 'II. Script', 'III. Builder'];
        const tagsHtml = (item.secondaryTags || [])
            .map(t => `<span class="plate-tag">${t}</span>`)
            .join('');

        const axiomHtml = item.axiomQuote
            ? `<div class="card-axiom-quote">${item.axiomQuote}</div>`
            : '';

        if (item.mold === 'wide') {
            card.innerHTML = `
                <div>
                    <div class="card-top-meta">
                        <span class="card-plate-num">${item.number} • ${item.refCode}</span>
                        <button class="card-pin-btn" onclick="pinToHero('${item.id}')" title="Load into Hero Stage">↑ Promote to Featured Stage</button>
                    </div>
                    <div class="card-header">
                        <span class="card-category">${item.categoryLabel}</span>
                        <h3 class="card-title">${item.title}</h3>
                        <div class="card-origin">${item.thinker} (${item.year}) • ${item.provenance}</div>
                    </div>
                    <div class="card-wide-inner">
                        <div class="card-visual-preview" onclick="openModal('${item.id}', 'example')" title="Click to inspect full plate & exegesis">
                            ${item.renderSvg()}
                        </div>
                        <div style="display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                                ${axiomHtml}
                                <p class="card-blurb">${item.blurb}</p>
                                <div class="card-tags-row">${tagsHtml}</div>
                                <div class="card-use-case">
                                    <strong>${item.useCaseLabel || 'Epistemic Application'}:</strong> ${item.useCase}
                                </div>
                            </div>
                            <div class="action-triad">
                                <button class="btn-action" onclick="openModal('${item.id}', 'example')">${labels[0]}</button>
                                <button class="btn-action" onclick="openModal('${item.id}', 'script')">${labels[1]}</button>
                                <button class="btn-action" onclick="openModal('${item.id}', 'builder')">${labels[2]}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div>
                    <div class="card-top-meta">
                        <span class="card-plate-num">${item.number} • ${item.refCode}</span>
                        <button class="card-pin-btn" onclick="pinToHero('${item.id}')" title="Load into Hero Stage">↑ Stage</button>
                    </div>
                    <div class="card-header">
                        <span class="card-category">${item.categoryLabel}</span>
                        <h3 class="card-title">${item.title}</h3>
                        <div class="card-origin">${item.thinker} (${item.year}) • ${item.provenance}</div>
                    </div>
                    <div class="card-visual-preview" onclick="openModal('${item.id}', 'example')" title="Click to inspect full plate & exegesis">
                        ${item.renderSvg()}
                    </div>
                    ${item.mold === 'minimal' || item.mold === 'nocturnal' ? axiomHtml : ''}
                    <p class="card-blurb">${item.blurb}</p>
                </div>
                <div>
                    <div class="card-tags-row">${tagsHtml}</div>
                    <div class="card-use-case">
                        <strong>${item.useCaseLabel || 'Epistemic Application'}:</strong> ${item.useCase}
                    </div>
                    <div class="action-triad">
                        <button class="btn-action" onclick="openModal('${item.id}', 'example')">${labels[0]}</button>
                        <button class="btn-action" onclick="openModal('${item.id}', 'script')">${labels[1]}</button>
                        <button class="btn-action" onclick="openModal('${item.id}', 'builder')">${labels[2]}</button>
                    </div>
                </div>
            `;
        }
        return card;
    };

    if (currentCategory === 'all' && !currentSearchQuery) {
        FOLIO_CHAPTERS.forEach(folio => {
            const chapterItems = filtered.filter(i => i.category === folio.cat);
            if (chapterItems.length === 0) return;

            const divider = document.createElement('div');
            divider.className = 'folio-chapter-divider';
            divider.id = `folio-${folio.cat}`;
            divider.innerHTML = `
                <div class="folio-chapter-title-wrap">
                    <span class="folio-numeral">${folio.numeral} (${chapterItems.length} PLATES)</span>
                    <h2 class="folio-title">${folio.title}</h2>
                </div>
                <div class="folio-epigraph">${folio.epigraph}</div>
            `;
            grid.appendChild(divider);

            chapterItems.forEach(item => {
                grid.appendChild(createCardElement(item));
            });
        });
    } else {
        filtered.forEach(item => {
            grid.appendChild(createCardElement(item));
        });
    }

    // Populate Chronological & Taxonomic Ledger Table
    const tbody = document.getElementById('ledger-tbody');
    if (tbody) {
        const sortedChrono = [...filtered].sort((a, b) => a.yearSort - b.yearSort);
        tbody.innerHTML = sortedChrono.map(item => `
            <tr onclick="openModal('${item.id}', 'example')">
                <td class="mono" style="white-space:nowrap; color:var(--accent-rust); font-weight:bold;">${item.year}</td>
                <td class="mono" style="white-space:nowrap;">${item.number}</td>
                <td><strong>${item.title}</strong></td>
                <td>${item.thinker}</td>
                <td><span class="plate-tag">${item.categoryLabel.split('•')[1] ? item.categoryLabel.split('•')[1].trim() : item.categoryLabel}</span></td>
                <td style="font-size:0.8rem; color:var(--ink-secondary);">${(item.secondaryTags || []).slice(0, 3).join(' · ')}</td>
            </tr>
        `).join('');
    }
}

/* --- MODAL DIALOG & SCHOLARLY APPARATUS CONTROLLER --- */
function openModal(key, defaultTab = 'example') {
    currentDiagramKey = key;
    const data = DIAGRAM_DATA[key];
    if (!data) return;

    // Header
    document.getElementById('modal-title').textContent = `${data.number} — ${data.title}`;
    document.getElementById('modal-subtitle').textContent = `${data.thinker} (${data.year}) • ${data.subtitle} • [${data.refCode}]`;

    // Custom Tab Titles
    const labels = data.triadLabels || ['I. Visual Plate', 'II. Formal Script', 'III. Apparatus'];
    document.getElementById('tab-btn-example').textContent = `${labels[0]} & Exegesis`;
    document.getElementById('tab-btn-script').textContent = `${labels[1]} (${data.scriptLang ? data.scriptLang.split('&')[0].trim() : 'Formal DSL'})`;
    document.getElementById('tab-btn-builder').textContent = `${labels[2]} (Interactive)`;
    document.getElementById('tab-btn-collider').textContent = `IV. Chiasmic Collider`;

    // Stage Theme (Nocturnal vs Paper)
    const exampleStage = document.getElementById('example-render-area');
    const builderStage = document.getElementById('builder-preview-area');
    if (data.mold === 'nocturnal') {
        exampleStage.classList.add('nocturnal-stage');
        builderStage.classList.add('nocturnal-stage');
    } else {
        exampleStage.classList.remove('nocturnal-stage');
        builderStage.classList.remove('nocturnal-stage');
    }

    // Tab 1: Visual Plate + 3-Column Exegesis + Connected Lineage
    exampleStage.innerHTML = data.renderSvg();
    document.getElementById('modal-axiom-banner').textContent = data.axiomQuote || data.description || '';

    if (data.exegesis) {
        document.getElementById('exegesis-stakes').textContent = data.exegesis.stakes;
        document.getElementById('exegesis-mechanics').textContent = data.exegesis.mechanics;
        document.getElementById('exegesis-lineage').textContent = data.exegesis.lineage;
    }

    if (data.bibliography) {
        document.getElementById('modal-bib-primary').innerHTML = `<strong>Primary Source:</strong> ${data.bibliography.primary}`;
        document.getElementById('modal-bib-secondary').innerHTML = `<strong>Critical Literature:</strong> ${data.bibliography.secondary}`;
    }

    // Related Lineage Chips
    const lineageContainer = document.getElementById('modal-lineage-chips');
    if (lineageContainer && data.relatedPlates) {
        lineageContainer.innerHTML = data.relatedPlates
            .map(relId => {
                const rel = DIAGRAM_DATA[relId];
                if (!rel) return '';
                return `<button class="lineage-chip" onclick="openModal('${rel.id}', 'example')">${rel.number}: ${rel.title.split('(')[0].trim()} (${rel.year})</button>`;
            })
            .join('');
    }

    // Tab 2: Formal Notation & Script
    document.getElementById('script-lang-heading').textContent = data.scriptLang || 'Formal Notation & Generative Protocol';
    document.getElementById('script-code-area').innerHTML = data.script;

    // Tab 3: Interactive Builder Controls
    buildFormControls(data);

    // Tab 4: Chiasmic Collider
    populateColliderTab(data);

    // Open Modal
    document.getElementById('interactive-modal').classList.add('open');
    switchTab(defaultTab);
}

function stepModalPlate(delta) {
    const idx = SPECIMEN_LIST.findIndex(s => s.id === currentDiagramKey);
    const nextIdx = (idx + delta + SPECIMEN_LIST.length) % SPECIMEN_LIST.length;
    openModal(SPECIMEN_LIST[nextIdx].id, currentTab);
}

function closeModal() {
    document.getElementById('interactive-modal').classList.remove('open');
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(pane => pane.classList.remove('active'));
    const activePane = document.getElementById(`tab-content-${tabName}`);
    if (activePane) activePane.classList.add('active');

    if (tabName === 'builder') {
        updateLiveBuilderPreview();
    } else if (tabName === 'collider') {
        updateColliderSynthesis();
    }
}

/* --- BUILDER DYNAMIC FORM GENERATOR --- */
function buildFormControls(data) {
    const container = document.getElementById('builder-form-controls');
    container.innerHTML = '';

    if (!data.builderControls || data.builderControls.length === 0) {
        container.innerHTML = '<p>No configurable parameters for this plate.</p>';
        return;
    }

    data.builderControls.forEach(ctrl => {
        const group = document.createElement('div');
        group.className = 'form-group';

        const header = document.createElement('div');
        header.className = 'form-group-header';

        const label = document.createElement('label');
        label.setAttribute('for', `ctrl-${ctrl.id}`);
        label.textContent = ctrl.label;
        header.appendChild(label);

        const valBadge = document.createElement('span');
        valBadge.className = 'form-val-badge';
        valBadge.id = `val-badge-${ctrl.id}`;
        valBadge.textContent = ctrl.type === 'range' ? ctrl.value : '';
        header.appendChild(valBadge);

        group.appendChild(header);

        if (ctrl.type === 'range') {
            const input = document.createElement('input');
            input.type = 'range';
            input.id = `ctrl-${ctrl.id}`;
            input.min = ctrl.min;
            input.max = ctrl.max;
            input.value = ctrl.value;
            input.addEventListener('input', () => {
                valBadge.textContent = input.value;
                updateLiveBuilderPreview();
            });
            group.appendChild(input);
        } else if (ctrl.type === 'select') {
            const select = document.createElement('select');
            select.id = `ctrl-${ctrl.id}`;
            ctrl.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                select.appendChild(option);
            });
            select.addEventListener('change', updateLiveBuilderPreview);
            group.appendChild(select);
        } else if (ctrl.type === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `ctrl-${ctrl.id}`;
            input.value = ctrl.value;
            input.placeholder = 'Enter custom symbol or term...';
            input.addEventListener('input', updateLiveBuilderPreview);
            group.appendChild(input);
        }

        container.appendChild(group);
    });

    // Action Buttons: Reset, Randomize, Export SVG
    const actionsRow = document.createElement('div');
    actionsRow.className = 'builder-actions-row';
    actionsRow.innerHTML = `
        <button class="btn-action" style="flex:1;" onclick="resetBuilderParams()">↺ Reset</button>
        <button class="btn-action" style="flex:1;" onclick="randomizeBuilderParams()">🎲 Perturb</button>
        <button class="btn-action" style="flex:1;" onclick="exportCurrentSvg()">⬇ SVG</button>
    `;
    container.appendChild(actionsRow);
}

function updateLiveBuilderPreview() {
    const data = DIAGRAM_DATA[currentDiagramKey];
    if (!data || !data.renderSvg) return;

    const params = {};
    if (data.builderControls) {
        data.builderControls.forEach(ctrl => {
            const elem = document.getElementById(`ctrl-${ctrl.id}`);
            if (elem) params[ctrl.id] = elem.value;
        });
    }

    document.getElementById('builder-preview-area').innerHTML = data.renderSvg(params);
}

function resetBuilderParams() {
    const data = DIAGRAM_DATA[currentDiagramKey];
    if (!data) return;
    buildFormControls(data);
    updateLiveBuilderPreview();
}

function randomizeBuilderParams() {
    const data = DIAGRAM_DATA[currentDiagramKey];
    if (!data || !data.builderControls) return;

    data.builderControls.forEach(ctrl => {
        const elem = document.getElementById(`ctrl-${ctrl.id}`);
        if (!elem) return;
        if (ctrl.type === 'range') {
            const min = parseInt(ctrl.min);
            const max = parseInt(ctrl.max);
            const rnd = Math.floor(Math.random() * (max - min + 1)) + min;
            elem.value = rnd;
            const badge = document.getElementById(`val-badge-${ctrl.id}`);
            if (badge) badge.textContent = rnd;
        } else if (ctrl.type === 'select') {
            const idx = Math.floor(Math.random() * ctrl.options.length);
            elem.selectedIndex = idx;
        }
    });
    updateLiveBuilderPreview();
}

function exportCurrentSvg() {
    const stage = document.getElementById('builder-preview-area');
    const svgEl = stage ? stage.querySelector('svg') : null;
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atlas-obscura-${currentDiagramKey}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/* --- TAB 4: CHIASMIC COLLIDER (THE FRICTION AGENT) --- */
function populateColliderTab(primaryData) {
    const select = document.getElementById('collider-partner-select');
    if (!select) return;
    select.innerHTML = '';

    const defaultPartner = (primaryData.relatedPlates && primaryData.relatedPlates[0]) || 'llull';
    SPECIMEN_LIST.forEach(item => {
        if (item.id === primaryData.id) return;
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.number}: ${item.title} (${item.year})`;
        if (item.id === defaultPartner) opt.selected = true;
        select.appendChild(opt);
    });
}

function updateColliderSynthesis() {
    const p1 = DIAGRAM_DATA[currentDiagramKey];
    const select = document.getElementById('collider-partner-select');
    const partnerId = select ? select.value : 'llull';
    const p2 = DIAGRAM_DATA[partnerId] || SPECIMEN_LIST[0];
    if (!p1 || !p2) return;

    document.getElementById('collider-svg-left').innerHTML = p1.renderSvg();
    document.getElementById('collider-svg-right').innerHTML = p2.renderSvg();
    document.getElementById('collider-title-left').textContent = `${p1.number}: ${p1.title} (${p1.year})`;
    document.getElementById('collider-title-right').textContent = `${p2.number}: ${p2.title} (${p2.year})`;

    const promptText = `CHIASMIC INTERSECTION [${p1.refCode} × ${p2.refCode}]: How does ${p1.thinker}’s ${p1.secondaryTags[0]} (${p1.year}) transform when subjected to the structural constraints of ${p2.thinker}’s ${p2.secondaryTags[0]} (${p2.year})? Map the invariant operations of “${p1.title.split('(')[0].trim()}” directly onto the spatial grammar of “${p2.title.split('(')[0].trim()},” isolating the third term where ${p1.secondaryTags[1] || 'form'} and ${p2.secondaryTags[1] || 'structure'} short-circuit.`;

    document.getElementById('collider-synthesis-prompt').textContent = promptText;
}

/* --- SCRIPT COPY TOOL --- */
function copyCode() {
    const codeText = document.getElementById('script-code-area').innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        const copyBtn = document.querySelector('.btn-copy');
        copyBtn.textContent = 'Copied to Clipboard';
        setTimeout(() => { copyBtn.textContent = 'Copy Formal Script'; }, 2000);
    });
}

/* --- DELEGATED GLOBAL TOOLTIP HANDLER FOR ALL INLINE SVGS --- */
function initGlobalTooltips() {
    const tooltip = document.getElementById('diagram-tooltip');
    if (!tooltip) return;

    document.addEventListener('mousemove', (e) => {
        const target = e.target.closest('[data-info]');
        if (target) {
            tooltip.style.display = 'block';
            const x = Math.min(window.innerWidth - 310, e.clientX + 14);
            const y = Math.min(window.innerHeight - 80, e.clientY + 14);
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
            tooltip.textContent = target.getAttribute('data-info');
        } else {
            tooltip.style.display = 'none';
        }
    });
}

/* --- KEYBOARD SHORTCUTS --- */
function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        const modalOpen = document.getElementById('interactive-modal').classList.contains('open');
        if (e.key === 'Escape' && modalOpen) {
            closeModal();
            return;
        }
        if (modalOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            if (e.key === 'ArrowRight') stepModalPlate(1);
            if (e.key === 'ArrowLeft') stepModalPlate(-1);
            if (e.key === '1') switchTab('example');
            if (e.key === '2') switchTab('script');
            if (e.key === '3') switchTab('builder');
            if (e.key === '4') switchTab('collider');
        }
    });
}
