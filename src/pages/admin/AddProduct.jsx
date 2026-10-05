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

  // FRONT IMAGE
  const [frontFile, setFrontFile] = useState(null);
  const [frontPreviewUrl, setFrontPreviewUrl] = useState("");
  const [frontOriginalUrl, setFrontOriginalUrl] = useState("");

  // BACK IMAGE
  const [backFile, setBackFile] = useState(null);
  const [backPreviewUrl, setBackPreviewUrl] = useState("");
  const [backOriginalUrl, setBackOriginalUrl] = useState("");

  // CROPPER
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageElement, setImageElement] = useState(null);

  const [showCropper, setShowCropper] = useState(false);
  const [cropSide, setCropSide] = useState(null);

  const [uploading, setUploading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // SELECT FRONT/BACK IMAGE
  // --------------------------------------------------

  const handleFileChange = (event, side) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setCropSide(side);
    setCrop(undefined);
    setCompletedCrop(null);
    setImageElement(null);
    setShowCropper(true);

    if (side === "front") {
      setFrontFile(file);
      setFrontOriginalUrl(imageUrl);
      setFrontPreviewUrl(imageUrl);
    } else {
      setBackFile(file);
      setBackOriginalUrl(imageUrl);
      setBackPreviewUrl(imageUrl);
    }

    // Allow selecting the same image again later.
    event.target.value = "";
  };

  // --------------------------------------------------
  // IMAGE LOAD
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CREATE CROPPED IMAGE
  // --------------------------------------------------

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
            `thrift-by-njeri-${cropSide}-cropped.jpg`,
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

  // --------------------------------------------------
  // CONFIRM CROP
  // --------------------------------------------------

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

    if (cropSide === "front") {
      setFrontFile(croppedFile);
      setFrontPreviewUrl(croppedUrl);
    }

    if (cropSide === "back") {
      setBackFile(croppedFile);
      setBackPreviewUrl(croppedUrl);
    }

    setShowCropper(false);
    setCrop(undefined);
    setCompletedCrop(null);
    setImageElement(null);
  };

  // --------------------------------------------------
  // CANCEL CROP
  // --------------------------------------------------

  const handleCropCancel = () => {
    setShowCropper(false);

    if (cropSide === "front") {
      if (frontOriginalUrl) {
        URL.revokeObjectURL(frontOriginalUrl);
      }

      setFrontFile(null);
      setFrontPreviewUrl("");
      setFrontOriginalUrl("");
    }

    if (cropSide === "back") {
      if (backOriginalUrl) {
        URL.revokeObjectURL(backOriginalUrl);
      }

      setBackFile(null);
      setBackPreviewUrl("");
      setBackOriginalUrl("");
    }

    setCrop(undefined);
    setCompletedCrop(null);
    setImageElement(null);
    setCropSide(null);
  };

  // --------------------------------------------------
  // CROP AGAIN
  // --------------------------------------------------

  const handleCropAgain = (side) => {
    const previewUrl =
      side === "front"
        ? frontPreviewUrl
        : backPreviewUrl;

    if (!previewUrl) {
      return;
    }

    setCropSide(side);
    setCrop(undefined);
    setCompletedCrop(null);
    setImageElement(null);
    setShowCropper(true);

    if (side === "front") {
      setFrontOriginalUrl(previewUrl);
    } else {
      setBackOriginalUrl(previewUrl);
    }
  };

  // --------------------------------------------------
  // REMOVE IMAGE
  // --------------------------------------------------

  const removeImage = (side) => {
    if (side === "front") {
      setFrontFile(null);
      setFrontPreviewUrl("");
      setFrontOriginalUrl("");
    }

    if (side === "back") {
      setBackFile(null);
      setBackPreviewUrl("");
      setBackOriginalUrl("");
    }
  };

  // --------------------------------------------------
  // CLOUDINARY UPLOAD
  // --------------------------------------------------

  const uploadToCloudinary = async (file) => {
    if (!file) {
      return "";
    }

    const cloudinaryFormData = new FormData();

    cloudinaryFormData.append(
      "file",
      file
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

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter the dress name.");
      return;
    }

    if (
      !formData.price ||
      Number(formData.price) <= 0
    ) {
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

    if (!frontFile) {
      alert("Please upload the FRONT photo of the dress.");
      return;
    }

    if (!backFile) {
      alert("Please upload the BACK photo of the dress.");
      return;
    }

    try {
      setUploading(true);

      const frontImageUrl =
        await uploadToCloudinary(frontFile);

      const backImageUrl =
        await uploadToCloudinary(backFile);

      await addDoc(
        collection(db, "products"),
        {
          name: formData.name.trim(),
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          description:
            formData.description.trim(),
          category: "Dresses",

          // Keep imageUrl for compatibility
          // with existing products.
          imageUrl: frontImageUrl,

          // New back image field.
          backImageUrl: backImageUrl,

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

            {/* DRESS INFORMATION */}

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

            {/* PHOTOS */}

            <div className="admin-form-section">

              <h2>Dress Photos</h2>

              <p className="photo-section-help">
                Upload both the front and back side
                of the dress.
              </p>

              <div className="dress-photo-upload-grid">

                {/* FRONT */}

                <div className="dress-photo-upload">

                  <label className="photo-side-label">
                    Front Side
                  </label>

                  <label
                    htmlFor="front-image"
                    className="image-upload-box"
                  >

                    {frontPreviewUrl ? (
                      <div className="selected-image-preview">

                        <img
                          src={frontPreviewUrl}
                          alt="Front of dress"
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
                          Upload Front Photo
                        </strong>

                        <span>
                          Click to choose an image
                        </span>
                      </>
                    )}

                    <input
                      id="front-image"
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleFileChange(
                          event,
                          "front"
                        )
                      }
                      hidden
                    />

                  </label>

                  {frontPreviewUrl &&
                    !showCropper && (
                      <div className="photo-actions">

                        <button
                          type="button"
                          className="crop-again-button"
                          onClick={() =>
                            handleCropAgain(
                              "front"
                            )
                          }
                        >
                          <Crop size={17} />
                          Crop Again
                        </button>

                        <button
                          type="button"
                          className="remove-photo-button"
                          onClick={() =>
                            removeImage("front")
                          }
                        >
                          <X size={16} />
                          Remove
                        </button>

                      </div>
                    )}

                </div>

                {/* BACK */}

                <div className="dress-photo-upload">

                  <label className="photo-side-label">
                    Back Side
                  </label>

                  <label
                    htmlFor="back-image"
                    className="image-upload-box"
                  >

                    {backPreviewUrl ? (
                      <div className="selected-image-preview">

                        <img
                          src={backPreviewUrl}
                          alt="Back of dress"
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
                          Upload Back Photo
                        </strong>

                        <span>
                          Click to choose an image
                        </span>
                      </>
                    )}

                    <input
                      id="back-image"
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleFileChange(
                          event,
                          "back"
                        )
                      }
                      hidden
                    />

                  </label>

                  {backPreviewUrl &&
                    !showCropper && (
                      <div className="photo-actions">

                        <button
                          type="button"
                          className="crop-again-button"
                          onClick={() =>
                            handleCropAgain(
                              "back"
                            )
                          }
                        >
                          <Crop size={17} />
                          Crop Again
                        </button>

                        <button
                          type="button"
                          className="remove-photo-button"
                          onClick={() =>
                            removeImage("back")
                          }
                        >
                          <X size={16} />
                          Remove
                        </button>

                      </div>
                    )}

                </div>

              </div>

            </div>

            {/* ACTIONS */}

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
                disabled={
                  uploading ||
                  showCropper
                }
              >

                <Save size={18} />

                {uploading
                  ? "Saving..."
                  : "Save Dress"}

              </button>

            </div>

          </form>

          {/* PREVIEW */}

          <aside className="admin-preview-card">

            <p className="section-label">
              PREVIEW
            </p>

            <h2>Dress Preview</h2>

            <div className="admin-product-preview">

              {frontPreviewUrl ? (
                <img
                  src={frontPreviewUrl}
                  alt="Dress preview"
                />
              ) : (
                <div className="admin-preview-placeholder">

                  <ImageIcon size={35} />

                  <span>
                    Front photo preview
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

                {backPreviewUrl && (
                  <span className="back-photo-ready">
                    ✓ Back photo added
                  </span>
                )}

              </div>

            </div>

          </aside>

        </div>
      </main>

      {/* CROPPER MODAL */}

      {showCropper &&
        (cropSide === "front"
          ? frontOriginalUrl
          : backOriginalUrl) && (

          <div className="cropper-modal">

            <div className="cropper-container">

              <div className="cropper-header">

                <p className="section-label">
                  EDIT PHOTO
                </p>

                <h2>
                  Crop{" "}
                  {cropSide === "front"
                    ? "Front"
                    : "Back"}{" "}
                  Photo
                </h2>

                <p>
                  Drag and resize the box to keep
                  only the part of the photo you want.
                </p>

              </div>

              <div className="free-crop-area">

                <ReactCrop
                  crop={crop}
                  onChange={(
                    pixelCrop,
                    percentCrop
                  ) =>
                    setCrop(percentCrop)
                  }
                  onComplete={(pixelCrop) =>
                    setCompletedCrop(
                      pixelCrop
                    )
                  }
                  keepSelection
                  minWidth={80}
                  minHeight={80}
                >

                  <img
                    src={
                      cropSide === "front"
                        ? frontOriginalUrl
                        : backOriginalUrl
                    }
                    alt={
                      cropSide === "front"
                        ? "Front crop preview"
                        : "Back crop preview"
                    }
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