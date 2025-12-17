import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ScanResult {
    barcode: string;
    productName: string;
    date: string;
    safe: boolean;
    triggers: string[];
}

interface UserContextType {
    userProfile: string[];
    toggleAllergen: (allergen: string) => void;
    scanHistory: ScanResult[];
    addScanToHistory: (scan: ScanResult) => void;
    clearHistory: () => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<string[]>([]);
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profile = await AsyncStorage.getItem('USER_PROFILE');
            const history = await AsyncStorage.getItem('SCAN_HISTORY');
            if (profile) setUserProfile(JSON.parse(profile));
            if (history) setScanHistory(JSON.parse(history));
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleAllergen = async (allergen: string) => {
        setUserProfile(prev => {
            const newProfile = prev.includes(allergen)
                ? prev.filter(a => a !== allergen)
                : [...prev, allergen];
            AsyncStorage.setItem('USER_PROFILE', JSON.stringify(newProfile));
            return newProfile;
        });
    };

    const addScanToHistory = async (scan: ScanResult) => {
        setScanHistory(prev => {
            const newHistory = [scan, ...prev].slice(0, 20); // Keep last 20
            AsyncStorage.setItem('SCAN_HISTORY', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = async () => {
        setScanHistory([]);
        await AsyncStorage.removeItem('SCAN_HISTORY');
    };

    return (
        <UserContext.Provider value={{ userProfile, toggleAllergen, scanHistory, addScanToHistory, clearHistory, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};
