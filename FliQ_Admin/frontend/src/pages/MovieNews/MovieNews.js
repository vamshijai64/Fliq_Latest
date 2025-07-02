        import { useState, useEffect } from "react";
        import styles from "./MovieNews.module.scss";
        import MovieNewsModal from "./MovieNewsModal";
        import axiosInstance from "../../services/axiosInstance";
        import { MdEdit, MdDelete } from "react-icons/md";
        import EditMovieNews from "./Edit/EditMovieNews";

        function MovieNews() {
            const [isModalOpen, setIsModalOpen] = useState(false);
            const [movieNews, setMovieNews] = useState([]);
            const [isEditModalOpen, setIsEditModalOpen] = useState(false);
            const [selectedTitleId, setSelectedTitleId] = useState(null);
            const [selectedTitle, setSelectedTitle] = useState(null);
            const [selectedMovieImageUrl, setSelectedMovieImageUrl] = useState("");
            const [selectedDescription, setSelectedDescription] = useState("");

            useEffect(() => {
                fetchMovieNews();
            }, []);

            const fetchMovieNews = async () => {
                try {
                    const response = await axiosInstance.get("/movienews/");
                    //console.log("Fetched Movie news:", response.data);
                    if (Array.isArray(response.data.news)) {
                        setMovieNews(response.data.news);
                    }
                } catch (error) {
                    console.error("Error fetching movie news:", error);
                }
            }

            const openEditQuizModal = async (news) => {
                setSelectedTitleId(news._id);
                setIsEditModalOpen(true);
                setSelectedTitle(news.title);
                setSelectedDescription(news.description);
                setSelectedMovieImageUrl(news.images);
            }

            const handleDeleteQuiz = async (newsId) => {
                if (!window.confirm("Are you sure you want to delete this Movie news?")) return;

                try {
                    await axiosInstance.delete(`/movienews/delete/${newsId}`);
                    setMovieNews(movieNews.filter(news => news._id !== newsId));
                    alert("Movie news deleted successfully");
                } catch (error) {
                    console.error("Error deleting Movie News:", error);
                    alert("Failed to delete Movie News");
                }
            } 

            return (
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h2 className={styles.heading}>Movie News</h2>
                        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                            + Add Movie News
                        </button>
                    </div>

                    {/* <div className={styles.newsList}>
                        {movieNews.length === 0 ? (
                            <p className={styles.noNews}>No Movie News Available</p>
                        ) : (
                            movieNews.map((news, index) => (
                                <div key={index} className={styles.newsCard}>
                                    <h3>{news.title}</h3>
                                    <p>{news.description}</p>
                                    <div className={styles.imageContainer}>
                                        {Array.isArray(news.imageUrl) ? (
                                            news.imageUrl.map((imgUrl, idx) => (
                                                <img key={idx} src={imgUrl} alt="Movie news" className={styles.image} />
                                            ))
                                        ) : (
                                            <img src={news.images} alt="Movie news" className={styles.image} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div> */}

                    <div className={styles.newsList}>
                        {movieNews.length === 0 ? (
                            <p className={styles.noNews}>No Movie News Available</p>
                        ) : (
                            movieNews.map((news, index) => (
                                <div key={index} className={styles.newsCard}>
                        <button className={styles.editButton} onClick={() => openEditQuizModal(news)}>
                            <MdEdit /> 
                        </button>
                        
                        <button className={styles.deleteButton} onClick={() => handleDeleteQuiz(news._id)}>
                            <MdDelete />
                        </button>
                        <h3>Title: {news.title}</h3>
                        <p>Description: {news.description}</p>
                        <div className={styles.imageContainer}>
                            {news.images && news.images.length > 0 &&
                                news.images.map((imgObj, idx) => (
                                    <div key={idx} className={styles.imageSet}>
                                        <img src={imgObj.landscape} alt="landscape" className={styles.image} />
                                        
                                    </div>
                                ))
                            }
                        </div>

                    </div>
                ))
            )}
        </div>

                    <MovieNewsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onMoviesAdded={fetchMovieNews}/>

                    <EditMovieNews 
                        isOpen={isEditModalOpen}
                        titleId={selectedTitleId}
                        onClose={() => setIsEditModalOpen(false)}  
                        titleName={selectedTitle} 
                        movieDescription = {selectedDescription} 
                        imageUrl={selectedMovieImageUrl} 
                        onEditMovieNews={fetchMovieNews}
                    />
                </div>
            );
        }

        export default MovieNews;
