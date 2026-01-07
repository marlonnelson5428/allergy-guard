import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Image, StyleSheet, Vibration, View } from 'react-native';
import { ActivityIndicator, Button, Card, Modal, Portal, Text, Title, useTheme } from 'react-native-paper';
import { Colors } from '../../src/constants/Colors';
import { useUser } from '../../src/context/UserContext';
import { AlternativeProduct, getAlternativeRecommendations } from '../../src/services/RecommendationService';
import { evaluateProduct, EvaluationResult, parseIngredientsText } from '../../src/utils/safetyEngine';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const isProcessing = React.useRef(false);

  const { userProfile, customSynonyms, addScanToHistory } = useUser();
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
    if (scanned || loading || isProcessing.current) return;

    isProcessing.current = true;
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
        const img = product.image_url || product.image_front_url || null;
        const ingredientsText = product.ingredients_text_en || product.ingredients_text || "";
        const ingredients = parseIngredientsText(ingredientsText);

        const evalResult = evaluateProduct(ingredients, userProfile, customSynonyms);

        setProductName(name);
        setProductImage(img);
        setAlternatives([]); // Clear previous alternatives
        setResult(evalResult);

        // Calculate visual feedback immediately
        if (evalResult.status === 'unsafe') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Vibration.vibrate(500);

          // Fetch alternatives in background
          setLoadingAlternatives(true);
          getAlternativeRecommendations(name, evalResult.triggers, userProfile)
            .then((fetchedAlternatives) => {
              setAlternatives(fetchedAlternatives);
            })
            .catch((err) => {
              console.error("Failed to get alternatives", err);
            })
            .finally(() => {
              setLoadingAlternatives(false);
            });

        } else if (evalResult.status === 'unknown') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        addScanToHistory({
          barcode: data,
          productName: name,
          date: new Date().toISOString(),
          safe: evalResult.safe,
          status: evalResult.status,
          triggers: evalResult.triggers
        });

      } else {
        setProductName("Product not found");
        setResult({ safe: true, status: 'unknown', triggers: [], reason: "Product data unavailable" });
      }
    } catch (error) {
      console.error(error);
      setProductName("Error fetching data");
      setResult({ safe: true, status: 'unknown', triggers: [], reason: "Network error" });
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setResult(null);
    setProductName('');
    setProductImage(null);
    setAlternatives([]);


  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "upc_a", "upc_e", "ean8"],
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
            <Card style={[styles.card, {
              backgroundColor: result.status === 'unsafe' ? Colors.scanner.unsafe : result.status === 'unknown' ? Colors.scanner.unknown : Colors.scanner.safe
            }]}>
              <Card.Content>
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons
                    name={result.status === 'unsafe' ? "alert-circle" : result.status === 'unknown' ? "help-circle" : "check-circle"}
                    size={60}
                    color="white"
                  />
                  <Title style={styles.resultTitle}>
                    {result.status === 'unsafe' ? "UNSAFE" : result.status === 'unknown' ? "UNKNOWN" : "SAFE"}
                  </Title>
                </View>

                {productImage && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: productImage }} style={styles.productImage} resizeMode="contain" />
                  </View>
                )}

                <Title style={styles.productName}>{productName}</Title>

                {result.status === 'unsafe' && (
                  <View style={styles.unsafeInfo}>
                    <Text style={styles.reasonTitle}>Triggers: {result.triggers.join(', ')}</Text>
                    <Text style={styles.reasonText}>{result.reason}</Text>
                  </View>
                )}

                {result.status === 'unsafe' && (
                  <View style={styles.alternativesContainer}>
                    <Title style={styles.sectionTitle}>✨ Safer Alternatives</Title>
                    {loadingAlternatives ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator animating={true} color="white" size="small" />
                        <Text style={styles.loadingText}>Finding alternatives...</Text>
                      </View>
                    ) : (
                      alternatives.length > 0 ? (
                        alternatives.map((alt, index) => (
                          <View key={index} style={styles.alternativeItem}>
                            <Text style={styles.altName}>{alt.name}</Text>
                            <Text style={styles.altReason}>{alt.reason}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.safeText}>No recommendations found.</Text>
                      )
                    )}
                  </View>
                )}

                {result.status === 'unknown' && (
                  <Text style={styles.safeText}>{result.reason}</Text>
                )}



                {result.status === 'safe' && (
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
    maxHeight: '90%',
  },
  card: {
    padding: 10,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 0,
  },
  resultTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: 'white',
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
    marginTop: 5,
    marginBottom: 10,
  },
  reasonTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  reasonText: {
    color: 'white',
  },
  ingredientsContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 10,
    borderRadius: 5,
  },
  safeText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  actions: {
    justifyContent: 'center',
    marginTop: 20,
  },
  alternativesContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: 10,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  alternativeItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  altName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  altReason: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    marginLeft: 10,
    fontStyle: 'italic',
  },
});
