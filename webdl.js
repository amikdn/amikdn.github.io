document.addEventListener('DOMContentLoaded', function() {
    // Находим элемент "Качество" в меню фильтра
    const qualityItem = document.querySelector('.selectbox-item__title:not(.selector) + .selectbox-item__subtitle:not(.selector)');
    if (!qualityItem) return;

    // Создаем новый элемент для фильтра "Уточнить"
    const refineItem = document.createElement('div');
    refineItem.className = 'selectbox-item selector';
    refineItem.innerHTML = `
        <div class="selectbox-item__title">Уточнить</div>
        <div class="selectbox-item__subtitle">Не выбрано</div>
        <div class="refine-input" style="display: none; padding: 10px;">
            <input type="text" name="refine" placeholder="Например BDRip, WEB-DL" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
    `;

    // Вставляем новый элемент после "Качество"
    qualityItem.parentElement.parentElement.insertAdjacentElement('afterend', refineItem);

    // Получаем элементы для взаимодействия
    const subtitle = refineItem.querySelector('.selectbox-item__subtitle');
    const inputContainer = refineItem.querySelector('.refine-input');
    const input = refineItem.querySelector('input[name="refine"]');

    // Обработчик клика по элементу "Уточнить"
    refineItem.addEventListener('click', function(e) {
        e.stopPropagation();
        inputContainer.style.display = inputContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Обработчик ввода в поле
    input.addEventListener('input', function() {
        const value = input.value.trim().toUpperCase();
        subtitle.textContent = value || 'Не выбрано';
        
        // Логика фильтрации
        filterResults(value);
    });

    // Функция фильтрации результатов
    function filterResults(refineValue) {
        if (!refineValue) {
            // Если поле пустое, показываем все результаты
            applyFilter('');
            return;
        }

        // Разделяем введенные значения
        const formats = refineValue.split(',').map(v => v.trim()).filter(v => v);
        
        // Формируем фильтр для BDRip и WEB-DL
        const filterRegex = formats.map(format => format.toUpperCase()).join('|');
        applyFilter(filterRegex);
    }

    // Функция применения фильтра (здесь предполагается интеграция с парсером Лампы)
    function applyFilter(filter) {
        // Предполагается, что в приложении Лампа есть глобальный объект или API для фильтрации
        // Например: Lampa.Parser.filter({ refine: filter });
        try {
            if (window.Lampa && window.Lampa.Parser) {
                window.Lampa.Parser.filter({ refine: filter });
            } else {
                console.warn('Lampa Parser API не найден');
            }
        } catch (e) {
            console.error('Ошибка при применении фильтра:', e);
        }
    }

    // Закрытие поля ввода при клике вне элемента
    document.addEventListener('click', function(e) {
        if (!refineItem.contains(e.target)) {
            inputContainer.style.display = 'none';
        }
    });
});