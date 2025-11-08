import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import FAB from '../../components/FAB';
import Header from '../../components/Header';
import Typography from '../../components/Typography';
import { gardenService, harvestService } from '../../lib/dataService';
import theme from '../../lib/theme';
import { Garden, Harvest } from '../../types/types';

export default function GardenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [garden, setGarden] = useState<Garden | null>(null);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      const gardenData = await gardenService.getGarden(id);
      if (gardenData) {
        setGarden(gardenData);
        const harvestData = await harvestService.getHarvestsByGarden(id);
        setHarvests(harvestData);
      }
    } catch (error) {
      console.error('Error loading garden details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddHarvest = () => {
    router.push({
      pathname: '/harvest/new' as any,
      params: { gardenId: id }
    });
  };

  const handleEditGarden = () => {
    router.push({
      pathname: '/garden/edit/[id]' as any,
      params: { id }
    });
  };

  const handleDeleteGarden = () => {
    Alert.alert(
      'Delete Garden',
      'Are you sure you want to delete this garden? This will also delete all harvests associated with this garden.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (id) {
                await gardenService.deleteGarden(id);
                router.back();
              }
            } catch (error) {
              console.error('Error deleting garden:', error);
              Alert.alert('Error', 'Failed to delete garden. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleHarvestPress = (harvest: Harvest) => {
    router.push({
      pathname: '/harvest/edit/[id]' as any,
      params: { id: harvest.id }
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderHarvestCard = ({ item }: { item: Harvest }) => {
    return (
      <Card onPress={() => handleHarvestPress(item)} style={styles.harvestCard}>
        <View style={styles.harvestCardContent}>
          <Typography variant="h4" numberOfLines={1}>
            {item.plantName}
          </Typography>
          
          <View style={styles.quantityContainer}>
            <Typography style={styles.quantity}>
              {item.quantity} count
            </Typography>
          </View>
          
          <Typography
            style={styles.harvestDate}
            numberOfLines={1}
          >
            {formatDate(item.date)}
          </Typography>
          
          {item.notes && (
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              numberOfLines={1}
              style={styles.notes}
            >
              {item.notes}
            </Typography>
          )}
        </View>
      </Card>
    );
  };

  const renderHeaderRight = () => {
    return (
      <View style={styles.headerActions}>
        <MaterialIcons
          name="edit"
          size={24}
          color={theme.colors.textSecondary}
          style={styles.headerIcon}
          onPress={handleEditGarden}
        />
        <MaterialIcons
          name="delete"
          size={24}
          color={theme.colors.textSecondary}
          style={styles.headerIcon}
          onPress={handleDeleteGarden}
        />
      </View>
    );
  };

  if (!garden && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Garden Not Found" showBackButton />
        <EmptyState
          title="Garden Not Found"
          message="The garden you're looking for doesn't exist or was deleted."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={garden?.name || 'Loading...'}
        showBackButton
        rightAction={renderHeaderRight()}
      />

      {garden && (
        <>
          {(garden.location || garden.description) && (
            <View style={styles.gardenInfoContainer}>
              {garden.location && (
                <View style={styles.locationContainer}>
                  <MaterialIcons
                    name="location-on"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Typography
                    variant="body2"
                    color={theme.colors.textSecondary}
                    style={styles.locationText}
                  >
                    {garden.location}
                  </Typography>
                </View>
              )}
              
              {garden.description && (
                <Typography
                  variant="body2"
                  color={theme.colors.textSecondary}
                  style={styles.descriptionText}
                >
                  {garden.description}
                </Typography>
              )}
            </View>
          )}

          {harvests.length === 0 ? (
            <EmptyState
              title="No Harvests Yet"
              message="Start tracking your harvests by adding your first one!"
              actionLabel="Add Harvest"
              onAction={handleAddHarvest}
            />
          ) : (
            <FlatList
              data={harvests}
              renderItem={renderHarvestCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.colors.primary]}
                  tintColor={theme.colors.primary}
                />
              }
            />
          )}

          <FAB
            onPress={handleAddHarvest}
            icon={<MaterialIcons name="add" size={24} color={theme.colors.white} />}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  harvestCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    minHeight: 80,
  },
  harvestCardContent: {
    flex: 1,
  },
  harvestInfo: {
    flex: 1,
  },
  quantityContainer: {
    marginTop: 4,
  },
  quantity: {
    fontSize: 14,
    color: theme.colors.text,
  },
  harvestDate: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
  },
  locationText: {
    marginLeft: 4,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  notes: {
    marginTop: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: theme.spacing.sm,
  },
  gardenInfoContainer: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  descriptionText: {
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
});
