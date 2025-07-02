import { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import styles from './EditQuiz.module.scss';

function EditQuiz({ isOpen, quiz, quizId, questionId, onClose, onEditQuiz }) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [hashtag, setHashtag] = useState([]);
    const [hint, setHint] = useState("");

    useEffect(() => {
        // console.log("Question ID: ", questionId);
                // console.log("Quiz ID ", quizId);
                //console.log("Incoming Quiz", quiz);
                
        if (quiz) {
            setQuestion(quiz.question || "");
            const optsObj = {};
            if (Array.isArray(quiz.options)) {
                quiz.options.forEach((opt, idx) => {
                    const key = String.fromCharCode(65 + idx); 
                    optsObj[key] = opt.name;
                });
                setOptions(optsObj);
            } else {
                setOptions(quiz.options || { A: "", B: "", C: "", D: "" });
            }
            setCorrectAnswer(quiz.correctOption?.id || "");
            setHashtag(quiz.hashtags || []);
            setHint(quiz.hint || "");
        }
    }, [quiz]);

    const handleOptionChange = (key, value) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleUpdate = async () => {
        try {
            const optionList = ["A", "B", "C", "D"].map((key, index) => ({
            id: key,
            name: options[key]
        }));

        const payload = {
            question,
            correctOption: {
                id: correctAnswer
            },
            options: optionList,
            hint,
            hashtags: hashtag
        };

                //console.log("Payload being sent:", payload);

        await axiosInstance.put(`/quizzes/${quizId}/questions/${questionId}`, payload);

                //console.log("Response: ", res.data);
            alert("Quiz updated successfully!");
            onEditQuiz();
            onClose();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update quiz.");
        }
    };
    return isOpen ? (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.cancel}>X</button>
                <h2>Edit Quiz</h2>

                <label>Question Title</label>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Enter Question"
                        value={question}
                        maxLength={90}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </div>

                <div className={styles.optionsGrid}>
                    {["A", "B", "C", "D"].map((key) => (
                        <div className={styles.optionBox} key={key}>
                            <label>Option {key}</label>
                            <input
                                type="text"
                                placeholder={`Enter Option ${key}`}
                                maxLength={25}
                                value={options[key]}
                                onChange={(e) => handleOptionChange(key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className={styles.customDropdown}>
                    <label>Correct Answer</label>
                    <select  value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}>
                        <option value="">{correctAnswer}</option>
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                    </select>
                </div>

                <div className={styles.textarea}>
                    <label>HashTags</label>
                    <textarea 
                        className={styles.textareaField} 
                        value={hashtag.join(", ")}
                        onChange={(e) => setHashtag(e.target.value.split(",").map(tag => tag.trim())
                                                                                    .filter(tag => tag.length>0))} 
                    />
                </div>
                <div className={styles.textarea}>
                    <label>Hint</label>
                    <textarea 
                        className={styles.textareaField} 
                        value={hint}
                        onChange={(e) => setHint(e.target.value)}  
                    />
                </div>

                <div className={styles.modalActions}>
                    <button onClick={handleUpdate} className={styles.save}>Submit</button>
                </div>
            </div>
        </div>
        ) : null;
    }

export default EditQuiz;