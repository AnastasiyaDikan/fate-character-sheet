document.addEventListener('DOMContentLoaded', () => {
    // --- СПИСОК НАВЫКОВ ---
    const SKILL_LIST = [
        "Атлетика", "Взаимопонимание", "Внимательность", "Вождение", "Воля",
        "Воровство", "Драка", "Знания", "Контакты", "Обман", "Провокация",
        "Расследование", "Ремесло", "Ресурсы", "Скрытность", "Стрельба",
        "Телосложение", "Эмпатия"
    ];

    // --- НАСТРОЙКА НАВЫКОВ ---
    const skillsContainer = document.querySelector('.skills-table-container');

    const skillLevels = [
        { label: "Великолеп. (+5)", level: 5, pyramidSlots: 0 },
        { label: "Отличный (+4)", level: 4, pyramidSlots: 1 },
        { label: "Хороший (+3)", level: 3, pyramidSlots: 2 },
        { label: "Неплохой (+2)", level: 2, pyramidSlots: 3 },
        { label: "Средний (+1)", level: 1, pyramidSlots: 4 }
    ];

    // Переменная для хранения имени текущего файла
    let currentFileName = 'fate_char.json';

    function createSkillsTable() {
        skillsContainer.innerHTML = '';
        
        skillLevels.forEach(item => {
            const row = document.createElement('div');
            row.className = 'skill-row';
            row.dataset.level = item.level;

            const label = document.createElement('div');
            label.className = 'skill-label';
            label.textContent = item.label;
            row.appendChild(label);

            // Создаем ячейки для навыков - всего 5 слотов на каждом уровне
            for (let i = 0; i < 5; i++) {
                const skillSlot = document.createElement('div');
                skillSlot.className = 'skill-slot';
                
                // Определяем, является ли этот слот частью пирамиды
                if (i < item.pyramidSlots) {
                    skillSlot.classList.add('pyramid-slot', 'active-slot');
                } else {
                    skillSlot.classList.add('empty-slot');
                }
                
                const select = document.createElement('select');
                select.name = `skill-${item.level}-${i}`;
                
                let optionsHTML = '<option value="">--</option>';
                SKILL_LIST.forEach(skill => {
                    optionsHTML += `<option value="${skill.toLowerCase()}">${skill}</option>`;
                });
                select.innerHTML = optionsHTML;
                
                select.addEventListener('change', updateStressAndConsequences);
                skillSlot.appendChild(select);
                row.appendChild(skillSlot);
            }
            
            skillsContainer.appendChild(row);
        });
    }

    // Инициализация таблицы навыков
    createSkillsTable();

    // Функция для загрузки старых навыков (из формата skill-name-X и skill-level-X)
    function loadOldSkillsFormat(charData) {
        const oldSkills = [];
        
        // Собираем все старые навыки
        Object.keys(charData).forEach(key => {
            if (key.startsWith('skill-name-')) {
                const num = key.replace('skill-name-', '');
                const name = charData[key];
                const level = charData[`skill-level-${num}`];
                
                if (name && name.trim() !== '' && level && level !== '0') {
                    oldSkills.push({
                        name: name.trim().toLowerCase(),
                        level: parseInt(level)
                    });
                }
            }
        });

        // Сортируем навыки по уровню (от высокого к низкому)
        oldSkills.sort((a, b) => b.level - a.level);

        // Распределяем навыки по таблице
        oldSkills.forEach(skill => {
            const row = document.querySelector(`.skill-row[data-level="${skill.level}"]`);
            if (row) {
                // Находим первый активный слот в этой строке
                const activeSlots = row.querySelectorAll('.active-slot select');
                for (let select of activeSlots) {
                    if (select.value === '') {
                        select.value = skill.name;
                        break;
                    }
                }
            }
        });
    }

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
        
        // Обновляем состояние кнопки добавления трюков
        updateAddStuntButtonState();
    }
    
    function createStuntEntry(stuntValue = '') {
        const currentStunts = stuntsContainer.querySelectorAll('.stunt-entry');
        
        // Проверяем, не превышен ли лимит в 5 трюков
        if (currentStunts.length >= 5) {
            alert("Вы превысили допустимый порог количества трюков. Максимум 5 трюков.");
            return;
        }
        
        stuntIdCounter++;
        const stuntEntry = document.createElement('div');
        stuntEntry.classList.add('stunt-entry');
        stuntEntry.innerHTML = `
            <textarea name="stunt-${stuntIdCounter}" placeholder="Введите описание трюка...">${stuntValue}</textarea>
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

    function updateAddStuntButtonState() {
        const currentStunts = stuntsContainer.querySelectorAll('.stunt-entry');
        
        // Если достигнут лимит в 5 трюков, скрываем кнопку добавления
        if (currentStunts.length >= 5) {
            addStuntBtn.style.display = 'none';
        } else {
            addStuntBtn.style.display = 'block';
        }
    }

    addStuntBtn.addEventListener('click', () => createStuntEntry());

    function initializeStuntRemoveButtons() {
        const allStuntEntries = stuntsContainer.querySelectorAll('.stunt-entry');
        allStuntEntries.forEach(entry => {
            const removeBtn = entry.querySelector('.remove-stunt-btn');
            removeBtn.style.display = allStuntEntries.length > 3 ? 'flex' : 'none';
        });
    }

    // Функция для загрузки трюков из данных
    function loadStunts(charData) {
        // Очищаем все существующие трюки, кроме первых трех
        const initialStunts = stuntsContainer.querySelectorAll('.stunt-entry');
        for (let i = 3; i < initialStunts.length; i++) {
            initialStunts[i].remove();
        }
        
        // Сбрасываем счетчик
        stuntIdCounter = 3;
        
        // Собираем все трюки из данных
        const stuntEntries = [];
        Object.keys(charData).forEach(key => {
            if (key.startsWith('stunt-')) {
                stuntEntries.push({
                    key: key,
                    value: charData[key]
                });
            }
        });
        
        // Сортируем трюки по ключу (чтобы сохранить порядок)
        stuntEntries.sort((a, b) => {
            const aNum = parseInt(a.key.replace('stunt-', ''));
            const bNum = parseInt(b.key.replace('stunt-', ''));
            return aNum - bNum;
        });
        
        // Заполняем существующие трюки и создаем новые для дополнительных
        stuntEntries.forEach((stunt, index) => {
            if (index < 3) {
                // Заполняем первые три трюка
                const textarea = stuntsContainer.querySelector(`[name="${stunt.key}"]`);
                if (textarea) {
                    textarea.value = stunt.value;
                }
            } else {
                // Создаем новые трюки для дополнительных
                createStuntEntry(stunt.value);
            }
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

    // --- ЗАМЕТКИ ---
    const notesBtn = document.getElementById('notesBtn');
    const notesModal = document.getElementById('notesModal');
    const notesTextarea = document.getElementById('notesTextarea');
    const saveNotesBtn = document.getElementById('saveNotesBtn');
    const closeBtn = document.querySelector('.close');

    // Открытие модального окна
    notesBtn.addEventListener('click', () => {
        notesModal.style.display = 'block';
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', () => {
        notesModal.style.display = 'none';
    });

    // Закрытие при клике вне окна
    window.addEventListener('click', (e) => {
        if (e.target === notesModal) {
            notesModal.style.display = 'none';
        }
    });

    // Сохранение заметок
    saveNotesBtn.addEventListener('click', () => {
        notesModal.style.display = 'none';
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
        
        // Сохраняем состояние стресса
        charData.stress = {};
        document.querySelectorAll('.stress-box').forEach((box, i) => {
            if(box.classList.contains('filled')) {
                const trackId = box.parentElement.id;
                charData.stress[trackId + '-' + i] = true;
            }
        });
        
        // Сохраняем фотографию
        if (currentPhotoDataUrl) {
            charData.photo = currentPhotoDataUrl;
        }

        // Сохраняем заметки
        charData.notes = notesTextarea.value;

        const dataStr = JSON.stringify(charData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', currentFileName);
        linkElement.click();
    });

    loadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            // Сохраняем имя файла для последующего сохранения
            currentFileName = file.name;
            
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = readerEvent => {
                const content = readerEvent.target.result;
                const charData = JSON.parse(content);
                
                // Очищаем текущие данные
                document.querySelectorAll('input, textarea, select').forEach(el => {
                    if (el.type !== 'file') el.value = '';
                });
                
                // Заполняем основные поля
                Object.keys(charData).forEach(key => {
                    const el = document.querySelector(`[name="${key}"]`);
                    if (el && el.type !== 'file') {
                        el.value = charData[key];
                    }
                });

                // Проверяем, является ли это старый формат (имеет skill-name- поля)
                const isOldFormat = Object.keys(charData).some(key => key.startsWith('skill-name-'));
                
                if (isOldFormat) {
                    // Загружаем старые навыки
                    loadOldSkillsFormat(charData);
                }

                // Загружаем трюки
                loadStunts(charData);

                // Загружаем фотографию
                if (charData.photo) {
                    currentPhotoDataUrl = charData.photo;
                    updatePhotoPreview();
                } else {
                    currentPhotoDataUrl = null;
                    updatePhotoPreview();
                }

                // Загружаем заметки
                if (charData.notes) {
                    notesTextarea.value = charData.notes;
                } else {
                    notesTextarea.value = '';
                }

                // Обновляем все динамические элементы
                updateStressAndConsequences();
                updateRefresh();
                initializeStuntRemoveButtons();

                // Восстанавливаем состояние стресса
                setTimeout(() => {
                    if (charData.stress) {
                        document.querySelectorAll('.stress-box').forEach((box, i) => {
                            box.classList.remove('filled');
                            const trackId = box.parentElement.id;
                            if(charData.stress[trackId + '-' + i]) {
                                box.classList.add('filled');
                            }
                        });
                    }
                }, 100);
            }
        }
        input.click();
    });
    
    // Первоначальный запуск для установки правильных значений
    updateStressAndConsequences();
    updateRefresh();
    initializeStuntRemoveButtons();
    updateAddStuntButtonState();
});