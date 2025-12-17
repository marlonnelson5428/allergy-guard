import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, Switch, Text, useTheme } from 'react-native-paper';
import { useUser } from '../../src/context/UserContext';
import { CORE_ALLERGENS } from '../../src/data/allergenMap';

export default function ProfileScreen() {
    const { userProfile, toggleAllergen } = useUser();
    const theme = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium">Your Allergen Profile</Text>
                <Text variant="bodyMedium">Select the allergens you want to avoid.</Text>
            </View>
            <Divider />
            {CORE_ALLERGENS.map(allergen => {
                const isSelected = userProfile.includes(allergen);
                return (
                    <List.Item
                        key={allergen}
                        title={allergen.charAt(0).toUpperCase() + allergen.slice(1).replace('_', ' ')}
                        right={() => (
                            <Switch
                                value={isSelected}
                                onValueChange={() => toggleAllergen(allergen)}
                            />
                        )}
                        style={styles.item}
                    />
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
    },
    item: {
        paddingVertical: 8,
    }
});
