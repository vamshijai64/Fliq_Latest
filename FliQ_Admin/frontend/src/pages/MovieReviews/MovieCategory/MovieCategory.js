import { useEffect, useState } from 'react';
import styles from './MovieCategory.module.scss'
import axiosInstance from '../../../services/axiosInstance';
import MovieCategoryModal from './MovieCategoryModal';
// import MovieTitles from '../MovieTitles/MovieTitles';
import MovieTitlesModal from './MovieTitleModal';
import { MdEdit, MdDelete } from "react-icons/md";
import MovieTitles from '../MovieTitles/MovieTitles';
import EditMovieCategory from './Edit/EditMovieCategory';

function MovieCategory() {
    const [title, setTitle] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTitleId, setSelectedTitleId] = useState(null);
    const [showTitles, setShowTitles] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState(null);
    // const [sectionId, setSectionId] = useState("");
    const [categories, setCategories] = useState([]);
    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
    const [selectedCategoryImageUrl, setSelectedCategoryImageUrl] = useState("");

    useEffect(() => {
        fetchCategories();
    },[]);

    const fetchCategories = async () => {
        try{
            const response = await axiosInstance('section/getAllSections');
            //console.log(response.data);
            if(Array.isArray(response.data))
                setTitle(response.data);
        } catch(error){
            console.error("Error fetching categories", error);
        }
    }

    const getImageUrl = (imageObj) => {
        if (!imageObj || typeof imageObj !== "object") return "";
    
        const url = imageObj.portrait; 
    
        if (!url || typeof url !== "string") return "";
    
        return url.startsWith("http") ? url : `${axiosInstance.defaults.baseURL}${url}`;
    };

    const openSubCategoryModal = (sectionId) => {
        setSelectedTitleId(sectionId);
        setIsSubCategoryModalOpen(true);
    }

    const openMoviesPage = (titleId) => {
        setSelectedTitleId(titleId);
        setShowTitles(true);
    };

    const openEditcategoryModal = (category) => {
        setSelectedCategoryId(category._id);
        setIsEditModalOpen(true);
        setSelectedCategoryName(category.title);
        setSelectedCategoryImageUrl(category.imageUrl);
    }

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            await axiosInstance.delete(`/section/deleteSection/${categoryId}`);
            await fetchCategories();
            setCategories(categories.filter(category => category._id !== categoryId));
            alert("Category deleted successfully");
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Failed to delete category");
        }
    }

    return (
        <div>
            {showTitles ? (
                <MovieTitles 
                    titleId={selectedTitleId} 
                    onBack={() => setShowTitles(false)} 
                />
            ) : (
                <>
                    <div className={styles.movieCategory}>
                        <h2 className={styles.title}>Movie Category</h2>
                        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                            + Add Movie Category
                        </button>
                    </div>
                    <br />

                    <div className={styles.categoryContainer}>
                        {title.length > 0 ? (
                            title.map((item) => (
                                <div key={item._id} className={styles.titleCard}>
                                    <img src={getImageUrl(item.imageUrl)} alt={item.name} className={styles.titleImage} />

                                    <button className={styles.editButton} onClick={() => openEditcategoryModal(item)}>
                                        <MdEdit /> 
                                    </button>
                                    
                                    <button className={styles.deleteButton} onClick={() => handleDeleteCategory(item._id)}>
                                        <MdDelete />
                                    </button>
                                    
                                    <button className={styles.addTitleButton} onClick={() => openSubCategoryModal(item._id)}>
                                        +
                                    </button>
                                    <p className={styles.itemTitle}>{item.title}</p>
                                    <button className={styles.showMovies} onClick={() => openMoviesPage(item._id)}>
                                        Show Movies
                                    </button>
                                </div>
                            ))
                        ) : (
                            <center><p >No Movie Categories found</p></center>
                        )}
                    </div>

                    <MovieCategoryModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onCategoryAdded={fetchCategories}
                    />

                    <MovieTitlesModal 
                        isOpen={isSubCategoryModalOpen}
                        onClose={() => setIsSubCategoryModalOpen(false)}
                        sectionId={selectedTitleId}
                    />

                    <EditMovieCategory
                        isOpen={isEditModalOpen}
                        categoryId={selectedCategoryId}
                        onClose={() => setIsEditModalOpen(false)}  
                        categoryName={selectedCategoryName}  
                        imageUrl={selectedCategoryImageUrl} 
                        onEditCategory={fetchCategories} 
                    />
                </>
            )}
        </div>
    );
}

export default MovieCategory;
