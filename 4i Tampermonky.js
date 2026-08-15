// ==UserScript==
// @name         4I
// @namespace    http://tampermonkey.net/
// @version      1.0.5.1
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
    11/08/2026 1.0.4.3
        Added auto-type "exp" + Enter for select-project-type-component
    11/08/2026 1.0.4.4
        Added Tab Change detection to automatically run component check on tab navigation
    11/08/2026 1.0.4.5
        Only fill "exp" if empty; enhanced Enter/Selection simulation
    11/08/2026 1.0.4.6
        Added check to return if <input> is readonly
    11/08/2026 1.0.4.7
        Added delay after Enter to focus on select-customer-component
    11/08/2026 1.0.4.8
        Added check to ensure work-order-component exists and is visible before processing
    11/08/2026 1.0.4.9
        Added cash-transaction-component automation for EMPLOYE context, Description enter flow, and Save trigger
    11/08/2026 1.0.5.0
        Added ar-transaction-component automation for Espèce payment method -> Reception account -> empty numeric input -> Enter to Save
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

/*^(Width input box|).*http://102.206.40.145:8080.*$*/
div[class*="input-group"]:has(input){
  width: unset;
  max-width: 400px;
}
div[class*="input-group"] > input{
  max-width: 400px;
}

/*******************************Dashboard*/
/*Screen Scrool*/
welcome-component fi-4i-main-tile-panel > div[class="metal-main-container"] {
  min-height: 80vh !important;
}
/*Card Scrool*/
welcome-component business-dashboard-component wo-kanban-cards > div{
  height: 65vh !important;
}
welcome-component fi-4i-main-tile-panel  div[class="kanban-board ng-star-inserted"] > div {
  height: 57vh !important;
}
/*****************************Lists */
/*Screen Scrool*/
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

    // --- Focus Customer Component ---
    const focusCustomerComponent = () => {
        const customerComponent = document.querySelector('select-customer-component');
        if (customerComponent) {
            const customerInput = customerComponent.querySelector('input');
            if (customerInput) {
                customerInput.focus();
            } else {
                customerComponent.focus();
            }
        }
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

    // --- Select Project Type Automation ---
    const handleProjectTypeComponent = (component) => {
        if (!component || component.dataset.processed === 'true') return;

        const input = component.querySelector('input');
        if (input) {
            if (input.readOnly || input.hasAttribute('readonly')) {
                return;
            }

            if (input.value && input.value.trim() !== '') {
                return;
            }

            component.dataset.processed = 'true';

            input.focus();
            setInputValue(input, 'exp');
            triggerEnterKey(input, focusCustomerComponent);
        }
    };

    const checkAndProcessProjectType = () => {
        const workOrderComp = document.querySelector('work-order-component');
        if (!workOrderComp || !isElementVisible(workOrderComp)) {
            return;
        }

        const components = workOrderComp.querySelectorAll('select-project-type-component');
        components.forEach(component => handleProjectTypeComponent(component));
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

    // --- AR Transaction Component Automation ---
    const executeArEspeceFlow = (arComp) => {
        const accountComp = arComp.querySelector('select-transaction-account-component');
        if (!accountComp) return;

        const accountInput = accountComp.querySelector('input');
        if (!accountInput || accountInput.readOnly || accountInput.hasAttribute('readonly')) return;

        accountInput.focus();
        setInputValue(accountInput, 'Reception');

        triggerEnterKey(accountInput, () => {
            const numericComp = arComp.querySelector('fi-numeric-field');
            const numericInput = numericComp ? numericComp.querySelector('input') : null;

            if (numericInput) {
                numericInput.focus();
                //setInputValue(numericInput, '');

                if (!numericInput.dataset.arEnterBound) {
                    numericInput.dataset.arEnterBound = 'true';
                    numericInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            clickElement('[title="Save"]');
                        }
                    });
                }
            }
        });
    };

    const checkAndProcessArTransaction = () => {
        const arComp = document.querySelector('ar-transaction-component');
        if (!arComp || !isElementVisible(arComp)) return;

        const customerComp = arComp.querySelector('select-customer-component');
        if (!customerComp) return;

        const customerInput = customerComp.querySelector('input');
        if (!customerInput || customerInput.readOnly || customerInput.hasAttribute('readonly')) return;

        const payMethodComp = arComp.querySelector('select-payment-method-component');
        if (!payMethodComp) return;

        const payMethodInput = payMethodComp.querySelector('input');
        if (!payMethodInput) return;

        // Check if value already contains "Espèce"
        if ((payMethodInput.value || '').includes('Espèce')) {
            if (arComp.dataset.arProcessed !== 'true') {
                arComp.dataset.arProcessed = 'true';
                executeArEspeceFlow(arComp);
            }
        }

        // Listen for user changing payment method input to "Espèce" dynamically
        if (!payMethodInput.dataset.arListenerBound) {
            payMethodInput.dataset.arListenerBound = 'true';

            const handleValueChange = () => {
                if ((payMethodInput.value || '').includes('Espèce')) {
                    if (arComp.dataset.arProcessed !== 'true') {
                        arComp.dataset.arProcessed = 'true';
                        executeArEspeceFlow(arComp);
                    }
                } else {
                    arComp.dataset.arProcessed = 'false';
                }
            };

            payMethodInput.addEventListener('input', handleValueChange);
            payMethodInput.addEventListener('change', handleValueChange);
        }
    };

    // Combine checks
    const runAllAutomations = () => {
        checkAndProcessProjectType();
        checkAndProcessCashTransaction();
        checkAndProcessArTransaction();
    };

    // Global Observer for dynamic DOM insertions
    const mainObserver = new MutationObserver((mutations) => {
        let shouldCheck = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldCheck = true;
                break;
            }
        }
        if (shouldCheck) {
            runAllAutomations();
        }
    });

    mainObserver.observe(document.body, { childList: true, subtree: true });

    // --- Tab Switch Detector ---
    document.addEventListener('click', (event) => {
        const tabClick = event.target.closest('my-tabs li, [role="tab"], .nav-tabs .nav-link, .p-tabview-nav li');
        if (tabClick) {
            setTimeout(() => {
                runAllAutomations();
            }, 150);
        }
    });

    // Initial load check
    runAllAutomations();

    // --- 1. Keyboard Shortcuts Listener ---
    document.addEventListener('keydown', function (event) {
        const HANDLED_KEYS = ['F9', 'F1', 'F2', 'F4', 'F5', 'F8','F12'];
        if (!HANDLED_KEYS.includes(event.code)) return;

        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;


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
            case 'F12': {
                if (clickElement('[title="Edit"]')) {
                    setTimeout(() => {
                        if (clickElement('[title="Reopen"]')) {
                            confirmMaterialDialog();
                            setTimeout(() => {
                                if (clickElement('[title="Close"]')) {
                                    setTimeout(() => {
                                        if (clickElement('button[class="btn btn-discard"]')) {
                                            setTimeout(() => {
                                                if (clickElement('[title="Delete"]')) {
                                                    confirmMaterialDialog();
                                                }
                                            }, 1500);
                                        }
                                    }, 800);
                                }
                            }, 1200);
                        }
                    }, 1500);
                }
                break;
            }
        }
    });

    // --- 2. Mouse Side Buttons Listener ---
    document.addEventListener('mousedown', function (event) {
        if (event.button !== 3 && event.button !== 4) return;

        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;

        event.preventDefault();

        if (event.button === 3) {

            event.preventDefault();
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
            event.preventDefault();
            const activeElement = document.activeElement;
            if (activeElement && activeElement.hasAttribute('readonly')) {
                activeElement.removeAttribute('readonly');
                activeElement.readOnly = false;
                activeElement.style.backgroundColor = '#ffffff';
            }
        }
    });
})();
