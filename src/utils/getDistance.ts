const getDistance = async (userAddess: string, restaurantAddress: string) => {
    try {
        console.log(restaurantAddress);
        
        const getUserAddess = await getLatAndLong(userAddess);
        const getRestaurantAddess = await getLatAndLong(restaurantAddress);
        console.log("getUserAddress", getUserAddess);
        console.log("getRestaurantAddess", getRestaurantAddess);
        return { isSuccess: false, distance: null }
    } catch (error) {
        console.log("getDistance failed error: ", error);
        return { isSuccess: false, distance: null }
    }
}

const getLatAndLong = async (address: string) => {
    const latAndLong_uri = `http://api.openweathermap.org/geo/1.0/direct?q=${address}&appid=30b7fc37b850daeee43bf8b7080b7bb6`;
    const response = await fetch(latAndLong_uri);
    const data = await response.json();
    return data;
}

export default getDistance;
