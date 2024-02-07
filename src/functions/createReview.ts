async function createReview(flashcard , success, user_id) {
    console.log("createReview", flashcard, success, user_id);
    const review = {...flashcard, success: success, user_id: user_id};
    const url= `http://127.0.0.1:5000/review/create`
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
    }
    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            // Handle non-2xx responses
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const reviewResponse = await response.json();
        console.log("Review created", reviewResponse);
        return reviewResponse; // Return the response for further processing if needed
    } catch (error) {
        console.error('Failed to create review', error);
    }
}
export default createReview;