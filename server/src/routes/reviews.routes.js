const express = require('express');
const reviews = require('../models/review.model');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(reviews);
});

router.post('/', (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: 'Rating must be between 1 and 5'
    });
  }

  if (!comment) {
    return res.status(400).json({
      message: 'Comment is required'
    });
  }

  const newReview = {
    id: reviews.length + 1,
    rating,
    comment
  };

  reviews.push(newReview);

  res.status(201).json({
    message: 'Review created successfully',
    review: newReview
  });
});

module.exports = router;