import React, { useEffect, useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { getReviewsByMovieId, addReview } from "../modules/ReviewManager";

export const ReviewList = ({ movieId, getLoggedInUser }) => {
  const [reviews, setReviews] = useState([]);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    title: "",
    body: "",
    rating: 5,
    movieId: parseInt(movieId),
  });

  const currentUser = getLoggedInUser();

  const getReviews = (movieId) => {
    getReviewsByMovieId(movieId).then((someReviews) => setReviews(someReviews));
  };

  const handleSubmitReview = (event) => {
    event.preventDefault();
    addReview(newReview).then(() => setIsWritingReview(false));
  };

  const handleFieldChange = (event) => {
    const tempReview = { ...newReview };

    tempReview.userId = currentUser;

    let selectedTarget = event.target.value;

    if (event.target.id.includes("rating")) {
      selectedTarget = parseInt(selectedTarget);
    }
    tempReview[event.target.id] = selectedTarget;
    setNewReview(tempReview);
  };

  useEffect(() => {
    getReviews(movieId);
  }, [isWritingReview]);

  const newReviewCodeArray = [
    <form className="new_review_form">
      <h2>Add Review</h2>
      <fieldset>
        <label className="new_review_label" htmlFor="new_review_title">
          Title
        </label>
        <input
          type="text"
          id="title"
          onChange={handleFieldChange}
          required
          autoFocus
          className="new_review_controlled_form"
          placeholder="Title"
          value={newReview.title}
        />
      </fieldset>
      <fieldset>
        <label className="new_review_label" htmlFor="new_review_body">
          Body
        </label>
        <input
          type="text"
          id="body"
          onChange={handleFieldChange}
          required
          autoFocus
          className="new_review_controlled_form"
          placeholder="Body"
          value={newReview.body}
        />
      </fieldset>
      <fieldset>
        <label className="new_review_label" htmlFor="new_review_rating">
          Rating
        </label>
        <input
          type="number"
          id="rating"
          onChange={handleFieldChange}
          required
          autoFocus
          min='1'
          max='5'
          className="new_review_controlled_form"
          placeholder="Rating"
          value={newReview.rating}
        />
      </fieldset>
      <button
        type="button"
        id="message_edit_submit_btn"
        className="submit_btn"
        onClick={handleSubmitReview}
      >
        Submit
      </button>
      <button
        type="button"
        id="new_review_cancel_btn"
        className="cancel_btn"
        onClick={() => setIsWritingReview(false)}
      >
        Cancel
      </button>
    </form>,
    <button
      type="button"
      onClick={() => {
        setIsWritingReview(true);
      }}
    >
      Add a New Review
    </button>
  ];

  return (
    <>
      <div className="review_list">
        <h1>User Reviews</h1>
        {isWritingReview ? newReviewCodeArray[0] : newReviewCodeArray[1]}
        {reviews.map((review) => {
          return <ReviewCard key={review.id} review={review} getLoggedInUser={getLoggedInUser}/>;
        })}
      </div>
    </>
  );
};
