    import { useEffect, useState, useMemo } from "react";
    import styles from "./ShowReviews.module.scss";
    import axiosInstance from "../../../services/axiosInstance";
    import { MdDelete } from "react-icons/md";
    import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

    function ShowReviews({ titleId, onBack }) {
        const [title, setTitle] = useState("");
        const [reviews, setReviews] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const reviewsPerPage = 5;

        useEffect(() => {
            const fetchData = async () => {
                //console.log("titleId passed to ShowReviews:", titleId);
                try {
                    const [titleRes, reviewsRes] = await Promise.all([
                        axiosInstance.get(`/title/getTitle/${titleId}`),
                        axiosInstance.get(`/review/reviews/${titleId}`)
                    ]);

                    const fetchedTitle = titleRes.data?.title || "Unknown Title";
                    setTitle(fetchedTitle);
                    //console.log("Title:", title);
                    
                    setReviews(reviewsRes.data?.reviews || []);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };

            fetchData();
        }, [titleId]);

        // const getImageUrl = (imagePath) => {
        //     if (!imagePath) return null;
        //     return `${axiosInstance.defaults.baseURL}${imagePath}`;
        // };

        const getImageUrl = (imagePath) => {
            
            if (!imagePath) return "";
            
            if (imagePath.startsWith("http")) return imagePath;
            //if (imagePath.startsWith("https")) return imagePath;
            
            const baseUrl = axiosInstance.defaults.baseURL;
        
            const fullUrl = `${baseUrl}${imagePath}`;
            //console.log("Formatted Image URL:", fullUrl); 
            return fullUrl;
        };

        const renderStars = (rating) => {
            return Array.from({ length: 5 }, (_, i) => {
                if (i < Math.floor(rating)) return <FaStar key={i} className={styles.starFilled} />;
                if (i === Math.floor(rating) && rating % 1 !== 0) return <FaStarHalfAlt key={i} className={styles.starHalf} />;
                return <FaRegStar key={i} className={styles.starEmpty} />;
            });
        };

        const handleDelete = async (reviewId) => {
            if (!window.confirm(`Are you sure you want to delete this review?`)) return;

            console.log("Hi");
            
            try {
                await axiosInstance.delete(`/review/admin/${reviewId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });

                const updatedReviews = reviews.filter(review => review.reviewId !== reviewId);
                setReviews(updatedReviews);

                if ((currentPage - 1) * reviewsPerPage >= updatedReviews.length) {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                }

                alert("Review deleted successfully");
            } catch (error) {
                console.error("Failed to delete Review:", error);
                alert("Failed to delete Review");
            }
        };

        const currentReviews = useMemo(() => {
            const indexOfLastReview = currentPage * reviewsPerPage;
            return reviews.slice(indexOfLastReview - reviewsPerPage, indexOfLastReview);
        }, [reviews, currentPage]);

        return (
            <div className={styles.review}>
        <div className={styles.title}>
            <button onClick={onBack} className={styles.backButton}>Back to Titles</button>
            <h2>Title: {title || "Loading..."}</h2>
        </div>

        <div className={styles.reviewList}>
            {reviews.length > 0 ? (
                currentReviews.map((review) => (
                    <div key={review.reviewId} className={styles.reviewCard}>
                        <div className={styles.reviewContent}>
                            <div className={styles.userInfo}>
                                <img
                                    src={getImageUrl(review.profileImage)}
                                    alt={`${review.user}'s profile`}
                                    className={styles.profileImage}
                                />
                                <div className={styles.userDetails}>
                                    <h3 className={styles.username}>{review.username}</h3>
                                    <div className={styles.rating}>{renderStars(review.rating)}</div>
                                </div>
                            </div>
                            <p className={styles.reviewText}>{review.reviewText}</p>
                        </div>
                        <button className={styles.deleteButton} onClick={() => handleDelete(review.reviewId)}>
                            <MdDelete />
                        </button>
                    </div>
                ))
            ) : (
                <p className={styles.noReviews}>No reviews found for this title</p>
            )}
        </div>

        {reviews.length > reviewsPerPage && (
            <div className={styles.pagination}>
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                >
                    Prev
                </button>
                {Array.from({ length: Math.ceil(reviews.length / reviewsPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`${styles.pageButton} ${currentPage === i + 1 ? styles.active : ""}`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(reviews.length / reviewsPerPage)}
                    className={styles.pageButton}
                >
                    Next
                </button>
            </div>
        )}
    </div>

        );
    }

    export default ShowReviews;
