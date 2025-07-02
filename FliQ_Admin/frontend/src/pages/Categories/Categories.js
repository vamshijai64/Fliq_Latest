    import { useState, useEffect } from "react";
    import axiosInstance from "../../services/axiosInstance";
    import styles from "./Categories.module.scss";
    import { MdEdit, MdDelete } from "react-icons/md";
    import CategoryModal from "./CategoryModal";
    import EditCategory from "./EditCategory/EditCategory";
    import SubCategories from "../SubCategories/SubCategories";
    import SubCategoryList from "../SubCategories/SubCategoriesList";

    function Categories() {
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
        const [selectedCategoryId, setSelectedCategoryId] = useState(null);
        const [selectedCategoryName, setSelectedCategoryName] = useState(null);
        const [categories, setCategories] = useState([]);
        const [isListModalOpen, setIsListModalOpen] = useState(false);
        const [isEditModalOpen, setIsEditModalOpen] = useState(false);
        const [selectedCategoryImageUrl, setSelectedCategoryImageUrl] = useState("");


        useEffect(() => {
            fetchCategories();
        }, []);

        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get("/categories");
                //console.log("Fetched Categories:", response.data);
                if (Array.isArray(response.data)) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const openSubcategoryModal = (categoryId) => {
            setSelectedCategoryId(categoryId);
            setIsSubcategoryModalOpen(true);
        };

        const openListModal = async (categoryId) => {
            //console.log("Opening modal for category:", categoryId);
            setSelectedCategoryId(categoryId);
            setIsListModalOpen(true);
        };

        const openEditcategoryModal = async (category) => {
            setSelectedCategoryId(category._id);
            setIsEditModalOpen(true);
            setSelectedCategoryName(category.title);
            setSelectedCategoryImageUrl(category.imageUrl);
        }

        const handleDeleteCategory = async (categoryId) => {
            if (!window.confirm("Are you sure you want to delete this category?")) return;

            try {
                await axiosInstance.delete(`/categories/${categoryId}`);
                setCategories(categories.filter(category => category._id !== categoryId));
                alert("Category deleted successfully");
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("Failed to delete category");
            }
        };

        const getImageUrl = (imageObj) => {
            if (!imageObj || typeof imageObj !== "object") return "";
        
            const url = imageObj.landscape; // or choose 'landscape' / 'portrait' based on need
        
            if (!url || typeof url !== "string") return "";
        
            return url.startsWith("http") ? url : `${axiosInstance.defaults.baseURL}${url}`;
        };
        
        return (
            <div>
                
                <div className={styles.categories} >
                    <h2 className={styles.title}>Categories</h2>
                    <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>+ Add Category</button>
                </div>
                <br />
                
                <div className={styles.categoryGrid}>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <div key={category._id} className={styles.categoryCard}
                                style={{ backgroundImage: `url("${getImageUrl(category.imageUrl)}")`, backgroundSize: "cover", backgroundPosition: "center" }}>
                                {/* <img src={getImageUrl(category.imageUrl)} alt="Category" style={{ width: "100px", height: "100px" }} /> */}

                                <button className={styles.editButton} onClick={() => openEditcategoryModal(category)}>
                                    <MdEdit /> 
                                </button>

                                <button className={styles.deleteButton} onClick={() => handleDeleteCategory(category._id)}>
                                    <MdDelete />
                                </button>

                                <button className={styles.addSubcategoryButton} onClick={() => openSubcategoryModal(category._id)}>
                                    +
                                </button>

                                <div className={styles.overlay}>
                                    <button className={styles.categoryName} onClick={() => openListModal(category._id)}>
                                        {category.title}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noCategories}><center>No categories available.</center></p>
                        
                    )}
                </div>

                <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCategoryAdded={fetchCategories}/>

                <SubCategories
                    isOpen={isSubcategoryModalOpen}
                    onClose={() => setIsSubcategoryModalOpen(false)}
                    categoryId={selectedCategoryId}
                />

                <SubCategoryList
                    isOpen={isListModalOpen}
                    onClose={() => setIsListModalOpen(false)}
                    categoryId={selectedCategoryId}
                />

                <EditCategory 
                    isOpen={isEditModalOpen}
                    categoryId={selectedCategoryId}
                    onClose={() => setIsEditModalOpen(false)}  
                    categoryName={selectedCategoryName}  
                    imageUrl={selectedCategoryImageUrl} 
                    onEditCategory={fetchCategories}
                />
                
            </div>
        );
    }

    export default Categories;
