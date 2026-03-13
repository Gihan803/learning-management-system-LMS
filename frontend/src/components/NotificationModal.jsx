export default function NotificationModal({ isOpen, type, message, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="modal-icon">
                    {type === 'success' ? '✅' : '❌'}
                </span>
                <h2>{type === 'success' ? 'Success!' : 'Oops!'}</h2>
                <p>{message}</p>
                <button 
                    onClick={onClose} 
                    className={`btn btn-full ${type === 'success' ? 'btn-success' : 'btn-danger'}`}
                >
                    Okay
                </button>
            </div>
        </div>
    );
}
