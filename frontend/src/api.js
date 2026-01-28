import axios from 'axios';

const API_Base = 'http://localhost:8000';

export const askGita = async (question) => {
    try {
        const response = await axios.post(`${API_Base}/ask`, {
            question: question
        });
        return response.data;
    } catch (error) {
        console.error("Error asking Gita:", error);
        throw error;
    }
};
