import React, { useEffect, useState } from "react";
import { deleteReview, updateReview } from "../modules/ReviewManager";

export const ReviewCard = ({ review, getLoggedInUser }) => {
  const [isChangingReview, setIsChangingReview] = useState(false);
  const currentUser = getLoggedInUser();
  const [thisReview, setThisReview] = useState({});

  useEffect(() => {
    setThisReview(review);
  }, [isChangingReview]);

  const handleDeleteReview = () => {
    deleteReview(review.id);
    window.location.reload();
  };

  const handleFieldChange = (event) => {
    const tempReview = { ...thisReview };

    tempReview.userId = currentUser;

    let selectedTarget = event.target.value;

    if (event.target.id.includes("rating")) {
      selectedTarget = parseInt(selectedTarget);
    }
    tempReview[event.target.id] = selectedTarget;
    setThisReview(tempReview);
  };

  const handleChangeReview = (event) => {
    event.preventDefault();
    updateReview(thisReview).then(() => {
      setIsChangingReview(false);
      window.location.reload();
    });
  };

  const editReviewCodeArray = [
    <form className="edit_review_form">
      <h2>Edit Review</h2>
      <fieldset>
        <label className="edit_review_label" htmlFor="edit_review_title">
          Title
        </label>
        <input
          type="text"
          id="title"
          onChange={handleFieldChange}
          required
          autoFocus
          className="edit_review_controlled_form"
          placeholder="Title"
          value={thisReview.title}
        />
      </fieldset>
      <fieldset>
        <label className="edit_review_label" htmlFor="edit_review_body">
          Body
        </label>
        <input
          type="text"
          id="body"
          onChange={handleFieldChange}
          required
          autoFocus
          className="edit_review_controlled_form"
          placeholder="Body"
          value={thisReview.body}
        />
      </fieldset>
      <fieldset>
        <label className="edit_review_label" htmlFor="edit_review_rating">
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
          className="edit_review_controlled_form"
          placeholder="Rating"
          value={thisReview.rating}
        />
      </fieldset>
      <button
        type="button"
        id="message_edit_submit_btn"
        className="submit_btn"
        onClick={handleChangeReview}
      >
        Submit
      </button>
      <button
        type="button"
        id="edit_review_cancel_btn"
        className="cancel_btn"
        onClick={() => setIsChangingReview(false)}
      >
        Cancel
      </button>
    </form>,
    <>
      <h1>{thisReview.title}</h1>
      <h3>{thisReview.body}</h3>
      <h3>- {thisReview.user?.name}</h3>
      <h3>{thisReview.rating} Stars</h3>
      {thisReview.userId === currentUser ? (
        <>
          <button
            type="button"
            onClick={() => {
              setIsChangingReview(true);
            }}
          >
            Edit Review
          </button>
          <button type="button" onClick={handleDeleteReview}>
            Delete Review
          </button>
        </>
      ) : (
        ""
      )}
    </>,
  ];

  return (
    <div className="review_card">
      {console.log(review)}
      {isChangingReview ? editReviewCodeArray[0] : editReviewCodeArray[1]}
    </div>
  );
};
