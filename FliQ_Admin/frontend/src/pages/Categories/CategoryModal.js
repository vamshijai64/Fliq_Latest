  import styles from "./CategoryModal.module.scss";
  import { MdOutlineImage } from "react-icons/md";
  import { useRef, useState, useEffect } from "react";
  import axiosInstance from "../../services/axiosInstance";
  import { uploadToS3 } from "../../utils/s3Upload";

  function CategoryModal({ isOpen, onClose, onCategoryAdded }) {
    const [categoryName, setCategoryName] = useState("");
    const [imageUrls, setImageUrls] = useState({ landscape: "", portrait: "", thumbnail: "" });
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleIconClick = () => {
      fileInputRef.current.click();
    };

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
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);

      try {
        // Resize to 3 sizes
        const landscape = await resizeImage(file, 260, 150);
        const portrait = await resizeImage(file, 131, 170);
        const thumbnail = await resizeImage(file, 300, 300);

        // Upload all
        const [landscapeUrl, portraitUrl, thumbnailUrl] = await Promise.all([
          uploadToS3(landscape),
          uploadToS3(portrait),
          uploadToS3(thumbnail),
        ]);

        // Save all image URLs
        setImageUrls({
          landscape: landscapeUrl,
          portrait: portraitUrl,
          thumbnail: thumbnailUrl,
        });
      } catch (err) {
        console.error(err);
        alert("Failed to process/upload image");
      } finally {
        setIsUploading(false);
      }
    };

    const handleUpload = async () => {
      if (!categoryName.trim()) {
        alert("Please enter category name");
        return;
      }

      if (!imageUrls.landscape || !imageUrls.portrait || !imageUrls.thumbnail) {
        alert("Please upload image to generate all formats");
        return;
      }

      try {
        const response = await axiosInstance.post("/categories/create", {
          title: categoryName.trim(),
          imageUrl: imageUrls, // send as object with 3 URLs
        });

        if (response.status === 201) {
          alert("Category created successfully!");
          onCategoryAdded();
          setCategoryName("");
          setImageUrls({ landscape: "", portrait: "", thumbnail: "" });
          onClose();
        }
      } catch (error) {
        console.error("Error creating category:", error);
        alert("Failed to create category");
      }
    };

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button onClick={onClose} className={styles.cancel}>X</button>
          <h2>Uploading Category</h2>
          <label>Category Name</label>
          <div className={styles.inputContainer}>
            <input 
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>

          <label>Category Image Upload</label>
          <div className={styles.inputContainer}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
            <input
              type="text"
              placeholder="Image uploaded..."
              value={imageUrls.landscape}
              disabled
            />
            <MdOutlineImage className={styles.icon} onClick={handleIconClick} />
          </div>

          <div className={styles.modalActions}>
            <button onClick={handleUpload} className={styles.add} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  export default CategoryModal;
