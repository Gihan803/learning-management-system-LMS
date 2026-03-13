export default function AddQuestionsModal({ 
    quizId, 
    onClose, 
    onSubmit, 
    questions, 
    addQuestion, 
    updateQuestion, 
    removeQuestion 
}) {
    if (!quizId) return null;

    return (
        <div className="modal-overlay">
            <div className="modal modal-lg">
                <h3>Add Questions</h3>
                <form onSubmit={onSubmit}>
                    {questions.map((q, idx) => (
                        <div key={idx} className="question-form-block">
                            <div className="question-form-header">
                                <h4>Question {idx + 1}</h4>
                                {questions.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => removeQuestion(idx)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Question Text</label>
                                <input 
                                    type="text" 
                                    value={q.question_text} 
                                    onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Option A</label>
                                    <input 
                                        type="text" 
                                        value={q.option_a} 
                                        onChange={(e) => updateQuestion(idx, 'option_a', e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Option B</label>
                                    <input 
                                        type="text" 
                                        value={q.option_b} 
                                        onChange={(e) => updateQuestion(idx, 'option_b', e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Option C</label>
                                    <input 
                                        type="text" 
                                        value={q.option_c} 
                                        onChange={(e) => updateQuestion(idx, 'option_c', e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Option D</label>
                                    <input 
                                        type="text" 
                                        value={q.option_d} 
                                        onChange={(e) => updateQuestion(idx, 'option_d', e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Correct Answer</label>
                                <select 
                                    value={q.correct_option} 
                                    onChange={(e) => updateQuestion(idx, 'correct_option', e.target.value)}
                                >
                                    <option value="a">A</option>
                                    <option value="b">B</option>
                                    <option value="c">C</option>
                                    <option value="d">D</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    <button 
                        type="button" 
                        className="btn btn-outline mb-1" 
                        onClick={addQuestion}
                    >
                        + Add Another Question
                    </button>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">Save Questions</button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
