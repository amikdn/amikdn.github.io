(function() {
    'use strict';

    function modifyUidModal() {
        const title = document.querySelector('.selectbox__content .selectbox__head .selectbox__title');
        if (!title || title.textContent.trim() !== 'lampa_uid') return;

        if (document.getElementById('custom-uid-item')) return;

        const parent = document.querySelector('.selectbox__body .scroll__content .scroll__body');
        if (!parent) return;

        const deleteItem = Array.from(parent.querySelectorAll('.selectbox-item')).find(
            item => item.querySelector('.selectbox-item__title')?.textContent.trim() === 'Удалить'
        );

        const customItem = document.createElement('div');
        customItem.className = 'selectbox-item selector';
        customItem.id = 'custom-uid-item';

        const itemTitle = document.createElement('div');
        itemTitle.className = 'selectbox-item__title';
        itemTitle.textContent = 'Изменить ID';
        customItem.appendChild(itemTitle);

        const inputWrapper = document.createElement('div');
        inputWrapper.style.padding = '10px 15px 15px';
        inputWrapper.style.display = 'none'; // скрыто по умолчанию

        const input = document.createElement('input');
        input.type = 'text';
        input.value = Lampa.Storage.get('lampac_unic_id', '');
        input.placeholder = 'Новый ID';
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.background = '#222';
        input.style.color = '#fff';
        input.style.border = '1px solid #555';
        input.style.borderRadius = '4px';
        input.style.marginBottom = '8px';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Сохранить';
        saveBtn.style.width = '100%';
        saveBtn.style.padding = '8px';
        saveBtn.style.background = 'hsl(105, 50%, 65%)';
        saveBtn.style.color = '#000';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '4px';

        saveBtn.onclick = () => {
            const newId = input.value.trim();
            if (newId) {
                Lampa.Storage.set('lampac_unic_id', newId);
                Lampa.Noty.show('ID изменён');
                inputWrapper.style.display = 'none';
            } else {
                Lampa.Noty.show('ID не пустой');
            }
        };

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(saveBtn);
        customItem.appendChild(inputWrapper);

        // Раскрытие поля при клике на пункт
        customItem.addEventListener('click', () => {
            inputWrapper.style.display = inputWrapper.style.display === 'none' ? 'block' : 'none';
            if (inputWrapper.style.display === 'block') input.focus();
        });

        if (deleteItem && deleteItem.nextSibling) {
            parent.insertBefore(customItem, deleteItem.nextSibling);
        } else {
            parent.appendChild(customItem);
        }
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector('.selectbox__content .selectbox__title')) {
            modifyUidModal();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
