import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, View } from 'react-native';
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
          <View style={styles.harvestInfo}>
            <Typography variant="h4" numberOfLines={1}>
              {item.plantName}
            </Typography>
            
            <View style={styles.quantityContainer}>
              <Typography variant="body1" style={styles.quantity}>
                {item.quantity} {item.unit}
              </Typography>
            </View>
            
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              style={styles.harvestDate}
            >
              {formatDate(item.date)}
            </Typography>
          </View>
          
          {item.photoUrl && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: item.photoUrl }} style={styles.photo} />
            </View>
          )}
        </View>
        
        {item.notes && (
          <Typography
            variant="body2"
            color={theme.colors.textSecondary}
            numberOfLines={2}
            style={styles.notes}
          >
            {item.notes}
          </Typography>
        )}
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  locationText: {
    marginLeft: 4,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  harvestCard: {
    marginBottom: theme.spacing.md,
  },
  harvestCardContent: {
    flexDirection: 'row',
  },
  harvestInfo: {
    flex: 1,
  },
  quantityContainer: {
    marginTop: theme.spacing.xs,
  },
  quantity: {
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  harvestDate: {
    marginTop: theme.spacing.xs,
  },
  photoContainer: {
    marginLeft: theme.spacing.md,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
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
});
