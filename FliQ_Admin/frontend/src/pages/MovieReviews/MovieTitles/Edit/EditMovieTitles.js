        import { useEffect, useRef, useState } from 'react';
        import { MdOutlineImage } from "react-icons/md";
        import styles from './EditMovieTitles.module.scss';
        import { uploadToS3 } from '../../../../utils/s3Upload';
        import axiosInstance from '../../../../services/axiosInstance';


        function EditMovieTitles({isOpen, selectedTitleId, onClose, selectedTitleName, imageUrl, onEditCategory}) {
            const [movieCategoryNewName, setMovieCategoryNewName] = useState("");
            const [newImageUrl, setNewImageUrl] = useState("");
            const [imageUrls, setImageUrls] = useState({ landscape: "", portrait: "", thumbnail: "" });
            const [imageFile, setImageFile] = useState(null);
            const fileInputRef = useRef(null);

            useEffect(() => {
                //console.log("Categor name: ", selectedTitleName);
                // console.log("title Name: ", movieCategoryNewName);
                // console.log("Selectd titleid:", selectedTitleId);
                setMovieCategoryNewName(selectedTitleName || "");
                setNewImageUrl(imageUrl || "");
            }, [selectedTitleName,imageUrl]);

            if(!isOpen) return null;

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

                //setIsUploading(true);

                try {
                    // Resize to 3 sizes
                    const landscape = await resizeImage(file, 251, 147);
                    const portrait = await resizeImage(file, 600, 800);
                    const thumbnail = await resizeImage(file, 300, 300);

                    // Upload all
                    const [landscapeUrl, portraitUrl, thumbnailUrl] = await Promise.all([
                    uploadToS3(landscape),
                    uploadToS3(portrait),
                    uploadToS3(thumbnail),
                ]);

                // Save all image URLs
                // setImageUrls({
                //     landscape: landscapeUrl,
                //     portrait: portraitUrl,
                //     thumbnail: thumbnailUrl,
                // });

                const imageSet = {
                    landscape: landscapeUrl,
                    portrait: portraitUrl,
                    thumbnail: thumbnailUrl,
                };

                    setImageUrls(imageSet);
                    setNewImageUrl(imageSet);
            } catch (err) {
            console.error(err);
            alert("Failed to process/upload image");
            } 
            }

            const handleIconClick = () => {
                fileInputRef.current.click();
            }

            const handleEdit = async () => {
                if(!movieCategoryNewName.trim()){
                    alert("Please enter movie category name");
                    return;
                }

                console.log("title Name: ", movieCategoryNewName);
                console.log("Selectd titleid:", selectedTitleId);
                
                
                try{
                    const response = await axiosInstance.put(`/title/updateTitle/${selectedTitleId}`, {
                        // headers: {"Content-Type": "multipart/form-data"},
                        title: movieCategoryNewName,
                        imageUrl: imageUrls,
                    });

                    if(response.status === 200) {
                        alert("Movie Category updated successfully");
                        setMovieCategoryNewName("");
                        setNewImageUrl("");
                        setImageFile(null);
                        onEditCategory();
                        onClose(); 
                    }
                } catch(error){
                    console.error("Error updating Movie category:", error?.response?.data || error.message);
                    alert("Failed to edit Movie category");
                }
            }
            return(
                <div className={styles.modalOverlay} onClick={onClose}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <button onClick={onClose} className={styles.cancel}>X</button>
                                <h2>Edit Movie Title</h2>
                                        
                                <label>Movie Title Name</label>
                                <div className={styles.inputContainer}>
                                    <input type='text' 
                                        value={movieCategoryNewName || ""}
                                        onChange={(e) => setMovieCategoryNewName(e.target.value)}
                                    />
                                </div>
                        
                                <label>Movie Title Url</label>
                                <div className={styles.inputContainer}>
                                    <input type='file' ref={fileInputRef} onChange={handleFileChange} hidden />
                                    <input
                                        type='text'
                                        placeholder='Enter image URL'
                                        value={newImageUrl.portrait}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        disabled={imageFile !== null}
                                    />
                                    <MdOutlineImage className={styles.icon}  onClick={handleIconClick}/>
                                </div>  
                        
                                <div className={styles.modalActions}>
                                    <button type='submit' onClick={handleEdit} className={styles.edit}>Submit</button>
                                </div>
                            </div>
                        </div>
            )
        }

        export default EditMovieTitles;