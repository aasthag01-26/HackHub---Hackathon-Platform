const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Configure Multer with memory storage, size limit (10MB), and file type validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(pdf|doc|docx|txt|rtf|png|jpg|jpeg|gif|webp|svg|zip|rar|7z|tar|gz|csv|xlsx|xls|pptx|ppt|json|md)$/i;
    if (!file.originalname.match(allowedExtensions)) {
      return cb(
        new Error(
          "Unsupported file type. Please upload documents, images, presentations, or project archives."
        )
      );
    }
    cb(null, true);
  },
});

// Middleware wrapper to handle Multer errors gracefully
const handleUploadMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File exceeds the 10MB size limit. Please choose a smaller file." });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Helper: Get current user's team
const getTeamId = (req, res) => {
  console.log("Logged-in user:", req.user?._id);
  console.log("User teamId:", req.user?.teamId);

  if (!req.user || !req.user.teamId) {
    res.status(403).json({
      message: "Please create or join a team first.",
    });
    return null;
  }

  return new mongoose.Types.ObjectId(req.user.teamId);
};

// Upload file - authenticated team members only
router.post(
  "/upload",
  protect,
  handleUploadMiddleware,
  async (req, res) => {
    try {
      const teamId = getTeamId(req, res);
      if (!teamId) return;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!" });
      }

      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads",
      });

      const filename = `${Date.now()}-${req.file.originalname}`;

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
        metadata: {
          teamId,
          uploadedBy: req.user._id,
        },
      });

      Readable.from(req.file.buffer)
        .pipe(uploadStream)
        .on("error", (err) => {
          console.error("Upload error:", err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Upload failed!" });
          }
        })
        .on("finish", () => {
          res.status(201).json({
            message: "File uploaded successfully!",
            file: {
              filename,
              contentType: req.file.mimetype,
            },
          });
        });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Fetch only current team's files
router.get("/files", protect, async (req, res) => {
  try {
    const teamId = getTeamId(req, res);
    if (!teamId) return;

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const files = await bucket
      .find({ "metadata.teamId": teamId })
      .toArray();

    return res.status(200).json(files);
  } catch (err) {
    console.error("Fetch files error:", err);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// Download only files belonging to current team
router.get("/file/:filename", protect, async (req, res) => {
  try {
    const teamId = getTeamId(req, res);
    if (!teamId) return;

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const file = await bucket.find({
      filename: req.params.filename,
      "metadata.teamId": teamId,
    }).next();

    if (!file) {
      return res.status(404).json({ message: "File not found!" });
    }

    res.set(
      "Content-Type",
      file.contentType || "application/octet-stream"
    );

    bucket.openDownloadStream(file._id).pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error retrieving file" });
    }
  }
});

// Delete only files belonging to current team
router.delete("/file/:identifier", protect, async (req, res) => {
  try {
    const teamId = getTeamId(req, res);
    if (!teamId) return;

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const file = await bucket.find({
      filename: req.params.identifier,
      "metadata.teamId": teamId,
    }).next();

    if (!file) {
      return res.status(404).json({
        message: "File not found in your team.",
      });
    }

    await bucket.delete(file._id);

    res.status(200).json({
      message: "File deleted successfully!",
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting file" });
  }
});

module.exports = router;