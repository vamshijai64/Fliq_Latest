    import { useState, useEffect, useCallback} from "react";
    import styles from "./SubCategoriesList.module.scss";
    import axiosInstance from "../../services/axiosInstance";
    import AddQuiz from './AddQuiz/AddQuiz';
    import { MdEdit, MdDelete } from "react-icons/md";
    import EditSubCategory from "./EditSubCategory/EditSubCategory";

    function SubCategoryList({ isOpen, onClose, categoryId }) {
        //const [isModalOpen, setIsModalOpen] = useState(false);
        const [isEditModalOpen, setIsEditModalOpen] = useState(false);
        const [selectedSubCategoryId ,setSelectedSubCategoryId] = useState(false);
        const [subcategories, setSubcategories] = useState([]);
        const [categoryName, setCategoryName] = useState("");
        //const [categoryImage, setCategoryImage] = useState("");
        //const [selectedSubcategory, setSelectedSubcategory] = useState(null); 
        const [selectedImageUrl, setSelectedImageUrl] = useState(null);
        const [selectedSubcategoryForQuiz, setSelectedSubcategoryForQuiz] = useState(null);
        const [selectedSubcategoryForEdit, setSelectedSubcategoryForEdit] = useState(null);

        

        // const fetchSubcategories = async () => {
        //     try {
        //         const response = await axiosInstance.get(`/categories/${categoryId}`);
        //         //console.log("Subcategories fetched:", response.data);
        //         setSubcategories(response.data.subcategories || []);
        //         // setCategoryName(response.data.name || "Unknown Category");
        //         // setCategoryImage(response.data.image || "");
        //         setCategoryName(response.data.title || "Unknown Category");
        //         //setCategoryImage(response.data.imageUrl || "");
        //     } catch (error) {
        //         //console.error("Error fetching subcategories:", error);
        //         setSubcategories([]);
        //     }
        // };
        // useEffect(() => {
        //     fetchSubcategories();
        // }, [categoryId, isOpen]);
// useEffect(() => {
//     const fetchSubcategories = async () => {
//         try {
//             const response = await axiosInstance.get(`/categories/${categoryId}`);
//             setSubcategories(response.data.subcategories || []);
//             setCategoryName(response.data.title || "Unknown Category");
//         } catch (error) {
//             setSubcategories([]);
//         }
//     };
//     fetchSubcategories();
// }, [categoryId, isOpen]);

const fetchSubcategories = useCallback(async () => {
    try {
        const response = await axiosInstance.get(`/categories/${categoryId}`);
        setSubcategories(response.data.subcategories || []);
        setCategoryName(response.data.title || "Unknown Category");
    } catch (error) {
        setSubcategories([]);
    }
}, [categoryId]); // ✅ dependencies

useEffect(() => {
    if (isOpen && categoryId) {
        fetchSubcategories();
    }
}, [isOpen, categoryId, fetchSubcategories]);


        if (!categoryId || !isOpen) return; 

//        const fetchSubcategories = useCallback(async () => {
//     try {
//         const response = await axiosInstance.get(`/categories/${categoryId}`);
//         setSubcategories(response.data.subcategories || []);
//         setCategoryName(response.data.title || "Unknown Category");
//     } catch (error) {
//         setSubcategories([]);
//     }
// }, [categoryId]);

// useEffect(() => {
//     if (isOpen && categoryId) {
//         fetchSubcategories();
//     }
// }, [isOpen, categoryId, fetchSubcategories]);


        // const getImageUrl = (imagePath) => {
        //     if (!imagePath) return "";

        //     if (imagePath.startsWith("http")) return imagePath;

        //     if (imagePath.startsWith("https")) return imagePath;
        
        //     const baseUrl = axiosInstance.defaults.baseURL;
        
        //     const fullUrl = `${baseUrl}${imagePath}`;
        //     return fullUrl;
        // };

        const getImageUrl = (imageObj) => {
            if (!imageObj || typeof imageObj !== "object") return "";
        
            const url = imageObj.portrait; 
        
            if (!url || typeof url !== "string") return "";
        
            return url.startsWith("http") ? url : `${axiosInstance.defaults.baseURL}${url}`;
        };

        const openEditSubcategoryModal = (subcategory) => {
            setSelectedSubCategoryId(subcategory._id);
            setIsEditModalOpen(true);
            setSelectedSubcategoryForEdit(subcategory.title);
            setSelectedImageUrl(subcategory.imageUrl);
        }

        const handleDeleteCategory = async (subcategoryId) => {
            if (!window.confirm("Are you sure you want to delete this subcategory?")) return;

            try {
                await axiosInstance.delete(`/subcategories/delete/${subcategoryId}`);
                setSubcategories(subcategories.filter(subcategory => subcategory._id !== subcategoryId));
                alert("Sub Category deleted successfully");
            } catch (error) {
                console.error("Error deleting sub category:", error);
                alert("Failed to delete sub category");
            }
        }

        return (
            
            <div className={styles.modalOverlay}>
            <div className={styles.modalContent} >
                    <button className={styles.closeButton} onClick={onClose}>X</button>
                    
                    <h2>{categoryName}:</h2>
                    
                    <div className={styles.subcategoryContainer}>
                        {subcategories.length > 0 ? (
                            subcategories.map((item) => (
                                <div key={item._id} className={styles.subcategoryCard}>
                                    <img src={getImageUrl(item.imageUrl)} alt={item.title} className={styles.subcategoryImage} />

                                    <div className={styles.buttonGroup}>
                                    <button className={styles.editButton} onClick={() => openEditSubcategoryModal(item)}
                                    >
                                        <MdEdit /> 
                                    </button>
                                    
                                    <button className={styles.deleteButton} onClick={() => handleDeleteCategory(item._id)}>
                                        <MdDelete />
                                    </button>
                                    </div>

                                    <p className={styles.subTitle}>{item.title}</p>
                                    <button 
                                        className={styles.addQuiz} 
                                        onClick={() => setSelectedSubcategoryForQuiz(item)} 
                                    >
                                        Add Quiz
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noSubCategory}>No subcategories found.</p>
                        )}
                    </div>
                </div>

                {selectedSubcategoryForQuiz && (
                    <AddQuiz
                        isOpen={true} 
                        onClose={() => setSelectedSubcategoryForQuiz(null)} 
                        subcategory={selectedSubcategoryForQuiz} 
                    />
                )}

                <EditSubCategory 
                    isOpen={isEditModalOpen}
                    subcategoryId={selectedSubCategoryId}
                    onClose={() => setIsEditModalOpen(false)}  
                    subCategoryName={selectedSubcategoryForEdit}  
                    imageUrl={selectedImageUrl} 
                    onEditSubCategory={fetchSubcategories}
                />    
            </div>
        );
    }

    export default SubCategoryList;
