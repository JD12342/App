import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedGardenList from '../../components/AnimatedGardenList';
import FAB from '../../components/FAB';
import GardenEmptyState from '../../components/GardenEmptyState';
import Typography from '../../components/Typography';
import { AuthContext } from '../../contexts/AuthContext';
import { gardenService, harvestService } from '../../lib/dataService';
import theme from '../../lib/theme';
import { Garden, Harvest } from '../../types/types';

export default function MyGardensScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { user, isGuest } = useContext(AuthContext);

  useEffect(() => {
    // Set up real-time listener for gardens and harvests
    const setupListeners = async () => {
      try {
        const [gardensData, harvestsData] = await Promise.all([
          gardenService.getGardens(),
          harvestService.getHarvests(),
        ]);
        setGardens(gardensData);
        setHarvests(harvestsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    setupListeners();
  }, [user, isGuest]);

  // Reload data when user navigates back to this tab
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [gardensData, harvestsData] = await Promise.all([
            gardenService.getGardens(),
            harvestService.getHarvests(),
          ]);
          setGardens(gardensData);
          setHarvests(harvestsData);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };

      loadData();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [gardensData, harvestsData] = await Promise.all([
        gardenService.getGardens(),
        harvestService.getHarvests(),
      ]);
      setGardens(gardensData);
      setHarvests(harvestsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mainContent}>
        {gardens.length === 0 ? (
          <View style={styles.content}>
            <GardenEmptyState
              onAddGarden={() => router.push('/garden/new')}
            />
          </View>
        ) : (
          <AnimatedGardenList
            gardens={gardens}
            harvests={harvests}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            onGardenPress={(garden) => router.push(`/garden/${garden.id}`)}
            headerComponent={
              <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                  <MaterialCommunityIcons 
                    name="sprout" 
                    size={36} 
                    color={theme.colors.logo.green}
                    style={styles.headerIcon}
                  />
                  <View style={styles.headerText}>
                    <Typography variant="h2" style={styles.title}>
                      My Gardens
                    </Typography>
                    <Typography variant="body2" color={theme.colors.textSecondary}>
                      Manage your garden collection
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
