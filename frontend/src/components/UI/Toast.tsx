
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

export default function Toast({ message, type, isVisible }: ToastProps) {
    return (
        <div className={`fixed bottom-5 right-5 py-3 px-6 rounded-lg text-white font-bold
            ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}
        `}>
            {message}
        </div>
    )
}