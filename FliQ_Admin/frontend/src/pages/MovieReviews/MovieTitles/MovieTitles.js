        import { useEffect, useState, useCallback } from "react";
        import ShowReviews from "../ShowReviews/ShowReviews";
        import styles from './MovieTitles.module.scss';
        import axiosInstance from "../../../services/axiosInstance";
        import MovieTitleModal from "./MovieTitleModal";
        import { MdEdit, MdDelete } from "react-icons/md";
        import EditMovieTitles from "./Edit/EditMovieTitles";

        function MovieTitles({titleId, onBack}) {
            const [showReviews, setShowReviews] = useState(false);
            const [title, setTitle] = useState([]);
            const [selectedTitleId, setSelectedTitleId] = useState(null);
            const [selectedTitleName, setSelectedTitleName] = useState("");
            const [selectedTitleImageUrl, setSelectedTitleImageUrl] = useState("");
            const [isModalOpen, setIsModalOpen] = useState(false);
            const [isEditModalOpen, setIsEditModalOpen] = useState(false);

            const fetchTitles = useCallback(async () => {
                try{
                    const response = await axiosInstance(`title/getAllTitles/${titleId}`);
                    if(Array.isArray(response.data))
                        setTitle(response.data);
                    //console.log("set Title", titleId);

                } catch(error){
                    console.error("Error fetching titles", error);
                }
            }, [titleId]);

            useEffect(() => {
                fetchTitles();
            },[fetchTitles]);

            const getImageUrl = (imageObj) => {
                if (!imageObj || typeof imageObj !== "object") return "";
            
                const url = imageObj.portrait; 
            
                if (!url || typeof url !== "string") return "";
            
                return url.startsWith("http") ? url : `${axiosInstance.defaults.baseURL}${url}`;
            };

            const openReviewPage = (titleId) => {
                setSelectedTitleId(titleId);
                setShowReviews(true);
            }

            const openEditcategoryModal = (category) => {
                setSelectedTitleId(category._id);
                setIsEditModalOpen(true);
                setSelectedTitleName(category.title);
                
                setSelectedTitleImageUrl(category.imageUrl);
            }

            const handleDeleteCategory = async (categoryId) => {
                if (!window.confirm("Are you sure you want to delete this category?")) return;

                try {
                    await axiosInstance.delete(`/title/deleteTitle/${categoryId}`);
                    await fetchTitles();
                    setTitle(title.filter(title => title._id !== categoryId));
                    alert("Titles deleted successfully");
                } catch (error) {
                    console.error("Error deleting titles:", error);
                    alert("Failed to delete titles");
                }
            }

            return (
                <div>
                    {showReviews ? (
                        <ShowReviews titleId={selectedTitleId} onBack={() => setShowReviews(false)}/>
                    ) : (
                        <>
                            <div className={styles.movieTitle}>
                                <button onClick={onBack} className={styles.backButton}>Back</button>
                                <h2 className={styles.title}>Movie Title</h2>

                                <button className={styles.addButton}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    + Add Title
                                </button>
                            </div>
                            <br />

                            <div className={styles.titleContainer}>
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

                                            <p className={styles.itemTitle}>{item.title}</p>
                                            <button className={styles.showReviews} 
                                                onClick={() => openReviewPage(item._id)}
                                            >
                                                Show Reviews
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noMovies}>No Movies found</p>
                                )}
                                <MovieTitleModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    onTitleAdded={fetchTitles}
                                    sectionId={titleId}
                                />

                                <EditMovieTitles 
                                    isOpen={isEditModalOpen}
                                    selectedTitleId={selectedTitleId}
                                    onClose={() => setIsEditModalOpen(false)}  
                                    selectedTitleName={selectedTitleName}  
                                    imageUrl={selectedTitleImageUrl} 
                                    onEditCategory={fetchTitles} 
                                />
                            </div>
                        </>
                    )
                }
                </div>
            );
        }

        export default MovieTitles;