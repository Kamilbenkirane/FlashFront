import { useEffect, useState } from 'react';
import API_URL from '../config';

const useUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch(`${API_URL}/user/list`); // Adjust this endpoint as needed
            const users = await response.json();
            setUsers(users);
        };
        fetchUsers();
    }, []);

    return users;
};

export default useUsers;
