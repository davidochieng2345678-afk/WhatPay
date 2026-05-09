// ============================================
// UNIVERSAL PAYMENT METHODS - WORKS ON ALL PAGES
// Add this file to every page on your website
// ============================================

(function() {
    
    // ============================================
    // PAYMENT METHODS CONFIGURATION
    // Add or remove methods here to control what appears
    // ============================================
    
    const PAYMENT_METHODS = {
        // LIVE METHODS - Already working
        mpesa: {
            name: 'M-Pesa',
            icon: 'fas fa-mobile-alt',
            color: 'green',
            fee: '0%',
            status: 'live',
            description: 'Pay with M-Pesa - 0% fee',
            type: 'mobile_money'
        },
        visa: {
            name: 'Visa Card',
            icon: 'fab fa-cc-visa',
            color: 'blue',
            fee: '1.5% + KES 20',
            status: 'live',
            description: 'Pay with Visa card',
            type: 'card'
        },
        mastercard: {
            name: 'Mastercard',
            icon: 'fab fa-cc-mastercard',
            color: 'orange',
            fee: '1.5% + KES 20',
            status: 'live',
            description: 'Pay with Mastercard',
            type: 'card'
        },
        offline_code: {
            name: 'Member Code (Offline)',
            icon: 'fas fa-key',
            color: 'purple',
            fee: '0%',
            status: 'live',
            description: 'Use Member Code with M-Pesa Paybill - No internet needed',
            type: 'offline'
        },
        qr_code: {
            name: 'Scan QR Code',
            icon: 'fas fa-qrcode',
            color: 'indigo',
            fee: '1.5% + KES 20',
            status: 'live',
            description: 'Scan merchant QR code to pay instantly',
            type: 'qr'
        },
        whatsapp: {
            name: 'WhatsApp Link',
            icon: 'fab fa-whatsapp',
            color: 'green',
            fee: '1.5% + KES 20',
            status: 'live',
            description: 'Click merchant WhatsApp payment link',
            type: 'whatsapp'
        },
        
        // ============================================
        // ADD YOUR NEW PAYMENT METHODS BELOW
        // Uncomment and edit when each method is live
        // ============================================
        
        airtel: {
            name: 'Airtel Money',
            icon: 'fas fa-wifi',
            color: 'red',
            fee: '1.5% + KES 10',
            status: 'live',  // Change to 'live' when ready
            description: 'Pay with Airtel Money',
            type: 'mobile_money',
            endpoint: 'https://whapay-backend.onrender.com/api/mobile-money/charge',
            network: 'AIRTEL',
            country: 'KE',
            currency: 'KES'
        },
        tigo: {
            name: 'Tigo Pesa',
            icon: 'fas fa-mobile',
            color: 'pink',
            fee: '1.5% + KES 10',
            status: 'live',  // Change to 'live' when ready
            description: 'Pay with Tigo Pesa (Tanzania)',
            type: 'mobile_money',
            endpoint: 'https://whapay-backend.onrender.com/api/mobile-money/charge',
            network: 'TIGO',
            country: 'TZ',
            currency: 'TZS'
        },
        mtn: {
            name: 'MTN Mobile Money',
            icon: 'fas fa-globe',
            color: 'yellow',
            fee: '1.5% + KES 10',
            status: 'live',  // Change to 'live' when ready
            description: 'Pay with MTN Mobile Money (Uganda)',
            type: 'mobile_money',
            endpoint: 'https://whapay-backend.onrender.com/api/mobile-money/charge',
            network: 'MTN',
            country: 'UG',
            currency: 'UGX'
        },
        orange: {
            name: 'Orange Money',
            icon: 'fas fa-circle',
            color: 'orange',
            fee: '1.5% + KES 10',
            status: 'live',  // Change to 'live' when ready
            description: 'Pay with Orange Money (Ivory Coast)',
            type: 'mobile_money',
            endpoint: 'https://whapay-backend.onrender.com/api/mobile-money/charge',
            network: 'ORANGE',
            country: 'CI',
            currency: 'XOF'
        },
        paypal: {
            name: 'PayPal',
            icon: 'fab fa-paypal',
            color: 'blue',
            fee: '2.9% + $0.30',
            status: 'live',  // Change to 'live' when ready
            description: 'Pay with PayPal account',
            type: 'paypal',
            endpoint: 'https://whapay-backend.onrender.com/api/paypal/charge'
        },
        googlepay: {
            name: 'Google Pay',
            icon: 'fab fa-google',
            color: 'gray',
            fee: '1.5% + KES 20',
            status: 'live',  // Change to 'live' when ready
            description: 'Pay with Google Pay',
            type: 'wallet',
            endpoint: 'https://whapay-backend.onrender.com/api/googlepay/charge'
        },
        applepay: {
            name: 'Apple Pay',
            icon: 'fab fa-apple',
            color: 'gray',
            fee: '1.5% + KES 20',
            status: 'live',  // Change to 'live' when ready
            description: 'Pay with Apple Pay',
            type: 'wallet',
            endpoint: 'https://whapay-backend.onrender.com/api/applepay/charge'
        }
    };
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    function showToast(msg, isErr = false) {
        let toast = document.getElementById('globalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'globalToast';
            toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm z-50 transition-opacity opacity-0';
            document.body.appendChild(toast);
        }
        toast.innerText = msg;
        toast.style.backgroundColor = isErr ? '#dc2626' : '#16a34a';
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
        setTimeout(() => toast.classList.add('opacity-0'), 3000);
    }
    
    function validatePhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return (cleaned.startsWith('0') && cleaned.length === 10) || (cleaned.startsWith('254') && cleaned.length === 12);
    }
    
    function normalizePhone(phone) {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
        if (!cleaned.startsWith('254')) cleaned = '254' + cleaned;
        return cleaned;
    }
    
    // ============================================
    // PROCESS PAYMENT WITH SELECTED METHOD
    // ============================================
    
    async function processPayment(methodId, paymentData) {
        const method = PAYMENT_METHODS[methodId];
        
        if (!method) {
            showToast('Payment method not found', true);
            return { success: false, error: 'Method not found' };
        }
        
        if (method.status !== 'live') {
            showToast(`${method.name} payments coming soon!`, false);
            return { success: false, error: 'Coming soon' };
        }
        
        try {
            let response;
            
            // Handle different payment types
            switch (method.type) {
                case 'mobile_money':
                    response = await fetch(method.endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            merchantCode: paymentData.merchantCode,
                            customerPhone: paymentData.customerPhone,
                            customerName: paymentData.customerName,
                            amount: paymentData.amount,
                            network: method.network,
                            country: method.country,
                            currency: method.currency
                        })
                    });
                    break;
                    
                case 'card':
                    // Stripe card payment
                    response = await fetch('https://whapay-backend.onrender.com/api/card/charge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            merchantCode: paymentData.merchantCode,
                            amount: paymentData.amount,
                            currency: 'KES',
                            customerEmail: paymentData.customerEmail || paymentData.customerPhone
                        })
                    });
                    break;
                    
                case 'mpesa':
                    response = await fetch('https://whapay-backend.onrender.com/api/mpesa/charge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            merchantCode: paymentData.merchantCode,
                            customerPhone: paymentData.customerPhone,
                            customerName: paymentData.customerName,
                            amount: paymentData.amount
                        })
                    });
                    break;
                    
                default:
                    showToast(`${method.name} - Coming soon`, false);
                    return { success: false, error: 'Coming soon' };
            }
            
            const data = await response.json();
            return { success: data.success, message: data.message, error: data.error };
            
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
    
    // ============================================
    // UPDATE PAYMENT DROPDOWN ON ANY PAGE
    // ============================================
    
    function updatePaymentDropdown(selectElementId) {
        const select = document.getElementById(selectElementId);
        if (!select) return;
        
        // Clear existing options except first
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add all live payment methods
        Object.entries(PAYMENT_METHODS).forEach(([key, method]) => {
            if (method.status === 'live') {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${method.icon ? '📱' : '💳'} ${method.name} - ${method.fee}`;
                select.appendChild(option);
            }
        });
        
        console.log(`✅ Updated ${selectElementId} with ${select.options.length - 1} payment methods`);
    }
    
    // ============================================
    // DISPLAY PAYMENT METHODS GRID ON ANY PAGE
    // ============================================
    
    function displayPaymentMethodsGrid(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6';
        
        Object.entries(PAYMENT_METHODS).forEach(([key, method]) => {
            if (method.status === 'live') {
                const card = document.createElement('div');
                card.className = `bg-white rounded-xl p-3 text-center shadow border border-${method.color === 'green' ? 'green' : 'gray'}-200 method-card cursor-pointer`;
                card.onclick = () => {
                    const select = document.getElementById('method');
                    if (select) {
                        select.value = key;
                        showToast(`${method.name} selected`);
                    }
                };
                card.innerHTML = `
                    <i class="${method.icon} text-3xl text-${method.color === 'green' ? 'green' : method.color === 'blue' ? 'blue' : method.color === 'orange' ? 'orange' : 'gray'}-600"></i>
                    <p class="font-bold text-sm mt-1">${method.name}</p>
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mt-1 inline-block">LIVE</span>
                    <p class="text-xs text-gray-500 mt-1">${method.fee}</p>
                `;
                container.appendChild(card);
            }
        });
    }
    
    // ============================================
    // AUTO-INITIALIZE WHEN PAGE LOADS
    // ============================================
    
    document.addEventListener('DOMContentLoaded', () => {
        // Update all payment dropdowns on the page
        updatePaymentDropdown('method');
        updatePaymentDropdown('osMethod');
        updatePaymentDropdown('paymentMethod');
        updatePaymentDropdown('merchantPaymentMethod');
        updatePaymentDropdown('memberPaymentMethod');
        
        // Display payment methods grid
        displayPaymentMethodsGrid('paymentMethodsGrid');
        
        console.log('✅ Universal payment methods loaded');
    });
    
    // Export for use in other scripts
    window.WhaPayPaymentMethods = {
        methods: PAYMENT_METHODS,
        process: processPayment,
        updateDropdown: updatePaymentDropdown,
        showGrid: displayPaymentMethodsGrid,
        toast: showToast
    };
    
})();
