// ==UserScript==
// @name         4I
// @namespace    http://tampermonkey.net/
// @version      1.0.4.2
// @description  Automate save, release, refresh, close, form modifications, keyboard/mouse shortcuts, and custom CSS overrides with !important priority.
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
    29/07/2026 1.0.3.2
        Fix Syntax
    29/07/2026 1.0.3.3
        Added Refresh from Mouse Back
    30/07/2026 1.0.4
        Added custom CSS UI overrides via dynamic DOM element injection
    30/07/2026 1.0.4.1
        Added !important flag to all CSS override rules
    30/07/2026 1.0.4.2
        Fix Report Jornal panal
        */
(function() {
    'use strict';

    // --- Dynamic CSS Injection (Method 2 - No @grant needed) ---
    const injectStyles = () => {
        const style = document.createElement('style');
        style.id = 'custom-portal-overrides';
        style.textContent = `
        
            /* USEFULL FUNCTION
            Count Selector
            document.querySelectorAll('[class*="panel-content"]').length
            */
            /*******************************Dashboard*/
            /*Screen Scrool*/
            welcome-component fi-4i-main-tile-panel > div[class="metal-main-container"] {
              min-height: calc(94vh - 100px) !important;
            }
            /*Card Scrool*/
            welcome-component business-dashboard-component wo-kanban-cards > div{
              height: calc(60vh - 260px) !important;
            }
            welcome-component fi-4i-main-tile-panel  div[class="kanban-board ng-star-inserted"] > div {
              height: calc(94vh - 260px) !important;
            }
            /*****************************Lists */
            /*Screen Scrool*/
            :is(
              vehicles-component,
              work-orders-component,
              customers-component,
              sale-orders-component,
              sale-returns-component,
              sale-invoices-component,
              sale-invoice-returns-component,
              suppliers-component,
              quotation-requests-component,
              purchase-orders-component,
              grns-component,
              suppliers-returns-component,
              purchase-invoices-component,
              purchase-invoice-returns-component,
              items-component,
              transfers-component,
              adjustments-component,
              inbounds-component,
              outbounds-component,
              list-ar-transaction-component,
              list-ap-transaction-component,
              list-cash-transaction-component,
              list-transfert-transaction-component
            ) fi-list-view2 div[class="main contents"] > div > as-split {
              height: calc(85vh - 140px) !important;
            }

            /*******************************OR Editor*/
            /*Font Size*/
            work-order-component [class="fi-splitter-pane pane-2"] span,
            work-order-component [formcontrolname="detailDescription"],
            work-order-component [formcontrolname="detailDescription2"],
            work-order-component [formcontrolname="customerProvidedParts"] {
              font-size: 15px !important;
            }
            work-order-component .ag-theme-balham {
              --ag-font-size : 16px !important;
            }
            /*Screen Scrool*/
            work-order-component div[class="metal-project-container"] {
              height: calc(95vh - 120px) !important;
            }
            /*Payment Panel Scrool*/
            work-order-component [role="tabpanel"] > div {
              overflow: auto !important;
            }
            /*Search item*/
            work-order-component work-order-lines-list-view item-quick-search .tw-absolute{
              max-width: 60vw;
              resize: horizontal;
            }

            /******************************* Autocomplete List*/
            [role="listbox"] {
              max-height: 50vh !important;
              min-width: fit-content !important;
              max-width: 40vw !important;
              width: fit-content !important;
              resize: both !important;
            }

            /*******************************Print*/
            /*Screen Scrool*/
            pdf-viewer {
              height: 78vh !important;
            }

            /*******************************Banque/Caisse */
            div[col-id="balance"] {
              text-align: right !important;
            }

            /******************************* workflow-visual-editor*/
            workflow-visual-editor .svg-scroll-container {
              max-height: unset !important;
            }
            p-tabpanel ag-grid-angular {
              height: 70vh !important;
            }
            
            /************************************* Raport Journal */
            [class*="main.contents"] fi-filter-component {
              visibility: hidden;
              display: none;
            }
            div[role="region"] > div > div.panel-content > div:nth-of-type(4) {
              display: none;
            }
        `;
        (document.body || document.documentElement).appendChild(style);
    };

    injectStyles();

    // --- Helper Utilities ---
    const clickElement = (selector) => {
        const el = document.querySelector(selector);
        if (el) el.click();
        return !!el;
    };

    // Waits dynamically for an element to appear in the DOM instead of guessing the time
    const waitForElement = (selector, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) return resolve(element);

            const observer = new MutationObserver((mutations, obs) => {
                const el = document.querySelector(selector);
                if (el) {
                    obs.disconnect();
                    resolve(el);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

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
                //updateBankInput();
                clickElement('[title="Save"]');
                break;
            }

            case 'F4': {
                const releaseBtn = document.querySelector('[title="Release"]');
                if (releaseBtn) {
                    if (confirm("Are you sure to release!!")) {
                        releaseBtn.click();
                        confirmMaterialDialog();
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
                                confirmMaterialDialog();
                            }
                        }, 1000);
                    }
                }
                break;
            }

            case 'F9': {
                const listDeleteBtn = document.querySelector('fi-list-view2 span:has(img[src="assets/icons/trash-24.png"])');
                if (listDeleteBtn) {
                    listDeleteBtn.click();
                }
                break;
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
            if (closeBtn) {
                closeBtn.click();
                setTimeout(() => {
                    if (document.querySelector('main > my-tabs li.active > a.active').textContent.trim() !== 'Ordres de Travail ×') {
                        clickElement('[title="Refresh"]');
                    }
                }, 300);
            }
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
})();
