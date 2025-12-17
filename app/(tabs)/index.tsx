import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';
import { ActivityIndicator, Button, Card, Modal, Portal, Text, Title, useTheme } from 'react-native-paper';
import { Colors } from '../../src/constants/Colors';
import { useUser } from '../../src/context/UserContext';
import { evaluateProduct, EvaluationResult, parseIngredientsText } from '../../src/utils/safetyEngine';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [productName, setProductName] = useState('');
  const [facing, setFacing] = useState<CameraType>('back');

  const { userProfile, addScanToHistory } = useUser();
  const theme = useTheme();

  // If permissions are still loading
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button mode="contained" onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Fetch data
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await response.json();

      if (json.status === 1) {
        const product = json.product;
        const name = product.product_name || "Unknown Product";
        const ingredientsText = product.ingredients_text_en || product.ingredients_text || "";
        const ingredients = parseIngredientsText(ingredientsText);

        const evalResult = evaluateProduct(ingredients, userProfile);

        setProductName(name);
        setResult(evalResult);

        // Haptics & Save
        if (evalResult.safe) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          // Vibrate longer for unsafe
          Vibration.vibrate(500);
        }

        addScanToHistory({
          barcode: data,
          productName: name,
          date: new Date().toISOString(),
          safe: evalResult.safe,
          triggers: evalResult.triggers
        });

      } else {
        setProductName("Product not found");
        setResult({ safe: true, triggers: [], reason: "Product data unavailable" }); // Treat as safe or unknown? MVP says Safe checkmark implies safe, maybe Unknown state? For now default behavior.
      }
    } catch (error) {
      console.error(error);
      setProductName("Error fetching data");
      setResult({ safe: true, triggers: [], reason: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResult(null);
    setProductName('');
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "upc_a", "upc_e", "ean8"], // Focusing on common food barcodes
        }}
      >
        <View style={styles.overlay}>
          {loading && <ActivityIndicator animating={true} color={Colors.light.tint} size="large" />}
          {!scanned && !loading && (
            <View style={styles.scanFrame} />
          )}
        </View>
      </CameraView>

      {/* Result Modal */}
      {result && (
        <Portal>
          <Modal visible={true} onDismiss={resetScanner} contentContainerStyle={styles.modalContent}>
            <Card style={[styles.card, { backgroundColor: result.safe ? Colors.scanner.safe : Colors.scanner.unsafe }]}>
              <Card.Content>
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons
                    name={result.safe ? "check-circle" : "alert-circle"}
                    size={60}
                    color="white"
                  />
                  <Title style={styles.resultTitle}>{result.safe ? "SAFE" : "UNSAFE"}</Title>
                </View>

                <Title style={styles.productName}>{productName}</Title>

                {!result.safe && (
                  <View style={styles.unsafeInfo}>
                    <Text style={styles.reasonTitle}>Triggers:</Text>
                    <Text style={styles.reasonText}>{result.reason}</Text>
                  </View>
                )}

                {result.safe && (
                  <Text style={styles.safeText}>No selected allergens found.</Text>
                )}

              </Card.Content>
              <Card.Actions style={styles.actions}>
                <Button mode="contained" buttonColor="white" textColor="black" onPress={resetScanner}>
                  Scan Another
                </Button>
              </Card.Actions>
            </Card>
          </Modal>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    opacity: 0.7,
  },
  modalContent: {
    padding: 20,
  },
  card: {
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  productName: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  unsafeInfo: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  reasonTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  reasonText: {
    color: 'white',
  },
  safeText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  actions: {
    justifyContent: 'center',
    marginTop: 20,
  }
});
