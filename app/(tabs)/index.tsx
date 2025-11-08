import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppLogo from '../../components/AppLogo';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FeatureWalkthrough, { FeatureWalkthroughStep } from '../../components/FeatureWalkthrough';
import Typography from '../../components/Typography';
import { useAuth } from '../../contexts/AuthContext';
import { gardenService, harvestService } from '../../lib/dataService';
import theme from '../../lib/theme';
import { getWeatherData, WeatherData } from '../../lib/weatherService';
import { Garden, Harvest } from '../../types/types';

const FEATURE_TOUR_STORAGE_KEY = 'home_feature_tour_v1';

const gardenTips = [
	{
		icon: 'water',
		tip: 'Water deeply but less frequently to encourage strong root growth.',
		category: 'Watering',
	},
	{
		icon: 'white-balance-sunny',
		tip: 'Most vegetables need 6-8 hours of direct sunlight daily.',
		category: 'Light',
	},
	{
		icon: 'leaf',
		tip: 'Companion planting improves growth and naturally repels pests.',
		category: 'Planting',
	},
	{
		icon: 'spa-outline',
		tip: 'Mulching retains soil moisture and suppresses weeds naturally.',
		category: 'Care',
	},
	{
		icon: 'clock-outline',
		tip: 'Harvest in the morning for the best flavor and longest storage.',
		category: 'Harvest',
	},
	{
		icon: 'autorenew',
		tip: 'Rotate crops seasonally to maintain soil health and prevent disease.',
		category: 'Planning',
	},
];

const funFacts = [
	{
		icon: 'flower',
		fact: 'Tomatoes are technically fruits and are related to deadly nightshade!',
		category: 'Botany',
	},
	{
		icon: 'palette',
		fact: 'Carrots were originally purple before being bred orange in honor of Dutch royalty.',
		category: 'History',
	},
	{
		icon: 'view-grid',
		fact: 'Corn ears always have an even number of rows - usually 16!',
		category: 'Nature',
	},
	{
		icon: 'rocket-launch',
		fact: 'Potatoes were the first vegetables grown in space by NASA.',
		category: 'Space',
	},
	{
		icon: 'favorite',
		fact: 'Strawberries are the only fruit with seeds on the outside.',
		category: 'Unique',
	},
	{
		icon: 'air',
		fact: 'Apples are 25% air, which is why they float in water!',
		category: 'Science',
	},
];

export default function HomeScreen() {
	const [gardens, setGardens] = useState<Garden[]>([]);
	const [harvests, setHarvests] = useState<Harvest[]>([]);
	const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [currentTipIndex, setCurrentTipIndex] = useState(0);
	const [currentFactIndex, setCurrentFactIndex] = useState(0);
	const [tipFadeAnim] = useState(new Animated.Value(1));
	const [factFadeAnim] = useState(new Animated.Value(1));
	const [showFeatureWalkthrough, setShowFeatureWalkthrough] = useState(false);
	const [showHarvestPicker, setShowHarvestPicker] = useState(false);
	const { user } = useAuth();
	const router = useRouter();

	const loadData = async () => {
		try {
			setIsLoading(true);
			const [gardensData, harvestsData, weather] = await Promise.all([
				gardenService.getGardens(),
				harvestService.getHarvests(),
				getWeatherData(),
			]);
			setGardens(gardensData);
			setHarvests(harvestsData);
			setWeatherData(weather);
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		const checkWalkthroughStatus = async () => {
			try {
				const hasCompleted = await AsyncStorage.getItem(FEATURE_TOUR_STORAGE_KEY);
				if (!hasCompleted) {
					setShowFeatureWalkthrough(true);
				}
			} catch (error) {
				console.warn('Unable to load feature tour status:', error);
			}
		};

		checkWalkthroughStatus();
	}, []);

	const getWeatherIcon = () => {
		if (!weatherData) return 'wb-sunny';
		
		switch (weatherData.condition) {
			case 'sunny':
			case 'clear':
				return 'wb-sunny';
			case 'cloudy':
				return 'cloud';
			case 'partly-cloudy':
				return 'cloud-queue';
			case 'rainy':
				return 'grain';
			case 'thunderstorm':
				return 'flash-on';
			case 'snow':
				return 'ac-unit';
			default:
				return 'wb-sunny';
		}
	};

	const animateTip = () => {
		Animated.sequence([
			Animated.timing(tipFadeAnim, {
				toValue: 0.3,
				duration: 150,
				useNativeDriver: true,
			}),
			Animated.timing(tipFadeAnim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}),
		]).start();
	};

	const animateFact = () => {
		Animated.sequence([
			Animated.timing(factFadeAnim, {
				toValue: 0.3,
				duration: 150,
				useNativeDriver: true,
			}),
			Animated.timing(factFadeAnim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}),
		]).start();
	};

	const handleNextTip = () => {
		animateTip();
		setCurrentTipIndex((prev) => (prev + 1) % gardenTips.length);
	};

	const handleNextFact = () => {
		animateFact();
		setCurrentFactIndex((prev) => (prev + 1) % funFacts.length);
	};

	const firstName = user?.email?.split('@')[0]?.split('.')[0] || 'Gardener';
	const currentTip = gardenTips[currentTipIndex];
	const currentFact = funFacts[currentFactIndex];

	const handleAddGarden = useCallback(() => {
		router.push('/garden/new');
	}, [router]);

	const handleLogHarvest = useCallback(() => {
		if (!gardens.length) {
			router.push('/garden/new');
			return;
		}

		if (gardens.length === 1) {
			router.push({ pathname: '/harvest/new', params: { gardenId: gardens[0].id } });
			return;
		}

		setShowHarvestPicker(true);
	}, [gardens, router]);

	const handleSelectHarvestGarden = useCallback((gardenId: string) => {
		setShowHarvestPicker(false);
		router.push({ pathname: '/harvest/new', params: { gardenId } });
	}, [router]);

	const handleViewReports = useCallback(() => {
		router.push('/(tabs)/reports');
	}, [router]);

	const quickActions = useMemo(() => [
		{
			title: 'Add Garden',
			subtitle: 'Create new plot',
			icon: 'eco',
			color: theme.colors.primary,
			tint: 'rgba(0, 142, 59, 0.12)',
			onPress: handleAddGarden,
		},
		{
			title: 'Log Harvest',
			subtitle:
				gardens.length === 0
					? 'Create a garden first'
					: gardens.length === 1
						? `Add to ${gardens[0].name}`
						: 'Choose a garden',
			icon: 'grass',
			color: theme.colors.secondary,
			tint: 'rgba(255, 152, 0, 0.12)',
			onPress: handleLogHarvest,
		},
		{
			title: 'View Reports',
			subtitle: 'Analytics',
			icon: 'trending-up',
			color: theme.colors.accent,
			tint: 'rgba(230, 184, 0, 0.12)',
			onPress: handleViewReports,
		},
	], [gardens, handleAddGarden, handleLogHarvest, handleViewReports]);

	const featureWalkthroughSteps: FeatureWalkthroughStep[] = [
		{
			title: 'Track Your Gardens',
			description: 'The hero dashboard keeps a running tally of active gardens and harvest logs so you know how everything is performing at a glance.',
			icon: 'view-dashboard-outline',
		},
		{
			title: 'Weather Insights',
			description: 'Today\'s weather card highlights the conditions that impact your plants, with quick access to humidity and wind details.',
			icon: 'weather-sunny',
		},
		{
			title: 'Quick Actions',
			description: 'Jump straight into adding a garden, logging a harvest, or reviewing reports using the quick action shortcuts.',
			icon: 'lightning-bolt-outline',
		},
		{
			title: 'Grow With Tips',
			description: 'Swipe through inspiration cards for rotating tips and fun facts that keep you learning as your garden evolves.',
			icon: 'sprout',
		},
	];

	const handleFeatureWalkthroughComplete = async () => {
		try {
			await AsyncStorage.setItem(FEATURE_TOUR_STORAGE_KEY, 'true');
		} catch (error) {
			console.warn('Unable to store feature tour status:', error);
		} finally {
			setShowFeatureWalkthrough(false);
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
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
				<View style={styles.headerSection}>
					<AppLogo size="medium" showLabel={false} />
					<Typography variant='h1' style={styles.appTitle}>
						Garden Tracker
					</Typography>
				</View>
				<Card variant='hero' elevation='floating' style={styles.heroCard}>
					<View style={styles.heroBadge}>
						<Typography variant='caption' color='rgba(255, 255, 255, 0.85)'>
							Today
						</Typography>
					</View>
					<Typography variant='display' color={theme.colors.white} style={styles.heroTitle}>
						Welcome back, {firstName}
					</Typography>
					<Typography variant='body1' color='rgba(255, 255, 255, 0.9)' style={styles.heroSubtitle}>
						{gardens.length
							? `Your ${gardens.length > 1 ? 'gardens are' : 'garden is'} thriving beautifully.`
							: 'Start your first garden and watch it flourish.'}
					</Typography>
					<View style={styles.heroStatsRow}>
						<View style={styles.heroStat}>
							<Typography variant='h1' color={theme.colors.white}>
								{gardens.length}
							</Typography>
							<Typography variant='caption' color='rgba(255, 255, 255, 0.8)'>
								Active Gardens
							</Typography>
						</View>
						<View style={styles.heroStatDivider} />
						<View style={styles.heroStat}>
							<Typography variant='h1' color={theme.colors.white}>
								{harvests.length}
							</Typography>
							<Typography variant='caption' color='rgba(255, 255, 255, 0.8)'>
								Harvest Logs
							</Typography>
						</View>
					</View>
					<View style={styles.heroActions}>
						<TouchableOpacity
							style={styles.heroActionButton}
							onPress={() => router.push('/garden/new')}
							activeOpacity={0.9}
						>
							<MaterialIcons name='eco' size={18} color={theme.colors.white} />
							<Typography variant='button' color={theme.colors.white} style={styles.heroActionText}>
								Add Garden
							</Typography>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.heroActionButtonSecondary}
							onPress={() => router.push('/harvest/new')}
							activeOpacity={0.9}
						>
							<MaterialIcons name='grass' size={18} color={theme.colors.heroAccent} />
							<Typography
								variant='button'
								color={theme.colors.heroAccent}
								style={styles.heroActionSecondaryText}
							>
								Log Harvest
							</Typography>
						</TouchableOpacity>
					</View>
				</Card>

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Typography variant='h3' style={styles.sectionTitle}>
							Today&apos;s Weather
							{weatherData?.location && (
								<Typography variant='caption' color={theme.colors.textSecondary}>
									{' '}• {weatherData.location}
								</Typography>
							)}
						</Typography>
						<Typography variant='body2' color={theme.colors.textSecondary}>
							{weatherData?.description || 'Loading...'}
						</Typography>
					</View>
					{weatherData && (
						<View style={styles.weatherCard}>
							<View style={styles.weatherMain}>
								<View style={styles.weatherIcon}>
									<MaterialIcons name={getWeatherIcon() as any} size={42} color='#FFD700' />
								</View>
								<View style={styles.weatherInfo}>
									<Typography variant='h2' style={styles.weatherTemp}>
										{weatherData.temperature}°
									</Typography>
									<Typography variant='body2' style={styles.weatherLocation}>
										{weatherData.description}
									</Typography>
								</View>
								<View style={styles.weatherStats}>
									<View style={styles.weatherStat}>
										<MaterialCommunityIcons 
											name='water-percent' 
											size={20} 
											color='#4A90E2' 
										/>
										<Typography variant='body2' style={styles.weatherStatText}>
											{weatherData.humidity}%
										</Typography>
									</View>
									<View style={styles.divider} />
									<View style={styles.weatherStat}>
										<MaterialCommunityIcons 
											name='weather-windy' 
											size={20} 
											color='#4A90E2' 
										/>
										<Typography variant='body2' style={styles.weatherStatText}>
											{weatherData.windSpeed} km/h
										</Typography>
									</View>
								</View>
							</View>
							{weatherData.advice && (
								<View style={styles.weatherTip}>
									<View style={styles.weatherTipIcon}>
										<MaterialCommunityIcons 
											name='seed' 
											size={16} 
											color='#43A047' 
										/>
									</View>
									<Typography variant='caption' style={styles.weatherTipText}>
										{weatherData.advice}
									</Typography>
								</View>
							)}
						</View>
					)}
				</View>

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Typography variant='h3' style={styles.sectionTitle}>
							Quick Actions
						</Typography>
						<Typography variant='body2' color={theme.colors.textSecondary}>
							Manage your garden in a tap.
						</Typography>
					</View>
					<View style={styles.quickActionGrid}>
						{quickActions.map((action, index) => (
							<TouchableOpacity
								key={index}
								style={styles.quickActionCard}
								onPress={action.onPress}
								activeOpacity={0.85}
							>
								<View style={[styles.quickActionIcon, { backgroundColor: action.tint }]}> 
									<MaterialIcons name={action.icon as any} size={22} color={action.color} />
								</View>
								<Typography variant='body1' style={styles.quickActionTitle}>
									{action.title}
								</Typography>
								<Typography variant='caption' style={styles.quickActionSubtitle}>
									{action.subtitle}
								</Typography>
							</TouchableOpacity>
						))}
					</View>
				</View>

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Typography variant='h3' style={styles.sectionTitle}>
							Inspiration
						</Typography>
						<Typography variant='body2' color={theme.colors.textSecondary}>
							Rotate through tips and fun facts.
						</Typography>
					</View>
					<View style={styles.insightRow}>
						<Card variant='elevated' style={styles.insightCard}>
							<View style={styles.insightHeader}>
								<MaterialCommunityIcons
									name={currentTip.icon as any}
									size={22}
									color={theme.colors.primary}
								/>
								<Typography variant='caption' color={theme.colors.primary}>
									{currentTip.category}
								</Typography>
							</View>
							<Animated.View style={{ opacity: tipFadeAnim }}>
								<Typography variant='body1' style={styles.insightText}>
									{currentTip.tip}
								</Typography>
							</Animated.View>
							<TouchableOpacity
								style={styles.insightAction}
								onPress={handleNextTip}
								activeOpacity={0.85}
							>
								<MaterialIcons name='refresh' size={16} color={theme.colors.primary} />
								<Typography variant='button' color={theme.colors.primary} style={styles.insightActionText}>
									Another Tip
								</Typography>
							</TouchableOpacity>
						</Card>

						<Card variant='elevated' style={styles.insightCard}>
							<View style={styles.insightHeader}>
								<MaterialCommunityIcons
									name={currentFact.icon as any}
									size={22}
									color={theme.colors.accent}
								/>
								<Typography variant='caption' color={theme.colors.accent}>
									{currentFact.category}
								</Typography>
							</View>
							<Animated.View style={{ opacity: factFadeAnim }}>
								<Typography variant='body1' style={styles.insightText}>
									{currentFact.fact}
								</Typography>
							</Animated.View>
							<TouchableOpacity
								style={styles.insightAction}
								onPress={handleNextFact}
								activeOpacity={0.85}
							>
								<MaterialIcons name='auto-awesome' size={16} color={theme.colors.accent} />
								<Typography variant='button' color={theme.colors.accent} style={styles.insightActionText}>
									Another Fact
								</Typography>
							</TouchableOpacity>
						</Card>
					</View>
				</View>

				<Card variant='elevated' elevation='large' style={styles.summaryCard}>
					<Typography variant='h3' style={styles.summaryTitle}>
						Garden Snapshot
					</Typography>
					<View style={styles.summaryRow}>
						<View style={styles.summaryMetric}>
							<View style={styles.summaryIcon}>
								<MaterialCommunityIcons name='sprout' size={26} color={theme.colors.primary} />
							</View>
							<Typography variant='h2' style={styles.summaryMetricValue}>
								{gardens.length}
							</Typography>
							<Typography variant='caption' color={theme.colors.textSecondary}>
								Active Gardens
							</Typography>
						</View>
						<View style={styles.summaryDivider} />
						<View style={styles.summaryMetric}>
							<View style={[styles.summaryIcon, styles.summaryIconSecondary]}>
								<MaterialCommunityIcons name='basket' size={26} color={theme.colors.secondary} />
							</View>
							<Typography variant='h2' style={styles.summaryMetricValue}>
								{harvests.length}
							</Typography>
							<Typography variant='caption' color={theme.colors.textSecondary}>
								Total Harvests
							</Typography>
						</View>
					</View>
				</Card>

				<TouchableOpacity
					style={styles.tourPrompt}
					onPress={() => setShowFeatureWalkthrough(true)}
					activeOpacity={0.85}
				>
					<MaterialCommunityIcons name='help-circle-outline' size={20} color={theme.colors.primary} />
					<Typography variant='body2' color={theme.colors.primary}>
						Need a walkthrough? Tap to explore the dashboard features.
					</Typography>
				</TouchableOpacity>

				<View style={styles.bottomSpacer} />
			</ScrollView>
			<FeatureWalkthrough
				visible={showFeatureWalkthrough}
				steps={featureWalkthroughSteps}
				onClose={() => setShowFeatureWalkthrough(false)}
				onComplete={handleFeatureWalkthroughComplete}
			/>
			<Modal
				visible={showHarvestPicker}
				transparent
				animationType='fade'
				onRequestClose={() => setShowHarvestPicker(false)}
			>
				<View style={styles.harvestModalOverlay}>
					<TouchableWithoutFeedback onPress={() => setShowHarvestPicker(false)}>
						<View style={styles.harvestModalBackdrop} />
					</TouchableWithoutFeedback>
					<View style={styles.harvestModalCard}>
						<Typography variant='h4' style={styles.harvestModalTitle}>
							Select a garden
						</Typography>
						<Typography variant='body2' color={theme.colors.textSecondary} style={styles.harvestModalSubtitle}>
							Choose where this harvest will be recorded.
						</Typography>
						<View style={styles.harvestModalList}>
							{gardens.map((garden) => (
								<TouchableOpacity
									key={garden.id}
									style={styles.harvestModalOption}
									onPress={() => handleSelectHarvestGarden(garden.id)}
								>
									<View style={styles.harvestModalOptionInfo}>
										<MaterialCommunityIcons name='sprout' size={20} color={theme.colors.primary} />
										<Typography variant='body1' style={styles.harvestModalOptionText}>
											{garden.name}
										</Typography>
									</View>
									<MaterialIcons name='chevron-right' size={20} color={theme.colors.textSecondary} />
								</TouchableOpacity>
							))}
						</View>
						<Button
							title='Cancel'
							variant='outline'
							onPress={() => setShowHarvestPicker(false)}
							fullWidth
							style={styles.harvestModalCancel}
						/>
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
	scrollContent: {
		paddingHorizontal: theme.spacing.md,
		paddingTop: theme.spacing.md,
		paddingBottom: 0,
	},
	headerSection: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.md,
		marginHorizontal: theme.spacing.md,
		marginTop: theme.spacing.md,
		marginBottom: theme.spacing.sm,
	},
	appTitle: {
		color: theme.colors.accent,
		flex: 1,
		fontWeight: '700',
	},
	heroCard: {
		marginTop: theme.spacing.md,
	},
	heroBadge: {
		backgroundColor: 'rgba(255, 255, 255, 0.16)',
		alignSelf: 'flex-start',
		paddingVertical: theme.spacing.xs / 2,
		paddingHorizontal: theme.spacing.sm,
		borderRadius: theme.borderRadius.pill,
		marginBottom: theme.spacing.sm,
	},
	heroTitle: {
		marginBottom: theme.spacing.xs,
	},
	heroSubtitle: {
		maxWidth: '85%',
		marginBottom: theme.spacing.lg,
	},
	heroStatsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: theme.spacing.lg,
	},
	heroStat: {
		flex: 1,
	},
	heroStatDivider: {
		width: 1,
		height: 48,
		backgroundColor: 'rgba(255, 255, 255, 0.35)',
		marginHorizontal: theme.spacing.md,
	},
	heroActions: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: theme.spacing.sm,
	},
	heroActionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: theme.spacing.xs,
		paddingHorizontal: theme.spacing.md,
		borderRadius: theme.borderRadius.pill,
		backgroundColor: 'rgba(255, 255, 255, 0.18)',
	},
	heroActionButtonSecondary: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: theme.spacing.xs,
		paddingHorizontal: theme.spacing.md,
		borderRadius: theme.borderRadius.pill,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.45)',
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	heroActionText: {
		marginLeft: theme.spacing.xs,
	},
	heroActionSecondaryText: {
		marginLeft: theme.spacing.xs,
	},
	section: {
		marginTop: theme.spacing.xl,
	},
	sectionHeader: {
		gap: theme.spacing.xs,
		marginBottom: theme.spacing.sm,
	},
	sectionTitle: {
		color: theme.colors.text,
	},
	weatherCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		padding: theme.spacing.lg,
		marginVertical: theme.spacing.sm,
		...theme.shadows.medium,
		elevation: 3,
	},
	weatherMain: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	weatherIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#F5F9FF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	weatherInfo: {
		flex: 1,
		marginLeft: theme.spacing.md,
		marginRight: theme.spacing.md,
	},
	weatherTemp: {
		fontSize: 32,
		fontWeight: '700',
		color: '#1A1A1A',
		marginBottom: 2,
	},
	weatherLocation: {
		fontSize: 15,
		color: '#666666',
		textTransform: 'capitalize',
	},
	weatherStats: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.sm,
	},
	weatherStat: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	weatherStatText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#4A90E2',
	},
	divider: {
		width: 1,
		height: 20,
		backgroundColor: '#E0E0E0',
		marginHorizontal: theme.spacing.xs,
	},
	weatherTip: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F1F8E9',
		borderRadius: 12,
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		marginTop: theme.spacing.md,
		gap: theme.spacing.sm,
	},
	weatherTipIcon: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#E8F5E9',
		alignItems: 'center',
		justifyContent: 'center',
	},
	weatherTipText: {
		flex: 1,
		fontSize: 13,
		color: '#1B5E20',
		lineHeight: 18,
	},
	quickActionGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: theme.spacing.sm,
	},
	quickActionCard: {
		flexBasis: theme.responsive.isSmallDevice ? '48%' : '30%',
		flexGrow: 1,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.xl,
		paddingVertical: theme.spacing.lg,
		paddingHorizontal: theme.spacing.md,
		...theme.shadows.medium,
	},
	quickActionIcon: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: theme.spacing.sm,
	},
	quickActionTitle: {
		color: theme.colors.text,
		marginBottom: theme.spacing.xs / 2,
		fontWeight: theme.typography.fontWeight.semiBold,
	},
	quickActionSubtitle: {
		color: theme.colors.textSecondary,
		lineHeight: 18,
	},
	insightRow: {
		flexDirection: theme.responsive.isTablet ? 'row' : 'column',
		gap: theme.spacing.md,
	},
	insightCard: {
		flex: 1,
		backgroundColor: theme.colors.surface,
		borderRadius: theme.borderRadius.xl,
		padding: theme.spacing.lg,
		...theme.shadows.medium,
	},
	insightHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.xs,
		marginBottom: theme.spacing.sm,
	},
	insightText: {
		color: theme.colors.text,
		marginBottom: theme.spacing.md,
		lineHeight: 22,
	},
	insightAction: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.xs,
	},
	insightActionText: {
		marginTop: 0,
	},
	summaryCard: {
		marginTop: theme.spacing.xl,
		borderRadius: theme.borderRadius.xl,
		padding: theme.spacing.lg,
		...theme.shadows.large,
	},
	summaryTitle: {
		textAlign: 'center',
		marginBottom: theme.spacing.md,
		color: theme.colors.text,
	},
	summaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	summaryMetric: {
		flex: 1,
		alignItems: 'center',
	},
	summaryIcon: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: theme.colors.primarySoft,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: theme.spacing.sm,
	},
	summaryIconSecondary: {
		backgroundColor: theme.colors.secondarySoft,
	},
	summaryMetricValue: {
		color: theme.colors.text,
		marginBottom: theme.spacing.xs,
	},
	summaryDivider: {
		width: 1,
		height: 64,
		backgroundColor: theme.colors.border,
		marginHorizontal: theme.spacing.md,
	},
	bottomSpacer: {
		height: 0,
	},
	tourPrompt: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: theme.spacing.xs,
		marginTop: theme.spacing.lg,
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.md,
		borderRadius: theme.borderRadius.xl,
		backgroundColor: theme.colors.primarySoft,
		alignSelf: 'center',
	},
	harvestModalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: theme.spacing.lg,
	},
	harvestModalBackdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
	},
	harvestModalCard: {
		width: '100%',
		maxWidth: 420,
		borderRadius: theme.borderRadius.xxl,
		backgroundColor: theme.colors.surface,
		padding: theme.spacing.lg,
		gap: theme.spacing.md,
	},
	harvestModalTitle: {
		textAlign: 'center',
	},
	harvestModalSubtitle: {
		textAlign: 'center',
	},
	harvestModalList: {
		gap: theme.spacing.sm,
	},
	harvestModalOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: theme.spacing.sm,
		paddingHorizontal: theme.spacing.sm,
		borderRadius: theme.borderRadius.lg,
		backgroundColor: theme.colors.background,
	},
	harvestModalOptionInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: theme.spacing.sm,
	},
	harvestModalOptionText: {
		color: theme.colors.text,
	},
	harvestModalCancel: {
		marginTop: theme.spacing.sm,
	},
});
