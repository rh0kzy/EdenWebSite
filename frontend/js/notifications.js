// Custom Notification System
// Replaces browser alerts and confirms with custom styled notifications

// Toast Notification
function showToast(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `custom-toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.innerHTML = `
        <div class="toast-content">
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        color: #1f2937;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 400px;
        min-width: 300px;
        border-left: 4px solid ${colors[type] || colors.info};
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        animation: slideIn 0.3s ease-out;
    `;
    
    const content = notification.querySelector('.toast-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        font-weight: 500;
        flex: 1;
    `;
    
    const icon = content.querySelector('i');
    icon.style.cssText = `
        color: ${colors[type] || colors.info};
        font-size: 20px;
    `;
    
    const closeBtn = notification.querySelector('.toast-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
    `;
    
    closeBtn.onmouseover = () => {
        closeBtn.style.background = '#f3f4f6';
        closeBtn.style.color = '#1f2937';
    };
    
    closeBtn.onmouseout = () => {
        closeBtn.style.background = 'none';
        closeBtn.style.color = '#9ca3af';
    };
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    return notification;
}

// Custom Confirm Dialog
function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
        const {
            title = 'Confirm Action',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'warning'
        } = options;
        
        const overlay = document.createElement('div');
        overlay.className = 'custom-confirm-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-out;
        `;
        
        const dialog = document.createElement('div');
        dialog.className = 'custom-confirm-dialog';
        
        const icons = {
            warning: { icon: 'fa-exclamation-triangle', color: '#f59e0b' },
            danger: { icon: 'fa-trash-alt', color: '#ef4444' },
            info: { icon: 'fa-info-circle', color: '#3b82f6' }
        };
        
        const iconData = icons[type] || icons.warning;
        
        dialog.innerHTML = `
            <div class="confirm-icon" style="
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${iconData.color}15;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
            ">
                <i class="fas ${iconData.icon}" style="
                    font-size: 28px;
                    color: ${iconData.color};
                "></i>
            </div>
            <h3 style="
                margin: 0 0 10px;
                font-size: 20px;
                font-weight: 700;
                color: #1f2937;
                text-align: center;
            ">${title}</h3>
            <p style="
                margin: 0 0 30px;
                color: #6b7280;
                line-height: 1.6;
                text-align: center;
                font-size: 15px;
            ">${message}</p>
            <div class="confirm-buttons" style="
                display: flex;
                gap: 12px;
                justify-content: center;
            ">
                <button class="confirm-cancel" style="
                    padding: 12px 24px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    color: #6b7280;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 100px;
                ">${cancelText}</button>
                <button class="confirm-ok" style="
                    padding: 12px 24px;
                    border: none;
                    background: ${iconData.color};
                    color: white;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 100px;
                ">${confirmText}</button>
            </div>
        `;
        
        dialog.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 450px;
            width: 90%;
            animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Add hover effects
        const cancelBtn = dialog.querySelector('.confirm-cancel');
        const okBtn = dialog.querySelector('.confirm-ok');
        
        cancelBtn.onmouseover = () => {
            cancelBtn.style.background = '#f9fafb';
            cancelBtn.style.borderColor = '#d1d5db';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.background = 'white';
            cancelBtn.style.borderColor = '#e5e7eb';
        };
        
        okBtn.onmouseover = () => {
            okBtn.style.transform = 'translateY(-2px)';
            okBtn.style.boxShadow = `0 4px 12px ${iconData.color}40`;
        };
        okBtn.onmouseout = () => {
            okBtn.style.transform = 'translateY(0)';
            okBtn.style.boxShadow = 'none';
        };
        
        // Handle responses
        const cleanup = (result) => {
            overlay.style.opacity = '0';
            dialog.style.transform = 'scale(0.9)';
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 200);
        };
        
        cancelBtn.onclick = () => cleanup(false);
        okBtn.onclick = () => cleanup(true);
        overlay.onclick = (e) => {
            if (e.target === overlay) cleanup(false);
        };
        
        // ESC key to cancel
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                cleanup(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    });
}

// Custom Alert Dialog
function showAlert(message, options = {}) {
    const {
        title = 'Notification',
        type = 'info',
        buttonText = 'OK'
    } = options;
    
    return showConfirm(message, {
        title,
        type,
        confirmText: buttonText,
        cancelText: null
    }).then(() => {
        // Always resolve true for alerts (no cancel button)
        return true;
    });
}

// Add CSS animations
if (!document.getElementById('custom-notifications-style')) {
    const style = document.createElement('style');
    style.id = 'custom-notifications-style';
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .custom-toast {
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .custom-confirm-dialog {
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
    `;
    document.head.appendChild(style);
}

// Export functions
window.showToast = showToast;
window.showConfirm = showConfirm;
window.showAlert = showAlert;
