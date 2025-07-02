import { useEffect, useState, useCallback } from 'react';
import styles from './Questions.module.scss';
import Add from './AddQuestions/Add';
import { MdEdit, MdDelete } from "react-icons/md";
import axiosInstance from '../../services/axiosInstance';
import EditQuiz from './EditQuiz';

function Questions() {
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [category, setCategory] = useState("");
    const [subcategory, setSubCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [quizID, setQuizID] = useState("");
    const [selectedQuestionId, setSelectedQuestionId] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState([]);
    const [isEditModalOpen ,setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchCategories();  
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get("/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setSubcategories([]);
        }
    };

                    useEffect(() => {
                        if (category) {    
                            fetchSubcategories(category);
                        } else {
                            setSubcategories([]);
                        }
                    }, [category]);
                    
                    const fetchSubcategories = async (categoryId) => {
                        try {
                            const response = await axiosInstance.get(`/categories/${categoryId}`);
                            const subcats = response.data.subcategories || [];      
                            setSubcategories(subcats);
                            //console.log("All data", response.data);
                            
                            // console.log("Subcategories list: ", response.data);
                            // console.log("Subcategory id: ", subcats[0]._id);
                            // console.log("Quiz id: ",subcats.quizzes);
                            subcats.forEach((sub) => {
                            // console.log(`Subcategory: ${sub.title}`);
                            // console.log("Subcategory ID: ", sub._id);
                    
                            // console.log("Quiz IDs:", sub.quizzes); // This will be an array
                            })    
                        } catch (error) {
                            console.error("Error fetching subcategories:", error);
                        }
                    };
                    
                    const fetchQuizzes = useCallback(async (subcategoryId) => {
                        if (!subcategoryId) {
                            alert("Subcategory ID is missing!");
                            return;
                        }

                        try {
                            const response = await axiosInstance.get(`/subcategories/${subcategoryId}`);
                            const subcategoryData = response.data;
                            //console.log("Subcategory dta ", response.data );
                            
                            if (subcategoryData.quizzes && subcategoryData.quizzes.length > 0) {
                                const firstQuiz = subcategoryData.quizzes[0];
                                setQuizID(firstQuiz._id);
                                setQuizzes(firstQuiz.questions);
                                //console.log("Quiz Id: ", quizID );    
                            } else {
                                setQuizzes([]);
                                setQuizID("");
                            }
                        } catch (error) {
                            console.error("Error fetching quizzes:", error);
                            setQuizzes([]);
                        }
                    }, []);
                    
                    useEffect(() => {
                        if (subcategory) {
                            fetchQuizzes(subcategory);
                        }
                    }, [subcategory, fetchQuizzes]);

                    if (showAddQuestion) {
                        return <Add onBack={() => setShowAddQuestion(false)} />;
                    }

                    const openEditQuizModal = async (quizQuestion) => {
                        setSelectedQuiz(quizQuestion);
                        setSelectedQuestionId(quizQuestion._id); // the selected question's ID
                        setIsEditModalOpen(true);
                };


                    const handleDeleteQuiz = async (selectedQuestionId) => {
                        //console.log("Quiz id: ", quizId);
                        
                        if (!window.confirm("Are you sure you want to delete this Quiz question?")) return;

                        try {
                            await axiosInstance.delete(`/quizzes/delete/${selectedQuestionId}`);
                            setQuizzes(quizzes.filter(quiz => quiz._id !== selectedQuestionId));
                            alert("Quiz question deleted successfully");
                        } catch (error) {
                            console.error("Error deleting quiz:", error);
                            alert("Failed to delete quiz");
                        }
                    };

                    return (
                        <div className={styles.main}>
                            <div className={styles.questions}>
                                <h2 className={styles.title}>Questions Panel</h2>
                                <div>
                                    <button 
                                        className={styles.add} 
                                        onClick={() => setShowAddQuestion(true)}
                                    >
                                        + Add Question
                                    </button>
                                    {/* <button className={styles.add}>Import Questions</button> */}
                                </div>
                            </div>
                            <div className={styles.filterSection}>
                                <div className={styles.inputGroup}>
                                    <div className={styles.inputBox}>
                                        <label>Category Name</label>
                                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                            <option value="">Select Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat._id}>{cat.title}</option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className={styles.inputBox}>
                                        <label>Sub Category Name</label>
                                        {/* <select value={subcategory} onChange={(e) => setSubCategory(e.target.value)}> */}
                                        <select
                                            value={subcategory}
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                setSubCategory(selectedId);
                    
                                                const selectedSub = subcategories.find((sub) => sub._id === selectedId);
                    
                                                if (selectedSub && selectedSub.quizzes && selectedSub.quizzes.length > 0) {
                                                    const quizObj = selectedSub.quizzes[0]; // should be an object
                                                    setQuizID(quizObj._id); // fix: explicitly use _id
                                                } else {
                                                    setQuizID("");
                                                }
                                            }}
                                        >

                                            <option value="">Select Sub Category</option>
                                            {subcategories.map((sub) => (
                                                <option key={sub._id} value={sub._id}>{sub.title}</option>
                                            ))}  
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.quizList}>
                                {quizzes.length === 0 && <p><center>No quizzes found for this subcategory.</center></p>}
                                {quizzes.map((quiz, index) => (
                                    
                                    <div key={quiz._id} className={styles.quizCard}>
                                        <button className={styles.editButton} onClick={() => openEditQuizModal(quiz)}>
                                            <MdEdit /> 
                                        </button>
                                
                                        <button className={styles.deleteButton} onClick={() => handleDeleteQuiz(quiz._id)}>
                                            <MdDelete />
                                        </button>
                                        <h4>Q{index + 1}. {quiz.question}</h4>
                                        <ul>
                                            {quiz.options.map((opt, i) => (
                                                <li key={i}>{opt.name}</li>
                                            ))}
                                        </ul>
                                        <p>Correct Answer: {quiz.correctOption.id}</p>
                                        <p>Hashtags: {quiz.hashtags}</p>
                                        <p>Hint: {quiz.hint}</p>
                                    </div>
                                ))}       

                            </div>

                            <EditQuiz
                                isOpen={isEditModalOpen}
                                quiz={selectedQuiz}                    // question object
                                quizId={quizID}                        // quiz object ID (parent)
                                questionId={selectedQuestionId}       // question _id
                                onClose={() => setIsEditModalOpen(false)}
                                onEditQuiz={() => fetchQuizzes(subcategory)}
                />

                        </div>
                    );
                }

                export default Questions;
