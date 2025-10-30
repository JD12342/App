import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/Card';
import Typography from '../../components/Typography';
import { useAuth } from '../../contexts/AuthContext';
import { gardenService, harvestService } from '../../lib/dataService';
import theme from '../../lib/theme';
import { Garden, Harvest } from '../../types/types';

// Enhanced weather, tips, and facts data
const weatherData = {
  condition: 'sunny',
  temperature: 27,
  description: 'Perfect Day',
  advice: 'Ideal weather for gardening! Your plants will thrive today.',
  humidity: 65,
  windSpeed: 8,
};

const gardenTips = [
  {
    icon: 'water',
    tip: "Water deeply but less frequently to encourage strong root growth.",
    category: "Watering"
  },
  {
    icon: 'white-balance-sunny',
    tip: "Most vegetables need 6-8 hours of direct sunlight daily.",
    category: "Light"
  },
  {
    icon: 'leaf',
    tip: "Companion planting improves growth and naturally repels pests.",
    category: "Planting"
  },
  {
    icon: 'spa-outline',
    tip: "Mulching retains soil moisture and suppresses weeds naturally.",
    category: "Care"
  },
  {
    icon: 'clock-outline',
    tip: "Harvest in the morning for the best flavor and longest storage.",
    category: "Harvest"
  },
  {
    icon: 'autorenew',
    tip: "Rotate crops seasonally to maintain soil health and prevent disease.",
    category: "Planning"
  }
];

const funFacts = [
  {
    icon: 'flower',
    fact: "Tomatoes are technically fruits and are related to deadly nightshade!",
    category: "Botany"
  },
  {
    icon: 'palette',
    fact: "Carrots were originally purple before being bred orange in honor of Dutch royalty.",
    category: "History"
  },
  {
    icon: 'view-grid',
    fact: "Corn ears always have an even number of rows - usually 16!",
    category: "Nature"
  },
  {
    icon: 'rocket-launch',
    fact: "Potatoes were the first vegetables grown in space by NASA.",
    category: "Space"
  },
  {
    icon: 'favorite',
    fact: "Strawberries are the only fruit with seeds on the outside.",
    category: "Unique"
  },
  {
    icon: 'air',
    fact: "Apples are 25% air, which is why they float in water!",
    category: "Science"
  }
];

export default function HomeScreen() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const { user } = useAuth();
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

  const getWeatherIcon = () => {
    switch (weatherData.condition) {
      case 'sunny': return 'wb-sunny';
      case 'cloudy': return 'cloud';
      case 'rainy': return 'grain';
      default: return 'wb-sunny';
    }
  };

  const handleNextTip = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrentTipIndex((prev) => (prev + 1) % gardenTips.length);
  };

  const handleNextFact = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
  };

  const firstName = user?.email?.split('@')[0]?.split('.')[0] || 'Gardener';
  const currentTip = gardenTips[currentTipIndex];
  const currentFact = funFacts[currentFactIndex];

  const quickActions = [
    {
      title: 'Add Garden',
      subtitle: 'Create new',
      icon: 'eco',
      color: theme.colors.primary,
      backgroundColor: '#E8F5E8',
      onPress: () => router.push('/garden/new'),
    },
    {
      title: 'Log Harvest',
      subtitle: 'Record yield',
      icon: 'grass',
      color: '#FF9800',
      backgroundColor: '#FFF3E0',
      onPress: () => router.push('/harvest/new'),
    },
    {
      title: 'View Reports',
      subtitle: 'Analytics',
      icon: 'trending-up',
      color: '#2196F3',
      backgroundColor: '#E3F2FD',
      onPress: () => router.push('/(tabs)/reports'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isLoading} 
              onRefresh={loadData}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* Greeting in upper left */}
          <View style={styles.greetingContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Typography variant="h2" style={styles.greeting}>
                Welcome back, {firstName}! 🌱
              </Typography>
              <Typography variant="body1" style={styles.welcome}>
                {"Let's check on your garden today"}
              </Typography>
            </Animated.View>
          </View>
          {/* Enhanced Weather Card */}
          <Card style={styles.weatherCard} elevation="large">
            <View style={styles.weatherHeader}>
              <View style={styles.weatherIconContainer}>
                <MaterialIcons 
                  name={getWeatherIcon() as any} 
                  size={40} 
                  color="#FF9800" 
                />
              </View>
              <View style={styles.weatherDetails}>
                <Typography variant="h3" style={styles.weatherTemp}>
                  {weatherData.temperature}°C
                </Typography>
                <Typography variant="body1" color={theme.colors.textSecondary}>
                  {weatherData.description}
                </Typography>
              </View>
              <View style={styles.weatherStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="water-percent" size={16} color={theme.colors.primary} />
                  <Typography variant="caption" style={styles.statText}>{weatherData.humidity}%</Typography>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="weather-windy" size={16} color={theme.colors.primary} />
                  <Typography variant="caption" style={styles.statText}>{weatherData.windSpeed} km/h</Typography>
                </View>
              </View>
            </View>
            <View style={styles.weatherAdvice}>
              <MaterialIcons name="lightbulb" size={18} color={theme.colors.secondary} />
              <Typography variant="body2" style={styles.adviceText}>
                {weatherData.advice}
              </Typography>
            </View>
          </Card>

          {/* Enhanced Garden Tips Card */}
          <Card style={styles.tipCard} elevation="medium">
            <View style={styles.tipHeader}>
              <MaterialCommunityIcons name={currentTip.icon as any} size={24} color={theme.colors.primary} />
              <View style={styles.tipTitleContainer}>
                <Typography variant="h4" style={styles.tipTitle}>Garden Tip</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  {currentTip.category}
                </Typography>
              </View>
            </View>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Typography variant="body1" style={styles.tipText}>
                {currentTip.tip}
              </Typography>
            </Animated.View>
            <TouchableOpacity 
              style={styles.tipButton} 
              onPress={handleNextTip}
              activeOpacity={0.8}
            >
              <MaterialIcons name="refresh" size={16} color="#fff" />
              <Typography variant="button" style={styles.buttonText}>
                Another Tip
              </Typography>
            </TouchableOpacity>
          </Card>

          {/* Enhanced Fun Fact Card */}
          <Card style={styles.factCard} elevation="medium">
            <View style={styles.factHeader}>
              <MaterialCommunityIcons name={currentFact.icon as any} size={24} color="#2196F3" />
              <View style={styles.factTitleContainer}>
                <Typography variant="h4" style={styles.factTitle}>Did You Know?</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  {currentFact.category}
                </Typography>
              </View>
            </View>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Typography variant="body1" style={styles.factText}>
                {currentFact.fact}
              </Typography>
            </Animated.View>
            <TouchableOpacity 
              style={styles.factButton} 
              onPress={handleNextFact}
              activeOpacity={0.8}
            >
              <MaterialIcons name="auto-awesome" size={16} color="#fff" />
              <Typography variant="button" style={styles.buttonText}>
                Another Fact
              </Typography>
            </TouchableOpacity>
          </Card>

          {/* Enhanced Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Quick Actions
            </Typography>
            <View style={styles.quickActionsRow}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickActionCard, { backgroundColor: action.backgroundColor }]}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                    <MaterialIcons 
                      name={action.icon as any} 
                      size={24} 
                      color={action.color} 
                    />
                  </View>
                  <Typography variant="body2" style={[styles.quickActionTitle, { color: action.color }]}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" style={styles.quickActionSubtitle}>
                    {action.subtitle}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Enhanced Garden Summary */}
          <Card style={styles.summaryCard} elevation="large">
            <Typography variant="h4" style={styles.summaryTitle}>Your Garden at a Glance</Typography>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryIconContainer}>
                  <MaterialCommunityIcons name="sprout" size={28} color={theme.colors.primary} />
                </View>
                <Typography variant="h2" style={styles.summaryNumber}>
                  {gardens.length}
                </Typography>
                <Typography variant="body2" color={theme.colors.textSecondary}>
                  Active Gardens
                </Typography>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={styles.summaryIconContainer}>
                  <MaterialCommunityIcons name="basket" size={28} color="#FF9800" />
                </View>
                <Typography variant="h2" style={styles.summaryNumber}>
                  {harvests.length}
                </Typography>
                <Typography variant="body2" color={theme.colors.textSecondary}>
                  Total Harvests
                </Typography>
              </View>
            </View>
          </Card>

          {/* Spacer for bottom navigation */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  greetingContainer: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  greeting: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  welcome: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },

  // Weather Card Styles
  weatherCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  weatherIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  weatherDetails: {
    flex: 1,
  },
  weatherTemp: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  weatherStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
  },
  weatherAdvice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  adviceText: {
    marginLeft: theme.spacing.sm,
    flex: 1,
    fontStyle: 'italic',
  },

  // Tips Card Styles
  tipCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tipTitleContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  tipTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  tipButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    ...theme.shadows.small,
  },

  // Facts Card Styles
  factCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  factTitleContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  factTitle: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  factText: {
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  factButton: {
    backgroundColor: '#2196F3',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    ...theme.shadows.small,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },

  // Quick Actions Styles
  quickActionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
  },
  quickActionCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '30%',
    minHeight: 120,
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  quickActionSubtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
  },

  // Summary Card Styles
  summaryCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});
