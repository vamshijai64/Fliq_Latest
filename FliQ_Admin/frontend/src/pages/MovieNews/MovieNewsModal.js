import React, { useRef, useState, useEffect} from "react";
import styles from "./MovieNewsModal.module.scss";
import { MdOutlineImage } from "react-icons/md";
import axiosInstance from "../../services/axiosInstance";
import { uploadToS3 } from "../../utils/s3Upload";

function MovieNewsModal({ isOpen, onClose, onMoviesAdded }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    //const [imageFile, setImageFile] = useState(null);
    const [imageUrls, setImageUrls] = useState("");
    const [uploadedImages, setUploadedImages] = useState([]);
    // const [previewUrl, setPreviewUrl] = useState(""); //For showing preview
    // const [errorMsg, setErrorMsg] = useState("");
    //const [imageFields, setImageFields] = useState([{ id: Date.now(), images:{landscape: "", portrait:"", thumbnail:""} }]);

    const fileInputRef = useRef([]);

    useEffect(() => {
        const handleEscape = (event) => {
          if (event.key === "Escape") {
            onClose();
          }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
      }, [onClose]);

    if (!isOpen) return null;

    // const handleIconClick = () => {
    //     fileInputRef.current.click();
    // };

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
            const landscape = await resizeImage(file, 260, 150);
            const portrait = await resizeImage(file, 320, 250);
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

    const handleUpload = async () => {
    if (!title.trim() || !description.trim() || uploadedImages.length === 0) {
        alert("Please fill all fields and upload at least one image.");
        return;
    }

    try {
        const response = await axiosInstance.post("/movienews/addmovienews", {
            title,
            description,
            images: uploadedImages, // Already formatted correctly
        });

        if (response.status === 201) {
            alert("Movie News added successfully!");
            onClose();
            setTitle("");
            setDescription("");
            setUploadedImages([]);
            setImageUrls("");
            onMoviesAdded();
        }
    } catch (error) {
        alert("Failed to add movie news.");
    }
};

const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
};
   
        
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButton}>✖</button>
                <h2>Add Movie News</h2>

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
                        className={styles.textAreaField}
                    />
                </div>
 
                <label>Movie News ImageUrl</label>
                <div className={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Uploaded Image URL"
                    value={imageUrls}
                    readOnly
                  />
                  <MdOutlineImage className={styles.icon} onClick={() => fileInputRef.current.click()} />

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    //hidden
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
                    <button onClick={handleUpload} className={styles.add}>Submit</button>
                </div>
            </div>
        </div>
    );
}

export default MovieNewsModal;
