import { useEffect, useState } from "react";
import API_URL from "../config";

const useUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      // log fetch users
      console.log("fetching users, API_URL:", `${API_URL}/user/list`);
      const response = await fetch(`${API_URL}/user/list`); // Adjust this endpoint as needed
      const users = await response.json();
      console.log("users:", users);
      setUsers(users);
    };
    fetchUsers();
  }, []);

  return users;
};

export default useUsers;
