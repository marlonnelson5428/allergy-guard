import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ScanResult {
    barcode: string;
    productName: string;
    date: string;
    safe: boolean;
    status?: 'safe' | 'unsafe' | 'unknown';
    triggers: string[];
}

interface UserContextType {
    userProfile: string[];
    customSynonyms: Record<string, string[]>;
    toggleAllergen: (allergen: string) => void;
    addCustomAllergenWithSynonyms: (allergen: string, synonyms: string[]) => void;
    scanHistory: ScanResult[];
    addScanToHistory: (scan: ScanResult) => void;
    clearHistory: () => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<string[]>([]);
    const [customSynonyms, setCustomSynonyms] = useState<Record<string, string[]>>({});
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profile = await AsyncStorage.getItem('USER_PROFILE');
            const synonyms = await AsyncStorage.getItem('CUSTOM_SYNONYMS');
            const history = await AsyncStorage.getItem('SCAN_HISTORY');

            if (profile) setUserProfile(JSON.parse(profile));
            if (synonyms) setCustomSynonyms(JSON.parse(synonyms));
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

            // If removing, also clean up synonyms (optional, but cleaner)
            if (prev.includes(allergen)) {
                setCustomSynonyms(current => {
                    const { [allergen]: _, ...rest } = current;
                    AsyncStorage.setItem('CUSTOM_SYNONYMS', JSON.stringify(rest));
                    return rest;
                });
            }

            return newProfile;
        });
    };

    const addCustomAllergenWithSynonyms = async (allergen: string, synonyms: string[]) => {
        // Add to profile
        setUserProfile(prev => {
            if (!prev.includes(allergen)) {
                const newProfile = [...prev, allergen];
                AsyncStorage.setItem('USER_PROFILE', JSON.stringify(newProfile));
                return newProfile;
            }
            return prev;
        });

        // Add synonyms
        setCustomSynonyms(prev => {
            const newSynonyms = { ...prev, [allergen]: synonyms };
            AsyncStorage.setItem('CUSTOM_SYNONYMS', JSON.stringify(newSynonyms));
            return newSynonyms;
        });
    };

    const addScanToHistory = async (scan: ScanResult) => {
        setScanHistory(prev => {
            // Remove existing entry for this barcode to prevent duplicates
            // and ensure the latest scan moves to the top
            const filtered = prev.filter(item => item.barcode !== scan.barcode);
            const newHistory = [scan, ...filtered].slice(0, 20); // Keep last 20 unique items
            AsyncStorage.setItem('SCAN_HISTORY', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = async () => {
        setScanHistory([]);
        await AsyncStorage.removeItem('SCAN_HISTORY');
    };

    return (
        <UserContext.Provider value={{ userProfile, customSynonyms, toggleAllergen, addCustomAllergenWithSynonyms, scanHistory, addScanToHistory, clearHistory, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};
