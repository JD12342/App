import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedGardenList from '../../components/AnimatedGardenList';
import FAB from '../../components/FAB';
import GardenEmptyState from '../../components/GardenEmptyState';
import Typography from '../../components/Typography';
import { gardenService, harvestService } from '../../lib/dataService';
import theme from '../../lib/theme';
import { Garden, Harvest } from '../../types/types';

export default function MyGardensScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [gardensData, harvestsData] = await Promise.all([
        gardenService.getGardens(),
        harvestService.getHarvests(),
      ]);
      setGardens(gardensData);
      setHarvests(harvestsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mainContent}>
        {gardens.length === 0 && !isLoading ? (
          <View style={styles.content}>
            <GardenEmptyState
              onAddGarden={() => router.push('/garden/new')}
            />
          </View>
        ) : (
          <AnimatedGardenList
            gardens={gardens}
            harvests={harvests}
            refreshing={isLoading}
            onRefresh={loadData}
            onGardenPress={(garden) => router.push(`/garden/${garden.id}`)}
            headerComponent={
              <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                  <MaterialCommunityIcons 
                    name="sprout" 
                    size={28} 
                    color={theme.colors.primary}
                    style={styles.headerIcon}
                  />
                  <View style={styles.headerText}>
                    <Typography variant="h2" style={styles.title}>
                      My Gardens 🏡
                    </Typography>
                    <Typography variant="body1" style={styles.subtitle}>
                      Manage your gardens and harvests
                    </Typography>
                  </View>
                </View>
              </View>
            }
          />
        )}

        <FAB
          icon="add"
          onPress={() => router.push('/garden/new')}
          style={styles.fab}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: theme.spacing.md,
    color: theme.colors.primary,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.large,
  },
});
