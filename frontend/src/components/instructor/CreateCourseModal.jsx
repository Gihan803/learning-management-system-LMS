export default function CreateCourseModal({ isOpen, onClose, onSubmit, courseForm, setCourseForm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Create New Course</h3>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Course Title</label>
                        <input 
                            type="text" 
                            value={courseForm.title} 
                            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={courseForm.description} 
                            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} 
                            rows={3}
                        ></textarea>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Create</button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
