import axios from "axios";

export const baseUrl = 'https://bayut.p.rapidapi.com';

export const fetchApi = async (url) => {
  const { data } = await axios.get((url), {
    headers: {
        'x-rapidapi-host': 'bayut.p.rapidapi.com',
        'x-rapidapi-key': 'e3ce3b606fmsh981b5a76b129d06p125cdejsnb793fd064dfd'
    },
  });
    
  return data;
}