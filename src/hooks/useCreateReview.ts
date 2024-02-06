import {useEffect, useState} from "react";

const useCreateReview = (flashcard , success) => {
    const [response, setResponse] = useState(null);

    useEffect(() => {
        const review = {...flashcard, success: success}
        const url= `http://127.0.0.1:5000/review/create`
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        }
        const fetchReview = async () => {
            const response = await fetch(url, requestOptions)
            console.log("response", requestOptions.body,response)
            const review = await response.json()
            // log the response to the console
            console.log("Review created", review)
            setResponse(review)
        }
        fetchReview()
    }
    , [flashcard, success]);

    return response
}
export default useCreateReview;