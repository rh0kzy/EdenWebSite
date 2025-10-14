/**
 * Authentication Guard
 * Protects admin pages by checking for valid authentication token
 * Redirects to login page if user is not authenticated
 */

(function() {
    'use strict';

    // Prevent redirect loop
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'admin-login.html') {
        console.log('🔓 Already on login page, skipping auth guard');
        return;
    }

    // Check for authentication in both localStorage and sessionStorage
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true' ||
                           sessionStorage.getItem('adminAuthenticated') === 'true';
    
    const token = localStorage.getItem('adminToken') || 
                  sessionStorage.getItem('adminToken');

    console.log('🔐 Auth Guard Check:', {
        currentPage,
        isAuthenticated,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        localStorage: {
            authenticated: localStorage.getItem('adminAuthenticated'),
            hasToken: !!localStorage.getItem('adminToken')
        },
        sessionStorage: {
            authenticated: sessionStorage.getItem('adminAuthenticated'),
            hasToken: !!sessionStorage.getItem('adminToken')
        }
    });

    // If not authenticated, redirect to login page
    if (!isAuthenticated || !token) {
        console.error('❌ User not authenticated, redirecting to login page');
        console.error('Missing:', {
            authenticated: !isAuthenticated,
            token: !token
        });
        window.location.href = 'admin-login.html';
        return;
    }
    
    console.log('✅ Initial auth check passed, verifying token with backend...');

    // Optional: Verify token with backend (non-blocking)
    async function verifyToken() {
        try {
            const response = await fetch('/api/v2/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Verify response status:', response.status);

            if (!response.ok) {
                console.error('❌ Token verification failed with status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error('Token verification failed');
            }

            const data = await response.json();
            console.log('📦 Verify response data:', data);
            
            if (!data.success) {
                // Token is invalid or expired, clear storage and redirect
                console.error('❌ Token is invalid or expired:', data.error);
                localStorage.removeItem('adminAuthenticated');
                localStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminAuthenticated');
                sessionStorage.removeItem('adminToken');
                
                setTimeout(() => {
                    window.location.href = 'admin-login.html';
                }, 1000);
            } else {
                console.log('✅ Authentication verified for user:', data.username);
            }
        } catch (error) {
            console.error('⚠️ Token verification error:', error);
            console.error('Error details:', error.message);
            // Don't redirect on network errors - allow page to load
            console.warn('⚠️ Allowing page to load despite verification error');
        }
    }

    // Verify token on page load (non-blocking)
    verifyToken();

    // Add logout functionality
    window.adminLogout = function() {
        if (confirm('Are you sure you want to logout?')) {
            console.log('🚪 Logging out...');
            
            // Clear authentication
            localStorage.removeItem('adminAuthenticated');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUsername');
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminUsername');

            // Call backend logout endpoint
            fetch('/api/v2/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).catch(err => {
                console.error('Logout error:', err);
            }).finally(() => {
                // Redirect to login page
                window.location.href = 'admin-login.html';
            });
        }
    };

    console.log('✅ Authentication guard active - user is authenticated');
})();
