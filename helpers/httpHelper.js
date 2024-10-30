const http = require('http');
require('dotenv').config();

const master = process.env.MASTER_DATA
const user = process.env.MASTER_DATA_USER

const loginUser = async (arrayData) => {
    try {
        const response = await fetch(`${user}/api-user/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(arrayData)
        });
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
};

const signOut = async (arrayData) => {
    try {
        const response = await fetch(`${user}/api-user/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(arrayData)
        });
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
};

const fetchFromMasterStation = async (data) => {
    try {
        const response = await fetch(`${master}/master/station/${data}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify(arrayData)
        });
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
};

const fetchUnitLV = async (data) => {
    try {
        const response = await fetch(`${master}/master/unit/get-hlv`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify(arrayData)
        });
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
};

const fetchUser = async (data) => {
    try {
        const response = await fetch(`${user}/api-user/get-user-fuel`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify(arrayData)
        });
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error.message);
        throw error;
    }
};

module.exports ={
    loginUser,
    fetchFromMasterStation,
    signOut,
    fetchUnitLV,
    fetchUser
}