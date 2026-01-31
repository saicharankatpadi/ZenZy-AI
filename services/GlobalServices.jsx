// @/services/GlobalServices.js
import axios from "axios";

export const getToken = async () => {
    try {
        const response = await axios.get('/api/getToken');
        // If your API returns NextResponse.json({ token: "..." })
        // Axios puts that in response.data
        return response.data.token; 
    } catch (error) {
        console.error("Error in Global Service getToken:", error);
        return null;
    }
}