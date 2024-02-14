import { useEffect, useState } from 'react';
import API_URL from '../config';

const useUser = (id: number) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      console.log(API_URL);

      const response = await fetch(`${API_URL}/user/${id}`);
      const user = await response.json();
      setUser(user);
    };
    fetchUser();
  }, []);

  return user;
};
export default useUser;
