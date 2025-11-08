import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Typography from '../../components/Typography';
import { AuthContext } from '../../contexts/AuthContext';
import { gardenService, harvestService } from '../../lib/dataService';
import { exportGardenData } from '../../lib/exportService';
import { showExportPermissionReminder } from '../../lib/permissions';
import theme from '../../lib/theme';
import { Garden, GardenTotal, Harvest, PlantTotal } from '../../types/types';

const { width: screenWidth } = Dimensions.get('window');
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(230, 184, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(93, 138, 58, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#E6B800',
  },
};

export default function Reports() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [plantTotals, setPlantTotals] = useState<PlantTotal[]>([]);
  const [gardenTotals, setGardenTotals] = useState<GardenTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedGardenForExport, setSelectedGardenForExport] = useState<string | 'all'>('all');
  const { user, isGuest } = useContext(AuthContext);

  const loadData = useCallback(async () => {
    try {
      const harvestsData = await harvestService.getHarvests();
      const gardensData = await gardenService.getGardens();
      
      setHarvests(harvestsData);
      setGardens(gardensData);
      
      // Calculate plant totals
      const plantMap = new Map<string, { quantity: number; unit: string }>();
      
      harvestsData.forEach(harvest => {
        const key = `${harvest.plantName}-${harvest.unit}`;
        if (plantMap.has(key)) {
          const current = plantMap.get(key)!;
          plantMap.set(key, {
            quantity: current.quantity + harvest.quantity,
            unit: harvest.unit,
          });
        } else {
          plantMap.set(key, {
            quantity: harvest.quantity,
            unit: harvest.unit,
          });
        }
      });
      
      const plantTotalsData: PlantTotal[] = [];
      plantMap.forEach((value, key) => {
        const plantName = key.split('-')[0];
        plantTotalsData.push({
          plantName,
          totalQuantity: value.quantity,
          unit: value.unit as any,
        });
      });
      
      plantTotalsData.sort((a, b) => b.totalQuantity - a.totalQuantity);
      setPlantTotals(plantTotalsData);
      
      // Calculate garden totals
      const gardenTotalsData: GardenTotal[] = [];
      gardensData.forEach(garden => {
        const gardenHarvests = harvestsData.filter(h => h.gardenId === garden.id);
        const uniquePlants = new Set(gardenHarvests.map(h => h.plantName)).size;
        
        gardenTotalsData.push({
          gardenId: garden.id,
          gardenName: garden.name,
          totalHarvests: gardenHarvests.length,
          plants: uniquePlants,
        });
      });
      
      gardenTotalsData.sort((a, b) => b.totalHarvests - a.totalHarvests);
      setGardenTotals(gardenTotalsData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, user, isGuest]);  // Reload when auth state changes

  // Reload data when user navigates back to this tab
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Don't reload on focus - let auto-sync handle updates in background
  // User can still manually pull-to-refresh if needed

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleExportExcel = useCallback(async () => {
    try {
      let selectedGardenIds: string[] = [];
      
      if (selectedGardenForExport === 'all') {
        selectedGardenIds = gardens.map(g => g.id);
      } else {
        selectedGardenIds = [selectedGardenForExport];
      }
      
      // Show permission reminder FIRST and wait for user to dismiss it
      await showExportPermissionReminder();
      
      // THEN start the export (which will trigger the share dialog)
      await exportGardenData(gardens, harvests, selectedGardenIds);
      setShowExportModal(false);
      
      Alert.alert(
        'Export Ready',
        'Tap "Save to Files" to save the report to your Downloads folder, or choose another app to send it to.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    }
  }, [selectedGardenForExport, gardens, harvests]);

  // Chart data preparation
  const getHarvestTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const harvestsByDate = harvests.reduce((acc, harvest) => {
      const harvestDate = new Date(harvest.date).toISOString().split('T')[0];
      acc[harvestDate] = (acc[harvestDate] || 0) + harvest.quantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en', { weekday: 'short' })),
      datasets: [{
        data: last7Days.map(date => harvestsByDate[date] || 0),
        color: (opacity = 1) => `rgba(230, 184, 0, ${opacity})`,
        strokeWidth: 3,
      }],
    };
  };

  const getTopPlantsData = () => {
    const topPlants = plantTotals.slice(0, 5);
    return {
      labels: topPlants.map(p => p.plantName.slice(0, 8)),
      datasets: [{
        data: topPlants.map(p => p.totalQuantity),
        color: (opacity = 1) => `rgba(93, 138, 58, ${opacity})`,
      }],
    };
  };

  const getGardenDistributionData = () => {
    return gardenTotals.slice(0, 4).map((garden, index) => ({
      name: garden.gardenName.slice(0, 10),
      population: garden.totalHarvests,
      color: ['#E6B800', '#5D8A3A', '#8BC34A', '#CDDC39'][index] || '#E6B800',
      legendFontColor: '#333',
      legendFontSize: 12,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="chart-line" size={48} color={theme.colors.primary} />
          <Typography variant="h3" style={styles.loadingText}>
            Loading Reports...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (harvests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="No harvest data yet"
          image={require('../../assets/images/icon.png')}
        />
      </SafeAreaView>
    );
  }

  const totalHarvests = harvests.length;
  const totalQuantity = harvests.reduce((sum, h) => sum + h.quantity, 0);
  const uniquePlants = new Set(harvests.map(h => h.plantName)).size;
  const activeGardens = gardenTotals.filter(g => g.totalHarvests > 0).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons 
              name="chart-box-outline" 
              size={36} 
              color={theme.colors.accent}
              style={styles.headerIcon}
            />
            <View style={styles.headerText}>
              <Typography variant="h2" style={styles.title}>
                Garden Reports
              </Typography>
              <Typography variant="body2" color={theme.colors.textSecondary}>
                Your harvest analytics
              </Typography>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="basket" size={24} color="#E6B800" />
            <Typography variant="h2" style={styles.statNumber}>{totalHarvests}</Typography>
            <Typography variant="body2" style={styles.statLabel}>Total Harvests</Typography>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="sprout" size={24} color="#5D8A3A" />
            <Typography variant="h2" style={styles.statNumber}>{uniquePlants}</Typography>
            <Typography variant="body2" style={styles.statLabel}>Plant Types</Typography>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="leaf" size={24} color="#8BC34A" />
            <Typography variant="h2" style={styles.statNumber}>{activeGardens}</Typography>
            <Typography variant="body2" style={styles.statLabel}>Active Gardens</Typography>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="weight" size={24} color="#CDDC39" />
            <Typography variant="h2" style={styles.statNumber}>{totalQuantity.toFixed(0)}</Typography>
            <Typography variant="body2" style={styles.statLabel}>Total Yield</Typography>
          </View>
        </View>

        {/* Export Section */}
        <Card style={styles.exportCard}>
          <View style={styles.exportHeader}>
            <View style={styles.exportIconContainer}>
              <MaterialCommunityIcons name="download" size={24} color={theme.colors.accent} />
            </View>
            <View style={styles.exportContent}>
              <Typography variant="h3" style={styles.exportTitle}>Export Reports</Typography>
              <Typography variant="body2" color={theme.colors.textSecondary}>
                Download your harvest data as Excel
              </Typography>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => setShowExportModal(true)}
          >
            <MaterialCommunityIcons name="file-excel" size={18} color={theme.colors.white} />
            <Typography variant="button" color={theme.colors.white} style={styles.exportButtonText}>
              Export to Excel
            </Typography>
          </TouchableOpacity>
        </Card>

        {/* Harvest Trend Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#E6B800" />
            <Typography variant="h3" style={styles.chartTitle}>7-Day Harvest Trend</Typography>
          </View>
          <LineChart
            data={getHarvestTrendData()}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        </Card>

        {/* Top Plants Chart */}
        {plantTotals.length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <MaterialCommunityIcons name="podium-gold" size={20} color="#5D8A3A" />
              <Typography variant="h3" style={styles.chartTitle}>Top 5 Plants by Yield</Typography>
            </View>
            <BarChart
              data={getTopPlantsData()}
              width={screenWidth - 40}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(93, 138, 58, ${opacity})`,
              }}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              showValuesOnTopOfBars
            />
          </Card>
        )}

        {/* Garden Distribution */}
        {gardenTotals.length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <MaterialCommunityIcons name="chart-pie" size={20} color="#8BC34A" />
              <Typography variant="h3" style={styles.chartTitle}>Harvest Distribution by Garden</Typography>
            </View>
            <PieChart
              data={getGardenDistributionData()}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Card>
        )}

        {/* Recent Activity */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="history" size={20} color="#CDDC39" />
            <Typography variant="h3" style={styles.chartTitle}>Recent Harvests</Typography>
          </View>
          <View style={styles.recentList}>
            {harvests.slice(0, 5).map((harvest, index) => (
              <View key={harvest.id} style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <MaterialCommunityIcons name="leaf" size={16} color="#5D8A3A" />
                </View>
                <View style={styles.recentContent}>
                  <Typography variant="body1" style={styles.recentPlant}>
                    {harvest.plantName}
                  </Typography>
                  <Typography variant="body2" style={styles.recentDetails}>
                    {harvest.quantity} {harvest.unit} • {new Date(harvest.date).toLocaleDateString()}
                  </Typography>
                </View>
                <Typography variant="body1" style={styles.recentGarden}>
                  {gardens.find(g => g.id === harvest.gardenId)?.name || 'Unknown'}
                </Typography>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowExportModal(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" style={styles.modalTitle}>Export to Excel</Typography>
              <Typography variant="body2" color={theme.colors.textSecondary}>
                Select which gardens to include in your report
              </Typography>
            </View>

            <View style={styles.gardenSelectionContainer}>
              <TouchableOpacity
                style={[
                  styles.gardenOption,
                  selectedGardenForExport === 'all' && styles.gardenOptionSelected
                ]}
                onPress={() => setSelectedGardenForExport('all')}
              >
                <View style={styles.gardenOptionCheckbox}>
                  {selectedGardenForExport === 'all' && (
                    <MaterialCommunityIcons name="check" size={16} color={theme.colors.white} />
                  )}
                </View>
                <View style={styles.gardenOptionInfo}>
                  <Typography variant="body1" style={styles.gardenOptionText}>
                    All Gardens
                  </Typography>
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    Export data from all {gardens.length} garden{gardens.length !== 1 ? 's' : ''}
                  </Typography>
                </View>
              </TouchableOpacity>

              {gardens.map((garden) => (
                <TouchableOpacity
                  key={garden.id}
                  style={[
                    styles.gardenOption,
                    selectedGardenForExport === garden.id && styles.gardenOptionSelected
                  ]}
                  onPress={() => setSelectedGardenForExport(garden.id)}
                >
                  <View style={styles.gardenOptionCheckbox}>
                    {selectedGardenForExport === garden.id && (
                      <MaterialCommunityIcons name="check" size={16} color={theme.colors.white} />
                    )}
                  </View>
                  <View style={styles.gardenOptionInfo}>
                    <Typography variant="body1" style={styles.gardenOptionText}>
                      {garden.name}
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textSecondary}>
                      Garden • {harvests.filter(h => h.gardenId === garden.id).length} harvests
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowExportModal(false)}
              >
                <Typography variant="button" color={theme.colors.primary}>
                  Cancel
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalExportButton}
                onPress={handleExportExcel}
              >
                <MaterialCommunityIcons name="file-excel" size={18} color={theme.colors.white} />
                <Typography variant="button" color={theme.colors.white} style={styles.modalExportButtonText}>
                  Export
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingTop: theme.spacing.xl + theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.small,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIcon: {
    color: theme.colors.accent,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    ...theme.shadows.medium,
  },
  statNumber: {
    color: theme.colors.accentDark,
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.xxl,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
  },
  chartCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  chartTitle: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: theme.typography.fontSize.lg,
  },
  chart: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentList: {
    gap: theme.spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  recentContent: {
    flex: 1,
  },
  recentPlant: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  recentDetails: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs,
  },
  recentGarden: {
    color: theme.colors.logo.green,
    fontWeight: '500',
    fontSize: theme.typography.fontSize.sm,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
  // Export section styles
  exportCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.accentSoft,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  exportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  exportButtonText: {
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.large,
  },
  modalHeader: {
    marginBottom: theme.spacing.sm,
  },
  modalTitle: {
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  gardenSelectionContainer: {
    gap: theme.spacing.sm,
    maxHeight: 300,
  },
  gardenOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gardenOptionSelected: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  gardenOptionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  gardenOptionInfo: {
    flex: 1,
  },
  gardenOptionText: {
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: theme.spacing.xs / 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalExportButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  modalExportButtonText: {
    fontWeight: '600',
  },
});
