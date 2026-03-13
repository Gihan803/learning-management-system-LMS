export default function CreateQuizModal({ courseId, onClose, onSubmit, quizForm, setQuizForm }) {
    if (!courseId) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Create Quiz</h3>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Quiz Title</label>
                        <input 
                            type="text" 
                            value={quizForm.title} 
                            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} 
                            required 
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Create & Add Questions</button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
