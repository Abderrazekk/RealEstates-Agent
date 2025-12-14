import express from "express";
import Property from "../models/Property.js";
import { authenticate, isAdmin } from "../middleware/auth.js";
import { uploadPropertyFiles } from "../utils/upload.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// GET all properties (public)
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      minPrice,
      maxPrice,
      beds,
      baths,
      location,
      status,
      sortBy = "createdAt",
      order = "desc",
      search,
    } = req.query;

    // Build filter
    const filter = { isPublished: true };

    if (type && type !== "All") filter.type = type;
    if (status && status !== "All") filter.status = status;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (beds) filter.beds = { $gte: Number(beds) };
    if (baths) filter.baths = { $gte: Number(baths) };
    if (location) filter.location = new RegExp(location, "i");

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
        { address: new RegExp(search, "i") },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Property.countDocuments(filter);

    // Get properties with pagination
    const properties = await Property.find(filter)
      .populate("createdBy", "name email profilePicture")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      status: "success",
      data: properties,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch properties",
    });
  }
});

// GET featured properties
router.get("/featured", async (req, res) => {
  try {
    const featuredProperties = await Property.find({
      isFeatured: true,
      isPublished: true,
    })
      .limit(6)
      .populate("createdBy", "name email profilePicture");

    res.json({
      status: "success",
      data: featuredProperties,
    });
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch featured properties",
    });
  }
});

// GET single property by ID
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "createdBy",
      "name email profilePicture"
    );

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    res.json({
      status: "success",
      data: property,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch property",
    });
  }
});

// POST create new property (Admin only) - WITH IMAGES & VIDEO
router.post(
  "/",
  authenticate,
  isAdmin,
  (req, res, next) => {
    uploadPropertyFiles(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          status: 'error',
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      console.log("Creating property with data:", req.body);
      console.log("Uploaded files:", req.files);
      
      // Parse coordinates - make optional
      let coordinates = { lat: 0, lng: 0 };
      try {
        if (req.body.coordinates && req.body.coordinates.trim()) {
          coordinates = JSON.parse(req.body.coordinates);
        }
      } catch (error) {
        console.error("Error parsing coordinates:", error);
      }

      // Parse address object - make optional
      let address = {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        formattedAddress: req.body.location || ''
      };
      try {
        if (req.body.address && req.body.address.trim()) {
          const parsedAddress = typeof req.body.address === 'string' 
            ? JSON.parse(req.body.address) 
            : req.body.address;
          
          // Merge with defaults
          address = { ...address, ...parsedAddress };
        }
      } catch (error) {
        console.error("Error parsing address:", error);
      }

      const propertyData = {
        title: req.body.title || '',
        description: req.body.description || '',
        price: 0, // Initialize with 0, will parse below
        location: req.body.location || '',
        address: address,
        coordinates: coordinates,
        type: req.body.type || 'House',
        status: req.body.status || 'For Sale',
        beds: req.body.beds || 0,
        baths: req.body.baths || 0,
        sqft: req.body.sqft || 0,
        yearBuilt: req.body.yearBuilt || null,
        createdBy: req.user._id,
      };

      // Parse agent - make optional with defaults
      let agent = {
        name: '',
        email: '',
        phone: '',
        image: ''
      };
      try {
        if (req.body.agent && req.body.agent.trim()) {
          const parsedAgent = typeof req.body.agent === "string"
            ? JSON.parse(req.body.agent)
            : req.body.agent;
          
          // Only include fields that have values
          if (parsedAgent.name) agent.name = parsedAgent.name;
          if (parsedAgent.email) agent.email = parsedAgent.email;
          if (parsedAgent.phone) agent.phone = parsedAgent.phone;
          if (parsedAgent.image) agent.image = parsedAgent.image;
        }
      } catch (error) {
        console.error("Error parsing agent JSON:", error);
      }
      propertyData.agent = agent;

      // Parse features - default empty array
      try {
        if (req.body.features && req.body.features.trim()) {
          propertyData.features = typeof req.body.features === "string"
            ? JSON.parse(req.body.features)
            : req.body.features;
        } else {
          propertyData.features = [];
        }
      } catch (error) {
        console.error("Error parsing features JSON:", error);
        propertyData.features = [];
      }

      // Parse amenities - default empty array
      try {
        if (req.body.amenities && req.body.amenities.trim()) {
          propertyData.amenities = typeof req.body.amenities === "string"
            ? JSON.parse(req.body.amenities)
            : req.body.amenities;
        } else {
          propertyData.amenities = [];
        }
      } catch (error) {
        console.error("Error parsing amenities JSON:", error);
        propertyData.amenities = [];
      }

      // Handle uploaded images - optional
      if (req.files && req.files.images) {
        const images = req.files.images.map((file, index) => ({
          url: `/uploads/${file.filename}`,
          publicId: file.filename,
          isFeatured: index === 0,
          order: index,
        }));
        propertyData.images = images;
      } else {
        propertyData.images = [];
      }

      // Handle uploaded video - optional
      if (req.files && req.files.video && req.files.video[0]) {
        propertyData.video = {
          url: `/uploads/${req.files.video[0].filename}`,
          publicId: req.files.video[0].filename,
          thumbnail: '',
          duration: 0,
        };
      } else {
        propertyData.video = {
          url: '',
          publicId: '',
          thumbnail: '',
          duration: 0,
        };
      }

      // Convert numeric fields with safe parsing
      const numericFields = ["price", "beds", "baths", "sqft", "yearBuilt"];
      numericFields.forEach((field) => {
        if (req.body[field] !== undefined && req.body[field] !== '') {
          const value = parseFloat(req.body[field]);
          if (!isNaN(value) && isFinite(value)) {
            propertyData[field] = value;
          } else if (field === 'yearBuilt') {
            propertyData[field] = null;
          } else if (field === 'price') {
            // Price is required, set to 0 if invalid
            propertyData[field] = 0;
          } else {
            propertyData[field] = 0;
          }
        } else if (field === 'price') {
          // Price is required, but user didn't input anything
          propertyData[field] = 0;
        } else if (field === 'yearBuilt') {
          propertyData[field] = null;
        }
      });

      // Convert beds, baths to integers
      ["beds", "baths"].forEach((field) => {
        if (propertyData[field] !== undefined) {
          const value = parseInt(propertyData[field]);
          if (!isNaN(value)) {
            propertyData[field] = value;
          } else {
            propertyData[field] = 0;
          }
        }
      });

      // Validate required fields
      if (!propertyData.title || !propertyData.description || !propertyData.location) {
        return res.status(400).json({
          status: "error",
          message: "Title, description, and location are required fields"
        });
      }

      // Validate price (must be a positive number)
      if (propertyData.price <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Please enter a valid price (greater than 0)"
        });
      }

      const property = new Property(propertyData);
      await property.save();

      res.status(201).json({
        status: "success",
        data: property,
      });
    } catch (error) {
      console.error("Error creating property:", error);
      
      // Clean up uploaded files on error
      if (req.files) {
        Object.values(req.files).forEach(filesArray => {
          filesArray.forEach(file => {
            const filePath = path.join(__dirname, '../uploads', file.filename);
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch (unlinkError) {
                console.error('Error cleaning up file:', unlinkError);
              }
            }
          });
        });
      }

      res.status(400).json({
        status: "error",
        message: "Failed to create property",
        error: error.message,
      });
    }
  }
);

// PUT update property (Admin only)
router.put(
  "/:id",
  authenticate,
  isAdmin,
  (req, res, next) => {
    uploadPropertyFiles(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          status: 'error',
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({
          status: "error",
          message: "Property not found",
        });
      }

      // Update coordinates - optional
      if (req.body.coordinates && req.body.coordinates.trim()) {
        try {
          property.coordinates = JSON.parse(req.body.coordinates);
        } catch (error) {
          console.error("Error parsing coordinates:", error);
        }
      }

      // Update address - optional
      if (req.body.address && req.body.address.trim()) {
        try {
          const parsedAddress = typeof req.body.address === 'string' 
            ? JSON.parse(req.body.address) 
            : req.body.address;
          
          // Merge with existing address
          property.address = { ...property.address, ...parsedAddress };
        } catch (error) {
          console.error("Error parsing address:", error);
        }
      }

      // Update basic fields (only if provided)
      const basicFields = ["title", "description", "location", "type", "status"];
      basicFields.forEach(field => {
        if (req.body[field] !== undefined) {
          property[field] = req.body[field];
        }
      });

      // Update price - allow any positive number
      if (req.body.price !== undefined && req.body.price !== '') {
        const priceValue = parseFloat(req.body.price);
        if (!isNaN(priceValue) && isFinite(priceValue) && priceValue > 0) {
          property.price = priceValue;
        } else {
          return res.status(400).json({
            status: "error",
            message: "Please enter a valid price (greater than 0)"
          });
        }
      }

      // Update yearBuilt - optional (can be empty)
      if (req.body.yearBuilt !== undefined) {
        if (req.body.yearBuilt === '' || req.body.yearBuilt === null) {
          property.yearBuilt = null;
        } else {
          const yearValue = parseInt(req.body.yearBuilt);
          if (!isNaN(yearValue)) {
            property.yearBuilt = yearValue;
          }
        }
      }

      // Update beds, baths, sqft - optional
      const numericOptionalFields = ["beds", "baths", "sqft"];
      numericOptionalFields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== '') {
          const value = parseFloat(req.body[field]);
          if (!isNaN(value) && value >= 0) {
            property[field] = value;
          }
        }
      });

      // Parse agent - optional
      if (req.body.agent) {
        try {
          const parsedAgent = typeof req.body.agent === "string"
            ? JSON.parse(req.body.agent)
            : req.body.agent;
          
          // Update only fields that are provided
          if (parsedAgent.name !== undefined) property.agent.name = parsedAgent.name || '';
          if (parsedAgent.email !== undefined) property.agent.email = parsedAgent.email || '';
          if (parsedAgent.phone !== undefined) property.agent.phone = parsedAgent.phone || '';
          if (parsedAgent.image !== undefined) property.agent.image = parsedAgent.image || '';
        } catch (error) {
          console.error("Error parsing agent JSON:", error);
        }
      }

      // Parse features - optional (can be empty array)
      if (req.body.features !== undefined) {
        try {
          if (req.body.features === '' || req.body.features === null) {
            property.features = [];
          } else {
            property.features = typeof req.body.features === "string"
              ? JSON.parse(req.body.features)
              : req.body.features;
          }
        } catch (error) {
          console.error("Error parsing features JSON:", error);
        }
      }

      // Parse amenities - optional (can be empty array)
      if (req.body.amenities !== undefined) {
        try {
          if (req.body.amenities === '' || req.body.amenities === null) {
            property.amenities = [];
          } else {
            property.amenities = typeof req.body.amenities === "string"
              ? JSON.parse(req.body.amenities)
              : req.body.amenities;
          }
        } catch (error) {
          console.error("Error parsing amenities JSON:", error);
        }
      }

      // Handle uploaded images - optional
      if (req.files && req.files.images) {
        const newImages = req.files.images.map((file, index) => ({
          url: `/uploads/${file.filename}`,
          publicId: file.filename,
          isFeatured: property.images.length === 0 && index === 0,
          order: property.images.length + index,
        }));

        // Add new images to existing ones
        property.images = [...property.images, ...newImages];
        
        // Limit to 10 images
        if (property.images.length > 10) {
          property.images = property.images.slice(0, 10);
        }
      }

      // Handle uploaded video - optional
      if (req.files && req.files.video && req.files.video[0]) {
        // Delete old video file if exists
        if (property.video && property.video.publicId) {
          const oldVideoPath = path.join(__dirname, '../uploads', property.video.publicId);
          if (fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
          }
        }
        
        property.video = {
          url: `/uploads/${req.files.video[0].filename}`,
          publicId: req.files.video[0].filename,
          thumbnail: '',
          duration: 0,
        };
      }

      await property.save();

      res.json({
        status: "success",
        data: property,
      });
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(400).json({
        status: "error",
        message: "Failed to update property",
        error: error.message,
      });
    }
  }
);

// DELETE property (Admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    // Delete all associated images
    if (property.images && property.images.length > 0) {
      property.images.forEach((image) => {
        if (image.publicId) {
          const imagePath = path.join(__dirname, "../uploads", image.publicId);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });
    }

    // Delete video if exists
    if (property.video && property.video.publicId) {
      const videoPath = path.join(
        __dirname,
        "../uploads",
        property.video.publicId
      );
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete property",
    });
  }
});

// GET similar properties
router.get("/:id/similar", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      type: property.type,
      isPublished: true,
    })
      .limit(4)
      .populate("createdBy", "name email profilePicture");

    res.json({
      status: "success",
      data: similarProperties,
    });
  } catch (error) {
    console.error("Error fetching similar properties:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch similar properties",
    });
  }
});

// DELETE property image (Admin only)
router.delete(
  "/:id/images/:imageId",
  authenticate,
  isAdmin,
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({
          status: "error",
          message: "Property not found",
        });
      }

      // Find the image to delete
      const imageToDelete = property.images.find(
        (image) => image.publicId === req.params.imageId
      );

      if (imageToDelete) {
        // Delete file from server
        const imagePath = path.join(
          __dirname,
          "../uploads",
          imageToDelete.publicId
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }

        // Remove the image from the array
        property.images = property.images.filter(
          (image) => image.publicId !== req.params.imageId
        );

        await property.save();

        res.json({
          status: "success",
          message: "Image deleted successfully",
        });
      } else {
        res.status(404).json({
          status: "error",
          message: "Image not found",
        });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete image",
      });
    }
  }
);

// DELETE property video (Admin only)
router.delete("/:id/video", authenticate, isAdmin, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    if (property.video && property.video.publicId) {
      const videoPath = path.join(
        __dirname,
        "../uploads",
        property.video.publicId
      );
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    property.video = null;
    await property.save();

    res.json({
      status: "success",
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete video",
    });
  }
});

export default router;
