// ==UserScript==
// @name         4I
// @namespace    http://tampermonkey.net/
// @version      1.0.8
// @description  Automate save, release, refresh, close, form modifications, keyboard/mouse shortcuts, and custom CSS overrides with !important priority.
// @author       YoucefHam
// @match        http://102.206.40.145:8080/portal/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=40.145
// @grant        none
// ==/UserScript==

// https://github.com/YoucefHam/4i-HMI-GERMAN-EXPERTS/blob/main/4i%20Tampermonky.js
// https://raw.githubusercontent.com/YoucefHam/4i-HMI-GERMAN-EXPERTS/refs/heads/main/4i%20Tampermonky.js

/* Log changes
    27/07/2026 1.0.2 - add link for update
    27/07/2026 1.0.2.1 - removed Refresh from Mouse Back
    27/07/2026 1.0.3 - Replaced setTimeout with waitForElement for dialog confirmations, Added debounce to MutationObserver for performance
    29/07/2026 1.0.3.1 - Remove Access Control (Delete Button)
    29/07/2026 1.0.3.2 - Fix Syntax
    29/07/2026 1.0.3.3 - Added Refresh from Mouse Back
    30/07/2026 1.0.4 - Added custom CSS UI overrides via dynamic DOM element injection
    30/07/2026 1.0.4.1 - Added !important flag to all CSS override rules
    30/07/2026 1.0.4.2 - Fix Report Journal panel
    11/08/2026 1.0.4.3 - Added auto-type "exp" + Enter for select-project-type-component
    11/08/2026 1.0.4.4 - Added Tab Change detection to automatically run component check on tab navigation
    11/08/2026 1.0.4.5 - Only fill "exp" if empty; enhanced Enter/Selection simulation
    11/08/2026 1.0.4.6 - Added check to return if <input> is readonly
    11/08/2026 1.0.4.7 - Added delay after Enter to focus on select-customer-component
    11/08/2026 1.0.4.8 - Added check to ensure work-order-component exists and is visible before processing
    11/08/2026 1.0.4.9 - Added cash-transaction-component automation for EMPLOYE context, Description enter flow, and Save trigger
    11/08/2026 1.0.5.0 - Added ar-transaction-component automation for Espèce payment method -> Reception account -> empty numeric input -> Enter to Save
    15/08/2026 1.0.5.2 - Added !important flag across all custom CSS style definitions
    19/09/2026 1.0.8 - Fixed cash transaction automation re-trigger on dropdown selection change
*/

// Step 1: Wrap everything in an IIFE to avoid polluting the global scope
(function() {
    'use strict';

    // --- Dynamic CSS Injection ---

    // Step 2: Define a function to create and inject custom CSS into the webpage dynamically
    const injectStyles = () => {
        // Step 2.1: Create a new <style> DOM element
        const style = document.createElement('style');

        // Step 2.2: Assign a unique ID to avoid duplicate style tags
        style.id = 'custom-portal-overrides';

        // Step 2.3: Define custom layout and scrollbar overrides using high-priority (!important) CSS declarations
        style.textContent = `
            /******************************* Dashboard */
            /* Screen Scroll */
            welcome-component fi-4i-main-tile-panel > div[class="metal-main-container"] {
                min-height: 80vh !important;
            }
            /* Card Scroll */
            welcome-component business-dashboard-component wo-kanban-cards > div {
                height: 65vh !important;
            }
            welcome-component fi-4i-main-tile-panel div[class="kanban-board ng-star-inserted"] > div {
                height: 57vh !important;
            }

            /******************************* Lists */
            /* Screen Scroll */
            :is(
                vehicles-component,
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
            :is(work-orders-component) fi-list-view2 div[class="main contents"] > div > as-split {
                height: 73vh !important;
            }

            /******************************* OR Editor */
            /* Font Size */
            work-order-component [class="fi-splitter-pane pane-2"] span,
            work-order-component [formcontrolname="detailDescription"],
            work-order-component [formcontrolname="detailDescription2"],
            work-order-component [formcontrolname="customerProvidedParts"] {
                font-size: 15px !important;
            }
            work-order-component .ag-theme-balham {
                --ag-font-size: 16px !important;
            }
            /* Screen Scroll */
            work-order-component div[class="metal-project-container"] {
                height: calc(95vh - 120px) !important;
            }
            /* Payment Panel Scroll */
            work-order-component [role="tabpanel"] > div {
                overflow: auto !important;
            }
            /* Search item */
            work-order-component work-order-lines-list-view item-quick-search .tw-absolute {
                max-width: 60vw !important;
                resize: horizontal !important;
            }

            /******************************* Autocomplete List */
            [role="listbox"] {
                max-height: 50vh !important;
                min-width: fit-content !important;
                max-width: 40vw !important;
                width: fit-content !important;
                resize: both !important;
            }

            /******************************* Print */
            /* Screen Scroll */
            pdf-viewer {
                height: 78vh !important;
            }

            /******************************* Banque/Caisse */
            div[col-id="balance"] {
                text-align: right !important;
            }

            /******************************* workflow-visual-editor */
            workflow-visual-editor .svg-scroll-container {
                max-height: unset !important;
            }
            p-tabpanel ag-grid-angular {
                height: 70vh !important;
            }

            /******************************* Rapport Journal */
            [class*="main.contents"] fi-filter-component {
                visibility: hidden !important;
                display: none !important;
            }
            div[role="region"] > div > div.panel-content > div:nth-of-type(4) {
                display: none !important;
            }

            /* Width input box */
            div[class*="input-group"]:has(input) {
                width: unset !important;
                max-width: 400px !important;
            }
            div[class*="input-group"] > input {
                max-width: 400px !important;
            }
        `;

        // Step 2.4: Append style tag to body or document head
        (document.body || document.documentElement).appendChild(style);
    };

    // Step 3: Trigger style injection immediately
    injectStyles();

    // --- Helper Utilities ---

    // Step 4: Click element by query selector
    const clickElement = (selector) => {
        const el = document.querySelector(selector);
        if (el) el.click();
        return !!el;
    };

    const isElementVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    };

    const setInputValue = (input, value) => {
        if (!input) return;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    };

    // --- Trigger Keyboard Enter ---
    const triggerEnterKey = (element, callback) => {
        const eventOptions = {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        };

        element.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
        element.dispatchEvent(new KeyboardEvent('keypress', eventOptions));
        element.dispatchEvent(new KeyboardEvent('keyup', eventOptions));

        setTimeout(() => {
            const activeOption = document.querySelector('[role="option"], .mat-option, .ng-option, .p-dropdown-item');
            if (activeOption) {
                activeOption.click();
            }

            if (typeof callback === 'function') {
                setTimeout(callback, 200);
            }
        }, 100);
    };

    // --- Cash Transaction Component Automation ---
    const setupCashTransactionEnterFlow = (cashComp) => {
        const formFields = Array.from(cashComp.querySelectorAll('fi-form-field2'));
        const descField = formFields.find(field => {
            const label = field.querySelector('label');
            return label && label.textContent.includes('Description');
        });

        const descInput = descField ? descField.querySelector('input, textarea') : null;

        const numericComp = cashComp.querySelector('fi-numeric-field');
        const numericInput = numericComp ? numericComp.querySelector('input') : null;

        if (descInput) {
            descInput.focus();

            if (!descInput.dataset.enterBound) {
                descInput.dataset.enterBound = 'true';
                descInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (numericInput) {
                            numericInput.focus();
                        }
                    }
                });
            }
        }

        if (numericInput && !numericInput.dataset.enterBound) {
            numericInput.dataset.enterBound = 'true';
            numericInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clickElement('[title="Save"]');
                }
            });
        }
    };

    const checkAndProcessCashTransaction = () => {
        const cashComp = document.querySelector('cash-transaction-component');
        if (!cashComp || !isElementVisible(cashComp)) return;

        const transTypeComp = cashComp.querySelector('select-transaction-type-component');
        if (!transTypeComp) return;

        const transTypeInput = transTypeComp.querySelector('input');
        if (!transTypeInput) return;

        // Bind event listener to reset processed status on transaction type change
        if (!transTypeInput.dataset.listenerBound) {
            transTypeInput.dataset.listenerBound = 'true';
            const resetAndCheck = () => {
                const contextComp = cashComp.querySelector('select-cash-transaction-context-component');
                if (contextComp) {
                    delete contextComp.dataset.processed;
                }
                setTimeout(checkAndProcessCashTransaction, 200);
            };
            transTypeInput.addEventListener('input', resetAndCheck);
            transTypeInput.addEventListener('change', resetAndCheck);
            transTypeInput.addEventListener('blur', resetAndCheck);
        }

        const val = transTypeInput.value || '';
        const matchFound = ["Accompte Employé", "SALARY", "Heur Supplémentaire"].some(term => val.includes(term));

        if (matchFound) {
            const contextComp = cashComp.querySelector('select-cash-transaction-context-component');
            if (contextComp && contextComp.dataset.processed !== 'true') {
                const contextInput = contextComp.querySelector('input');
                if (contextInput && !contextInput.readOnly && !contextInput.hasAttribute('readonly')) {
                    contextComp.dataset.processed = 'true';

                    contextInput.focus();
                    setInputValue(contextInput, 'EMPLOYE');
                    triggerEnterKey(contextInput, () => {
                        setupCashTransactionEnterFlow(cashComp);
                    });
                }
            }
        }
    };

    const runAllAutomations = () => {
        checkAndProcessCashTransaction();
    };

    // Global Observer for dynamic DOM insertions
    let isProcessingMutation = false;
    const mainObserver = new MutationObserver((mutations) => {
        if (isProcessingMutation) return;
        let shouldCheck = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldCheck = true;
                break;
            }
        }
        if (shouldCheck) {
            isProcessingMutation = true;
            runAllAutomations();
            setTimeout(() => { isProcessingMutation = false; }, 200);
        }
    });

    // Start watching document modifications
    mainObserver.observe(document.body, { childList: true, subtree: true });

    // --- 1. Keyboard Shortcuts Listener ---

    document.addEventListener('keydown', function (event) {
        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;

        const HANDLED_KEYS = ['F1', 'F2', 'F4', 'F5', 'F8', 'F9'];
        if (!HANDLED_KEYS.includes(event.code)) return;

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

        event.preventDefault();

        switch (event.code) {
            case 'F1': {
                clickElement('[title="New"]');
                break;
            }
            case 'F2': {
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

    // --- 2. Mouse Side Buttons Listener ---

    document.addEventListener('mousedown', function (event) {
        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;

        if (event.button !== 3 && event.button !== 4) return;

        event.preventDefault();

        if (event.button === 3) {
            const closeBtn = document.querySelector('main > my-tabs > ul > li.active > a > span');
            if (closeBtn) {
                closeBtn.click();

                setTimeout(() => {
                    const activeTabLink = document.querySelector('main > my-tabs li.active > a.active');
                    if (activeTabLink && activeTabLink.textContent.trim() !== 'Ordres de Travail ×') {
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
