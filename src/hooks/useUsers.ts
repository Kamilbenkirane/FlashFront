import { useEffect, useState } from 'react';
import API_URL from '../config';
import type { User } from '../interfaces';

const useUsers = (): User[] => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(`${API_URL}/user/list`);
      const users = await response.json();
      setUsers(users);
    };
    fetchUsers();
  }, []);

  return users;
};

export default useUsers;
