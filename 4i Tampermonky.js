// ==UserScript==
// @name         4I
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Automate save, release, refresh, close, and form modifications with keyboard and mouse shortcuts.
// @author       YoucefHam
// @match        http://102.206.40.145:8080/portal/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=40.145
// @grant        none
// ==/UserScript==
// https://github.com/YoucefHam/4i-HMI-GERMAN-EXPERTS/blob/main/4i%20Tampermonky.js
// https://raw.githubusercontent.com/YoucefHam/4i-HMI-GERMAN-EXPERTS/f75aa85416e6ee3c3db3397e4b0bc62df1cf1082/4i%20Tampermonky.js

/* Log changes
    27/07/2026
        add link for update
*/
(function() {
    'use strict';

    // Helper Utilities
    const clickElement = (selector) => {
        const el = document.querySelector(selector);
        if (el) el.click();
        return !!el;
    };

    // --- 1. Keyboard Shortcuts Listener ---
    document.addEventListener('keydown', function (event) {
        // Macro Keys Guard
        const HANDLED_KEYS = ['F9', 'F1', 'F2', 'F4', 'F5', 'F8'];
        if (!HANDLED_KEYS.includes(event.code)) return;

        // Authorize user once up front
        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;

        event.preventDefault();


        const confirmMaterialDialog = (delayMs = 300) => {
            setTimeout(() => clickElement('mat-dialog-container .mat-raised-button'), delayMs);
        };

        const updateBankInput = () => {
            const activeTab = document.querySelector('a.nav-link.active');
            const isFactureTab = activeTab && (
                activeTab.textContent.includes('Facture') ||
                activeTab.textContent.includes('Purchase Invoice')
            );

            if (isFactureTab) {
                const bankInput = document.querySelector('[fieldcode="bank.Name"] input');
                if (bankInput) {
                    /*// Strip readonly restrictions before populating
                    bankInput.removeAttribute('readonly');
                    bankInput.readOnly = false;
                    bankInput.style.backgroundColor = '#ffffff';*/

                    bankInput.focus();
                    bankInput.value = '-';

                    bankInput.dispatchEvent(new Event('input', { bubbles: true }));
                    bankInput.dispatchEvent(new Event('change', { bubbles: true }));
                    bankInput.blur();
                }
            }
        };

        // Key Handler Logic
        switch (event.code) {
            case 'F9': {
                const listDeleteBtn = document.querySelector('fi-list-view2 span:has(img[src="assets/icons/trash-24.png"])');
                if (listDeleteBtn) {
                    if (confirm("Are you sure to Delete!!")) {
                        listDeleteBtn.click();
                    }
                }
                break;
            }

            case 'F1': {
                clickElement('[title="New"]');
                break;
            }
            case 'F2': {
                updateBankInput();
                clickElement('[title="Save"]');
                break;
            }

            case 'F4': {
                const releaseBtn = document.querySelector('[title="Release"]');
                if (releaseBtn) {
                    if (confirm("Are you sure to release!!")) {
                        releaseBtn.click();
                        confirmMaterialDialog(500);
                    }
                }
                break;
            }

            case 'F5': {
                clickElement('[title="Refresh"]');
                break;
            }

            case 'F8': {
                const saveBtn = document.querySelector('[title="Save"]');
                if (saveBtn) {
                    if (confirm("Are you sure to save and release!!")) {
                        updateBankInput();
                        saveBtn.click();
                        setTimeout(() => {
                            if (clickElement('[title="Release"]')) {
                                confirmMaterialDialog(500);
                            }
                        }, 1000);
                    }
                }
                break;
            }

        }
    });

    // --- 2. Mouse Side Buttons Listener (XButton1 & XButton2) ---
    document.addEventListener('mousedown', function (event) {
        // Only proceed for side buttons (3 = Back / XButton1, 4 = Forward / XButton2)
        if (event.button !== 3 && event.button !== 4) return;

        // Authorize user once up front
        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;

        event.preventDefault(); // Prevents default browser navigation (Back/Forward)

        // XButton1 (Mouse Back) -> Clicks Close button
        if (event.button === 3) {
            const closeBtn = document.querySelector('main > my-tabs > ul > li.active > a > span'); // [title="Close"]
            if (closeBtn) closeBtn.click();
            setTimeout(() => {
                clickElement('[title="Refresh"]');
            }, 600);

        }

        // XButton2 (Mouse Forward) -> Unlock Readonly Inputs
        if (event.button === 4) {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.hasAttribute('readonly')) { // && activeElement.tagName === 'INPUT'
                activeElement.removeAttribute('readonly');
                activeElement.readOnly = false;
                activeElement.style.backgroundColor = '#ffffff'; // Clear grey background
            }
        }
    });



    // ######################################################################## DELETE BUTTON ###################################################################
    // HIDE DELETE BUTTON

    function checkAndHideDeleteButton() {
        // Target the specific span in the active layout
        const targetSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');

        if (targetSpan &&
           (
            targetSpan.textContent.trim() !== 'youcefham' &&
            targetSpan.textContent.trim() !== 'mokhtar' &&
            targetSpan.textContent.trim() !== 'admin'
           )) {
            // Find the delete button within the active context/app
            const deleteButtons = document.querySelectorAll('[title="app.Delete"]');
            deleteButtons.forEach(btn => {
                btn.disabled = true;
                btn.setAttribute('disabled', 'disabled');

                // Apply styles so non-button tags (<div>, <a>) act disabled
                btn.style.pointerEvents = 'none'; // Prevents mouse clicks/hovers
                btn.style.opacity = '0.5'; // Visual cue that it's disabled
                btn.style.cursor = 'not-allowed';
            });
        }
    }

    // 1. Run immediately on load
    checkAndHideDeleteButton();

    // 2. Observe DOM mutations (catches tab switches, AJAX updates, dynamic rendering)
    const observer = new MutationObserver(() => {
        checkAndHideDeleteButton();
    });

    // Start watching the main container or whole body for updates
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
