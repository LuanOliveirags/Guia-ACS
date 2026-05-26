// ─── Theme toggle ─────────────────────────────────────────────

(function initTheme() {
    const THEME_KEY = 'acs-theme';

    function setTheme(theme) {
        document.documentElement.classList.add('theme-transitioning');
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        const icon = document.getElementById('themeIcon');
        if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        const btn = document.getElementById('themeToggle');
        if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro');
        setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 400);
    }

    const saved = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(saved);

    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
})();

// ─── Avatar / Profile ─────────────────────────────────────────

(function initProfile() {
    const PROFILE_KEY  = 'acs-profile';
    const DICEBEAR     = 'https://api.dicebear.com/9.x/adventurer/svg';

    const OPTS = {
        femaleHair: [
            { v:'long01',  l:'Liso'      }, { v:'long06',  l:'Ondulado'  },
            { v:'long09',  l:'Cacheado'  }, { v:'long14',  l:'Trança'    },
            { v:'long17',  l:'Bob'       }, { v:'long20',  l:'Rabo'      },
            { v:'long24',  l:'Volumoso'  }, { v:'long26',  l:'Curto'     },
        ],
        maleHair: [
            { v:'short01', l:'Clássico'  }, { v:'short03', l:'Social'    },
            { v:'short05', l:'Riscado'   }, { v:'short07', l:'Moderno'   },
            { v:'short10', l:'Ondulado'  }, { v:'short12', l:'Topete'    },
            { v:'short15', l:'Natural'   }, { v:'short19', l:'Raspado'   },
        ],
        eyes: [
            { v:'variant01', l:'Redondo'    }, { v:'variant04', l:'Amendoado' },
            { v:'variant06', l:'Fechado'    }, { v:'variant10', l:'Sorridente'},
            { v:'variant14', l:'Oval'       }, { v:'variant20', l:'Grande'    },
        ],
        eyebrows: [
            { v:'variant01', l:'Reto'    }, { v:'variant04', l:'Curvado' },
            { v:'variant08', l:'Fino'    }, { v:'variant12', l:'Grosso'  },
        ],
        glasses: [
            { v:'',          l:'Sem óculos'  }, { v:'variant01', l:'Redondo'    },
            { v:'variant02', l:'Retangular'  }, { v:'variant03', l:'Aviador'    },
            { v:'variant05', l:'Quadrado'    },
        ],
        mouth: [
            { v:'variant01', l:'Neutro'   }, { v:'variant04', l:'Sorriso'  },
            { v:'variant07', l:'Feliz'    }, { v:'variant09', l:'Animado'  },
            { v:'variant17', l:'Sério'    }, { v:'variant24', l:'Travesso' },
        ],
        earrings: [
            { v:'',          l:'Nenhum'   }, { v:'variant01', l:'Argola'   },
            { v:'variant02', l:'Bolinha'  }, { v:'variant03', l:'Coração'  },
            { v:'variant04', l:'Comprido' }, { v:'variant05', l:'Estrela'  },
        ],
    };

    function buildUrl(cfg) {
        const seed = encodeURIComponent((cfg.name || 'acs').replace(/\s+/g, '-') + cfg.gender);
        let url = `${DICEBEAR}?seed=${seed}&skinColor=${cfg.skinColor}&hairColor=${cfg.hairColor}&hair=${cfg.hair}&eyes=${cfg.eyes}&eyebrows=${cfg.eyebrows}&backgroundColor=b6e3f4,ffd5dc,c0aede,d1f4d9`;
        if (cfg.mouth)    url += `&mouth=${cfg.mouth}`;
        if (cfg.glasses)  url += `&glasses=${cfg.glasses}&glassesProbability=100`;
        if (cfg.earrings) url += `&earrings=${cfg.earrings}&earringsProbability=100`;
        return url;
    }

    function buildThumbUrl(cfg, paramName, paramValue) {
        const c = { ...cfg, [paramName]: paramValue };
        let url = `${DICEBEAR}?seed=${encodeURIComponent('acs-style-preview')}`;
        url += `&skinColor=${c.skinColor}&hairColor=${c.hairColor}&hair=${c.hair}`;
        url += `&eyes=${c.eyes}&eyebrows=${c.eyebrows}&backgroundColor=c0aede,b6e3f4`;
        if (c.mouth)    url += `&mouth=${c.mouth}`;
        if (c.glasses)  url += `&glasses=${c.glasses}&glassesProbability=100`;
        if (c.earrings) url += `&earrings=${c.earrings}&earringsProbability=100`;
        return url;
    }

    function defaultCfg() {
        return { name:'', gender:'female', skinColor:'f2d3b1', hairColor:'2c1b18',
                 hair:'long01', eyes:'variant01', eyebrows:'variant01', glasses:'',
                 mouth:'variant04', earrings:'' };
    }

    function loadProfile() {
        try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch { return null; }
    }
    function saveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }

    function applyToSidebar(cfg) {
        const img  = document.getElementById('profileAvatarImg');
        const name = document.getElementById('profileName');
        if (img)  { img.src = buildUrl(cfg); img.style.borderRadius = '50%'; }
        if (name) name.textContent = cfg.name || 'Estudante ACS';
    }

    function makeAvatarPicker(containerId, opts, currentVal, cfg, paramName, onPick) {
        const el = document.getElementById(containerId);
        el.innerHTML = opts.map(o => {
            const sel = o.v === currentVal ? ' avatar-opt--selected' : '';
            return `<button class="avatar-opt${sel}" data-value="${o.v}" title="${o.l}">
                <img src="${buildThumbUrl(cfg, paramName, o.v)}" alt="${o.l}" width="56" height="56" loading="lazy">
                <span class="avatar-opt__label">${o.l}</span>
            </button>`;
        }).join('');
        el.onclick = function(e) {
            const btn = e.target.closest('.avatar-opt');
            if (!btn) return;
            el.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('avatar-opt--selected'));
            btn.classList.add('avatar-opt--selected');
            onPick(btn.dataset.value);
        };
    }

    function makeCirclePicker(containerId, currentVal, onPick) {
        document.querySelectorAll(`#${containerId} .circle-opt`).forEach(btn => {
            btn.classList.toggle('circle-opt--selected', btn.dataset.value === currentVal);
        });
        document.getElementById(containerId).onclick = function(e) {
            const btn = e.target.closest('.circle-opt');
            if (!btn) return;
            this.querySelectorAll('.circle-opt').forEach(b => b.classList.remove('circle-opt--selected'));
            btn.classList.add('circle-opt--selected');
            onPick(btn.dataset.value);
        };
    }

    function openModal(existing) {
        const modal = document.getElementById('avatarModal');
        const cfg   = existing ? { ...defaultCfg(), ...existing } : defaultCfg();

        function preview() {
            cfg.name = (document.getElementById('avatarName').value || '').trim();
            const img = document.getElementById('avatarBigPreview');
            if (img) img.src = buildUrl(cfg);
        }

        function buildHairPicker() {
            makeAvatarPicker('hairStylePicker',
                cfg.gender === 'female' ? OPTS.femaleHair : OPTS.maleHair,
                cfg.hair, cfg, 'hair', v => { cfg.hair = v; preview(); });
        }

        function buildStylePickers() {
            buildHairPicker();
            makeAvatarPicker('eyesPicker',     OPTS.eyes,     cfg.eyes,     cfg, 'eyes',     v => { cfg.eyes     = v; preview(); });
            makeAvatarPicker('eyebrowsPicker', OPTS.eyebrows, cfg.eyebrows, cfg, 'eyebrows', v => { cfg.eyebrows = v; preview(); });
            makeAvatarPicker('mouthPicker',    OPTS.mouth,    cfg.mouth,    cfg, 'mouth',    v => { cfg.mouth    = v; preview(); });
            makeAvatarPicker('glassesPicker',  OPTS.glasses,  cfg.glasses,  cfg, 'glasses',  v => { cfg.glasses  = v; preview(); });
            makeAvatarPicker('earringsPicker', OPTS.earrings, cfg.earrings, cfg, 'earrings', v => { cfg.earrings = v; preview(); });
        }

        // Nome
        document.getElementById('avatarName').value = cfg.name;
        document.getElementById('avatarName').oninput = preview;

        // Gênero
        document.querySelectorAll('#genderPicker .avatar-toggle__btn').forEach(b =>
            b.classList.toggle('avatar-toggle__btn--selected', b.dataset.value === cfg.gender));
        document.getElementById('genderPicker').onclick = function(e) {
            const btn = e.target.closest('.avatar-toggle__btn');
            if (!btn) return;
            cfg.gender = btn.dataset.value;
            this.querySelectorAll('.avatar-toggle__btn').forEach(b =>
                b.classList.toggle('avatar-toggle__btn--selected', b === btn));
            cfg.hair = cfg.gender === 'female' ? 'long01' : 'short01';
            buildHairPicker();
            preview();
        };

        // Pele & cabelo — rebuilda thumbnails quando cores mudam
        makeCirclePicker('skinPicker',      cfg.skinColor, v => { cfg.skinColor = v; buildStylePickers(); preview(); });
        makeCirclePicker('hairColorPicker', cfg.hairColor, v => { cfg.hairColor = v; buildStylePickers(); preview(); });

        // Style pickers com miniaturas do avatar
        buildStylePickers();

        // Aleatório
        const randomBtn = document.getElementById('avatarRandomBtn');
        if (randomBtn) randomBtn.onclick = function() {
            const g    = Math.random() > .5 ? 'female' : 'male';
            const hArr = g === 'female' ? OPTS.femaleHair : OPTS.maleHair;
            const pick = arr => arr[Math.floor(Math.random() * arr.length)].v;
            cfg.gender    = g;
            cfg.skinColor = ['f2d3b1','f5cfa0','e5a07b','bd7c5e','a55220','694d3d'][Math.floor(Math.random()*6)];
            cfg.hairColor = ['2c1b18','724133','a55728','d6b370','cabfad','efefef','f59797','6bd9e9'][Math.floor(Math.random()*8)];
            cfg.hair      = pick(hArr);
            cfg.eyes      = pick(OPTS.eyes);
            cfg.eyebrows  = pick(OPTS.eyebrows);
            cfg.glasses   = pick(OPTS.glasses);
            cfg.mouth     = pick(OPTS.mouth);
            cfg.earrings  = pick(OPTS.earrings);
            document.querySelectorAll('#genderPicker .avatar-toggle__btn').forEach(b =>
                b.classList.toggle('avatar-toggle__btn--selected', b.dataset.value === cfg.gender));
            makeCirclePicker('skinPicker',      cfg.skinColor, v => { cfg.skinColor = v; buildStylePickers(); preview(); });
            makeCirclePicker('hairColorPicker', cfg.hairColor, v => { cfg.hairColor = v; buildStylePickers(); preview(); });
            buildStylePickers();
            preview();
        };

        // Salvar
        document.getElementById('avatarSaveBtn').onclick = function() {
            cfg.name = document.getElementById('avatarName').value.trim() || 'Estudante ACS';
            saveProfile(cfg);
            applyToSidebar(cfg);
            modal.hidden = true;
        };

        document.getElementById('avatarSkipBtn').onclick       = () => { modal.hidden = true; };
        document.getElementById('avatarModalBackdrop').onclick = () => { modal.hidden = true; };

        preview();
        modal.hidden = false;
        setTimeout(() => document.getElementById('avatarName').focus(), 120);
    }

    // Init
    const profile = loadProfile();
    if (profile) applyToSidebar(profile);
    else         setTimeout(() => openModal(null), 800);

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('profileCard')?.addEventListener('click', () => openModal(loadProfile()));
    });
    window.openAvatarModal = () => openModal(loadProfile());
})();

// ─── Firebase ─────────────────────────────────────────────────

firebase.initializeApp({
    apiKey: "AIzaSyDI_YXbvqHYksvVRa0iVoeRts0_32gYfrw",
    authDomain: "guia-acs-8abb3.firebaseapp.com",
    projectId: "guia-acs-8abb3",
    storageBucket: "guia-acs-8abb3.firebasestorage.app",
    messagingSenderId: "975842667906",
    appId: "1:975842667906:web:51e5a0c31ae1fcb1b1b39b",
});

const db = firebase.firestore();

// Cache em memória — evita múltiplas leituras por sessão
let _questoesCache = null;

async function getAllQuestoes() {
    if (_questoesCache) return _questoesCache;
    const snap = await db.collection('questoes').get();
    _questoesCache = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(q => q.ativo !== false);
    return _questoesCache;
}

// ─── Module quiz answers ──────────────────────────────────────

const CORRECT_ANSWERS = {
    q1: 'b', q2: 'b',
    q3: 'b', q4: 'b',
    q5: 'b', q6: 'b',
    q7: 'b', q8: 'b',
};

// ─── Study topics data ───────────────────────────────────────

const STUDY_CATEGORIES = {
    sus:        { label: 'SUS',               color: 'primary'  },
    legislacao: { label: 'Legislação',        color: 'info'     },
    atuacao:    { label: 'Atuação',           color: 'info'     },
    doencas:    { label: 'Doenças',           color: 'danger'   },
    saude:      { label: 'Saúde Prioritária', color: 'success'  },
    vigilancia: { label: 'Vigilância',        color: 'warning'  },
    social:     { label: 'Contexto Social',   color: 'expert'   },
};

const STUDY_TOPICS = [
    {
        id: 'base-legal',
        title: 'Base Legal da Profissão',
        category: 'legislacao',
        points: [
            'Lei nº 11.350/2006 regulamenta o exercício da profissão de ACS no Brasil',
            'Deve residir na área de atuação — único profissional de saúde com esta obrigação legal',
            'Escolaridade mínima exigida: ensino médio completo',
            'Contratado exclusivamente pelo gestor municipal de saúde',
            'Integra a Equipe de Saúde da Família (ESF), mas pode atuar sem ela em municípios menores',
        ],
        remember: 'É o único profissional de saúde obrigado por lei a residir na comunidade onde atua. Isso garante o vínculo real com o território e a confiança da população.',
    },
    {
        id: 'atribuicoes',
        title: 'Atribuições e Limites do ACS',
        category: 'atuacao',
        points: [
            'Realizar cadastramento e atualização contínua das famílias da microárea',
            'Visitar sistematicamente todas as famílias — mínimo 1 visita/mês',
            'Orientar as famílias sobre utilização adequada dos serviços de saúde',
            'Desenvolver ações de educação em saúde e mobilização comunitária',
            '🚫 Proibido: prescrever medicamentos, realizar procedimentos clínicos ou solicitar exames',
        ],
        remember: 'O ACS não realiza procedimentos. Seu trabalho é vínculo, orientação e monitoramento. Qualquer dúvida sobre os limites de atuação: sempre consulte a equipe de saúde.',
    },
    {
        id: 'visita-domiciliar',
        title: 'Visita Domiciliar',
        category: 'atuacao',
        points: [
            'Principal instrumento de trabalho — frequência mínima de 1 visita/mês por família',
            'Grupos prioritários recebem visitas mais frequentes: gestantes, crianças menores de 2 anos, idosos, doentes crônicos',
            'Deve ser planejada, registrada e comunicada à equipe de saúde',
            'Permite identificar riscos e vulnerabilidades invisíveis ao sistema clínico',
            'Respeitar privacidade, horário e cultura da família — nunca entrar sem consentimento',
        ],
        remember: 'A visita domiciliar não é obrigação burocrática — é oportunidade terapêutica. É o momento em que o sistema de saúde "entra" de verdade na vida das pessoas.',
    },
    {
        id: 'hipertensao',
        title: 'Hipertensão Arterial (HAS)',
        category: 'doencas',
        points: [
            'Definição: PA ≥ 140/90 mmHg em adultos — principal fator de risco cardiovascular no Brasil',
            'Assintomática na maioria dos casos: rastreamento ativo pelo ACS é essencial',
            'Fatores de risco: obesidade, sedentarismo, tabagismo, excesso de sal e álcool, estresse crônico',
            'Orientar: aderência ao medicamento, dieta com pouco sódio, exercício regular e não fumar',
            'Complicações sem controle: AVC, infarto, insuficiência renal e retinopatia (cegueira)',
        ],
        remember: 'Chamada de "assassina silenciosa": a maioria dos hipertensos não sente nada. O ACS é fundamental para identificar, monitorar e manter esses casos em acompanhamento.',
    },
    {
        id: 'diabetes',
        title: 'Diabetes Mellitus (DM)',
        category: 'doencas',
        points: [
            'DM Tipo 1: autoimune, insulinodependente, mais comum em jovens — minoria dos casos',
            'DM Tipo 2: resistência à insulina, fortemente associada ao estilo de vida — mais de 90% dos casos',
            'Sintomas clássicos: poliúria (urinar muito), polidipsia (muita sede), polifagia (muita fome) e emagrecimento',
            'Monitorar os pés dos diabéticos: feridas pequenas podem evoluir para amputação se ignoradas',
            'Orientar: alimentação equilibrada, exercício físico regular e uso correto de insulina/medicamentos',
        ],
        remember: 'DM tipo 2 é prevenível e controlável com mudanças de hábito. Pé diabético mata — ensine o paciente a examinar os próprios pés diariamente e reportar qualquer ferida.',
    },
    {
        id: 'saude-crianca',
        title: 'Saúde da Criança',
        category: 'saude',
        points: [
            'Acompanhar crescimento (peso/altura na curva) e desenvolvimento neuropsicomotor em toda visita',
            'Caderneta da Criança: principal documento de acompanhamento — verificar em CADA visita',
            'Aleitamento materno exclusivo até os 6 meses — sem água, chás ou alimentos complementares',
            'Verificar calendário vacinal e incentivar atualização de pendências',
            'Atentar para sinais de violência, negligência ou maus-tratos — notificação ao Conselho Tutelar é obrigatória',
        ],
        remember: 'Se a criança perdeu peso, atrasou vacina ou sumiu das consultas, o ACS deve agir imediatamente — não esperar a próxima visita programada.',
    },
    {
        id: 'saude-mulher',
        title: 'Saúde da Mulher',
        category: 'saude',
        points: [
            'Identificar gestantes precocemente e cadastrar no pré-natal — mínimo 6 consultas (OMS recomenda 8+)',
            'Sinais de alarme na gestação: sangramento, edema excessivo, cefaleia intensa, visão turva, dor epigástrica',
            'Prevenção do câncer de colo: Papanicolau dos 25 aos 64 anos, a cada 3 anos após 2 exames normais',
            'Rastreamento do câncer de mama: autoexame mensal + mamografia a partir dos 50 anos pelo SUS',
            'Planejamento familiar: orientar sobre todos os métodos contraceptivos disponíveis gratuitamente no SUS',
        ],
        remember: 'Edema + cefaleia + hipertensão em gestante = sinal de pré-eclâmpsia. Isso é emergência — encaminhe imediatamente à UBS ou pronto-socorro, não aguarde consulta agendada.',
    },
    {
        id: 'saude-idoso',
        title: 'Saúde do Idoso',
        category: 'saude',
        points: [
            'Riscos prioritários: quedas, polifarmácia, isolamento social, desnutrição e declínio cognitivo',
            'Queda recente é sinal de alarme: pode indicar fragilidade grave, polimedicação ou violência doméstica',
            'Polifarmácia (5+ medicamentos): risco alto de interação — verificar todos os remédios que o idoso toma',
            'Sinais de violência contra o idoso: hematomas, medo, dinheiro em falta, negligência com higiene',
            'Promover atividade física leve, convívio social e rastreamento de doenças crônicas',
        ],
        remember: 'Idoso que caiu merece visita de acompanhamento em até 48h. Isolamento social é fator de risco comprovado para depressão, demência e morte precoce.',
    },
    {
        id: 'tuberculose',
        title: 'Tuberculose (TB)',
        category: 'doencas',
        points: [
            'Doença de notificação compulsória — transmissão por via aérea (gotículas de Koch/tosse)',
            'Sintomas clássicos: tosse ≥ 3 semanas, febre vespertina, sudorese noturna e perda de peso sem causa aparente',
            'Tratamento: DOTS (Tratamento Diretamente Observado) — ACS pode acompanhar a tomada diária do remédio',
            'Identificar e examinar todos os contatos íntimos do caso confirmado (família, colegas de quarto)',
            'Fatores de risco: HIV/AIDS, diabetes, desnutrição, moradia precária, tabagismo, uso de álcool/drogas',
        ],
        remember: 'TB tem cura com tratamento correto (mínimo 6 meses). O maior problema é o abandono do tratamento. O ACS é a chave para a adesão — acompanhe semanalmente nos primeiros meses.',
    },
    {
        id: 'dengue',
        title: 'Dengue, Zika e Chikungunya',
        category: 'doencas',
        points: [
            'Transmitidas pelo Aedes aegypti — ativo de dia, em ambientes urbanos e periurbanos',
            '80% dos criadouros estão dentro ou ao redor das próprias casas: calhas, vasos, pneus, caixas d\'água',
            'Sinais de alarme da dengue: dor abdominal intensa, vômito persistente, sangramento, hipotensão, sonolência',
            'Zika em gestantes: risco de microcefalia e outras malformações congênitas — acompanhamento obrigatório',
            'Chikungunya: dor articular intensa e persistente — pode durar meses após a febre',
        ],
        remember: 'A visita domiciliar é a melhor arma contra o Aedes. Verifique criadouros em cada visita e oriente a família a eliminar água parada todo domingo.',
    },
    {
        id: 'saude-mental',
        title: 'Saúde Mental na Comunidade',
        category: 'saude',
        points: [
            'Identificar sinais de sofrimento psíquico: isolamento, choro frequente, alterações de sono, apetite e comportamento',
            'Principais condições: depressão, ansiedade, transtornos por uso de álcool e drogas',
            'Encaminhar para CAPS (Centro de Atenção Psicossocial) quando necessário',
            'Abordagem sem estigma, com escuta ativa, sem julgamento e sem rotular o usuário',
            'Sobre suicídio: perguntar diretamente NÃO aumenta o risco — abordar com naturalidade e acolhimento',
        ],
        remember: '"Falar sobre suicídio não provoca suicídio." Se suspeitar de ideação suicida, pergunte diretamente, acolha sem julgamento e encaminhe com urgência para a equipe de saúde.',
    },
    {
        id: 'notificacao',
        title: 'Doenças de Notificação Compulsória',
        category: 'vigilancia',
        points: [
            'Lista oficial definida pelo Ministério da Saúde — Portaria nº 264/2020',
            'Notificação imediata (até 24h): meningite, sarampo, raiva humana, febre amarela, botulismo',
            'Notificação semanal: dengue, tuberculose, sífilis congênita, hepatites virais, leishmaniose',
            'Registro via SINAN (Sistema de Informação de Agravos de Notificação)',
            'ACS identifica casos suspeitos na comunidade — o profissional de saúde realiza a notificação formal',
        ],
        remember: 'O ACS não notifica formalmente ao SINAN, mas é o primeiro a detectar casos na comunidade. Qualquer suspeita de doença de notificação obrigatória deve ser comunicada imediatamente à equipe de saúde.',
    },
    {
        id: 'calendario-vacinal',
        title: 'Calendário Nacional de Vacinação',
        category: 'saude',
        points: [
            'Criança: BCG (ao nascer), Hepatite B, Pentavalente, VIP, Rotavírus, Pneumo10, MeningC, SCR, Varicela, Hepatite A',
            'Adolescente (9–14 anos): HPV (2 doses), Meningocócica ACWY, dTpa (reforço)',
            'Adulto: dT (a cada 10 anos), Influenza (anual para grupos prioritários), Febre Amarela (dose única)',
            'Idoso (≥ 60 anos): Influenza anual, Pneumocócica 23-valente, dT (reforço a cada 10 anos)',
            'Verificar a Caderneta de Vacinação em toda visita domiciliar — nunca assumir que está em dia',
        ],
        remember: 'Vacinas de vírus vivos atenuados (SCR, Varicela, Febre Amarela) são contraindicadas na gravidez e em imunossuprimidos. Todas as outras do calendário básico podem ser aplicadas em gestantes.',
    },
    {
        id: 'determinantes-sociais',
        title: 'Determinantes Sociais da Saúde',
        category: 'social',
        points: [
            'As condições onde as pessoas nascem, crescem, vivem, trabalham e envelhecem determinam sua saúde',
            'Renda, educação, habitação, saneamento, emprego e exposição à violência afetam diretamente o adoecer',
            'ACS mapeia vulnerabilidades com a Ficha de Cadastro Individual — classifica risco familiar',
            'Articulação intersetorial: CRAS (assistência social), CREAS (proteção especial), escola, habitação, Ministério Público',
            'Condicionalidades do Bolsa Família: vacinas em dia, pré-natal e acompanhamento nutricional — monitorados pelo ACS',
        ],
        remember: 'Não há saúde plena sem condições sociais mínimas. O ACS é o único profissional de saúde que entra nas casas — use isso para mapear vulnerabilidades que o sistema clínico nunca enxerga.',
    },
    {
        id: 'registros-esus',
        title: 'Registros e e-SUS',
        category: 'atuacao',
        points: [
            'e-SUS PEC (Prontuário Eletrônico do Cidadão): sistema nacional de registro da Atenção Primária à Saúde',
            'Fichas do ACS: Cadastro Individual, Ficha de Visita Domiciliar e Ficha de Atividade Coletiva',
            'Os dados alimentam os indicadores do PMAQ e o cálculo do financiamento da equipe de saúde',
            'Registrar cada visita: objetivo, ações realizadas, orientações dadas e encaminhamentos feitos',
            'Atualizar cadastros sempre que houver mudanças: nascimentos, óbitos, mudanças de endereço, novos diagnósticos',
        ],
        remember: 'No SUS, o que não está registrado não existiu. A remuneração e os indicadores da sua equipe dependem diretamente do que você documenta. Registro ruim = invisibilidade da sua produção.',
    },
    {
        id: 'sus-principios',
        title: 'SUS — Princípios e Organização',
        category: 'sus',
        points: [
            'Criado pela Constituição Federal de 1988 (art. 196) e regulamentado pela Lei nº 8.080/1990',
            'Princípios doutrinários: Universalidade (atende todos), Equidade (prioriza quem mais precisa) e Integralidade (atenção completa)',
            'Princípios organizativos: Descentralização, Hierarquização (primário → secundário → terciário) e Participação Popular',
            'Controle social: Conselhos de Saúde (50% usuários) e Conferências de Saúde',
            'Financiamento tripartite: União, Estados e Municípios',
        ],
        remember: 'Universalidade = para todos. Equidade = não é igualdade, é dar mais a quem mais precisa. Integralidade = cuidar do ser humano de forma completa, não apenas da doença.',
    },
    {
        id: 'esf-equipe',
        title: 'Estratégia Saúde da Família (ESF)',
        category: 'sus',
        points: [
            'Principal estratégia de organização da Atenção Primária — substituiu o modelo hospitalocêntrico',
            'Equipe mínima: médico, enfermeiro, técnico de enfermagem e ACS (1 ACS por microárea de até 750 pessoas)',
            'Responsabilidade territorial: a equipe é responsável por uma área geográfica delimitada',
            'ACS é o único membro que não precisa estar na UBS — sua sala é o território',
            'NASF-AB (Núcleo Ampliado de Saúde da Família): apoia a ESF com nutricionista, psicólogo, fisioterapeuta, entre outros',
        ],
        remember: 'A ESF mudou o SUS de um modelo de cura para um modelo de vínculo e prevenção. O ACS é a "antena" da equipe no território — detecta antes que a doença chegue à UBS.',
    },
    {
        id: 'sus-niveis',
        title: 'Níveis de Atenção e Redes de Saúde',
        category: 'sus',
        points: [
            'Atenção Primária (APS): porta de entrada preferencial — UBS/ESF, resolução de 80% dos problemas de saúde',
            'Atenção Secundária: ambulatórios especializados, CAPS, CEO — referência da APS para casos mais complexos',
            'Atenção Terciária: hospitais de alta complexidade, UTIs, cirurgias — casos graves e procedimentos especializados',
            'Redes Temáticas: Rede Cegonha, Rede de Urgência e Emergência, Rede de Atenção Psicossocial (RAPS)',
            'Regulação: o ACS não acessa diretamente o secundário/terciário — passa pela UBS que solicita o encaminhamento',
        ],
        remember: 'O ACS atua exclusivamente na Atenção Primária. Seu papel é resolver o que for possível ali e referenciar adequadamente o que não for — sem tentar "pular" os níveis do sistema.',
    },
    {
        id: 'sus-controle-social',
        title: 'Controle Social e Participação Popular',
        category: 'sus',
        points: [
            'Lei nº 8.142/1990 regulamenta a participação da comunidade na gestão do SUS',
            'Conselho de Saúde: caráter permanente e deliberativo, composição paritária (50% usuários, 50% trabalhadores + gestores)',
            'Conferência de Saúde: ocorre a cada 4 anos nos níveis municipal, estadual e nacional para avaliar e propor diretrizes',
            'ACS tem papel estratégico: mobiliza a comunidade para participar dos Conselhos e Conferências',
            'Fundo Nacional de Saúde (FNS): transfere recursos federais diretamente para municípios conforme indicadores',
        ],
        remember: 'O SUS é do povo. O controle social é o mecanismo que garante isso. O ACS é o elo mais próximo da comunidade — sua função inclui estimular a participação popular nas decisões de saúde.',
    },
    {
        id: 'hanseniase',
        title: 'Hanseníase',
        category: 'doencas',
        points: [
            'Doença infecciosa crônica causada pelo Mycobacterium leprae — transmissão por contato prolongado com pessoa não tratada',
            'Sinal principal: mancha na pele com perda de sensibilidade (anestesia) — diferencial em relação a outras dermatoses',
            'Formas clínicas: Paucibacilar (PB, até 5 lesões) e Multibacilar (MB, 6+ lesões)',
            'Tratamento: Poliquimioterapia (PQT) fornecida gratuitamente pelo SUS — PB por 6 meses, MB por 12 meses',
            'Doença de notificação compulsória — ACS deve investigar contatos intradomiciliares',
        ],
        remember: 'Hanseníase tem cura com tratamento completo. Mancha com perda de sensibilidade = suspeita até prova em contrário. O estigma histórico da "lepra" ainda impede diagnóstico precoce — o ACS quebra esse tabu.',
    },
    {
        id: 'hiv-hepatites',
        title: 'HIV/AIDS e Hepatites Virais',
        category: 'doencas',
        points: [
            'HIV: transmissão sexual, sanguínea e vertical (mãe-filho). Tratamento com antirretrovirais (ARV) é gratuito e vitalício',
            'Detectado precocemente, o HIV não impede vida longa e saudável — sigilo e sem discriminação',
            'Hepatite B: transmissão sexual e sanguínea — vacina disponível no calendário básico (3 doses)',
            'Hepatite C: transmissão predominantemente sanguínea — sem vacina, mas com tratamento com alta taxa de cura',
            'Teste rápido para HIV, hepatites B e C disponível gratuitamente na UBS',
        ],
        remember: 'Pessoas vivendo com HIV em tratamento adequado têm carga viral indetectável = intransmissível (I=I). O sigilo é obrigação legal. O ACS incentiva testagem, nunca estigmatiza.',
    },
    {
        id: 'registro-civil',
        title: 'Registro Civil e Documentação Básica',
        category: 'atuacao',
        points: [
            'Registro de nascimento é direito de toda criança — deve ser feito em cartório nos primeiros 15 dias de vida',
            'ACS orienta a família sobre local, prazo e documentos necessários para o registro',
            'Sem registro civil não há acesso a CPF, escola, serviços de saúde, Bolsa Família e previdência',
            'Documentos básicos da família: RG, CPF, Cartão SUS, Cartão do Bolsa Família, Caderneta da Criança',
            'Identificar famílias sem documentação é parte do cadastramento — articular com CRAS e cartórios',
        ],
        remember: 'A falta de documentação é uma das maiores barreiras ao acesso a serviços. O ACS que identifica uma criança sem registro civil precisa agir imediatamente — é uma violação de direitos.',
    },
    {
        id: 'saude-adolescente',
        title: 'Saúde do Adolescente',
        category: 'saude',
        points: [
            'Faixa etária: 10 a 19 anos — período de intensas transformações físicas, emocionais e sociais',
            'Vacinação: HPV (9–14 anos, 2 doses), Meningocócica ACWY, reforço de dTpa e Hepatite B se incompleto',
            'Sexualidade: orientar sobre prevenção de gravidez na adolescência e IST — abordagem sem julgamento',
            'Saúde mental: identificar sinais de depressão, ansiedade, uso de substâncias e comportamentos de risco',
            'Transtornos alimentares (anorexia, bulimia): sinais de alerta — peso muito abaixo do esperado, recusa alimentar, vômitos frequentes',
        ],
        remember: 'O adolescente tem direito ao sigilo nas consultas (Estatuto da Criança e do Adolescente). O ACS não expõe informações à família sem consentimento, exceto em situações de risco de vida.',
    },
    {
        id: 'saude-homem',
        title: 'Saúde do Homem',
        category: 'saude',
        points: [
            'Homens buscam menos os serviços de saúde — mortalidade precoce é 2x maior que a das mulheres',
            'Rastreamento de câncer de próstata: PSA e toque retal para homens a partir dos 50 anos (ou 45 com histórico familiar)',
            'Hipertensão e diabetes são mais graves no homem por diagnóstico tardio — incentivar aferição e exames',
            'Saúde sexual: orientar sobre uso de preservativo, prevenção de IST e câncer de pênis (higiene e HPV)',
            'Saúde mental masculina: homens expressam menos sofrimento — suicídio é 3x mais frequente em homens',
        ],
        remember: '"Homem não vai ao médico" é um mito cultural perigoso. O ACS quebra essa barreira na visita domiciliar, falando com naturalidade sobre saúde masculina sem reforçar estereótipos.',
    },
    {
        id: 'alimentacao-atividade',
        title: 'Alimentação Saudável e Atividade Física',
        category: 'saude',
        points: [
            'Guia Alimentar Brasileiro: base em alimentos in natura e minimamente processados; evitar ultraprocessados',
            'Obesidade em adultos: IMC ≥ 30 — fator de risco para hipertensão, diabetes, doenças cardiovasculares e alguns cânceres',
            'Obesidade em crianças: acompanhar curva de crescimento — peso acima do percentil 97 exige avaliação nutricional',
            'Atividade física: 150 min/semana de intensidade moderada (caminhada rápida, natação, dança) para adultos',
            'Sedentarismo: tão prejudicial quanto tabagismo — aumenta risco de 35 doenças crônicas',
        ],
        remember: 'Orientar alimentação saudável considerando a realidade da família: renda, cultura e acesso local. O ACS não prescreve dieta, mas ensina o GUIA ALIMENTAR com linguagem simples e acessível.',
    },
    {
        id: 'ist-dst',
        title: 'IST — Infecções Sexualmente Transmissíveis',
        category: 'doencas',
        points: [
            'Principais IST: sífilis, gonorreia, clamídia, herpes genital, HPV, HIV — prevenção com preservativo',
            'Sífilis: ressurgimento alarmante no Brasil — transmissão sexual e vertical; testes rápidos na UBS',
            'Sífilis congênita: transmitida da mãe ao bebê na gestação — causa aborto, morte neonatal e malformações',
            'HPV: vírus mais comum do mundo — causa verrugas genitais e câncer de colo do útero; vacina disponível no SUS',
            'Toda IST em adulto requer rastreamento do parceiro(a) — o ACS orienta sem expor o paciente',
        ],
        remember: 'Sífilis em gestante é emergência — tratamento imediato com penicilina. Se o parceiro não tratar junto, a reinfecção é certa. O ACS pode ser o elo que quebra essa cadeia.',
    },
    {
        id: 'saude-bucal',
        title: 'Saúde Bucal',
        category: 'saude',
        points: [
            'Saúde bucal começa na gestação: cárie materna é fator de risco para cárie na criança',
            'Criança: limpeza das gengivas antes dos dentes nascerem; escovação com dentifrício fluoretado a partir dos 2 anos',
            'Adolescente: maior risco de cárie e gengivite — uso de aparelho não substitui higiene diária rigorosa',
            'Adulto: doença periodontal (gengiva) ligada a diabetes, doenças cardíacas e partos prematuros',
            'CEO (Centro de Especialidades Odontológicas): referência do SUS para endodontia, prótese e cirurgia',
        ],
        remember: 'Dor de dente tira o sono, impede trabalho e afeta saúde sistêmica. Encaminhar para a UBS com equipe de saúde bucal. Fluor na água e dentifrício são as intervenções de saúde pública mais custo-efetivas da história.',
    },
    {
        id: 'pessoa-deficiencia',
        title: 'Atenção à Pessoa com Deficiência',
        category: 'saude',
        points: [
            'Lei Brasileira de Inclusão (Lei nº 13.146/2015): garante direitos de acessibilidade, educação, trabalho e saúde',
            'Tipos: física, intelectual, visual, auditiva e múltipla — cada uma exige abordagem e encaminhamentos específicos',
            'Crianças com deficiência: diagnóstico precoce e estimulação são fundamentais — ACS identifica sinais de alerta no desenvolvimento',
            'Benefício de Prestação Continuada (BPC): 1 salário mínimo para PcD em situação de pobreza — ACS orienta sobre acesso',
            'Barreiras: arquitetônicas, comunicacionais e atitudinais — ACS mapeia dificuldades da pessoa no território',
        ],
        remember: 'Deficiência não é doença. O ACS combate o preconceito, identifica barreiras na comunidade e conecta a pessoa com deficiência às redes de apoio: CRAS, CER, CAPS e serviços de reabilitação.',
    },
    {
        id: 'acamados',
        title: 'Cuidados com Pessoas Acamadas',
        category: 'saude',
        points: [
            'Lesão por pressão (escaras): principal complicação — prevenção com mudança de decúbito a cada 2 horas',
            'Higiene: banho no leito, higiene oral e cuidados com pele — orientar cuidadores sobre técnicas corretas',
            'Nutrição: risco alto de desnutrição e desidratação — avaliar ingestão alimentar em toda visita',
            'Pneumonia aspirativa: risco em pacientes com dificuldade de deglutição — posicionamento correto nas refeições',
            'Sobrecarga do cuidador: depressão e síndrome do esgotamento são frequentes — ACS ativa rede de apoio',
        ],
        remember: 'O cuidador é tão importante quanto o paciente. Sem apoio e orientação, o cuidador adoece junto. O ACS avalia tanto a saúde do acamado quanto o bem-estar de quem cuida.',
    },
    {
        id: 'violencia-familiar',
        title: 'Violência Familiar',
        category: 'social',
        points: [
            'Tipos: física, psicológica, sexual, patrimonial e negligência — todas são formas de violação de direitos',
            'Violência contra a mulher: Lei Maria da Penha (Lei nº 11.340/2006) — notificação é obrigatória e sigilosa',
            'Violência contra criança/adolescente: notificação ao Conselho Tutelar é obrigatória por qualquer cidadão',
            'Violência contra o idoso: sinais — hematomas, medo, dinheiro desaparecendo, isolamento, negligência',
            'Violência contra PcD: grupo altamente vulnerável — abuso frequentemente praticado por cuidadores',
        ],
        remember: 'O ACS não é investigador nem juiz. Sua função é identificar sinais, acolher com cuidado e acionar a rede de proteção (Conselho Tutelar, CREAS, DEAM, UBS). Nunca confrontar o agressor sozinho.',
    },
    {
        id: 'outras-doencas-vetores',
        title: 'Esquistossomose, Malária e Tracoma',
        category: 'doencas',
        points: [
            'Esquistossomose: causada pelo Schistosoma mansoni — transmissão pelo contato com água doce contaminada por caramujos; risco em regiões com saneamento precário',
            'Malária: transmitida pelo Anopheles darlingi — endêmica na Amazônia; febre cíclica, calafrios e sudorese; notificação compulsória',
            'Tracoma: infecção ocular bacteriana (Chlamydia trachomatis) — transmissão por contato direto; principal causa de cegueira evitável no mundo',
            'Prevenção comum: saneamento básico, acesso à água tratada, higiene e controle de vetores',
            'ACS identifica casos suspeitos e aciona a vigilância — todas são doenças de notificação compulsória',
        ],
        remember: 'Essas doenças são marcadores de pobreza e ausência de saneamento. O ACS que atua em áreas endêmicas precisa conhecê-las bem — diagnóstico tardio significa sequelas permanentes.',
    },
];

// ─── Level quiz data ──────────────────────────────────────────

const LEVEL_QUESTIONS = {
    basico: {
        label: 'Básico',
        color: 'success',
        description: 'Conceitos fundamentais, definições e atribuições essenciais do ACS.',
        questions: [
            {
                id: 'lb1',
                text: 'O ACS pertence a qual nível de atenção à saúde?',
                options: [
                    { value: 'a', text: 'Atenção secundária (ambulatórios especializados)' },
                    { value: 'b', text: 'Atenção primária à saúde' },
                    { value: 'c', text: 'Atenção terciária (hospitais de alta complexidade)' },
                ],
                correct: 'b',
            },
            {
                id: 'lb2',
                text: 'Qual das seguintes é uma atividade típica do ACS?',
                options: [
                    { value: 'a', text: 'Realizar procedimentos cirúrgicos domiciliares' },
                    { value: 'b', text: 'Realizar visitas domiciliares e acompanhar famílias' },
                    { value: 'c', text: 'Prescrever medicamentos de uso contínuo' },
                ],
                correct: 'b',
            },
            {
                id: 'lb3',
                text: 'A promoção da saúde tem como foco principal:',
                options: [
                    { value: 'a', text: 'Curar doenças já instaladas na população' },
                    { value: 'b', text: 'Criar condições para que as pessoas vivam de forma mais saudável' },
                    { value: 'c', text: 'Aumentar o número de internações hospitalares' },
                ],
                correct: 'b',
            },
            {
                id: 'lb4',
                text: 'O que é notificação compulsória?',
                options: [
                    { value: 'a', text: 'Avisar os vizinhos sobre doenças que surgirem na área' },
                    { value: 'b', text: 'Comunicar obrigatoriamente às autoridades de saúde determinadas doenças' },
                    { value: 'c', text: 'Registrar apenas doenças crônicas no prontuário familiar' },
                ],
                correct: 'b',
            },
            {
                id: 'lb5',
                text: 'Qual é o principal instrumento de trabalho do ACS?',
                options: [
                    { value: 'a', text: 'O estetoscópio e o termômetro clínico' },
                    { value: 'b', text: 'A visita domiciliar' },
                    { value: 'c', text: 'A prescrição de exames laboratoriais' },
                ],
                correct: 'b',
            },
            {
                id: 'lb6',
                text: 'O ACS deve residir na comunidade onde atua. Qual é o principal motivo?',
                options: [
                    { value: 'a', text: 'Para reduzir gastos com transporte público' },
                    { value: 'b', text: 'Para criar vínculo, conhecer a realidade local e ser acessível à população' },
                    { value: 'c', text: 'Porque a legislação proíbe que o ACS more em outro bairro' },
                ],
                correct: 'b',
            },
        ],
    },

    intermediario: {
        label: 'Intermediário',
        color: 'primary',
        description: 'Compreensão e aplicação dos conceitos em situações do cotidiano.',
        questions: [
            {
                id: 'li1',
                text: 'Uma moradora pede ao ACS que prescreva um remédio para dor de cabeça persistente. A conduta correta é:',
                options: [
                    { value: 'a', text: 'Indicar um analgésico comum e acompanhar a evolução' },
                    { value: 'b', text: 'Orientar a buscar atendimento na UBS e registrar o caso para acompanhamento' },
                    { value: 'c', text: 'Encaminhar diretamente a uma farmácia sem contato com a equipe' },
                ],
                correct: 'b',
            },
            {
                id: 'li2',
                text: 'Ao visitar uma família, o ACS encontra uma criança de 2 anos com vacinação atrasada. O que deve fazer?',
                options: [
                    { value: 'a', text: 'Vacinar a criança no domicílio com as vacinas do kit da equipe' },
                    { value: 'b', text: 'Orientar os responsáveis sobre a importância e encaminhar para a UBS' },
                    { value: 'c', text: 'Apenas registrar no caderno de visitas sem tomar outra providência' },
                ],
                correct: 'b',
            },
            {
                id: 'li3',
                text: 'Qual é a principal diferença entre prevenção e promoção da saúde?',
                options: [
                    { value: 'a', text: 'São sinônimos com o mesmo objetivo prático' },
                    { value: 'b', text: 'Prevenção evita doenças específicas; promoção cria condições gerais de saúde e bem-estar' },
                    { value: 'c', text: 'Promoção trata doenças; prevenção é exclusiva de médicos' },
                ],
                correct: 'b',
            },
            {
                id: 'li4',
                text: 'Um idoso não consegue ir à UBS por dificuldade de locomoção. A conduta do ACS é:',
                options: [
                    { value: 'a', text: 'Informar que o atendimento só pode ocorrer dentro da unidade' },
                    { value: 'b', text: 'Articular com a equipe de saúde para organizar atendimento domiciliar' },
                    { value: 'c', text: 'Pedir que um familiar leve o idoso sem comunicar à equipe' },
                ],
                correct: 'b',
            },
            {
                id: 'li5',
                text: 'O ACS percebe sintomas de dengue em um morador durante visita. O que deve fazer primeiro?',
                options: [
                    { value: 'a', text: 'Aguardar a evolução por 48h antes de comunicar a equipe' },
                    { value: 'b', text: 'Orientar sobre sinais de alerta, hidratação e encaminhar imediatamente à UBS' },
                    { value: 'c', text: 'Recomendar automedicação com analgésicos enquanto monitora' },
                ],
                correct: 'b',
            },
            {
                id: 'li6',
                text: 'Durante visita, uma mãe relata que seu bebê não está ganhando peso. Qual é a conduta do ACS?',
                options: [
                    { value: 'a', text: 'Prescrever fórmula infantil e orientar sobre preparo correto' },
                    { value: 'b', text: 'Registrar, orientar sobre aleitamento e encaminhar para avaliação nutricional na UBS' },
                    { value: 'c', text: 'Aguardar a próxima visita programada para reavaliação' },
                ],
                correct: 'b',
            },
        ],
    },

    avancado: {
        label: 'Avançado',
        color: 'warning',
        description: 'Análise de cenários complexos, epidemiologia e tomada de decisão.',
        questions: [
            {
                id: 'la1',
                text: 'Uma comunidade apresenta aumento súbito de diarreia em crianças na mesma semana. Qual é a conduta mais completa do ACS?',
                options: [
                    { value: 'a', text: 'Distribuir soro caseiro nas casas afetadas e aguardar resolução espontânea' },
                    { value: 'b', text: 'Mapear os casos, identificar possível fonte comum (água ou alimento) e acionar a vigilância epidemiológica com dados sistematizados' },
                    { value: 'c', text: 'Encaminhar apenas as crianças com sintomas mais graves e ignorar os demais' },
                ],
                correct: 'b',
            },
            {
                id: 'la2',
                text: 'Quatro famílias na mesma rua apresentaram tuberculose no último ano. Qual hipótese o ACS deve levantar?',
                options: [
                    { value: 'a', text: 'Coincidência, pois tuberculose não tem relação com fatores ambientais' },
                    { value: 'b', text: 'Possível foco de transmissão ativa no território, exigindo investigação epidemiológica e busca ativa de contatos' },
                    { value: 'c', text: 'Predisposição genética das famílias, que não requer ação coletiva' },
                ],
                correct: 'b',
            },
            {
                id: 'la3',
                text: 'Por que o vínculo com a comunidade é considerado uma ferramenta terapêutica?',
                options: [
                    { value: 'a', text: 'Porque substitui o atendimento médico em situações simples' },
                    { value: 'b', text: 'Porque aumenta a adesão ao tratamento, facilita o diagnóstico precoce e melhora resultados de saúde' },
                    { value: 'c', text: 'Porque reduz a necessidade de medicamentos de alto custo no SUS' },
                ],
                correct: 'b',
            },
            {
                id: 'la4',
                text: 'Um idoso hipertenso não toma o remédio regularmente por não conseguir pagar. Qual é a abordagem mais completa?',
                options: [
                    { value: 'a', text: 'Solicitar que a família compre o medicamento por conta própria' },
                    { value: 'b', text: 'Orientar sobre Farmácia Popular, verificar direito a medicamentos gratuitos pelo SUS e comunicar à equipe' },
                    { value: 'c', text: 'Sugerir que o paciente reduza a dosagem para economizar o remédio disponível' },
                ],
                correct: 'b',
            },
            {
                id: 'la5',
                text: 'Qual é o principal risco de o ACS assumir funções de diagnóstico e tratamento sem respaldo técnico?',
                options: [
                    { value: 'a', text: 'Apenas sobrecarga de trabalho, sem consequências clínicas ou legais' },
                    { value: 'b', text: 'Retardo no diagnóstico correto, risco de dano ao usuário e responsabilidade civil e ética' },
                    { value: 'c', text: 'Nenhum risco concreto, pois o ACS conhece profundamente a comunidade' },
                ],
                correct: 'b',
            },
            {
                id: 'la6',
                text: 'Qual é a diferença prática entre vigilância epidemiológica e vigilância sanitária no papel do ACS?',
                options: [
                    { value: 'a', text: 'São a mesma coisa com nomes diferentes dentro do SUS' },
                    { value: 'b', text: 'Epidemiológica monitora doenças na população; sanitária envolve condições do ambiente, alimentos e produtos' },
                    { value: 'c', text: 'Vigilância sanitária é exclusiva dos fiscais da prefeitura, sem relação com o ACS' },
                ],
                correct: 'b',
            },
        ],
    },

    expert: {
        label: 'Expert',
        color: 'expert',
        description: 'Dilemas éticos, interseccionalidade social e decisão em situações-limite.',
        questions: [
            {
                id: 'le1',
                text: 'Em visita, você percebe sinais de violência doméstica em uma mulher que pede sigilo absoluto. Como agir?',
                options: [
                    { value: 'a', text: 'Respeitar o pedido integralmente e não registrar para preservar a confiança' },
                    { value: 'b', text: 'Acolher sem julgamento, informar sobre serviços disponíveis e notificar em caso de risco iminente conforme protocolo municipal' },
                    { value: 'c', text: 'Comunicar imediatamente à polícia sem dialogar previamente com a vítima' },
                ],
                correct: 'b',
            },
            {
                id: 'le2',
                text: 'Sua liderança orienta ações contrárias ao protocolo do Ministério da Saúde. Qual é a atitude ética correta?',
                options: [
                    { value: 'a', text: 'Seguir a liderança sem questionamentos, respeitando a hierarquia institucional' },
                    { value: 'b', text: 'Registrar formalmente a divergência e comunicar ao coordenador da UBS ou ao Conselho Local de Saúde' },
                    { value: 'c', text: 'Agir por conta própria conforme o protocolo sem comunicar ninguém' },
                ],
                correct: 'b',
            },
            {
                id: 'le3',
                text: 'Fake news sobre vacinas circulam na comunidade gerando recusa de imunização em massa. Qual é a estratégia mais eficaz?',
                options: [
                    { value: 'a', text: 'Ignorar, pois as pessoas acabam se vacinando por obrigação legal' },
                    { value: 'b', text: 'Identificar as desinformações, apresentar evidências com linguagem acessível, mobilizar lideranças locais e comunicar à equipe de saúde' },
                    { value: 'c', text: 'Proibir conversas sobre o assunto durante as visitas domiciliares' },
                ],
                correct: 'b',
            },
            {
                id: 'le4',
                text: 'Uma família apresenta: desemprego, insegurança alimentar, criança fora da escola e adulto com doença crônica descompensada. Qual é a abordagem correta do ACS?',
                options: [
                    { value: 'a', text: 'Focar exclusivamente na doença crônica por ser o problema de saúde mais urgente' },
                    { value: 'b', text: 'Realizar escuta qualificada, mapear todas as necessidades, articular intersetorialmente (CRAS, escola, UBS) e monitorar continuamente' },
                    { value: 'c', text: 'Encaminhar apenas ao assistente social e considerar o caso resolvido' },
                ],
                correct: 'b',
            },
            {
                id: 'le5',
                text: 'Qual é o papel do ACS no controle social do SUS?',
                options: [
                    { value: 'a', text: 'Apenas executar ordens da secretaria de saúde sem participar das decisões' },
                    { value: 'b', text: 'Ser mediador entre comunidade e sistema, estimulando participação em Conselhos de Saúde e levando demandas da população à gestão' },
                    { value: 'c', text: 'Evitar envolvimento político para manter neutralidade profissional absoluta' },
                ],
                correct: 'b',
            },
            {
                id: 'le6',
                text: 'Uma família recusa vacinação da criança por convicção religiosa. Após múltiplas visitas sem adesão, qual é o limite ético da sua atuação?',
                options: [
                    { value: 'a', text: 'Impor a vacinação com apoio policial para garantir a proteção da criança' },
                    { value: 'b', text: 'Documentar as tentativas de diálogo, comunicar ao Conselho Tutelar se houver risco à criança e manter o vínculo respeitoso' },
                    { value: 'c', text: 'Encerrar o acompanhamento da família por falta de cooperação' },
                ],
                correct: 'b',
            },
        ],
    },
};

// ─── App state ────────────────────────────────────────────────

const state = {
    completed: new Set(),
    scores: {},
};

const studyState = {
    studied:     new Set(),
    activeFilter: 'all',
    searchQuery:  '',
};

const levelState = {
    questions: [],
    levelKey:  null,
};

// ─── Navigation ───────────────────────────────────────────────

const navItems = document.querySelectorAll('.nav__item');
const panels   = document.querySelectorAll('.panel');

function activateModule(index) {
    navItems.forEach((item, i) => {
        const active = i === index;
        item.setAttribute('aria-selected', active);
        item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel, i) => {
        panel.setAttribute('aria-hidden', i !== index);
    });
    document.querySelector('.content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach(item => {
    item.addEventListener('click', () => activateModule(Number(item.dataset.module)));
    item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateModule(Number(item.dataset.module));
        }
    });
});

// ─── Module quiz ──────────────────────────────────────────────

function checkQuiz(quizIndex) {
    const quiz      = document.querySelector(`[data-quiz="${quizIndex}"]`);
    const questions = quiz.querySelectorAll('.question');
    let correct     = 0;
    let answered    = 0;
    let allAnswered  = true;

    questions.forEach(question => {
        const name     = question.dataset.question;
        const selected = question.querySelector(`input[name="${name}"]:checked`);
        const feedback = question.querySelector('.feedback');
        const options  = question.querySelectorAll('.option');

        if (!selected) {
            allAnswered = false;
            feedback.className   = 'feedback feedback--show feedback--warn';
            feedback.textContent = 'Selecione uma resposta antes de continuar.';
            return;
        }

        answered++;
        const isCorrect = selected.value === CORRECT_ANSWERS[name];

        options.forEach(opt => {
            const radio = opt.querySelector('input');
            opt.classList.add('option--locked');
            radio.disabled = true;
            if (radio.value === CORRECT_ANSWERS[name]) opt.classList.add('option--correct');
            if (radio.checked && !isCorrect)           opt.classList.add('option--incorrect');
        });

        if (isCorrect) {
            correct++;
            feedback.className   = 'feedback feedback--show feedback--success';
            feedback.textContent = 'Correto!';
        } else {
            feedback.className   = 'feedback feedback--show feedback--error';
            feedback.textContent = 'Incorreto. Revise o conteúdo.';
        }
    });

    if (!allAnswered) return;

    const pct = Math.round((correct / answered) * 100);
    state.scores[quizIndex] = pct;
    if (pct === 100) state.completed.add(quizIndex);

    quiz.querySelector('[data-action="check"]').hidden = true;
    quiz.querySelector('[data-action="reset"]').hidden = false;

    updateBadge(quizIndex, pct);
    updateProgress();
    showModal(pct);
}

function resetQuiz(quizIndex) {
    const quiz = document.querySelector(`[data-quiz="${quizIndex}"]`);

    quiz.querySelectorAll('.question').forEach(question => {
        question.querySelectorAll('input[type="radio"]').forEach(r => {
            r.checked  = false;
            r.disabled = false;
        });
        question.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('option--locked', 'option--correct', 'option--incorrect');
        });
        const fb = question.querySelector('.feedback');
        fb.className   = 'feedback';
        fb.textContent = '';
    });

    quiz.querySelector('[data-action="check"]').hidden = false;
    quiz.querySelector('[data-action="reset"]').hidden = true;

    state.completed.delete(quizIndex);
    delete state.scores[quizIndex];
    updateBadge(quizIndex, null);
    updateProgress();
}

// ─── Progress & badges ────────────────────────────────────────

function updateBadge(quizIndex, pct) {
    const badge = document.querySelector(`[data-badge="${quizIndex}"]`);
    if (!badge) return;
    if (pct === null)     { badge.className = 'badge badge--new';  badge.textContent = 'Novo'; }
    else if (pct === 100) { badge.className = 'badge badge--done'; badge.textContent = '100%'; }
    else                  { badge.className = 'badge badge--new';  badge.textContent = pct + '%'; }
}

function updateProgress() {
    const scoreValues = Object.values(state.scores);
    const totalPct = scoreValues.length > 0
        ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
        : 0;

    document.getElementById('progressFill').style.width = totalPct + '%';
    document.getElementById('progressBar').setAttribute('aria-valuenow', totalPct);
    document.getElementById('statModules').textContent = state.completed.size;
    document.getElementById('statScore').textContent   = scoreValues.length > 0 ? totalPct + '%' : '—';
}

// ─── Module modal ─────────────────────────────────────────────

function showModal(pct) {
    document.getElementById('modalScore').textContent = pct + '%';
    const msg = document.getElementById('modalMessage');
    if      (pct === 100) msg.textContent = 'Perfeito! Você domina este conteúdo!';
    else if (pct >= 80)   msg.textContent = 'Muito bom! Continue praticando!';
    else if (pct >= 60)   msg.textContent = 'Bom início! Revise o conteúdo e refaça.';
    else                  msg.textContent = 'Continue estudando, você consegue!';
    document.getElementById('resultModal').classList.add('modal-backdrop--open');
    document.getElementById('modalClose').focus();
}

document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('resultModal').classList.remove('modal-backdrop--open');
});

document.getElementById('resultModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('modal-backdrop--open');
});

// ─── Study section ───────────────────────────────────────────

function renderStudyFilters() {
    const container = document.getElementById('studyFilters');
    const allBtn = `<button class="study-filter study-filter--active" data-filter="all">Todos</button>`;
    const catBtns = Object.entries(STUDY_CATEGORIES).map(([key, cat]) =>
        `<button class="study-filter study-filter--${cat.color}" data-filter="${key}">${cat.label}</button>`
    ).join('');
    container.innerHTML = allBtn + catBtns;
}

function renderStudyGrid() {
    const grid      = document.getElementById('studyGrid');
    const noResults = document.getElementById('studyNoResults');
    const { activeFilter, searchQuery, studied } = studyState;

    const filtered = STUDY_TOPICS.filter(topic => {
        const matchesFilter = activeFilter === 'all' || topic.category === activeFilter;
        const matchesSearch = !searchQuery ||
            topic.title.toLowerCase().includes(searchQuery)   ||
            topic.points.some(p => p.toLowerCase().includes(searchQuery)) ||
            topic.remember.toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        noResults.hidden = false;
        return;
    }

    noResults.hidden = true;

    grid.innerHTML = filtered.map(topic => {
        const cat    = STUDY_CATEGORIES[topic.category];
        const isDone = studied.has(topic.id);

        return `
            <article class="topic-card topic-card--${cat.color}${isDone ? ' topic-card--studied' : ''}">
                <div class="topic-card__header">
                    <div>
                        <span class="topic-badge topic-badge--${cat.color}">${cat.label}</span>
                        <h3 class="topic-card__title">${topic.title}</h3>
                    </div>
                    <button
                        class="topic-mark${isDone ? ' topic-mark--done' : ''}"
                        data-action="toggle-studied"
                        data-topic="${topic.id}"
                        aria-label="${isDone ? 'Desmarcar como estudado' : 'Marcar como estudado'}"
                        title="${isDone ? 'Desmarcar' : 'Marcar como estudado'}"
                    >${isDone ? '✓' : '○'}</button>
                </div>
                <ul class="topic-card__points">
                    ${topic.points.map(p => `<li class="topic-card__point">${p}</li>`).join('')}
                </ul>
                <div class="topic-card__remember">
                    <strong>Lembre-se:</strong> ${topic.remember}
                </div>
            </article>
        `;
    }).join('');

    updateStudyProgress();
}

function toggleStudied(topicId) {
    if (studyState.studied.has(topicId)) studyState.studied.delete(topicId);
    else studyState.studied.add(topicId);
    renderStudyGrid();
}

function updateStudyProgress() {
    const total = STUDY_TOPICS.length;
    const done  = studyState.studied.size;
    const pct   = Math.round((done / total) * 100);
    document.getElementById('studyProgressText').textContent    = `${done} de ${total} tópicos estudados`;
    document.getElementById('studyProgressFill').style.width    = pct + '%';
    document.getElementById('studyProgressBar').setAttribute('aria-valuenow', pct);
}

// ─── Level quiz — render ──────────────────────────────────────

function renderLevelSelector() {
    const selector = document.getElementById('levelSelector');
    const quiz     = document.getElementById('levelQuiz');

    selector.innerHTML = Object.entries(LEVEL_QUESTIONS).map(([key, level]) => `
        <button class="level-card level-card--${level.color}" data-action="level-start" data-level="${key}">
            <div class="level-card__accent"></div>
            <div class="level-card__body">
                <p class="level-card__name">${level.label}</p>
                <p class="level-card__desc">${level.description}</p>
                <p class="level-card__meta">6 questões por tentativa</p>
            </div>
            <span class="level-card__cta">Iniciar →</span>
        </button>
    `).join('');

    selector.hidden = false;
    quiz.hidden     = true;
}

async function renderLevelQuiz(levelKey) {
    const level    = LEVEL_QUESTIONS[levelKey];
    const selector = document.getElementById('levelSelector');
    const quiz     = document.getElementById('levelQuiz');

    selector.hidden = true;
    quiz.hidden     = false;
    quiz.innerHTML  = `
        <div class="level-quiz-header">
            <button class="btn btn--ghost" data-action="level-back">← Voltar</button>
            <h3 class="level-quiz-header__title">Nível ${level.label}</h3>
        </div>
        <div style="text-align:center;padding:40px;opacity:.6">Sorteando questões...</div>
    `;

    let questions;
    try {
        const all  = await getAllQuestoes();
        const pool = all.filter(q => q.nivel === levelKey);
        questions  = pool.length > 0
            ? shuffleArray(pool).slice(0, 6)
            : level.questions;
    } catch (_) {
        questions = level.questions;
    }

    levelState.questions = questions;
    levelState.levelKey  = levelKey;

    const questionsHTML = questions.map((q, i) => `
        <div class="question" data-question="${q.id}">
            <p class="question__text">${i + 1}. ${q.text}</p>
            <div class="options" role="radiogroup">
                ${q.options.map(opt => `
                    <label class="option">
                        <input type="radio" name="${q.id}" value="${opt.value}">
                        <span>${opt.text}</span>
                    </label>
                `).join('')}
            </div>
            <div class="feedback" aria-live="polite"></div>
        </div>
    `).join('');

    quiz.innerHTML = `
        <div class="level-quiz-header">
            <button class="btn btn--ghost" data-action="level-back">← Voltar</button>
            <h3 class="level-quiz-header__title">Nível ${level.label}</h3>
            <span class="level-badge level-badge--${level.color}">${questions.length} questões</span>
        </div>
        ${questionsHTML}
        <div class="quiz__actions">
            <button class="btn btn--primary" data-action="check-level" data-level="${levelKey}">Verificar Respostas</button>
        </div>
        <div class="level-result" hidden>
            <div class="level-result__score"></div>
            <p class="level-result__message"></p>
            <div class="level-result__actions">
                <button class="btn btn--ghost"    data-action="level-retry" data-level="${levelKey}">Tentar Novamente</button>
                <button class="btn btn--primary"  data-action="level-back">Escolher Outro Nível</button>
            </div>
        </div>
    `;
}

// ─── Level quiz — check ───────────────────────────────────────

function checkLevelQuiz(levelKey) {
    const level       = LEVEL_QUESTIONS[levelKey];
    const quiz        = document.getElementById('levelQuiz');
    const questions   = levelState.questions;
    let correct       = 0;
    let answered      = 0;
    let allAnswered   = true;

    questions.forEach(q => {
        const questionEl = quiz.querySelector(`[data-question="${q.id}"]`);
        const selected   = questionEl.querySelector(`input[name="${q.id}"]:checked`);
        const feedback   = questionEl.querySelector('.feedback');
        const options    = questionEl.querySelectorAll('.option');

        if (!selected) {
            allAnswered = false;
            feedback.className   = 'feedback feedback--show feedback--warn';
            feedback.textContent = 'Selecione uma resposta antes de continuar.';
            return;
        }

        answered++;
        const isCorrect = selected.value === q.correct;

        options.forEach(opt => {
            const radio = opt.querySelector('input');
            opt.classList.add('option--locked');
            radio.disabled = true;
            if (radio.value === q.correct) opt.classList.add('option--correct');
            if (radio.checked && !isCorrect) opt.classList.add('option--incorrect');
        });

        if (isCorrect) {
            correct++;
            feedback.className   = 'feedback feedback--show feedback--success';
            feedback.textContent = 'Correto!';
        } else {
            feedback.className   = 'feedback feedback--show feedback--error';
            feedback.textContent = 'Incorreto. Revise o conteúdo.';
        }
    });

    if (!allAnswered) return;

    const pct    = Math.round((correct / answered) * 100);
    const result = quiz.querySelector('.level-result');

    quiz.querySelector('[data-action="check-level"]').hidden = true;

    result.querySelector('.level-result__score').textContent   = pct + '%';
    result.querySelector('.level-result__message').textContent =
        pct === 100  ? 'Perfeito! Você domina este nível!' :
        pct >= 80    ? 'Muito bom! Tente o próximo nível.' :
        pct >= 60    ? 'Bom início! Revise o conteúdo e refaça.' :
                       'Continue estudando, você consegue!';

    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Exam data ────────────────────────────────────────────────

const EXAM_TOPICS = {
    sus:       { label: 'SUS e Princípios',         count: 5 },
    acs:       { label: 'ACS e Atribuições',         count: 5 },
    doencas:   { label: 'Doenças Transmissíveis',   count: 5 },
    crianca:   { label: 'Saúde da Criança',         count: 4 },
    mulher:    { label: 'Saúde da Mulher',          count: 3 },
    cronicas:  { label: 'Doenças Crônicas',         count: 3 },
    vigilancia:{ label: 'Vigilância em Saúde',      count: 3 },
    mental:    { label: 'Saúde Mental',             count: 2 },
};

const EXAM_QUESTIONS = [
    // ── SUS ──
    {
        id: 'sus1', topic: 'sus',
        text: 'Qual princípio do SUS garante que todo cidadão tem direito ao atendimento, independentemente de raça, religião, situação financeira ou qualquer outra condição?',
        options: [
            { value: 'a', text: 'Equidade' },
            { value: 'b', text: 'Universalidade' },
            { value: 'c', text: 'Integralidade' },
        ],
        correct: 'b',
    },
    {
        id: 'sus2', topic: 'sus',
        text: 'A Atenção Primária à Saúde no Brasil está organizada principalmente por meio de:',
        options: [
            { value: 'a', text: 'Estratégia Saúde da Família (ESF)' },
            { value: 'b', text: 'Hospitais de referência regional' },
            { value: 'c', text: 'Unidades de Pronto Atendimento (UPA)' },
        ],
        correct: 'a',
    },
    {
        id: 'sus3', topic: 'sus',
        text: 'O princípio da equidade no SUS significa:',
        options: [
            { value: 'a', text: 'Oferecer o mesmo atendimento a todos os cidadãos, sem qualquer distinção' },
            { value: 'b', text: 'Tratar as doenças mais graves com prioridade absoluta sobre as demais' },
            { value: 'c', text: 'Reconhecer diferenças nas necessidades e priorizar quem mais precisa de cuidado' },
        ],
        correct: 'c',
    },
    {
        id: 'sus4', topic: 'sus',
        text: 'O controle social do SUS é exercido principalmente por meio de:',
        options: [
            { value: 'a', text: 'Das secretarias estaduais e municipais de saúde' },
            { value: 'b', text: 'Dos Conselhos de Saúde e Conferências de Saúde' },
            { value: 'c', text: 'Dos planos de saúde privados conveniados ao SUS' },
        ],
        correct: 'b',
    },
    {
        id: 'sus5', topic: 'sus',
        text: 'Qual lei regulamentou o Sistema Único de Saúde (SUS), definindo seus princípios, diretrizes e organização?',
        options: [
            { value: 'a', text: 'Lei nº 8.080/1990 (Lei Orgânica da Saúde)' },
            { value: 'b', text: 'Lei nº 11.350/2006' },
            { value: 'c', text: 'Lei nº 8.142/1990' },
        ],
        correct: 'a',
    },
    // ── ACS ──
    {
        id: 'acs1', topic: 'acs',
        text: 'Com que frequência mínima o ACS deve realizar visita domiciliar a cada família de sua microárea?',
        options: [
            { value: 'a', text: 'A cada 3 meses' },
            { value: 'b', text: 'Pelo menos 1 vez por mês' },
            { value: 'c', text: 'Apenas quando solicitado pelo usuário ou pela equipe' },
        ],
        correct: 'b',
    },
    {
        id: 'acs2', topic: 'acs',
        text: 'De acordo com a Lei nº 11.350/2006, o ACS é obrigado a:',
        options: [
            { value: 'a', text: 'Ter formação de nível superior na área da saúde' },
            { value: 'b', text: 'Ser aprovado em concurso público federal para o cargo' },
            { value: 'c', text: 'Residir na área em que atua como requisito do exercício da função' },
        ],
        correct: 'c',
    },
    {
        id: 'acs3', topic: 'acs',
        text: 'Qual das seguintes ações está DENTRO das atribuições legais do ACS?',
        options: [
            { value: 'a', text: 'Orientar famílias sobre uso adequado dos serviços de saúde e realizar cadastramento domiciliar' },
            { value: 'b', text: 'Prescrever medicamentos de uso contínuo para doenças crônicas estabilizadas' },
            { value: 'c', text: 'Realizar curativos complexos e aplicar injeções domiciliares' },
        ],
        correct: 'a',
    },
    {
        id: 'acs4', topic: 'acs',
        text: 'O ACS identifica em domicílio um caso suspeito de doença de notificação compulsória. A conduta correta é:',
        options: [
            { value: 'a', text: 'Notificar diretamente ao SINAN sem aguardar contato com a equipe de saúde' },
            { value: 'b', text: 'Comunicar imediatamente à equipe de saúde para que a notificação formal seja realizada' },
            { value: 'c', text: 'Aguardar confirmação laboratorial antes de qualquer ação ou comunicação' },
        ],
        correct: 'b',
    },
    {
        id: 'acs5', topic: 'acs',
        text: 'Qual é a escolaridade mínima exigida por lei para o exercício da função de Agente Comunitário de Saúde?',
        options: [
            { value: 'a', text: 'Ensino fundamental completo' },
            { value: 'b', text: 'Ensino médio incompleto' },
            { value: 'c', text: 'Ensino médio completo' },
        ],
        correct: 'c',
    },
    // ── Doenças transmissíveis ──
    {
        id: 'doe1', topic: 'doencas',
        text: 'Qual é a principal via de transmissão da tuberculose?',
        options: [
            { value: 'a', text: 'Contato com objetos contaminados (fômites)' },
            { value: 'b', text: 'Via aérea, por gotículas expelidas pela tosse do doente' },
            { value: 'c', text: 'Água e alimentos contaminados com o bacilo' },
        ],
        correct: 'b',
    },
    {
        id: 'doe2', topic: 'doencas',
        text: 'Qual mosquito é o vetor responsável pela transmissão da dengue, zika e chikungunya?',
        options: [
            { value: 'a', text: 'Aedes aegypti' },
            { value: 'b', text: 'Anopheles darlingi' },
            { value: 'c', text: 'Culex quinquefasciatus' },
        ],
        correct: 'a',
    },
    {
        id: 'doe3', topic: 'doencas',
        text: 'Qual é o sinal de alarme da dengue que indica risco de evolução para forma grave?',
        options: [
            { value: 'a', text: 'Febre acima de 37,5°C apenas no primeiro dia da doença' },
            { value: 'b', text: 'Dor de cabeça e dor atrás dos olhos desde o início' },
            { value: 'c', text: 'Dor abdominal intensa, vômito persistente e sangramento espontâneo' },
        ],
        correct: 'c',
    },
    {
        id: 'doe4', topic: 'doencas',
        text: 'O Tratamento Diretamente Observado (DOTS) para tuberculose tem como objetivo principal:',
        options: [
            { value: 'a', text: 'Reduzir o custo do tratamento para o sistema público de saúde' },
            { value: 'b', text: 'Garantir a adesão ao tratamento e evitar o abandono e a resistência bacteriana' },
            { value: 'c', text: 'Isolar o paciente da comunidade durante toda a fase contagiante' },
        ],
        correct: 'b',
    },
    {
        id: 'doe5', topic: 'doencas',
        text: 'Em gestantes infectadas pelo vírus Zika, o principal risco para o feto é:',
        options: [
            { value: 'a', text: 'Microcefalia e outras malformações congênitas no recém-nascido' },
            { value: 'b', text: 'Aborto espontâneo inevitável no primeiro trimestre da gestação' },
            { value: 'c', text: 'Pré-eclâmpsia severa com risco de morte materna' },
        ],
        correct: 'a',
    },
    // ── Saúde da criança ──
    {
        id: 'cri1', topic: 'crianca',
        text: 'Até que idade é recomendado o aleitamento materno EXCLUSIVO, sem oferta de água, chás ou outros alimentos?',
        options: [
            { value: 'a', text: 'Até os 3 meses de vida' },
            { value: 'b', text: 'Até os 6 meses de vida' },
            { value: 'c', text: 'Até o 1º ano de vida' },
        ],
        correct: 'b',
    },
    {
        id: 'cri2', topic: 'crianca',
        text: 'O ACS visita uma família e constata que a criança de 8 meses não teve consulta de puericultura há 4 meses. A conduta correta é:',
        options: [
            { value: 'a', text: 'Aguardar a próxima visita programada e reavaliar então a situação' },
            { value: 'b', text: 'Orientar a mãe a comprar vitaminas na farmácia para compensar as consultas perdidas' },
            { value: 'c', text: 'Registrar, orientar os responsáveis e encaminhar para consulta na UBS com urgência' },
        ],
        correct: 'c',
    },
    {
        id: 'cri3', topic: 'crianca',
        text: 'O principal documento de acompanhamento do crescimento e desenvolvimento infantil que o ACS deve verificar em cada visita é:',
        options: [
            { value: 'a', text: 'A Caderneta da Criança (Caderneta de Saúde da Criança)' },
            { value: 'b', text: 'O prontuário médico arquivado na UBS' },
            { value: 'c', text: 'A ficha de vacinação avulsa entregue pelo hospital no nascimento' },
        ],
        correct: 'a',
    },
    {
        id: 'cri4', topic: 'crianca',
        text: 'Ao suspeitar de violência ou maus-tratos contra uma criança durante visita domiciliar, o ACS deve:',
        options: [
            { value: 'a', text: 'Tentar resolver a situação internamente na família sem envolver terceiros' },
            { value: 'b', text: 'Comunicar imediatamente à equipe de saúde; a notificação ao Conselho Tutelar é obrigatória' },
            { value: 'c', text: 'Aguardar pelo menos 3 visitas consecutivas antes de tomar qualquer providência' },
        ],
        correct: 'b',
    },
    // ── Saúde da mulher ──
    {
        id: 'mul1', topic: 'mulher',
        text: 'Qual é a periodicidade recomendada para a realização do Papanicolau após dois exames anuais normais consecutivos?',
        options: [
            { value: 'a', text: 'Anualmente, sem interrupção' },
            { value: 'b', text: 'A cada 2 anos' },
            { value: 'c', text: 'A cada 3 anos' },
        ],
        correct: 'c',
    },
    {
        id: 'mul2', topic: 'mulher',
        text: 'Qual é a faixa etária do público-alvo para rastreamento do câncer de colo do útero pelo Papanicolau, conforme o Ministério da Saúde?',
        options: [
            { value: 'a', text: 'De 18 a 50 anos' },
            { value: 'b', text: 'De 25 a 64 anos' },
            { value: 'c', text: 'De 30 a 70 anos' },
        ],
        correct: 'b',
    },
    {
        id: 'mul3', topic: 'mulher',
        text: 'Uma gestante apresenta edema excessivo, cefaleia intensa e PA de 160/110 mmHg. O ACS deve:',
        options: [
            { value: 'a', text: 'Encaminhar com urgência à UBS ou pronto-socorro — são sinais de pré-eclâmpsia grave' },
            { value: 'b', text: 'Orientar repouso em casa e aguardar a próxima consulta de pré-natal já agendada' },
            { value: 'c', text: 'Agendar consulta de rotina para avaliação médica sem caráter de urgência' },
        ],
        correct: 'a',
    },
    // ── Doenças crônicas ──
    {
        id: 'cro1', topic: 'cronicas',
        text: 'Um paciente diabético apresenta ferida pequena no pé que não cicatriza há 2 semanas. A conduta do ACS é:',
        options: [
            { value: 'a', text: 'Orientar limpeza doméstica com água oxigenada e aguardar cicatrização natural' },
            { value: 'b', text: 'Encaminhar imediatamente para avaliação médica — feridas no pé diabético podem evoluir para amputação' },
            { value: 'c', text: 'Indicar pomadas cicatrizantes disponíveis gratuitamente na farmácia popular' },
        ],
        correct: 'b',
    },
    {
        id: 'cro2', topic: 'cronicas',
        text: 'A hipertensão arterial sistêmica é chamada de "assassina silenciosa" porque:',
        options: [
            { value: 'a', text: 'Provoca morte súbita sem qualquer sinal prévio em absolutamente todos os casos' },
            { value: 'b', text: 'É diagnosticada apenas por exames de sangue e imagem especializados' },
            { value: 'c', text: 'A maioria dos portadores não apresenta sintomas, favorecendo o diagnóstico tardio' },
        ],
        correct: 'c',
    },
    {
        id: 'cro3', topic: 'cronicas',
        text: 'Qual o valor que define hipertensão arterial em adultos, segundo os critérios vigentes no Brasil?',
        options: [
            { value: 'a', text: 'Pressão arterial ≥ 140/90 mmHg em medições repetidas' },
            { value: 'b', text: 'Pressão arterial ≥ 120/80 mmHg em qualquer medição isolada' },
            { value: 'c', text: 'Pressão arterial ≥ 160/100 mmHg confirmada na primeira aferição' },
        ],
        correct: 'a',
    },
    // ── Vigilância ──
    {
        id: 'vig1', topic: 'vigilancia',
        text: 'A notificação compulsória imediata (em até 24 horas) é exigida para qual das doenças abaixo?',
        options: [
            { value: 'a', text: 'Dengue e tuberculose pulmonar' },
            { value: 'b', text: 'Meningite bacteriana e sarampo' },
            { value: 'c', text: 'Sífilis congênita e hepatites virais' },
        ],
        correct: 'b',
    },
    {
        id: 'vig2', topic: 'vigilancia',
        text: 'O sistema oficial de registro das notificações compulsórias no Brasil é denominado:',
        options: [
            { value: 'a', text: 'SINAN (Sistema de Informação de Agravos de Notificação)' },
            { value: 'b', text: 'e-SUS PEC (Prontuário Eletrônico do Cidadão)' },
            { value: 'c', text: 'CNES (Cadastro Nacional de Estabelecimentos de Saúde)' },
        ],
        correct: 'a',
    },
    {
        id: 'vig3', topic: 'vigilancia',
        text: 'Qual a diferença entre vigilância epidemiológica e vigilância sanitária?',
        options: [
            { value: 'a', text: 'São a mesma atividade com nomes diferentes no âmbito do SUS' },
            { value: 'b', text: 'Epidemiológica identifica riscos individuais; sanitária trata doenças já instaladas' },
            { value: 'c', text: 'Epidemiológica monitora doenças na população; sanitária controla riscos no ambiente, alimentos e produtos' },
        ],
        correct: 'c',
    },
    // ── Saúde mental ──
    {
        id: 'men1', topic: 'mental',
        text: 'Segundo as boas práticas em saúde mental, perguntar diretamente a alguém sobre ideação suicida:',
        options: [
            { value: 'a', text: 'Deve ser evitado, pois pode provocar e estimular comportamento suicida' },
            { value: 'b', text: 'Não aumenta o risco de suicídio e é recomendado para identificar casos e encaminhar adequadamente' },
            { value: 'c', text: 'Só pode ser realizado por médicos e psicólogos em ambiente clínico controlado' },
        ],
        correct: 'b',
    },
    {
        id: 'men2', topic: 'mental',
        text: 'Para onde o ACS deve encaminhar usuários com transtornos mentais graves que necessitam de atenção especializada?',
        options: [
            { value: 'a', text: 'Diretamente para internação em hospital psiquiátrico de referência' },
            { value: 'b', text: 'Para a UBS, que dispõe de equipe especializada exclusiva em saúde mental' },
            { value: 'c', text: 'Para o CAPS (Centro de Atenção Psicossocial)' },
        ],
        correct: 'c',
    },
];

// ─── Exam state ───────────────────────────────────────────────

const examState = {
    mode:          null,
    topic:         null,
    questions:     [],
    timeLeft:      0,
    timerInterval: null,
    submitted:     false,
};

// ─── Exam helpers ─────────────────────────────────────────────

function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ─── Exam render ──────────────────────────────────────────────

function renderExamIntro() {
    clearInterval(examState.timerInterval);
    examState.submitted = false;

    const topicRows = Object.entries(EXAM_TOPICS).map(([, t]) =>
        `<li>${t.label} — ${t.count} quest${t.count === 1 ? 'ão' : 'ões'}</li>`
    ).join('');

    document.getElementById('examContainer').innerHTML = `
        <div class="exam-intro">
            <h2 class="exam-intro__title">Simulado de Prova ACS</h2>
            <div class="exam-mode-cards">
                <button class="exam-mode-card exam-mode-card--simulado" data-action="start-simulado">
                    <div class="exam-mode-card__icon">📋</div>
                    <div class="exam-mode-card__title">Simulado Completo</div>
                    <div class="exam-mode-card__desc">30 questões em 40 minutos, com nota final e diagnóstico por tópico.</div>
                    <div class="exam-mode-card__meta">Nota de corte: 5,0 · Cronômetro ativo</div>
                </button>
                <button class="exam-mode-card exam-mode-card--topico" data-action="show-topic-selector">
                    <div class="exam-mode-card__icon">🎯</div>
                    <div class="exam-mode-card__title">Praticar por Tópico</div>
                    <div class="exam-mode-card__desc">Escolha um tópico e treine sem limite de tempo.</div>
                    <div class="exam-mode-card__meta">Sem cronômetro · Feedback imediato</div>
                </button>
            </div>
            <div class="exam-rules">
                <p class="exam-rules__title">Conteúdo do simulado</p>
                <ul class="exam-rules__list">${topicRows}</ul>
            </div>
        </div>
    `;
}

function renderTopicSelector() {
    const btns = Object.entries(EXAM_TOPICS).map(([key, t]) => `
        <button class="exam-topic-btn" data-action="start-topic" data-topic="${key}">
            <span class="exam-topic-btn__name">${t.label}</span>
            <span class="exam-topic-btn__count">${t.count} questão${t.count > 1 ? 'ões' : ''}</span>
        </button>
    `).join('');

    document.getElementById('examContainer').innerHTML = `
        <div class="exam-intro">
            <h2 class="exam-intro__title">Escolha o Tópico</h2>
            <div class="exam-topics-grid">${btns}</div>
            <button class="btn btn--ghost" data-action="exam-back-intro">← Voltar</button>
        </div>
    `;
}

async function startSimulado() {
    examState.mode      = 'simulado';
    examState.topic     = null;
    examState.timeLeft  = 40 * 60;
    examState.submitted = false;

    document.getElementById('examContainer').innerHTML =
        '<div style="text-align:center;padding:60px;opacity:.6">Preparando simulado...</div>';

    try {
        const all     = await getAllQuestoes();
        const byTopic = {};
        all.forEach(q => {
            if (q.topic) {
                if (!byTopic[q.topic]) byTopic[q.topic] = [];
                byTopic[q.topic].push(q);
            }
        });

        const selected = [];
        Object.entries(EXAM_TOPICS).forEach(([key, t]) => {
            const pool = shuffleArray(byTopic[key] || []);
            selected.push(...pool.slice(0, t.count));
        });

        examState.questions = selected.length > 0
            ? shuffleArray(selected)
            : shuffleArray(EXAM_QUESTIONS);
    } catch (_) {
        examState.questions = shuffleArray(EXAM_QUESTIONS);
    }

    renderExam(true);
}

async function startTopicPractice(topicKey) {
    examState.mode      = 'topico';
    examState.topic     = topicKey;
    examState.timeLeft  = 0;
    examState.submitted = false;

    document.getElementById('examContainer').innerHTML =
        '<div style="text-align:center;padding:60px;opacity:.6">Carregando questões...</div>';

    try {
        const all  = await getAllQuestoes();
        const pool = all.filter(q => q.topic === topicKey);
        examState.questions = pool.length > 0
            ? shuffleArray(pool)
            : EXAM_QUESTIONS.filter(q => q.topic === topicKey);
    } catch (_) {
        examState.questions = EXAM_QUESTIONS.filter(q => q.topic === topicKey);
    }

    renderExam(false);
}

function renderExam(timerEnabled) {
    clearInterval(examState.timerInterval);

    const topicLabel = examState.topic ? EXAM_TOPICS[examState.topic].label : 'Simulado Completo';
    const total      = examState.questions.length;

    const questionsHTML = examState.questions.map((q, i) => `
        <div class="question" data-qid="${q.id}">
            <p class="question__text">${i + 1}. ${q.text}</p>
            <div class="options" role="radiogroup">
                ${q.options.map(opt => `
                    <label class="option">
                        <input type="radio" name="exam_${q.id}" value="${opt.value}">
                        <span>${opt.text}</span>
                    </label>
                `).join('')}
            </div>
            <div class="feedback" aria-live="polite"></div>
        </div>
    `).join('');

    const timerHTML = timerEnabled
        ? `<span class="exam-timer" id="examTimer">${formatTime(examState.timeLeft)}</span>`
        : '';

    document.getElementById('examContainer').innerHTML = `
        <div class="exam-header">
            <button class="btn btn--ghost" style="padding:7px 14px;font-size:.85rem" data-action="exam-back-intro">← Sair</button>
            <span class="exam-header__title">${topicLabel}</span>
            <span class="exam-progress-text" id="examProgressText">0 / ${total} respondidas</span>
            ${timerHTML}
        </div>
        ${questionsHTML}
        <div class="quiz__actions" style="margin-top:32px">
            <button class="btn btn--primary" data-action="submit-exam">Finalizar Prova</button>
        </div>
    `;

    if (timerEnabled) {
        examState.timerInterval = setInterval(tickTimer, 1000);
    }
}

function tickTimer() {
    examState.timeLeft--;
    const el = document.getElementById('examTimer');
    if (el) {
        el.textContent = formatTime(examState.timeLeft);
        if (examState.timeLeft <= 300) el.classList.add('exam-timer--warning');
    }
    if (examState.timeLeft <= 0) {
        clearInterval(examState.timerInterval);
        checkExam(true);
    }
}

function checkExam(forced) {
    if (examState.submitted) return;

    const container = document.getElementById('examContainer');
    const questions = examState.questions;
    let allAnswered  = true;

    if (!forced) {
        questions.forEach(q => {
            const checked = container.querySelector(`input[name="exam_${q.id}"]:checked`);
            if (!checked) allAnswered = false;
        });
        if (!allAnswered) {
            const unanswered = container.querySelectorAll('[data-qid]');
            unanswered.forEach(el => {
                const q   = questions.find(x => x.id === el.dataset.qid);
                const sel = container.querySelector(`input[name="exam_${q.id}"]:checked`);
                if (!sel) {
                    const fb = el.querySelector('.feedback');
                    fb.className   = 'feedback feedback--show feedback--warn';
                    fb.textContent = 'Responda esta questão antes de finalizar.';
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
            return;
        }
    }

    clearInterval(examState.timerInterval);
    examState.submitted = true;

    let correct = 0;
    const breakdown = {};
    Object.keys(EXAM_TOPICS).forEach(k => { breakdown[k] = { correct: 0, total: 0 }; });

    questions.forEach(q => {
        const selected = container.querySelector(`input[name="exam_${q.id}"]:checked`);
        const qEl      = container.querySelector(`[data-qid="${q.id}"]`);
        const options  = qEl ? qEl.querySelectorAll('.option') : [];
        const fb       = qEl ? qEl.querySelector('.feedback') : null;

        if (breakdown[q.topic]) breakdown[q.topic].total++;

        const value    = selected ? selected.value : null;
        const isCorrect = value === q.correct;

        options.forEach(opt => {
            const radio = opt.querySelector('input');
            opt.classList.add('option--locked');
            radio.disabled = true;
            if (radio.value === q.correct) opt.classList.add('option--correct');
            if (radio.checked && !isCorrect) opt.classList.add('option--incorrect');
        });

        if (fb) {
            if (!selected) {
                fb.className   = 'feedback feedback--show feedback--warn';
                fb.textContent = 'Não respondida.';
            } else if (isCorrect) {
                fb.className   = 'feedback feedback--show feedback--success';
                fb.textContent = 'Correto!';
                correct++;
                if (breakdown[q.topic]) breakdown[q.topic].correct++;
            } else {
                fb.className   = 'feedback feedback--show feedback--error';
                fb.textContent = 'Incorreto.';
            }
        } else if (isCorrect) {
            correct++;
            if (breakdown[q.topic]) breakdown[q.topic].correct++;
        }
    });

    const total  = questions.length;
    const score  = parseFloat(((correct / total) * 10).toFixed(1));
    const passed = examState.mode === 'simulado' ? score >= 5.0 : null;

    renderExamResult(score, passed, breakdown, correct, total);
}

function renderExamResult(score, passed, breakdown, correct, total) {
    const scoreClass  = passed === null ? 'exam-result__score--pass' : (passed ? 'exam-result__score--pass' : 'exam-result__score--fail');
    const verdictHTML = passed === null ? '' : `
        <span class="exam-verdict ${passed ? 'exam-verdict--pass' : 'exam-verdict--fail'}">
            ${passed ? 'APROVADO' : 'REPROVADO'}
        </span><br>
    `;

    const breakdownHTML = Object.entries(breakdown)
        .filter(([, v]) => v.total > 0)
        .map(([key, v]) => {
            const pct = Math.round((v.correct / v.total) * 100);
            return `
            <div class="breakdown-row">
                <span class="breakdown-row__label">${EXAM_TOPICS[key].label}</span>
                <div class="breakdown-bar-track">
                    <div class="breakdown-bar-fill" style="width:${pct}%;background:${pct >= 60 ? 'var(--color-success)' : 'var(--color-danger)'}"></div>
                </div>
                <span class="breakdown-row__score">${v.correct}/${v.total}</span>
            </div>`;
        }).join('');

    const resultSection = document.createElement('div');
    resultSection.className = 'exam-result';
    resultSection.innerHTML = `
        <div class="exam-result__score ${scoreClass}">${score.toFixed(1)}</div>
        ${verdictHTML}
        <p class="exam-result__details">
            Você acertou <strong>${correct} de ${total}</strong> questões.
            ${passed === null ? '' : (passed ? 'Parabéns! Você atingiu a nota de corte 5,0.' : 'A nota mínima para aprovação é 5,0. Continue estudando!')}
        </p>
        ${breakdownHTML ? `<div class="exam-breakdown"><p class="exam-breakdown__title">Desempenho por tópico</p>${breakdownHTML}</div>` : ''}
        <div class="exam-result__actions">
            <button class="btn btn--ghost" data-action="exam-back-intro">← Início</button>
            ${examState.mode === 'simulado'
                ? `<button class="btn btn--primary" data-action="start-simulado">Refazer Simulado</button>`
                : `<button class="btn btn--primary" data-action="start-topic" data-topic="${examState.topic}">Refazer Tópico</button>`
            }
        </div>
    `;

    const container = document.getElementById('examContainer');
    container.querySelector('.quiz__actions')?.remove();
    container.appendChild(resultSection);
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Event delegation ─────────────────────────────────────────

document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action } = btn.dataset;

    if (action === 'check')              checkQuiz(Number(btn.dataset.quizTarget));
    if (action === 'reset')              resetQuiz(Number(btn.dataset.quizTarget));
    if (action === 'level-start')        renderLevelQuiz(btn.dataset.level);
    if (action === 'check-level')        checkLevelQuiz(btn.dataset.level);
    if (action === 'level-retry')        renderLevelQuiz(btn.dataset.level);
    if (action === 'level-back')         renderLevelSelector();
    if (action === 'toggle-studied')     toggleStudied(btn.dataset.topic);
    if (action === 'start-simulado')     startSimulado();
    if (action === 'show-topic-selector')renderTopicSelector();
    if (action === 'start-topic')        startTopicPractice(btn.dataset.topic);
    if (action === 'submit-exam')        checkExam(false);
    if (action === 'exam-back-intro')    renderExamIntro();
    if (action === 'go-module')          activateModule(Number(btn.dataset.target));
});

// ─── Init ─────────────────────────────────────────────────────

renderStudyFilters();
renderStudyGrid();

document.getElementById('studySearch').addEventListener('input', e => {
    studyState.searchQuery = e.target.value.trim().toLowerCase();
    renderStudyGrid();
});

document.getElementById('studyFilters').addEventListener('click', e => {
    const btn = e.target.closest('.study-filter');
    if (!btn) return;
    studyState.activeFilter = btn.dataset.filter;
    document.querySelectorAll('.study-filter').forEach(b => b.classList.remove('study-filter--active'));
    btn.classList.add('study-filter--active');
    renderStudyGrid();
});

renderLevelSelector();
renderExamIntro();

document.addEventListener('change', e => {
    if (!e.target.matches('input[name^="exam_"]')) return;
    const container = document.getElementById('examContainer');
    if (!container) return;
    const total    = examState.questions.length;
    const answered = new Set(
        [...container.querySelectorAll('input[name^="exam_"]:checked')].map(r => r.name)
    ).size;
    const el = document.getElementById('examProgressText');
    if (el) el.textContent = `${answered} / ${total} respondidas`;
});
