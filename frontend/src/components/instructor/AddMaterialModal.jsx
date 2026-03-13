export default function AddMaterialModal({ 
    courseId, 
    onClose, 
    onSubmit, 
    materialForm, 
    setMaterialForm, 
    setMaterialFile 
}) {
    if (!courseId) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Add Material</h3>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input 
                            type="text" 
                            value={materialForm.title} 
                            onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select 
                            value={materialForm.type} 
                            onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                        >
                            <option value="video">Video Link</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    {materialForm.type === 'video' ? (
                        <div className="form-group">
                            <label>Video URL (YouTube link)</label>
                            <input 
                                type="url" 
                                value={materialForm.content_url} 
                                onChange={(e) => setMaterialForm({ ...materialForm, content_url: e.target.value })} 
                                required 
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Upload PDF Document</label>
                            <input 
                                type="file" 
                                accept=".pdf" 
                                onChange={(e) => setMaterialFile(e.target.files[0])} 
                                required 
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Sort Order</label>
                        <input 
                            type="number" 
                            value={materialForm.sort_order} 
                            onChange={(e) => setMaterialForm({ ...materialForm, sort_order: parseInt(e.target.value) })} 
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Add Material</button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
