import React, { createContext, useContext, useState, useRef } from 'react'

import Toast from '../components/UI/Toast'

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error') => void;
}

interface ToastType {
    message: string,
    type: 'success' | 'error',
    isVisible: boolean
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<ToastType>({
        message: '', type: 'success', isVisible: true
    })
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)

        setToast({ message, type, isVisible: true})

        toastTimerRef.current = setTimeout(() => {
            setToast(prev => ({...prev, isVisible: false}))
        }, 3000)
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
            />
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast must be used within a ToastProvider')
    return context;
}