document.addEventListener('DOMContentLoaded', () => {
    // --- СПИСОК НАВЫКОВ ---
    const SKILL_LIST = [
        "Атлетика", "Взаимопонимание", "Внимательность", "Вождение", "Воля",
        "Воровство", "Драка", "Знания", "Контакты", "Обман", "Провокация",
        "Расследование", "Ремесло", "Ресурсы", "Скрытность", "Стрельба",
        "Телосложение", "Эмпатия"
    ];

    let skillCounter = 0; // Глобальный счетчик для уникальных имен

    // --- НАСТРОЙКА НАВЫКОВ ---
    const skillsContainer = document.querySelector('.skills-table-container');

    const skillLevels = [
        { label: "Великолеп. (+5)", level: 5, pyramidSlots: 0 },
        { label: "Отличный (+4)", level: 4, pyramidSlots: 1 },
        { label: "Хороший (+3)", level: 3, pyramidSlots: 2 },
        { label: "Неплохой (+2)", level: 2, pyramidSlots: 3 },
        { label: "Средний (+1)", level: 1, pyramidSlots: 4 }
    ];

    function createSkillDropdown(isPyramid = false) {
        skillCounter++;
        const select = document.createElement('select');
        select.name = `skill-${skillCounter}`;
        select.classList.add(isPyramid ? 'pyramid-slot' : 'empty-slot');

        let optionsHTML = '<option value="">--</option>';
        SKILL_LIST.forEach(skill => {
            optionsHTML += `<option value="${skill.toLowerCase()}">${skill}</option>`;
        });
        select.innerHTML = optionsHTML;
        
        select.addEventListener('change', updateStressAndConsequences);
        
        const slotDiv = document.createElement('div');
        slotDiv.className = 'skill-slot';
        slotDiv.appendChild(select);
        return slotDiv;
    }

    skillLevels.forEach(item => {
        const row = document.createElement('div');
        row.className = 'skill-row';
        row.dataset.level = item.level;

        const label = document.createElement('div');
        label.className = 'skill-label';
        label.textContent = item.label;
        row.appendChild(label);

        for (let i = 0; i < 5; i++) {
            const isPyramidSlot = i < item.pyramidSlots;
            row.appendChild(createSkillDropdown(isPyramidSlot));
        }
        
        skillsContainer.appendChild(row);
    });

    // --- ТРЮКИ И ОБНОВЛЕНИЕ ---
    const stuntsContainer = document.getElementById('stunts-container');
    const addStuntBtn = document.getElementById('add-stunt-btn');
    const refreshValueEl = document.getElementById('refresh-value');
    let stuntIdCounter = 3;

    function updateRefresh() {
        const allStunts = stuntsContainer.querySelectorAll('textarea');
        let filledStunts = 0;
        allStunts.forEach(stunt => {
            if (stunt.value.trim() !== '') {
                filledStunts++;
            }
        });
        const baseRefresh = 3;
        const refreshCost = Math.max(0, filledStunts - 3);
        refreshValueEl.textContent = baseRefresh - refreshCost;
        initializeStuntRemoveButtons();
    }
    
    function createStuntEntry() {
        stuntIdCounter++;
        const stuntEntry = document.createElement('div');
        stuntEntry.classList.add('stunt-entry');
        stuntEntry.innerHTML = `
            <textarea name="stunt-${stuntIdCounter}" placeholder="Введите описание трюка..."></textarea>
            <button class="remove-stunt-btn">×</button>
        `;
        stuntsContainer.appendChild(stuntEntry);
        
        stuntEntry.querySelector('textarea').addEventListener('input', updateRefresh);
        stuntEntry.querySelector('.remove-stunt-btn').addEventListener('click', () => {
            stuntEntry.remove();
            updateRefresh();
        });
        
        updateRefresh();
    }

    addStuntBtn.addEventListener('click', createStuntEntry);

    function initializeStuntRemoveButtons() {
        const allStuntEntries = stuntsContainer.querySelectorAll('.stunt-entry');
        allStuntEntries.forEach(entry => {
            const removeBtn = entry.querySelector('.remove-stunt-btn');
            removeBtn.style.display = allStuntEntries.length > 3 ? 'flex' : 'none';
        });
    }

    stuntsContainer.querySelectorAll('.stunt-entry').forEach(entry => {
        entry.querySelector('textarea').addEventListener('input', updateRefresh);
        entry.querySelector('.remove-stunt-btn').addEventListener('click', () => {
            entry.remove();
            updateRefresh();
        });
    });
    
    // --- ФОТОГРАФИЯ ПЕРСОНАЖА ---
    const photoInput = document.getElementById('char-photo');
    const photoPreview = document.getElementById('photo-preview');
    let currentPhotoDataUrl = null;

    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentPhotoDataUrl = e.target.result;
                updatePhotoPreview();
            };
            reader.readAsDataURL(file);
        }
    });

    function updatePhotoPreview() {
        if (currentPhotoDataUrl) {
            photoPreview.innerHTML = `<img src="${currentPhotoDataUrl}" alt="Фотография персонажа">`;
        } else {
            photoPreview.innerHTML = '';
        }
    }

    // --- СТРЕСС И ПОСЛЕДСТВИЯ ---
    const physicalStressTrack = document.getElementById('physical-stress-track');
    const mentalStressTrack = document.getElementById('mental-stress-track');
    const consequenceLight2 = document.getElementById('consequence-light-2-field');

    function updateStressAndConsequences() {
        let physiqueLevel = 0;
        let willLevel = 0;
        
        document.querySelectorAll('.skill-row').forEach(row => {
            const level = parseInt(row.dataset.level, 10);
            row.querySelectorAll('select').forEach(select => {
                if (select.value === 'телосложение') {
                    physiqueLevel = Math.max(physiqueLevel, level);
                }
                if (select.value === 'воля') {
                    willLevel = Math.max(willLevel, level);
                }
            });
        });
        
        updateTrack(physicalStressTrack, physiqueLevel);
        updateTrack(mentalStressTrack, willLevel);

        if (physiqueLevel >= 5 || willLevel >= 5) {
            consequenceLight2.style.display = 'block';
        } else {
            consequenceLight2.style.display = 'none';
        }
    }

    function updateTrack(trackElement, skillLevel) {
        trackElement.innerHTML = '<div class="stress-box">1</div><div class="stress-box">2</div>';
        if (skillLevel >= 1) trackElement.innerHTML += '<div class="stress-box">3</div>';
        if (skillLevel >= 3) trackElement.innerHTML += '<div class="stress-box">4</div>';
    }
    
    document.body.addEventListener('click', e => {
        if (e.target.classList.contains('stress-box')) e.target.classList.toggle('filled');
    });

    // --- СОХРАНЕНИЕ И ЗАГРУЗКА ---
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');

    saveBtn.addEventListener('click', () => {
        const charData = {};
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type === 'file') return;
            charData[el.name] = el.value;
        });
        charData.stress = {};
        document.querySelectorAll('.stress-box.filled').forEach((box) => {
             const trackId = box.parentElement.id;
             const boxIndex = Array.from(box.parentElement.children).indexOf(box);
             charData.stress[trackId + '-' + boxIndex] = true;
        });
        if (currentPhotoDataUrl) {
            charData.photo = currentPhotoDataUrl;
        }
        const dataStr = JSON.stringify(charData, null, 2);
        const linkElement = document.createElement('a');
        linkElement.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        linkElement.download = 'fate_char.json';
        linkElement.click();
    });

    loadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = readerEvent => {
                const charData = JSON.parse(readerEvent.target.result);
                Object.keys(charData).forEach(key => {
                    const el = document.querySelector(`[name="${key}"]`);
                    if (el && el.type !== 'file') el.value = charData[key];
                });

                if (charData.photo) {
                    currentPhotoDataUrl = charData.photo;
                    updatePhotoPreview();
                } else {
                    currentPhotoDataUrl = null;
                    updatePhotoPreview();
                }

                updateStressAndConsequences();
                updateRefresh();
                initializeStuntRemoveButtons();

                setTimeout(() => {
                    document.querySelectorAll('.stress-box').forEach(box => box.classList.remove('filled'));
                    if (charData.stress) {
                        Object.keys(charData.stress).forEach(key => {
                            const [trackId, boxIndexStr] = key.split('-');
                            const boxIndex = parseInt(boxIndexStr, 10);
                            const track = document.getElementById(trackId);
                            if(track && track.children[boxIndex]){
                                track.children[boxIndex].classList.add('filled');
                            }
                        });
                    }
                }, 100);
            }
        }
        input.click();
    });
    
    // Первоначальный запуск
    updateStressAndConsequences();
    updateRefresh();
    initializeStuntRemoveButtons();
});