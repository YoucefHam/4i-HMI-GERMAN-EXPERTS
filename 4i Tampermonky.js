// ==UserScript==
// @name         4I
// @namespace    http://tampermonkey.net/
// @version      1.0.6
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
        Fix Report Journal panel
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
    15/08/2026 1.0.5.2
        Added !important flag across all custom CSS style definitions
*/

// Step 1: Wrap everything in an Immediately Invoked Function Expression (IIFE) to avoid polluting the global scope
(function() {
    'use strict';

    // --- Dynamic CSS Injection (Method 2 - No @grant needed) ---
    
    // Step 2: Define a function to create and inject custom CSS into the webpage dynamically
    const injectStyles = () => {
        // Step 2.1: Create a new <style> DOM element
        const style = document.createElement('style');
        
        // Step 2.2: Assign a unique ID to avoid duplicate style tags
        style.id = 'custom-portal-overrides';
        
        // Step 2.3: Define custom layout and scrollbar overrides using high-priority (!important) CSS declarations
        style.textContent = `

/*******************************Dashboard*/
/*Screen Scroll*/
welcome-component fi-4i-main-tile-panel > div[class="metal-main-container"] {
  min-height: 80vh !important;
}
/*Card Scroll*/
welcome-component business-dashboard-component wo-kanban-cards > div {
  height: 65vh !important;
}
welcome-component fi-4i-main-tile-panel div[class="kanban-board ng-star-inserted"] > div {
  height: 57vh !important;
}

/*****************************Lists */
/*Screen Scroll*/
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
/*Screen Scroll*/
work-order-component div[class="metal-project-container"] {
  height: calc(95vh - 120px) !important;
}
/*Payment Panel Scroll*/
work-order-component [role="tabpanel"] > div {
  overflow: auto !important;
}
/*Search item*/
work-order-component work-order-lines-list-view item-quick-search .tw-absolute {
  max-width: 60vw !important;
  resize: horizontal !important;
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
/*Screen Scroll*/
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

/************************************* Rapport Journal */
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
        
        // Step 2.4: Append the newly created style tag to the document body or document element root
        (document.body || document.documentElement).appendChild(style);
    };

    // Step 3: Trigger the CSS injection function immediately on script execution
    injectStyles();

    // --- Helper Utilities ---
    
    // Step 4: Utility function to trigger a mouse click on an element by CSS selector
    const clickElement = (selector) => {
        const el = document.querySelector(selector);
        if (el) el.click();
        return !!el; // Returns true if element existed and was clicked, otherwise false
    };

    // --- 1. Keyboard Shortcuts Listener ---
    
    // Step 5: Attach an event listener to catch global keydown events
    document.addEventListener('keydown', function (event) {

        // Step 5.1: Verify active user profile; exit early if user is not "youcefham"
        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;

        // Step 5.2: Define target function keys and exit if pressed key is unrelated
        const HANDLED_KEYS = ['F1', 'F2', 'F4', 'F5', 'F8', 'F9'];
        if (!HANDLED_KEYS.includes(event.code)) return;

        // Step 5.3: Helper promise function to watch the DOM and wait until a dynamic element appears
        const waitForElement = (selector, timeout = 5000) => {
            return new Promise((resolve, reject) => {
                // Return immediately if element is already present
                const element = document.querySelector(selector);
                if (element) return resolve(element);

                // Set up MutationObserver to watch for dynamic DOM updates
                const observer = new MutationObserver((mutations, obs) => {
                    const el = document.querySelector(selector);
                    if (el) {
                        obs.disconnect(); // Stop observing once target is found
                        resolve(el);
                    }
                });

                // Start observing changes across the body element subtree
                observer.observe(document.body, { childList: true, subtree: true });

                // Handle timeout if element does not load within specified time frame
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Timeout waiting for: ${selector}`));
                }, timeout);
            });
        };

        // Step 5.4: Helper function to automatically confirm pop-up Angular Material confirmation dialogs
        const confirmMaterialDialog = () => {
            waitForElement('mat-dialog-container .mat-raised-button', 3000)
                .then(btn => btn.click())
                .catch(err => console.warn(err.message));
        };

        // Step 5.5: Helper function to automatically update bank field values under active invoice tabs
        const updateBankInput = () => {
            const activeTab = document.querySelector('a.nav-link.active');
            const isFactureTab = activeTab && (
                activeTab.textContent.includes('Facture') ||
                activeTab.textContent.includes('Purchase Invoice')
            );

            // If active tab matches invoice criteria, find input and dispatch change events
            if (isFactureTab) {
                const bankInput = document.querySelector('[fieldcode="bank.Name"] input');
                if (bankInput) {
                    bankInput.focus();
                    bankInput.value = '-';

                    // Dispatch native input events so framework data bindings catch the change
                    bankInput.dispatchEvent(new Event('input', { bubbles: true }));
                    bankInput.dispatchEvent(new Event('change', { bubbles: true }));
                    bankInput.blur();
                }
            }
        };

        // Step 5.6: Intercept default key functionality to prevent native browser hotkey actions
        event.preventDefault();

        // Step 5.7: Map custom actions to selected function keys
        switch (event.code) {
            case 'F1': {
                // F1: Trigger "New" creation button
                clickElement('[title="New"]');
                break;
            }
            case 'F2': {
                // F2: Trigger "Save" button
                clickElement('[title="Save"]');
                break;
            }
            case 'F4': {
                // F4: Trigger "Release" button with confirmation check
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
                // F5: Trigger portal custom "Refresh" button
                clickElement('[title="Refresh"]');
                break;
            }
            case 'F8': {
                // F8: Sequence automated "Save", update bank field, then "Release" after delay
                const saveBtn = document.querySelector('[title="Save"]');
                if (saveBtn) {
                    if (confirm("Are you sure to save and release!!")) {
                        updateBankInput();
                        saveBtn.click();

                        // Delay execution briefly to allow save operation processing before triggering release
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
                // F9: Trigger list view item deletion button
                const listDeleteBtn = document.querySelector('fi-list-view2 span:has(img[src="assets/icons/trash-24.png"])');
                if (listDeleteBtn) {
                    listDeleteBtn.click();
                }
                break;
            }
        }
    });

    // --- 2. Mouse Side Buttons Listener ---
    
    // Step 6: Attach event listener to handle custom mouse side button shortcuts (Mouse 4 and Mouse 5)
    document.addEventListener('mousedown', function (event) {

        // Step 6.1: Verify user profile context before performing mouse actions
        const userSpan = document.querySelector('div.tw-justify-end label:nth-child(3) > span');
        if (!userSpan || userSpan.textContent.trim() !== 'youcefham') return;

        // Step 6.2: Exit early if click is not from mouse side buttons (Button 3 = Back, Button 4 = Forward)
        if (event.button !== 3 && event.button !== 4) return;

        // Step 6.3: Suppress default browser mouse navigation history actions
        event.preventDefault();

        // Step 6.4: Handle Mouse Button 3 (Back Button) -> Close Active Tab & Refresh Workspace
        if (event.button === 3) {
            event.preventDefault();
            const closeBtn = document.querySelector('main > my-tabs > ul > li.active > a > span');
            if (closeBtn) {
                closeBtn.click(); // Close current tab
                
                // Check active tab after delay; trigger page refresh if user is not on Work Orders tab
                setTimeout(() => {
                    if (document.querySelector('main > my-tabs li.active > a.active').textContent.trim() !== 'Ordres de Travail ×') {
                        clickElement('[title="Refresh"]');
                    }
                }, 300);
            }
        }

        // Step 6.5: Handle Mouse Button 4 (Forward Button) -> Unlock Readonly Input Fields
        if (event.button === 4) {
            event.preventDefault();
            const activeElement = document.activeElement;
            
            // If focused element is readonly, strip attribute and override styling to make field editable
            if (activeElement && activeElement.hasAttribute('readonly')) {
                activeElement.removeAttribute('readonly');
                activeElement.readOnly = false;
                activeElement.style.backgroundColor = '#ffffff';
            }
        }
    });
})();
