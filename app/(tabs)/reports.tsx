import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Typography from '../../components/Typography';
import { gardenService, harvestService } from '../../lib/dataService';
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
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

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
              name="chart-donut" 
              size={32} 
              color="#E6B800" 
              style={styles.headerIcon}
            />
            <View style={styles.headerText}>
              <Typography variant="h1" style={styles.title}>
                Garden Analytics
              </Typography>
              <Typography variant="body1" style={styles.subtitle}>
                Insights from your harvests
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
            <MaterialCommunityIcons name="flower" size={24} color="#8BC34A" />
            <Typography variant="h2" style={styles.statNumber}>{activeGardens}</Typography>
            <Typography variant="body2" style={styles.statLabel}>Active Gardens</Typography>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="weight-kilogram" size={24} color="#CDDC39" />
            <Typography variant="h2" style={styles.statNumber}>{totalQuantity.toFixed(0)}</Typography>
            <Typography variant="body2" style={styles.statLabel}>Total Yield</Typography>
          </View>
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#fff',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingTop: theme.spacing.xl + theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#7F8C8D',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    color: '#2C3E50',
    fontWeight: 'bold',
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  chartCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  chartTitle: {
    marginLeft: theme.spacing.sm,
    color: '#2C3E50',
    fontWeight: '600',
  },
  chart: {
    borderRadius: 8,
  },
  recentList: {
    gap: theme.spacing.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  recentContent: {
    flex: 1,
  },
  recentPlant: {
    color: '#2C3E50',
    fontWeight: '500',
  },
  recentDetails: {
    color: '#7F8C8D',
    marginTop: 2,
  },
  recentGarden: {
    color: '#5D8A3A',
    fontWeight: '500',
    fontSize: 12,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});
