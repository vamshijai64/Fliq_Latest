import { useEffect, useRef, useState } from "react";
import { uploadToS3 } from "../../../utils/s3Upload";
import axiosInstance from "../../../services/axiosInstance";
import styles from './EditMovieNews.module.scss';
import { MdOutlineImage } from "react-icons/md";

function EditMovieNews({ isOpen, titleId, onClose, titleName, movieDescription, imageUrl, onEditMovieNews }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrls, setImageUrls] = useState("");
    const [uploadedImages, setUploadedImages] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTitle(titleName || "");
            setDescription(movieDescription || "");
            setImageUrls(imageUrl || ""); // string or array? depends on your API
            setUploadedImages(Array.isArray(imageUrl) ? imageUrl : []);
        }
    }, [isOpen, titleName, movieDescription, imageUrl]);

    if (!isOpen) return null;

    const resizeImage = (file, width, height) => {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
                    resolve(resizedFile);
                }, "image/jpeg");
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            const uploadPromises = files.map(async (file) => {
                const landscape = await resizeImage(file, 251, 147);
                const portrait = await resizeImage(file, 600, 800);
                const thumbnail = await resizeImage(file, 300, 300);

                const [landscapeUrl, portraitUrl, thumbnailUrl] = await Promise.all([
                    uploadToS3(landscape),
                    uploadToS3(portrait),
                    uploadToS3(thumbnail),
                ]);

                return { landscape: landscapeUrl, portrait: portraitUrl, thumbnail: thumbnailUrl };
            });

            const allUploadedImages = await Promise.all(uploadPromises);
            setUploadedImages(prev => [...prev, ...allUploadedImages]);
        } catch (error) {
            alert("Failed to upload one or more images.");
        }
    };

    const handleEdit = async () => {
        if (!title.trim()) {
            alert("Please enter movie news title");
            return;
        }

        try {
            const response = await axiosInstance.put(`/movienews/update/${titleId}`, {
                title: title,
                description: description,
                images: uploadedImages,
            });

            if (response.status === 200) {
                alert("Movie news updated successfully");
                setTitle("");
                setDescription("");
                setImageUrls("");
                setUploadedImages([]);
                onEditMovieNews();
                onClose();
            }
        } catch (error) {
            console.error("Error updating Movie news:", error?.response?.data || error.message);
            alert("Failed to edit Movie News");
        }
    };

    const handleRemoveImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButton}>✖</button>
                <h2>Edit Movie News</h2>

                <div className={styles.modalBody}>
                    <label>Title</label>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="Enter movie title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.inputField}
                        />
                    </div>

                    <label>Description</label>
                    <div className={styles.textarea}>
                        <textarea
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <label>Movie News Image Upload</label>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="Uploaded Image URLs"
                            //value={uploadedImages.map(img => img.landscape).join(", ")}
                            value={imageUrls.landscape}
                            readOnly
                        />
                        <MdOutlineImage className={styles.icon} onClick={() => fileInputRef.current.click()} />

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            hidden
                        />
                    </div>

                    <ul className={styles.uploadedList}>
                        {uploadedImages.map((img, i) => (
                            <li key={i} className={styles.uploadedItem}>
                                <div className={styles.imageRow}>
                                    <span className={styles.imageUrl}>{img.landscape}</span>
                                    <button onClick={() => handleRemoveImage(i)} className={styles.removeButton}>X</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.modalActions}>
                    <button onClick={handleEdit} className={styles.add}>Submit</button>
                </div>
            </div>
        </div>
    );
}

export default EditMovieNews;
