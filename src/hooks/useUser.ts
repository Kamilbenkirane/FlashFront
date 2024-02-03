import {useEffect, useState} from "react";

const useUser = (id: number) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            const response = await fetch(`http://127.0.0.1:5000/user/${id}`)
            const user = await response.json()
            setUser(user)
        }
        fetchUser()
    }, []);

    return user
}
export default useUser;