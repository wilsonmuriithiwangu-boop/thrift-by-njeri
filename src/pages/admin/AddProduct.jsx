import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Save,
  X,
  Crop,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const CLOUDINARY_CLOUD_NAME = "jhzszqrd";
const CLOUDINARY_UPLOAD_PRESET = "thrift_by_njeri";

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 80,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    category: "Dresses",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");

  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const [uploading, setUploading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setOriginalImageUrl(imageUrl);
    setPreviewUrl(imageUrl);
    setCrop(undefined);
    setCompletedCrop(null);
    setShowCropper(true);
  };

  const handleImageLoad = (event) => {
    const { width, height } = event.currentTarget;

    setImageElement(event.currentTarget);

    const initialCrop = centerAspectCrop(
      width,
      height,
      4 / 5
    );

    setCrop(initialCrop);
  };

  const createCroppedImage = async () => {
    if (!completedCrop || !imageElement) {
      return null;
    }

    const canvas = document.createElement("canvas");

    const scaleX =
      imageElement.naturalWidth / imageElement.width;

    const scaleY =
      imageElement.naturalHeight / imageElement.height;

    const pixelCrop = convertToPixelCrop(
      completedCrop,
      imageElement.width,
      imageElement.height
    );

    canvas.width = Math.floor(
      pixelCrop.width * scaleX
    );

    canvas.height = Math.floor(
      pixelCrop.height * scaleY
    );

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imageElement,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          const croppedFile = new File(
            [blob],
            "thrift-by-njeri-cropped.jpg",
            {
              type: "image/jpeg",
            }
          );

          resolve(croppedFile);
        },
        "image/jpeg",
        0.92
      );
    });
  };

  const handleCropConfirm = async () => {
    if (!completedCrop || !imageElement) {
      alert("Please select the area you want to keep.");
      return;
    }

    const croppedFile = await createCroppedImage();

    if (!croppedFile) {
      alert("Could not crop the image. Please try again.");
      return;
    }

    const croppedUrl = URL.createObjectURL(croppedFile);

    setSelectedFile(croppedFile);
    setPreviewUrl(croppedUrl);
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);

    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setOriginalImageUrl("");
    setCrop(undefined);
    setCompletedCrop(null);
    setImageElement(null);
  };

  const handleCropAgain = () => {
    if (!previewUrl) {
      return;
    }

    setOriginalImageUrl(previewUrl);
    setCrop(undefined);
    setCompletedCrop(null);
    setImageElement(null);
    setShowCropper(true);
  };

  const uploadToCloudinary = async () => {
    if (!selectedFile) {
      return "";
    }

    const cloudinaryFormData = new FormData();

    cloudinaryFormData.append(
      "file",
      selectedFile
    );

    cloudinaryFormData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    cloudinaryFormData.append(
      "folder",
      "thrift-by-njeri/products"
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary error:", data);
      throw new Error(
        data.error?.message ||
          "Image upload failed."
      );
    }

    return data.secure_url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter the dress name.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (
      formData.quantity === "" ||
      Number(formData.quantity) < 0
    ) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (!selectedFile) {
      alert("Please upload a dress photo.");
      return;
    }

    try {
      setUploading(true);

      const imageUrl =
        await uploadToCloudinary();

      await addDoc(
        collection(db, "products"),
        {
          name: formData.name.trim(),
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          description:
            formData.description.trim(),
          category: "Dresses",
          imageUrl,
          createdAt: serverTimestamp(),
        }
      );

      alert("Dress added successfully!");

      navigate("/admin/dashboard");
    } catch (error) {
      console.error(
        "Error adding product:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while adding the dress."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="page admin-page">
        <div className="admin-header">
          <Link
            to="/admin/dashboard"
            className="back-link"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="admin-title">
            <p className="section-label">
              ADMIN
            </p>

            <h1>Add New Dress</h1>

            <p>
              Add a dress to your Thrift by Njeri
              collection.
            </p>
          </div>
        </div>

        <div className="admin-form-layout">
          <form
            className="admin-form-card"
            onSubmit={handleSubmit}
          >
            <div className="admin-form-section">
              <h2>Dress Information</h2>

              <div className="form-group">
                <label htmlFor="name">
                  Dress Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Blue Mini Dress"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">
                    Price (KSh)
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the dress..."
                />
              </div>
            </div>

            <div className="admin-form-section">
              <h2>Dress Photo</h2>

              <label
                htmlFor="image"
                className="image-upload-box"
              >
                {previewUrl ? (
                  <div className="selected-image-preview">
                    <img
                      src={previewUrl}
                      alt="Selected dress"
                    />

                    <div className="selected-image-overlay">
                      <Upload size={20} />
                      <span>
                        Choose another photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={40} />

                    <strong>
                      Upload Dress Photo
                    </strong>

                    <span>
                      Click to choose an image
                    </span>
                  </>
                )}

                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
              </label>

              {previewUrl && !showCropper && (
                <button
                  type="button"
                  className="crop-again-button"
                  onClick={handleCropAgain}
                >
                  <Crop size={17} />
                  Crop Photo Again
                </button>
              )}
            </div>

            <div className="admin-form-actions">
              <Link
                to="/admin/dashboard"
                className="secondary-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="primary-button"
                disabled={uploading || showCropper}
              >
                <Save size={18} />

                {uploading
                  ? "Saving..."
                  : "Save Dress"}
              </button>
            </div>
          </form>

          <aside className="admin-preview-card">
            <p className="section-label">
              PREVIEW
            </p>

            <h2>Dress Preview</h2>

            <div className="admin-product-preview">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Dress preview"
                />
              ) : (
                <div className="admin-preview-placeholder">
                  <ImageIcon size={35} />
                  <span>
                    Photo preview
                  </span>
                </div>
              )}

              <div className="admin-preview-info">
                <p>
                  {formData.category}
                </p>

                <h3>
                  {formData.name ||
                    "Dress Name"}
                </h3>

                <strong>
                  KSh{" "}
                  {formData.price
                    ? Number(
                        formData.price
                      ).toLocaleString()
                    : "0"}
                </strong>

                <span>
                  {formData.quantity === ""
                    ? "Quantity not set"
                    : `${formData.quantity} available`}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showCropper && originalImageUrl && (
        <div className="cropper-modal">
          <div className="cropper-container">
            <div className="cropper-header">
              <p className="section-label">
                EDIT PHOTO
              </p>

              <h2>
                Crop Your Dress Photo
              </h2>

              <p>
                Drag and resize the box to keep
                only the part of the photo you want.
              </p>
            </div>

            <div className="free-crop-area">
              <ReactCrop
                crop={crop}
                onChange={(pixelCrop, percentCrop) =>
                  setCrop(percentCrop)
                }
                onComplete={(pixelCrop) =>
                  setCompletedCrop(pixelCrop)
                }
                keepSelection
                minWidth={80}
                minHeight={80}
              >
                <img
                  src={originalImageUrl}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                />
              </ReactCrop>
            </div>

            <div className="cropper-help">
              <Crop size={17} />

              <span>
                Drag the box to move it.
                Drag its corners or edges to resize it.
              </span>
            </div>

            <div className="cropper-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCropCancel}
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleCropConfirm}
              >
                <Crop size={17} />
                Crop Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default AddProduct;