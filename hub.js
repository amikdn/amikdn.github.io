(function() {
    'use strict';

    function editUnicId() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('console__line')) {
                        const span = node.querySelector('span[style*="hsl(105"]');
                        if (span && span.textContent.trim() === 'lampac_unic_id') {
                            const currentValue = Lampa.Storage.get('lampac_unic_id', '');
                            node.innerHTML = '';
                            const keySpan = document.createElement('span');
                            keySpan.style.color = 'hsl(105, 50%, 65%)';
                            keySpan.textContent = 'lampac_unic_id ';
                            node.appendChild(keySpan);

                            const input = document.createElement('input');
                            input.type = 'text';
                            input.value = currentValue;
                            input.style.background = 'transparent';
                            input.style.border = '1px solid #555';
                            input.style.color = '#fff';
                            input.style.padding = '2px';
                            input.style.borderRadius = '4px';

                            input.addEventListener('blur', () => {
                                Lampa.Storage.set('lampac_unic_id', input.value.trim());
                                Lampa.Noty.show('lampac_unic_id изменён');
                            });
                            input.addEventListener('keydown', e => {
                                if (e.key === 'Enter') input.blur();
                            });

                            node.appendChild(input);
                            input.focus();
                            input.select();
                        }
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') editUnicId();
    });
})();
