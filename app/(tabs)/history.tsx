import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { IconButton, List, Text, useTheme } from 'react-native-paper';
import { Colors } from '../../src/constants/Colors';
import { ScanResult, useUser } from '../../src/context/UserContext';

export default function HistoryScreen() {
    const { scanHistory, clearHistory } = useUser();
    const theme = useTheme();

    const renderItem = ({ item }: { item: ScanResult }) => (
        <List.Item
            title={item.productName || "Unknown Product"}
            description={`${new Date(item.date).toLocaleDateString()} ${new Date(item.date).toLocaleTimeString()}`}
            left={props => (
                <List.Icon
                    {...props}
                    icon={item.safe ? "check-circle" : "alert-circle"}
                    color={item.safe ? Colors.scanner.safe : Colors.scanner.unsafe}
                />
            )}
            right={props => (
                !item.safe ? <List.Icon {...props} icon="close" /> : null
            )}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineSmall">Recent Scans</Text>
                <IconButton icon="delete" onPress={clearHistory} />
            </View>
            {scanHistory.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text variant="bodyLarge">No scan history yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={scanHistory}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.barcode + index}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    list: {
        paddingBottom: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
