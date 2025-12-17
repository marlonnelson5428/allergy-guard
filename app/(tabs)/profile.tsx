import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Divider, FAB, IconButton, List, Portal, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { useUser } from '../../src/context/UserContext';
import { CORE_ALLERGENS } from '../../src/data/allergenMap';

export default function ProfileScreen() {
    const { userProfile, toggleAllergen } = useUser();
    const theme = useTheme();
    const [visible, setVisible] = React.useState(false);
    const [customAllergen, setCustomAllergen] = React.useState('');

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const handleAdd = () => {
        if (customAllergen.trim()) {
            toggleAllergen(customAllergen.toLowerCase().trim());
            setCustomAllergen('');
            hideDialog();
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.header}>
                    <Text variant="headlineMedium">Your Allergen Profile</Text>
                    <Text variant="bodyMedium">Select the allergens you want to avoid.</Text>
                </View>
                <Divider />
                <List.Section title="Common Allergens">
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
                </List.Section>

                <List.Section title="Custom Allergens">
                    {userProfile
                        .filter(a => !CORE_ALLERGENS.includes(a))
                        .map(allergen => (
                            <List.Item
                                key={allergen}
                                title={allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                                right={() => <IconButton icon="delete" onPress={() => toggleAllergen(allergen)} />}
                            />
                        ))}
                </List.Section>
                <View style={{ height: 100 }} />
            </ScrollView>

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Add Custom Allergen</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Allergen, e.g., Strawberry"
                            value={customAllergen}
                            onChangeText={setCustomAllergen}
                            mode="outlined"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Cancel</Button>
                        <Button onPress={handleAdd}>Add</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={showDialog}
                label="Add Allergen"
            />
        </View>
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
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 80, // Moved up to avoid Tab Bar overlap
    },
});
