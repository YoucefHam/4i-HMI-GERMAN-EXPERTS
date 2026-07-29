// ==UserScript==
// @name         4I
// @namespace    http://tampermonkey.net/
// @version      1.0.3.1
// @description  Automate save, release, refresh, close, and form modifications with keyboard and mouse shortcuts. Added robust element waiting.
// @author       YoucefHam
// @match        http://102.206.40.145:8080/portal/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=40.145
// @grant        none
// ==/UserScript==
// https://github.com/YoucefHam/4i-HMI-GERMAN-EXPERTS/blob/main/4i%20Tampermonky.js
// https://raw.githubusercontent.com/YoucefHam/4i-HMI-GERMAN-EXPERTS/refs/heads/main/4i%20Tampermonky.js

/* Log changes
    27/07/2026 1.0.2
        add link for update
    27/07/2026 1.0.2.1
        removed Refresh from Mouse Back
    27/07/2026 1.0.3
        Replaced setTimeout with waitForElement for dialog confirmations
        Added debounce to MutationObserver for performance
    29/07/2026 1.0.3.1
        Remove Access Control (Delete Button)
*/
(function() {
    'use strict';

    // --- Helper Utilities ---
    const clickElement = (selector) => {
        const el = document.querySelector(selector);
        if (el) el.click();
        return !!el;
    };

    // Waits dynamically for an element to appear in the DOM instead of guessing the time
    const waitForElement = (selector, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            // If it's already there, resolve immediately
            const element = document.querySelector(selector);
            if (element) return resolve(element);

            // Otherwise, watch the DOM for changes
            const observer = new MutationObserver((mutations, obs) => {
                const el = document.querySelector(selector);
                if (el) {
                    obs.disconnect(); // Stop watching once found
                    resolve(el);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // Safety net: timeout if it never appears
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for: ${selector}`));
            }, timeout);
        });
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

        // Updated to use waitForElement (timeout after 3 seconds if not found)
        const confirmMaterialDialog = () => {
            waitForElement('mat-dialog-container .mat-raised-button', 3000)
                .then(btn => btn.click())
                .catch(err => console.warn(err.message));
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
                        confirmMaterialDialog(); // Now waits dynamically
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

                        // We still use a small timeout here to let the Save network request process
                        // before attempting to click Release.
                        setTimeout(() => {
                            if (clickElement('[title="Release"]')) {
                                confirmMaterialDialog(); // Now waits dynamically
                            }
                        }, 1000);
                    }
                }
                break;

            case 'F9': {
                const listDeleteBtn = document.querySelector('fi-list-view2 span:has(img[src="assets/icons/trash-24.png"])');
                if (listDeleteBtn) {
                    ///if (confirm("Are you sure to Delete!!")) {
                        listDeleteBtn.click();
                    //}
                }
                break;
            }

            }
        }
    });

    // --- 2. Mouse Side Buttons Listener (XButton1 & XButton2) ---
    document.addEventListener('mousedown', function (event) {
        if (event.button !== 3 && event.button !== 4) return;

        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;

        event.preventDefault();

        if (event.button === 3) {
            const closeBtn = document.querySelector('main > my-tabs > ul > li.active > a > span');
            if (closeBtn) closeBtn.click();
        }

        if (event.button === 4) {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.hasAttribute('readonly')) {
                activeElement.removeAttribute('readonly');
                activeElement.readOnly = false;
                activeElement.style.backgroundColor = '#ffffff';
            }
        }
    });
/*
    // --- 3. Access Control (Delete Button) ---
    function checkAndHideDeleteButton() {
        const targetSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');

        if (targetSpan &&
           (
            targetSpan.textContent.trim() !== 'youcefham' &&
            targetSpan.textContent.trim() !== 'mokhtar' &&
            targetSpan.textContent.trim() !== 'admin'
           )) {
            const deleteButtons = document.querySelectorAll('[title="app.Delete"]');
            deleteButtons.forEach(btn => {
                btn.disabled = true;
                btn.setAttribute('disabled', 'disabled');
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
        }
    }

    // Debounce utility to prevent the observer from freezing the browser
    let debounceTimer;
    const debouncedCheck = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(checkAndHideDeleteButton, 150);
    };

    checkAndHideDeleteButton();

    const observer = new MutationObserver(() => {
        debouncedCheck(); // Now runs efficiently instead of firing hundreds of times per second
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
*/
})();
