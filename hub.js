(function() {
    'use strict';

    function modifyUidModal() {
        const modal = document.querySelector('.selectbox__content .selectbox__head .selectbox__title');
        if (!modal || modal.textContent.trim() !== 'lampa_uid') return;

        // Избегаем дублирования
        if (document.querySelector('#custom-uid-input')) return;

        const body = document.querySelector('.selectbox__body .scroll__content');

        const customItem = document.createElement('div');
        customItem.className = 'selectbox-item selector';
        customItem.id = 'custom-uid-item';

        const title = document.createElement('div');
        title.className = 'selectbox-item__title';
        title.textContent = 'Изменить ID';

        const inputWrapper = document.createElement('div');
        inputWrapper.style.marginTop = '10px';
        inputWrapper.style.padding = '0 15px';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'custom-uid-input';
        input.value = Lampa.Storage.get('lampac_unic_id', '');
        input.placeholder = 'Введите новый ID';
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.background = '#222';
        input.style.color = '#fff';
        input.style.border = '1px solid #555';
        input.style.borderRadius = '4px';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Сохранить';
        saveBtn.style.marginTop = '8px';
        saveBtn.style.width = '100%';
        saveBtn.style.padding = '8px';
        saveBtn.style.background = 'hsl(105, 50%, 65%)';
        saveBtn.style.color = '#000';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '4px';
        saveBtn.style.cursor = 'pointer';

        saveBtn.onclick = () => {
            const newId = input.value.trim();
            if (newId) {
                Lampa.Storage.set('lampac_unic_id', newId);
                Lampa.Noty.show('ID успешно изменён');
                // Обновляем отображение в консоли, если нужно
            } else {
                Lampa.Noty.show('ID не может быть пустым');
            }
        };

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(saveBtn);
        customItem.appendChild(title);
        customItem.appendChild(inputWrapper);

        // Вставляем после кнопки "Удалить"
        const deleteItem = body.querySelector('.selectbox-item');
        if (deleteItem && deleteItem.nextSibling) {
            body.insertBefore(customItem, deleteItem.nextSibling);
        } else {
            body.appendChild(customItem);
        }

        input.focus();
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector('.selectbox__content .selectbox__title')) {
            modifyUidModal();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') observer.observe(document.body, { childList: true, subtree: true });
    });
})();
